import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getDatabase, databases, workspaces, eq, and, desc } from '@backuphub/db';
import { encrypt } from '@/lib/crypto';
import { getAuthUserId, unauthorized } from '@/lib/auth-helpers';

const createDatabaseSchema = z.object({
  name: z.string().min(1).max(100),
  type: z.enum(['postgres', 'mysql']),
  host: z.string().min(1).max(255),
  port: z.number().int().min(1).max(65535),
  username: z.string().min(1).max(100),
  password: z.string().min(1),
  database_name: z.string().min(1).max(100),
  ssl: z.boolean().default(false),
  schedule_cron: z.string().optional(),
  retention_days: z.number().int().min(1).max(365).default(30),
});

// GET /api/databases — list user's databases
export async function GET() {
  const userId = await getAuthUserId();
  if (!userId) return unauthorized();

  const db = getDatabase();

  // Get user's workspace
  const [workspace] = await db
    .select({ id: workspaces.id })
    .from(workspaces)
    .where(eq(workspaces.owner_id, userId))
    .limit(1);

  if (!workspace) {
    return NextResponse.json({ databases: [] });
  }

  const dbs = await db
    .select({
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
      next_backup_at: databases.next_backup_at,
      created_at: databases.created_at,
      updated_at: databases.updated_at,
      // Note: password_encrypted is intentionally excluded
    })
    .from(databases)
    .where(eq(databases.workspace_id, workspace.id))
    .orderBy(desc(databases.created_at));

  return NextResponse.json({ databases: dbs });
}

// POST /api/databases — create a database connection
export async function POST(req: NextRequest) {
  const userId = await getAuthUserId();
  if (!userId) return unauthorized();

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = createDatabaseSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message ?? 'Invalid input' },
      { status: 400 }
    );
  }

  const { password, ...rest } = parsed.data;

  const db = getDatabase();

  // Get or create workspace
  let [workspace] = await db
    .select({ id: workspaces.id })
    .from(workspaces)
    .where(eq(workspaces.owner_id, userId))
    .limit(1);

  if (!workspace) {
    // Auto-create default workspace for the user
    const [newWorkspace] = await db
      .insert(workspaces)
      .values({
        owner_id: userId,
        name: 'My Workspace',
        slug: `workspace-${userId.slice(0, 8)}`,
      })
      .returning({ id: workspaces.id });
    workspace = newWorkspace;
  }

  // Encrypt password
  let passwordEncrypted: string;
  try {
    passwordEncrypted = encrypt(password);
  } catch {
    return NextResponse.json(
      { error: 'Encryption configuration error. Contact support.' },
      { status: 500 }
    );
  }

  const [newDb] = await db
    .insert(databases)
    .values({
      workspace_id: workspace.id,
      password_encrypted: passwordEncrypted,
      ...rest,
    })
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
      created_at: databases.created_at,
    });

  return NextResponse.json({ database: newDb }, { status: 201 });
}
