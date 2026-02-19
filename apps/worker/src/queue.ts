import { Queue, Worker, type Job } from 'bullmq';
import IORedis from 'ioredis';

function getRedisConnection(): IORedis {
  const url = process.env.REDIS_URL;
  if (!url) throw new Error('Missing REDIS_URL environment variable');

  return new IORedis(url, {
    maxRetriesPerRequest: null, // Required by BullMQ
    enableReadyCheck: false,
  });
}

export const connection = getRedisConnection();

export const BACKUP_QUEUE_NAME = 'backup-jobs';

export interface BackupJobData {
  jobId: string;        // backup_jobs.id
  databaseId: string;   // databases.id
  workspaceId: string;  // workspaces.id
}

export const backupQueue = new Queue<BackupJobData>(BACKUP_QUEUE_NAME, {
  connection,
  defaultJobOptions: {
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 50 },
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000, // 5s, 25s, 125s
    },
  },
});

/**
 * Add a backup job to the queue
 */
export async function enqueueBackup(data: BackupJobData): Promise<Job<BackupJobData>> {
  return backupQueue.add('run-backup', data, {
    jobId: data.jobId, // Use our DB job ID as BullMQ job ID for idempotency
  });
}
