"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
const server_1 = require("next/server");
const zod_1 = require("zod");
const auth_helpers_1 = require("@/lib/auth-helpers");
const db_1 = require("@backuphub/db");
const db_2 = require("@backuphub/db");
const schema_inspector_1 = require("@/lib/schema-inspector");
const crypto_1 = require("@/lib/crypto");
const querySchema = zod_1.z.object({
    database_id: zod_1.z.string().uuid(),
    baseline_backup_id: zod_1.z.string().uuid().optional(),
});
function buildConnectionString(db) {
    const password = (0, crypto_1.decrypt)(db.password_encrypted);
    const encoded = encodeURIComponent(password);
    const sslParam = db.ssl ? '?sslmode=require' : '';
    return `postgresql://${db.username}:${encoded}@${db.host}:${db.port}/${db.database_name}${sslParam}`;
}
// GET /api/schema-diff?database_id=<uuid>
async function GET(req) {
    const userId = await (0, auth_helpers_1.getAuthUserId)();
    if (!userId)
        return (0, auth_helpers_1.unauthorized)();
    const url = new URL(req.url);
    const params = {
        database_id: url.searchParams.get('database_id') ?? undefined,
        baseline_backup_id: url.searchParams.get('baseline_backup_id') ?? undefined,
    };
    const parsed = querySchema.safeParse(params);
    if (!parsed.success) {
        return server_1.NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
    }
    const db = (0, db_1.getDatabase)();
    // Get database record
    const [dbRecord] = await db
        .select()
        .from(db_2.databases)
        .where((0, db_2.eq)(db_2.databases.id, parsed.data.database_id))
        .limit(1);
    if (!dbRecord)
        return server_1.NextResponse.json({ error: 'Database not found' }, { status: 404 });
    // Verify workspace ownership
    const [workspace] = await db
        .select({ owner_id: db_2.workspaces.owner_id })
        .from(db_2.workspaces)
        .where((0, db_2.eq)(db_2.workspaces.id, dbRecord.workspace_id))
        .limit(1);
    if (!workspace || workspace.owner_id !== userId) {
        return server_1.NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    try {
        const connStr = buildConnectionString(dbRecord);
        const currentSchema = await (0, schema_inspector_1.inspectSchema)(connStr);
        // Try to get baseline schema
        let baselineSchema = null;
        if (parsed.data.baseline_backup_id) {
            const [backup] = await db
                .select({ schema_snapshot: db_2.backup_jobs.schema_snapshot })
                .from(db_2.backup_jobs)
                .where((0, db_2.and)((0, db_2.eq)(db_2.backup_jobs.id, parsed.data.baseline_backup_id), (0, db_2.eq)(db_2.backup_jobs.database_id, parsed.data.database_id)))
                .limit(1);
            if (backup?.schema_snapshot) {
                baselineSchema = backup.schema_snapshot;
            }
        }
        else {
            // Latest successful backup snapshot
            const [latestBackup] = await db
                .select({ schema_snapshot: db_2.backup_jobs.schema_snapshot })
                .from(db_2.backup_jobs)
                .where((0, db_2.and)((0, db_2.eq)(db_2.backup_jobs.database_id, parsed.data.database_id), (0, db_2.eq)(db_2.backup_jobs.status, 'completed')))
                .orderBy((0, db_2.desc)(db_2.backup_jobs.completed_at))
                .limit(1);
            if (latestBackup?.schema_snapshot) {
                baselineSchema = latestBackup.schema_snapshot;
            }
        }
        if (!baselineSchema) {
            return server_1.NextResponse.json({
                message: 'No baseline schema available. Run at least one backup to establish a baseline.',
                current_schema: currentSchema,
                diff: null,
            });
        }
        const diff = (0, schema_inspector_1.diffSchemas)(baselineSchema, currentSchema);
        return server_1.NextResponse.json({
            current_schema: currentSchema,
            baseline_captured_at: baselineSchema.captured_at,
            diff,
        });
    }
    catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to inspect schema';
        console.error('[schema-diff] Error:', err);
        return server_1.NextResponse.json({ error: message }, { status: 500 });
    }
}
//# sourceMappingURL=route.js.map