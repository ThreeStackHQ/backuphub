"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
const server_1 = require("next/server");
const zod_1 = require("zod");
const auth_helpers_1 = require("@/lib/auth-helpers");
const db_1 = require("@backuphub/db");
const db_2 = require("@backuphub/db");
const storage_1 = require("@/lib/storage");
const rate_limit_1 = require("@/lib/rate-limit");
const paramsSchema = zod_1.z.object({
    expires_in: zod_1.z.coerce.number().int().min(60).max(86400).default(3600),
});
// GET /api/backups/:id/download — returns a pre-signed R2 download URL
async function GET(req, { params }) {
    const userId = await (0, auth_helpers_1.getAuthUserId)();
    if (!userId)
        return (0, auth_helpers_1.unauthorized)();
    // Rate limiting: 10 downloads per hour per user
    const allowed = await (0, rate_limit_1.checkRateLimit)(userId, 10, 3600);
    if (!allowed) {
        return server_1.NextResponse.json({ error: 'Rate limit exceeded. Maximum 10 downloads per hour allowed.' }, { status: 429 });
    }
    const url = new URL(req.url);
    const parsed = paramsSchema.safeParse({
        expires_in: url.searchParams.get('expires_in'),
    });
    const expiresIn = parsed.success ? parsed.data.expires_in : 3600;
    const db = (0, db_1.getDatabase)();
    // Get backup + DB + workspace in one join chain
    const [backup] = await db
        .select({
        id: db_2.backup_jobs.id,
        s3_key: db_2.backup_jobs.s3_key,
        status: db_2.backup_jobs.status,
        database_id: db_2.backup_jobs.database_id,
        size_bytes: db_2.backup_jobs.size_bytes,
        completed_at: db_2.backup_jobs.completed_at,
    })
        .from(db_2.backup_jobs)
        .where((0, db_2.eq)(db_2.backup_jobs.id, params.id))
        .limit(1);
    if (!backup) {
        return server_1.NextResponse.json({ error: 'Backup not found' }, { status: 404 });
    }
    if (backup.status !== 'completed') {
        return server_1.NextResponse.json({ error: 'Backup is not yet complete or failed' }, { status: 422 });
    }
    if (!backup.s3_key) {
        return server_1.NextResponse.json({ error: 'Backup has no stored file' }, { status: 422 });
    }
    // Verify ownership via database → workspace → owner
    const [dbRecord] = await db
        .select({ workspace_id: db_2.databases.workspace_id })
        .from(db_2.databases)
        .where((0, db_2.eq)(db_2.databases.id, backup.database_id))
        .limit(1);
    if (!dbRecord) {
        return server_1.NextResponse.json({ error: 'Associated database not found' }, { status: 404 });
    }
    const [workspace] = await db
        .select({ owner_id: db_2.workspaces.owner_id })
        .from(db_2.workspaces)
        .where((0, db_2.eq)(db_2.workspaces.id, dbRecord.workspace_id))
        .limit(1);
    if (!workspace || workspace.owner_id !== userId) {
        return server_1.NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    try {
        const downloadUrl = await (0, storage_1.getPresignedDownloadUrl)(backup.s3_key, expiresIn);
        return server_1.NextResponse.json({
            download_url: downloadUrl,
            expires_in_seconds: expiresIn,
            backup: {
                id: backup.id,
                s3_key: backup.s3_key,
                size_bytes: backup.size_bytes,
                completed_at: backup.completed_at,
            },
        });
    }
    catch (err) {
        console.error('[backup/download] R2 error:', err);
        return server_1.NextResponse.json({ error: 'Failed to generate download URL' }, { status: 500 });
    }
}
//# sourceMappingURL=route.js.map