"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkAndEnqueueDueBackups = checkAndEnqueueDueBackups;
exports.startScheduler = startScheduler;
const db_1 = require("@backuphub/db");
const queue_1 = require("./queue");
/**
 * Sprint 1.6 — Backup Scheduler
 * Checks databases.next_backup_at every 5 minutes.
 * Creates BullMQ jobs for due backups.
 */
async function checkAndEnqueueDueBackups() {
    const now = new Date();
    // Find databases due for backup
    const dueDatabases = await db_1.db
        .select({
        id: db_1.databases.id,
        workspace_id: db_1.databases.workspace_id,
        name: db_1.databases.name,
        schedule_cron: db_1.databases.schedule_cron,
        next_backup_at: db_1.databases.next_backup_at,
        retention_days: db_1.databases.retention_days,
    })
        .from(db_1.databases)
        .where(
    // Has a schedule AND next_backup_at is in the past
    (0, db_1.isNotNull)(db_1.databases.schedule_cron) &&
        (0, db_1.isNotNull)(db_1.databases.next_backup_at) &&
        (0, db_1.lte)(db_1.databases.next_backup_at, now));
    if (dueDatabases.length === 0) {
        console.log(`[Scheduler] No backups due at ${now.toISOString()}`);
        return;
    }
    console.log(`[Scheduler] ${dueDatabases.length} backup(s) due`);
    for (const database of dueDatabases) {
        try {
            // Create a backup_jobs record
            const [job] = await db_1.db
                .insert(db_1.backup_jobs)
                .values({
                database_id: database.id,
                status: 'pending',
            })
                .returning({ id: db_1.backup_jobs.id });
            if (!job)
                continue;
            // Enqueue in BullMQ
            await (0, queue_1.enqueueBackup)({
                jobId: job.id,
                databaseId: database.id,
                workspaceId: database.workspace_id,
            });
            // Calculate next backup time from cron schedule
            const nextBackupAt = getNextCronDate(database.schedule_cron);
            await db_1.db
                .update(db_1.databases)
                .set({ next_backup_at: nextBackupAt, updated_at: new Date() })
                .where((0, db_1.eq)(db_1.databases.id, database.id));
            console.log(`[Scheduler] Enqueued backup for db=${database.id} (${database.name}), next=${nextBackupAt.toISOString()}`);
        }
        catch (err) {
            console.error(`[Scheduler] Failed to enqueue backup for db=${database.id}:`, err);
        }
    }
}
/**
 * Simple cron next-date calculator
 * Supports standard cron expressions (minute, hour, day, month, weekday)
 */
function getNextCronDate(cronExpression) {
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
function startScheduler() {
    const INTERVAL_MS = 5 * 60 * 1000; // 5 minutes
    console.log('[Scheduler] Starting backup scheduler (5-minute interval)');
    // Run immediately on start
    void checkAndEnqueueDueBackups().catch(console.error);
    // Then repeat
    setInterval(() => {
        void checkAndEnqueueDueBackups().catch(console.error);
    }, INTERVAL_MS);
}
//# sourceMappingURL=scheduler.js.map