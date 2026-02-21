import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getAuthUserId, unauthorized } from '@/lib/auth-helpers';
import { getDatabase } from '@backuphub/db';
import { backup_jobs, databases, workspaces, eq, and, desc } from '@backuphub/db';

const querySchema = z.object({
  database_id: z.string().uuid().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

// GET /api/backups?database_id=<uuid>
export async function GET(req: NextRequest) {
  const userId = await getAuthUserId();
  if (!userId) return unauthorized();

  const url = new URL(req.url);
  const parsed = querySchema.safeParse({
    database_id: url.searchParams.get('database_id') ?? undefined,
    limit: url.searchParams.get('limit') ?? 50,
  });

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
  }

  const db = getDatabase();

  // Build query with workspace verification
  if (parsed.data.database_id) {
    // Verify the database belongs to the user's workspace
    const [dbRecord] = await db
      .select({ workspace_id: databases.workspace_id })
      .from(databases)
      .where(eq(databases.id, parsed.data.database_id))
      .limit(1);

    if (!dbRecord) return NextResponse.json({ error: 'Database not found' }, { status: 404 });

    const [workspace] = await db
      .select({ owner_id: workspaces.owner_id })
      .from(workspaces)
      .where(eq(workspaces.id, dbRecord.workspace_id))
      .limit(1);

    if (!workspace || workspace.owner_id !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const backups = await db
      .select()
      .from(backup_jobs)
      .where(eq(backup_jobs.database_id, parsed.data.database_id))
      .orderBy(desc(backup_jobs.created_at))
      .limit(parsed.data.limit);

    return NextResponse.json({ backups });
  }

  // Return all backups for all user's databases
  const backups = await db
    .select({
      id: backup_jobs.id,
      database_id: backup_jobs.database_id,
      status: backup_jobs.status,
      s3_key: backup_jobs.s3_key,
      size_bytes: backup_jobs.size_bytes,
      started_at: backup_jobs.started_at,
      completed_at: backup_jobs.completed_at,
      error_message: backup_jobs.error_message,
      created_at: backup_jobs.created_at,
    })
    .from(backup_jobs)
    .innerJoin(databases, eq(backup_jobs.database_id, databases.id))
    .innerJoin(workspaces, and(
      eq(databases.workspace_id, workspaces.id),
      eq(workspaces.owner_id, userId)
    ))
    .orderBy(desc(backup_jobs.created_at))
    .limit(parsed.data.limit);

  return NextResponse.json({ backups });
}
