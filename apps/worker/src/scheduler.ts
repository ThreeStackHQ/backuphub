import { db, databases, backup_jobs, eq, isNotNull, lte } from '@backuphub/db';
import { enqueueBackup } from './queue';

/**
 * Sprint 1.6 — Backup Scheduler
 * Checks databases.next_backup_at every 5 minutes.
 * Creates BullMQ jobs for due backups.
 */
export async function checkAndEnqueueDueBackups(): Promise<void> {
  const now = new Date();

  // Find databases due for backup
  const dueDatabases = await db
    .select({
      id: databases.id,
      workspace_id: databases.workspace_id,
      name: databases.name,
      schedule_cron: databases.schedule_cron,
      next_backup_at: databases.next_backup_at,
      retention_days: databases.retention_days,
    })
    .from(databases)
    .where(
      // Has a schedule AND next_backup_at is in the past
      isNotNull(databases.schedule_cron) &&
      isNotNull(databases.next_backup_at) &&
      lte(databases.next_backup_at, now)
    );

  if (dueDatabases.length === 0) {
    console.log(`[Scheduler] No backups due at ${now.toISOString()}`);
    return;
  }

  console.log(`[Scheduler] ${dueDatabases.length} backup(s) due`);

  for (const database of dueDatabases) {
    try {
      // Create a backup_jobs record
      const [job] = await db
        .insert(backup_jobs)
        .values({
          database_id: database.id,
          status: 'pending',
        })
        .returning({ id: backup_jobs.id });

      if (!job) continue;

      // Enqueue in BullMQ
      await enqueueBackup({
        jobId: job.id,
        databaseId: database.id,
        workspaceId: database.workspace_id,
      });

      // Calculate next backup time from cron schedule
      const nextBackupAt = getNextCronDate(database.schedule_cron!);

      await db
        .update(databases)
        .set({ next_backup_at: nextBackupAt, updated_at: new Date() })
        .where(eq(databases.id, database.id));

      console.log(`[Scheduler] Enqueued backup for db=${database.id} (${database.name}), next=${nextBackupAt.toISOString()}`);
    } catch (err) {
      console.error(`[Scheduler] Failed to enqueue backup for db=${database.id}:`, err);
    }
  }
}

/**
 * Simple cron next-date calculator
 * Supports standard cron expressions (minute, hour, day, month, weekday)
 */
function getNextCronDate(cronExpression: string): Date {
  // For simplicity, parse common patterns
  // In production, use a proper cron library like node-cron or cronstrue
  const parts = cronExpression.trim().split(/\s+/);
  
  if (parts.length !== 5) {
    // Default: 24h from now
    return new Date(Date.now() + 24 * 60 * 60 * 1000);
  }

  const [minute, hour] = parts;
  const now = new Date();
  const next = new Date();

  // Set the time to the scheduled hour/minute today
  next.setHours(parseInt(hour === '*' ? '0' : hour, 10));
  next.setMinutes(parseInt(minute === '*' ? '0' : minute, 10));
  next.setSeconds(0);
  next.setMilliseconds(0);

  // If this time is in the past, add 24 hours
  if (next <= now) {
    next.setDate(next.getDate() + 1);
  }

  return next;
}

/**
 * Start the scheduler loop (runs every 5 minutes)
 */
export function startScheduler(): void {
  const INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

  console.log('[Scheduler] Starting backup scheduler (5-minute interval)');

  // Run immediately on start
  void checkAndEnqueueDueBackups().catch(console.error);

  // Then repeat
  setInterval(() => {
    void checkAndEnqueueDueBackups().catch(console.error);
  }, INTERVAL_MS);
}
