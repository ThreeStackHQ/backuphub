import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getAuthUserId, unauthorized } from '@/lib/auth-helpers';
import { getDatabase } from '@backuphub/db';
import { databases, backup_jobs, workspaces, eq, and, desc } from '@backuphub/db';
import { inspectSchema, diffSchemas } from '@/lib/schema-inspector';
import type { DatabaseSchema } from '@/lib/schema-inspector';
import { decrypt } from '@/lib/crypto';

const querySchema = z.object({
  database_id: z.string().uuid(),
  baseline_backup_id: z.string().uuid().optional(),
});

function buildConnectionString(db: {
  type: string; host: string; port: number; username: string;
  password_encrypted: string; database_name: string; ssl: boolean;
}): string {
  const password = decrypt(db.password_encrypted);
  const encoded = encodeURIComponent(password);
  const sslParam = db.ssl ? '?sslmode=require' : '';
  return `postgresql://${db.username}:${encoded}@${db.host}:${db.port}/${db.database_name}${sslParam}`;
}

// GET /api/schema-diff?database_id=<uuid>
export async function GET(req: NextRequest) {
  const userId = await getAuthUserId();
  if (!userId) return unauthorized();

  const url = new URL(req.url);
  const params = {
    database_id: url.searchParams.get('database_id') ?? undefined,
    baseline_backup_id: url.searchParams.get('baseline_backup_id') ?? undefined,
  };

  const parsed = querySchema.safeParse(params);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
  }

  const db = getDatabase();

  // Get database record
  const [dbRecord] = await db
    .select()
    .from(databases)
    .where(eq(databases.id, parsed.data.database_id))
    .limit(1);

  if (!dbRecord) return NextResponse.json({ error: 'Database not found' }, { status: 404 });

  // Verify workspace ownership
  const [workspace] = await db
    .select({ owner_id: workspaces.owner_id })
    .from(workspaces)
    .where(eq(workspaces.id, dbRecord.workspace_id))
    .limit(1);

  if (!workspace || workspace.owner_id !== userId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const connStr = buildConnectionString(dbRecord);
    const currentSchema = await inspectSchema(connStr);

    // Try to get baseline schema
    let baselineSchema: DatabaseSchema | null = null;

    if (parsed.data.baseline_backup_id) {
      const [backup] = await db
        .select({ schema_snapshot: backup_jobs.schema_snapshot })
        .from(backup_jobs)
        .where(and(
          eq(backup_jobs.id, parsed.data.baseline_backup_id),
          eq(backup_jobs.database_id, parsed.data.database_id)
        ))
        .limit(1);

      if (backup?.schema_snapshot) {
        baselineSchema = backup.schema_snapshot as DatabaseSchema;
      }
    } else {
      // Latest successful backup snapshot
      const [latestBackup] = await db
        .select({ schema_snapshot: backup_jobs.schema_snapshot })
        .from(backup_jobs)
        .where(and(
          eq(backup_jobs.database_id, parsed.data.database_id),
          eq(backup_jobs.status, 'completed')
        ))
        .orderBy(desc(backup_jobs.completed_at))
        .limit(1);

      if (latestBackup?.schema_snapshot) {
        baselineSchema = latestBackup.schema_snapshot as DatabaseSchema;
      }
    }

    if (!baselineSchema) {
      return NextResponse.json({
        message: 'No baseline schema available. Run at least one backup to establish a baseline.',
        current_schema: currentSchema,
        diff: null,
      });
    }

    const diff = diffSchemas(baselineSchema, currentSchema);

    return NextResponse.json({
      current_schema: currentSchema,
      baseline_captured_at: baselineSchema.captured_at,
      diff,
    });

  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to inspect schema';
    console.error('[schema-diff] Error:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
