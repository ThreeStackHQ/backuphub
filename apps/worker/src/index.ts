import { startWorker } from './processor';
import { startScheduler } from './scheduler';

console.log('[BackupHub Worker] Starting...');

// Start BullMQ worker (processes backup jobs)
const worker = startWorker();

// Start backup scheduler (enqueues jobs based on database schedules)
startScheduler();

// Graceful shutdown
async function shutdown() {
  console.log('[BackupHub Worker] Shutting down...');
  await worker.close();
  process.exit(0);
}

process.on('SIGTERM', () => void shutdown());
process.on('SIGINT', () => void shutdown());

console.log('[BackupHub Worker] Ready ✓');
