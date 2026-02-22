"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
exports.POST = POST;
const server_1 = require("next/server");
const zod_1 = require("zod");
const db_1 = require("@backuphub/db");
const crypto_1 = require("@/lib/crypto");
const auth_helpers_1 = require("@/lib/auth-helpers");
const createDatabaseSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(100),
    type: zod_1.z.enum(['postgres', 'mysql']),
    host: zod_1.z.string().min(1).max(255),
    port: zod_1.z.number().int().min(1).max(65535),
    username: zod_1.z.string().min(1).max(100),
    password: zod_1.z.string().min(1),
    database_name: zod_1.z.string().min(1).max(100),
    ssl: zod_1.z.boolean().default(false),
    schedule_cron: zod_1.z.string().optional(),
    retention_days: zod_1.z.number().int().min(1).max(365).default(30),
});
// GET /api/databases — list user's databases
async function GET() {
    const userId = await (0, auth_helpers_1.getAuthUserId)();
    if (!userId)
        return (0, auth_helpers_1.unauthorized)();
    const db = (0, db_1.getDatabase)();
    // Get user's workspace
    const [workspace] = await db
        .select({ id: db_1.workspaces.id })
        .from(db_1.workspaces)
        .where((0, db_1.eq)(db_1.workspaces.owner_id, userId))
        .limit(1);
    if (!workspace) {
        return server_1.NextResponse.json({ databases: [] });
    }
    const dbs = await db
        .select({
        id: db_1.databases.id,
        name: db_1.databases.name,
        type: db_1.databases.type,
        host: db_1.databases.host,
        port: db_1.databases.port,
        username: db_1.databases.username,
        database_name: db_1.databases.database_name,
        ssl: db_1.databases.ssl,
        schedule_cron: db_1.databases.schedule_cron,
        retention_days: db_1.databases.retention_days,
        next_backup_at: db_1.databases.next_backup_at,
        created_at: db_1.databases.created_at,
        updated_at: db_1.databases.updated_at,
        // Note: password_encrypted is intentionally excluded
    })
        .from(db_1.databases)
        .where((0, db_1.eq)(db_1.databases.workspace_id, workspace.id))
        .orderBy((0, db_1.desc)(db_1.databases.created_at));
    return server_1.NextResponse.json({ databases: dbs });
}
// POST /api/databases — create a database connection
async function POST(req) {
    const userId = await (0, auth_helpers_1.getAuthUserId)();
    if (!userId)
        return (0, auth_helpers_1.unauthorized)();
    let body;
    try {
        body = await req.json();
    }
    catch {
        return server_1.NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }
    const parsed = createDatabaseSchema.safeParse(body);
    if (!parsed.success) {
        return server_1.NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid input' }, { status: 400 });
    }
    const { password, ...rest } = parsed.data;
    const db = (0, db_1.getDatabase)();
    // Get or create workspace
    let [workspace] = await db
        .select({ id: db_1.workspaces.id })
        .from(db_1.workspaces)
        .where((0, db_1.eq)(db_1.workspaces.owner_id, userId))
        .limit(1);
    if (!workspace) {
        // Auto-create default workspace for the user
        const [newWorkspace] = await db
            .insert(db_1.workspaces)
            .values({
            owner_id: userId,
            name: 'My Workspace',
            slug: `workspace-${userId.slice(0, 8)}`,
        })
            .returning({ id: db_1.workspaces.id });
        workspace = newWorkspace;
    }
    // Encrypt password
    let passwordEncrypted;
    try {
        passwordEncrypted = (0, crypto_1.encrypt)(password);
    }
    catch {
        return server_1.NextResponse.json({ error: 'Encryption configuration error. Contact support.' }, { status: 500 });
    }
    const [newDb] = await db
        .insert(db_1.databases)
        .values({
        workspace_id: workspace.id,
        password_encrypted: passwordEncrypted,
        ...rest,
    })
        .returning({
        id: db_1.databases.id,
        name: db_1.databases.name,
        type: db_1.databases.type,
        host: db_1.databases.host,
        port: db_1.databases.port,
        username: db_1.databases.username,
        database_name: db_1.databases.database_name,
        ssl: db_1.databases.ssl,
        schedule_cron: db_1.databases.schedule_cron,
        retention_days: db_1.databases.retention_days,
        created_at: db_1.databases.created_at,
    });
    return server_1.NextResponse.json({ database: newDb }, { status: 201 });
}
//# sourceMappingURL=route.js.map