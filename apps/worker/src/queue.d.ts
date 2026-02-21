import { Queue, type Job } from 'bullmq';
import IORedis from 'ioredis';
export declare const connection: IORedis;
export declare const BACKUP_QUEUE_NAME = "backup-jobs";
export interface BackupJobData {
    jobId: string;
    databaseId: string;
    workspaceId: string;
}
export declare const backupQueue: Queue<BackupJobData, any, string, DataTypeOrJob extends Job<infer D, any, any> ? D : DataTypeOrJob, DataTypeOrJob extends Job<any, infer R, any> ? R : DefaultResultType, DataTypeOrJob extends Job<any, any, infer N extends string> ? N : DefaultNameType>;
/**
 * Add a backup job to the queue
 */
export declare function enqueueBackup(data: BackupJobData): Promise<Job<BackupJobData>>;
//# sourceMappingURL=queue.d.ts.map