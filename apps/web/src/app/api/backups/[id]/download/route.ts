import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getAuthUserId, unauthorized } from '@/lib/auth-helpers';
import { getDatabase } from '@backuphub/db';
import { backup_jobs, databases, workspaces, eq } from '@backuphub/db';
import { getPresignedDownloadUrl } from '@/lib/storage';

const paramsSchema = z.object({
  expires_in: z.coerce.number().int().min(60).max(86400).default(3600),
});

// GET /api/backups/:id/download — returns a pre-signed R2 download URL
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const userId = await getAuthUserId();
  if (!userId) return unauthorized();

  const url = new URL(req.url);
  const parsed = paramsSchema.safeParse({
    expires_in: url.searchParams.get('expires_in'),
  });
  const expiresIn = parsed.success ? parsed.data.expires_in : 3600;

  const db = getDatabase();

  // Get backup + DB + workspace in one join chain
  const [backup] = await db
    .select({
      id: backup_jobs.id,
      s3_key: backup_jobs.s3_key,
      status: backup_jobs.status,
      database_id: backup_jobs.database_id,
      size_bytes: backup_jobs.size_bytes,
      completed_at: backup_jobs.completed_at,
    })
    .from(backup_jobs)
    .where(eq(backup_jobs.id, params.id))
    .limit(1);

  if (!backup) {
    return NextResponse.json({ error: 'Backup not found' }, { status: 404 });
  }

  if (backup.status !== 'success') {
    return NextResponse.json({ error: 'Backup is not yet complete or failed' }, { status: 422 });
  }

  if (!backup.s3_key) {
    return NextResponse.json({ error: 'Backup has no stored file' }, { status: 422 });
  }

  // Verify ownership via database → workspace → owner
  const [dbRecord] = await db
    .select({ workspace_id: databases.workspace_id })
    .from(databases)
    .where(eq(databases.id, backup.database_id))
    .limit(1);

  if (!dbRecord) {
    return NextResponse.json({ error: 'Associated database not found' }, { status: 404 });
  }

  const [workspace] = await db
    .select({ owner_id: workspaces.owner_id })
    .from(workspaces)
    .where(eq(workspaces.id, dbRecord.workspace_id))
    .limit(1);

  if (!workspace || workspace.owner_id !== userId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const downloadUrl = await getPresignedDownloadUrl(backup.s3_key, expiresIn);

    return NextResponse.json({
      download_url: downloadUrl,
      expires_in_seconds: expiresIn,
      backup: {
        id: backup.id,
        s3_key: backup.s3_key,
        size_bytes: backup.size_bytes,
        completed_at: backup.completed_at,
      },
    });
  } catch (err) {
    console.error('[backup/download] R2 error:', err);
    return NextResponse.json({ error: 'Failed to generate download URL' }, { status: 500 });
  }
}
