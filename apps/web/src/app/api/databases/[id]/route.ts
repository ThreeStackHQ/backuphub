import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getDatabase, databases, workspaces, eq, and } from '@backuphub/db';
import { encrypt } from '@/lib/crypto';
import { getAuthUserId, unauthorized, notFound, forbidden } from '@/lib/auth-helpers';

const updateDatabaseSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  host: z.string().min(1).max(255).optional(),
  port: z.number().int().min(1).max(65535).optional(),
  username: z.string().min(1).max(100).optional(),
  password: z.string().min(1).optional(),
  database_name: z.string().min(1).max(100).optional(),
  ssl: z.boolean().optional(),
  schedule_cron: z.string().nullable().optional(),
  retention_days: z.number().int().min(1).max(365).optional(),
});

async function getDbAndVerifyOwnership(dbId: string, userId: string) {
  const db = getDatabase();

  const [row] = await db
    .select({
      db: databases,
      workspaceOwnerId: workspaces.owner_id,
    })
    .from(databases)
    .innerJoin(workspaces, eq(databases.workspace_id, workspaces.id))
    .where(eq(databases.id, dbId))
    .limit(1);

  if (!row) return { error: 'not_found' as const };
  if (row.workspaceOwnerId !== userId) return { error: 'forbidden' as const };

  return { database: row.db, db };
}

// PATCH /api/databases/:id — update a database connection
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const userId = await getAuthUserId();
  if (!userId) return unauthorized();

  const result = await getDbAndVerifyOwnership(params.id, userId);
  if ('error' in result) {
    return result.error === 'not_found' ? notFound('Database not found') : forbidden();
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = updateDatabaseSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Invalid input' },
      { status: 400 }
    );
  }

  const { password, ...fields } = parsed.data;
  const updates: Record<string, unknown> = { ...fields };

  // Re-encrypt password if provided
  if (password) {
    try {
      updates.password_encrypted = encrypt(password);
    } catch {
      return NextResponse.json(
        { error: 'Encryption configuration error' },
        { status: 500 }
      );
    }
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
  }

  updates.updated_at = new Date();

  const { db } = result;
  const [updated] = await db
    .update(databases)
    .set(updates)
    .where(eq(databases.id, params.id))
    .returning({
      id: databases.id,
      name: databases.name,
      type: databases.type,
      host: databases.host,
      port: databases.port,
      username: databases.username,
      database_name: databases.database_name,
      ssl: databases.ssl,
      schedule_cron: databases.schedule_cron,
      retention_days: databases.retention_days,
      updated_at: databases.updated_at,
    });

  return NextResponse.json({ database: updated });
}

// DELETE /api/databases/:id — delete a database connection
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const userId = await getAuthUserId();
  if (!userId) return unauthorized();

  const result = await getDbAndVerifyOwnership(params.id, userId);
  if ('error' in result) {
    return result.error === 'not_found' ? notFound('Database not found') : forbidden();
  }

  const { db } = result;
  await db.delete(databases).where(eq(databases.id, params.id));

  return NextResponse.json({ success: true });
}

// GET /api/databases/:id — get a single database (without password)
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const userId = await getAuthUserId();
  if (!userId) return unauthorized();

  const result = await getDbAndVerifyOwnership(params.id, userId);
  if ('error' in result) {
    return result.error === 'not_found' ? notFound('Database not found') : forbidden();
  }

  const { database } = result;

  // Strip password before returning
  const { password_encrypted: _pass, ...safe } = database;
  return NextResponse.json({ database: safe });
}
