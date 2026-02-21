"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.backupQueue = exports.BACKUP_QUEUE_NAME = exports.connection = void 0;
exports.enqueueBackup = enqueueBackup;
const bullmq_1 = require("bullmq");
const ioredis_1 = __importDefault(require("ioredis"));
function getRedisConnection() {
    const url = process.env.REDIS_URL;
    if (!url)
        throw new Error('Missing REDIS_URL environment variable');
    return new ioredis_1.default(url, {
        maxRetriesPerRequest: null, // Required by BullMQ
        enableReadyCheck: false,
    });
}
exports.connection = getRedisConnection();
exports.BACKUP_QUEUE_NAME = 'backup-jobs';
exports.backupQueue = new bullmq_1.Queue(exports.BACKUP_QUEUE_NAME, {
    connection: exports.connection,
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
async function enqueueBackup(data) {
    return exports.backupQueue.add('run-backup', data, {
        jobId: data.jobId, // Use our DB job ID as BullMQ job ID for idempotency
    });
}
//# sourceMappingURL=queue.js.map