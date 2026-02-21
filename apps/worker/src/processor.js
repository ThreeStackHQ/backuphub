"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startWorker = startWorker;
const bullmq_1 = require("bullmq");
const crypto_1 = require("crypto");
const db_1 = require("@backuphub/db");
const backup_engine_1 = require("@backuphub/backup-engine");
const s3_1 = require("@backuphub/s3");
const queue_1 = require("./queue");
const crypto_2 = require("./crypto");
const alerts_1 = require("./alerts");
async function runBackup(job) {
    const { jobId, databaseId, workspaceId } = job.data;
    console.log(`[Backup] Starting job=${jobId} database=${databaseId}`);
    // Mark job as running
    await db_1.db
        .update(db_1.backup_jobs)
        .set({ status: 'running', started_at: new Date() })
        .where((0, db_1.eq)(db_1.backup_jobs.id, jobId));
    // Fetch database connection details
    const [dbRecord] = await db_1.db
        .select()
        .from(db_1.databases)
        .where((0, db_1.eq)(db_1.databases.id, databaseId))
        .limit(1);
    if (!dbRecord) {
        throw new Error(`Database not found: ${databaseId}`);
    }
    // Decrypt password
    const password = (0, crypto_2.decrypt)(dbRecord.password_encrypted);
    const conn = {
        type: dbRecord.type,
        host: dbRecord.host,
        port: dbRecord.port,
        username: dbRecord.username,
        password,
        database: dbRecord.database_name,
        ssl: dbRecord.ssl,
    };
    // Create backup stream
    const { stream, cleanup } = (0, backup_engine_1.createBackup)(conn);
    try {
        // Build S3 key
        const s3Key = (0, s3_1.buildBackupKey)(workspaceId, databaseId, jobId);
        // Collect stream to buffer for upload + size tracking
        const chunks = [];
        for await (const chunk of stream) {
            chunks.push(chunk);
        }
        const buffer = Buffer.concat(chunks);
        // Upload to R2
        await (0, s3_1.uploadBackup)({
            key: s3Key,
            body: buffer,
            contentType: 'application/gzip',
            contentLength: buffer.length,
        });
        // Extract schema for diff (compute hash)
        const schemaHash = (0, crypto_1.createHash)('sha256').update(buffer).digest('hex').slice(0, 16);
        // Mark complete
        await db_1.db
            .update(db_1.backup_jobs)
            .set({
            status: 'completed',
            completed_at: new Date(),
            s3_key: s3Key,
            size_bytes: buffer.length,
            schema_hash: schemaHash,
        })
            .where((0, db_1.eq)(db_1.backup_jobs.id, jobId));
        console.log(`[Backup] Completed job=${jobId} size=${buffer.length} bytes`);
    }
    catch (err) {
        cleanup();
        const errorMessage = err instanceof Error ? err.message : String(err);
        // Mark as failed
        await db_1.db
            .update(db_1.backup_jobs)
            .set({
            status: 'failed',
            completed_at: new Date(),
            error_message: errorMessage,
        })
            .where((0, db_1.eq)(db_1.backup_jobs.id, jobId));
        // Send alert email
        try {
            await (0, alerts_1.sendBackupFailureAlert)({
                databaseName: dbRecord.name,
                databaseType: dbRecord.type,
                jobId,
                errorMessage,
            });
        }
        catch (alertErr) {
            console.error('[Backup] Failed to send alert email:', alertErr);
        }
        throw new Error(errorMessage);
    }
}
function startWorker() {
    const worker = new bullmq_1.Worker(queue_1.BACKUP_QUEUE_NAME, async (job) => runBackup(job), {
        connection: queue_1.connection,
        concurrency: 5, // Process up to 5 backups simultaneously
    });
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
//# sourceMappingURL=processor.js.map