"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
const server_1 = require("next/server");
const zod_1 = require("zod");
const auth_helpers_1 = require("@/lib/auth-helpers");
const db_1 = require("@backuphub/db");
const db_2 = require("@backuphub/db");
const querySchema = zod_1.z.object({
    database_id: zod_1.z.string().uuid().optional(),
    limit: zod_1.z.coerce.number().int().min(1).max(100).default(50),
});
// GET /api/backups?database_id=<uuid>
async function GET(req) {
    const userId = await (0, auth_helpers_1.getAuthUserId)();
    if (!userId)
        return (0, auth_helpers_1.unauthorized)();
    const url = new URL(req.url);
    const parsed = querySchema.safeParse({
        database_id: url.searchParams.get('database_id') ?? undefined,
        limit: url.searchParams.get('limit') ?? 50,
    });
    if (!parsed.success) {
        return server_1.NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
    }
    const db = (0, db_1.getDatabase)();
    // Build query with workspace verification
    if (parsed.data.database_id) {
        // Verify the database belongs to the user's workspace
        const [dbRecord] = await db
            .select({ workspace_id: db_2.databases.workspace_id })
            .from(db_2.databases)
            .where((0, db_2.eq)(db_2.databases.id, parsed.data.database_id))
            .limit(1);
        if (!dbRecord)
            return server_1.NextResponse.json({ error: 'Database not found' }, { status: 404 });
        const [workspace] = await db
            .select({ owner_id: db_2.workspaces.owner_id })
            .from(db_2.workspaces)
            .where((0, db_2.eq)(db_2.workspaces.id, dbRecord.workspace_id))
            .limit(1);
        if (!workspace || workspace.owner_id !== userId) {
            return server_1.NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }
        const backups = await db
            .select()
            .from(db_2.backup_jobs)
            .where((0, db_2.eq)(db_2.backup_jobs.database_id, parsed.data.database_id))
            .orderBy((0, db_2.desc)(db_2.backup_jobs.created_at))
            .limit(parsed.data.limit);
        return server_1.NextResponse.json({ backups });
    }
    // Return all backups for all user's databases
    const backups = await db
        .select({
        id: db_2.backup_jobs.id,
        database_id: db_2.backup_jobs.database_id,
        status: db_2.backup_jobs.status,
        s3_key: db_2.backup_jobs.s3_key,
        size_bytes: db_2.backup_jobs.size_bytes,
        started_at: db_2.backup_jobs.started_at,
        completed_at: db_2.backup_jobs.completed_at,
        error_message: db_2.backup_jobs.error_message,
        created_at: db_2.backup_jobs.created_at,
    })
        .from(db_2.backup_jobs)
        .innerJoin(db_2.databases, (0, db_2.eq)(db_2.backup_jobs.database_id, db_2.databases.id))
        .innerJoin(db_2.workspaces, (0, db_2.and)((0, db_2.eq)(db_2.databases.workspace_id, db_2.workspaces.id), (0, db_2.eq)(db_2.workspaces.owner_id, userId)))
        .orderBy((0, db_2.desc)(db_2.backup_jobs.created_at))
        .limit(parsed.data.limit);
    return server_1.NextResponse.json({ backups });
}
//# sourceMappingURL=route.js.map