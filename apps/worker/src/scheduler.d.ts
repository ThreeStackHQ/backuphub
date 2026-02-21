/**
 * Sprint 1.6 — Backup Scheduler
 * Checks databases.next_backup_at every 5 minutes.
 * Creates BullMQ jobs for due backups.
 */
export declare function checkAndEnqueueDueBackups(): Promise<void>;
/**
 * Start the scheduler loop (runs every 5 minutes)
 */
export declare function startScheduler(): void;
//# sourceMappingURL=scheduler.d.ts.map