"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PATCH = PATCH;
exports.DELETE = DELETE;
exports.GET = GET;
const server_1 = require("next/server");
const zod_1 = require("zod");
const db_1 = require("@backuphub/db");
const crypto_1 = require("@/lib/crypto");
const auth_helpers_1 = require("@/lib/auth-helpers");
const updateDatabaseSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(100).optional(),
    host: zod_1.z.string().min(1).max(255).optional(),
    port: zod_1.z.number().int().min(1).max(65535).optional(),
    username: zod_1.z.string().min(1).max(100).optional(),
    password: zod_1.z.string().min(1).optional(),
    database_name: zod_1.z.string().min(1).max(100).optional(),
    ssl: zod_1.z.boolean().optional(),
    schedule_cron: zod_1.z.string().nullable().optional(),
    retention_days: zod_1.z.number().int().min(1).max(365).optional(),
});
async function getDbAndVerifyOwnership(dbId, userId) {
    const db = (0, db_1.getDatabase)();
    const [row] = await db
        .select({
        db: db_1.databases,
        workspaceOwnerId: db_1.workspaces.owner_id,
    })
        .from(db_1.databases)
        .innerJoin(db_1.workspaces, (0, db_1.eq)(db_1.databases.workspace_id, db_1.workspaces.id))
        .where((0, db_1.eq)(db_1.databases.id, dbId))
        .limit(1);
    if (!row)
        return { error: 'not_found' };
    if (row.workspaceOwnerId !== userId)
        return { error: 'forbidden' };
    return { database: row.db, db };
}
// PATCH /api/databases/:id — update a database connection
async function PATCH(req, { params }) {
    const userId = await (0, auth_helpers_1.getAuthUserId)();
    if (!userId)
        return (0, auth_helpers_1.unauthorized)();
    const result = await getDbAndVerifyOwnership(params.id, userId);
    if ('error' in result) {
        return result.error === 'not_found' ? (0, auth_helpers_1.notFound)('Database not found') : (0, auth_helpers_1.forbidden)();
    }
    let body;
    try {
        body = await req.json();
    }
    catch {
        return server_1.NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }
    const parsed = updateDatabaseSchema.safeParse(body);
    if (!parsed.success) {
        return server_1.NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid input' }, { status: 400 });
    }
    const { password, ...fields } = parsed.data;
    const updates = { ...fields };
    // Re-encrypt password if provided
    if (password) {
        try {
            updates.password_encrypted = (0, crypto_1.encrypt)(password);
        }
        catch {
            return server_1.NextResponse.json({ error: 'Encryption configuration error' }, { status: 500 });
        }
    }
    if (Object.keys(updates).length === 0) {
        return server_1.NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }
    updates.updated_at = new Date();
    const { db } = result;
    const [updated] = await db
        .update(db_1.databases)
        .set(updates)
        .where((0, db_1.eq)(db_1.databases.id, params.id))
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
        updated_at: db_1.databases.updated_at,
    });
    return server_1.NextResponse.json({ database: updated });
}
// DELETE /api/databases/:id — delete a database connection
async function DELETE(_req, { params }) {
    const userId = await (0, auth_helpers_1.getAuthUserId)();
    if (!userId)
        return (0, auth_helpers_1.unauthorized)();
    const result = await getDbAndVerifyOwnership(params.id, userId);
    if ('error' in result) {
        return result.error === 'not_found' ? (0, auth_helpers_1.notFound)('Database not found') : (0, auth_helpers_1.forbidden)();
    }
    const { db } = result;
    await db.delete(db_1.databases).where((0, db_1.eq)(db_1.databases.id, params.id));
    return server_1.NextResponse.json({ success: true });
}
// GET /api/databases/:id — get a single database (without password)
async function GET(_req, { params }) {
    const userId = await (0, auth_helpers_1.getAuthUserId)();
    if (!userId)
        return (0, auth_helpers_1.unauthorized)();
    const result = await getDbAndVerifyOwnership(params.id, userId);
    if ('error' in result) {
        return result.error === 'not_found' ? (0, auth_helpers_1.notFound)('Database not found') : (0, auth_helpers_1.forbidden)();
    }
    const { database } = result;
    // Strip password before returning
    const { password_encrypted: _pass, ...safe } = database;
    return server_1.NextResponse.json({ database: safe });
}
//# sourceMappingURL=route.js.map