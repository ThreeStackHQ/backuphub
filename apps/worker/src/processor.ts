import { Worker, type Job } from 'bullmq';
import { createHash } from 'crypto';
import {
  db,
  databases,
  backup_jobs,
  eq,
} from '@backuphub/db';
import { createBackup, extractSchema, type DatabaseConnection } from '@backuphub/backup-engine';
import { uploadBackup, buildBackupKey } from '@backuphub/s3';
import { connection, BACKUP_QUEUE_NAME, type BackupJobData } from './queue';
import { decrypt } from './crypto';
import { sendBackupFailureAlert } from './alerts';

async function runBackup(job: Job<BackupJobData>): Promise<void> {
  const { jobId, databaseId, workspaceId } = job.data;

  console.log(`[Backup] Starting job=${jobId} database=${databaseId}`);

  // Mark job as running
  await db
    .update(backup_jobs)
    .set({ status: 'running', started_at: new Date() })
    .where(eq(backup_jobs.id, jobId));

  // Fetch database connection details
  const [dbRecord] = await db
    .select()
    .from(databases)
    .where(eq(databases.id, databaseId))
    .limit(1);

  if (!dbRecord) {
    throw new Error(`Database not found: ${databaseId}`);
  }

  // Decrypt password
  const password = decrypt(dbRecord.password_encrypted);

  const conn: DatabaseConnection = {
    type: dbRecord.type,
    host: dbRecord.host,
    port: dbRecord.port,
    username: dbRecord.username,
    password,
    database: dbRecord.database_name,
    ssl: dbRecord.ssl,
  };

  // Create backup stream
  const { stream, cleanup } = createBackup(conn);

  try {
    // Build S3 key
    const s3Key = buildBackupKey(workspaceId, databaseId, jobId);

    // Collect stream to buffer for upload + size tracking
    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
      chunks.push(chunk as Buffer);
    }
    const buffer = Buffer.concat(chunks);

    // Upload to R2
    await uploadBackup({
      key: s3Key,
      body: buffer,
      contentType: 'application/gzip',
      contentLength: buffer.length,
    });

    // Extract schema for diff (compute hash)
    const schemaHash = createHash('sha256').update(buffer).digest('hex').slice(0, 16);

    // Mark complete
    await db
      .update(backup_jobs)
      .set({
        status: 'completed',
        completed_at: new Date(),
        s3_key: s3Key,
        size_bytes: buffer.length,
        schema_hash: schemaHash,
      })
      .where(eq(backup_jobs.id, jobId));

    console.log(`[Backup] Completed job=${jobId} size=${buffer.length} bytes`);
  } catch (err) {
    cleanup();

    const errorMessage = err instanceof Error ? err.message : String(err);

    // Mark as failed
    await db
      .update(backup_jobs)
      .set({
        status: 'failed',
        completed_at: new Date(),
        error_message: errorMessage,
      })
      .where(eq(backup_jobs.id, jobId));

    // Send alert email
    try {
      await sendBackupFailureAlert({
        databaseName: dbRecord.name,
        databaseType: dbRecord.type,
        jobId,
        errorMessage,
      });
    } catch (alertErr) {
      console.error('[Backup] Failed to send alert email:', alertErr);
    }

    throw new Error(errorMessage);
  }
}

export function startWorker(): Worker<BackupJobData> {
  const worker = new Worker<BackupJobData>(
    BACKUP_QUEUE_NAME,
    async (job) => runBackup(job),
    {
      connection,
      concurrency: 5, // Process up to 5 backups simultaneously
    }
  );

  worker.on('completed', (job) => {
    console.log(`[Worker] Job ${job.id} completed`);
  });

  worker.on('failed', (job, err) => {
    console.error(`[Worker] Job ${job?.id} failed:`, err.message);
  });

  worker.on('error', (err) => {
    console.error('[Worker] Error:', err);
  });

  return worker;
}
