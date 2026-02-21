"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const processor_1 = require("./processor");
const scheduler_1 = require("./scheduler");
console.log('[BackupHub Worker] Starting...');
// Start BullMQ worker (processes backup jobs)
const worker = (0, processor_1.startWorker)();
// Start backup scheduler (enqueues jobs based on database schedules)
(0, scheduler_1.startScheduler)();
// Graceful shutdown
async function shutdown() {
    console.log('[BackupHub Worker] Shutting down...');
    await worker.close();
    process.exit(0);
}
process.on('SIGTERM', () => void shutdown());
process.on('SIGINT', () => void shutdown());
console.log('[BackupHub Worker] Ready ✓');
//# sourceMappingURL=index.js.map