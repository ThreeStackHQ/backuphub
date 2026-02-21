"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.subscriptionsRelations = exports.backupJobsRelations = exports.databasesRelations = exports.workspacesRelations = exports.usersRelations = exports.subscriptions = exports.backup_jobs = exports.databases = exports.workspaces = exports.users = exports.subscriptionStatusEnum = exports.subscriptionTierEnum = exports.backupStatusEnum = exports.databaseTypeEnum = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_orm_1 = require("drizzle-orm");
// ─── Enums ────────────────────────────────────────────────────────────────────
exports.databaseTypeEnum = (0, pg_core_1.pgEnum)('database_type', ['postgres', 'mysql']);
exports.backupStatusEnum = (0, pg_core_1.pgEnum)('backup_status', [
    'pending',
    'running',
    'completed',
    'failed',
]);
exports.subscriptionTierEnum = (0, pg_core_1.pgEnum)('subscription_tier', [
    'free',
    'pro',
    'business',
]);
exports.subscriptionStatusEnum = (0, pg_core_1.pgEnum)('subscription_status', [
    'active',
    'inactive',
    'canceled',
]);
// ─── Tables ───────────────────────────────────────────────────────────────────
/**
 * Users — registered accounts
 */
exports.users = (0, pg_core_1.pgTable)('users', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    email: (0, pg_core_1.text)('email').notNull().unique(),
    name: (0, pg_core_1.text)('name').notNull(),
    password_hash: (0, pg_core_1.text)('password_hash').notNull(),
    created_at: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updated_at: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
});
/**
 * Workspaces — team/org container
 */
exports.workspaces = (0, pg_core_1.pgTable)('workspaces', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    owner_id: (0, pg_core_1.uuid)('owner_id')
        .notNull()
        .references(() => exports.users.id, { onDelete: 'cascade' }),
    name: (0, pg_core_1.text)('name').notNull(),
    slug: (0, pg_core_1.text)('slug').notNull().unique(),
    created_at: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updated_at: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
});
/**
 * Databases — user-registered database connections
 */
exports.databases = (0, pg_core_1.pgTable)('databases', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    workspace_id: (0, pg_core_1.uuid)('workspace_id')
        .notNull()
        .references(() => exports.workspaces.id, { onDelete: 'cascade' }),
    name: (0, pg_core_1.text)('name').notNull(),
    type: (0, exports.databaseTypeEnum)('type').notNull(),
    host: (0, pg_core_1.text)('host').notNull(),
    port: (0, pg_core_1.integer)('port').notNull(),
    username: (0, pg_core_1.text)('username').notNull(),
    password_encrypted: (0, pg_core_1.text)('password_encrypted').notNull(), // AES-256-GCM encrypted
    database_name: (0, pg_core_1.text)('database_name').notNull(),
    ssl: (0, pg_core_1.boolean)('ssl').default(false).notNull(),
    // Scheduling
    schedule_cron: (0, pg_core_1.text)('schedule_cron'), // e.g. "0 2 * * *" (2am daily)
    next_backup_at: (0, pg_core_1.timestamp)('next_backup_at'),
    retention_days: (0, pg_core_1.integer)('retention_days').default(30).notNull(),
    created_at: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updated_at: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
}, (t) => ({
    workspace_idx: (0, pg_core_1.index)('databases_workspace_idx').on(t.workspace_id),
    next_backup_idx: (0, pg_core_1.index)('databases_next_backup_idx').on(t.next_backup_at),
}));
/**
 * Backup Jobs — individual backup records
 */
exports.backup_jobs = (0, pg_core_1.pgTable)('backup_jobs', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    database_id: (0, pg_core_1.uuid)('database_id')
        .notNull()
        .references(() => exports.databases.id, { onDelete: 'cascade' }),
    status: (0, exports.backupStatusEnum)('status').notNull().default('pending'),
    // Storage
    s3_key: (0, pg_core_1.text)('s3_key'), // R2 object key
    size_bytes: (0, pg_core_1.bigint)('size_bytes', { mode: 'number' }), // compressed size
    // Timing
    started_at: (0, pg_core_1.timestamp)('started_at'),
    completed_at: (0, pg_core_1.timestamp)('completed_at'),
    error_message: (0, pg_core_1.text)('error_message'),
    // Schema snapshot (for diff)
    schema_hash: (0, pg_core_1.text)('schema_hash'), // SHA-256 of schema DDL
    schema_snapshot: (0, pg_core_1.jsonb)('schema_snapshot'), // Full schema JSON for diff
    // Metadata
    created_at: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
}, (t) => ({
    database_idx: (0, pg_core_1.index)('backup_jobs_database_idx').on(t.database_id),
    status_idx: (0, pg_core_1.index)('backup_jobs_status_idx').on(t.status),
    created_idx: (0, pg_core_1.index)('backup_jobs_created_idx').on(t.created_at),
}));
/**
 * Subscriptions — Stripe billing tiers
 */
exports.subscriptions = (0, pg_core_1.pgTable)('subscriptions', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    workspace_id: (0, pg_core_1.uuid)('workspace_id')
        .notNull()
        .references(() => exports.workspaces.id, { onDelete: 'cascade' })
        .unique(),
    tier: (0, exports.subscriptionTierEnum)('tier').notNull().default('free'),
    status: (0, exports.subscriptionStatusEnum)('status').notNull().default('active'),
    stripe_customer_id: (0, pg_core_1.text)('stripe_customer_id'),
    stripe_subscription_id: (0, pg_core_1.text)('stripe_subscription_id'),
    current_period_end: (0, pg_core_1.timestamp)('current_period_end'),
    created_at: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updated_at: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
});
// ─── Relations ────────────────────────────────────────────────────────────────
exports.usersRelations = (0, drizzle_orm_1.relations)(exports.users, ({ many }) => ({
    workspaces: many(exports.workspaces),
}));
exports.workspacesRelations = (0, drizzle_orm_1.relations)(exports.workspaces, ({ one, many }) => ({
    owner: one(exports.users, { fields: [exports.workspaces.owner_id], references: [exports.users.id] }),
    databases: many(exports.databases),
    subscription: one(exports.subscriptions, {
        fields: [exports.workspaces.id],
        references: [exports.subscriptions.workspace_id],
    }),
}));
exports.databasesRelations = (0, drizzle_orm_1.relations)(exports.databases, ({ one, many }) => ({
    workspace: one(exports.workspaces, {
        fields: [exports.databases.workspace_id],
        references: [exports.workspaces.id],
    }),
    backup_jobs: many(exports.backup_jobs),
}));
exports.backupJobsRelations = (0, drizzle_orm_1.relations)(exports.backup_jobs, ({ one }) => ({
    database: one(exports.databases, {
        fields: [exports.backup_jobs.database_id],
        references: [exports.databases.id],
    }),
}));
exports.subscriptionsRelations = (0, drizzle_orm_1.relations)(exports.subscriptions, ({ one }) => ({
    workspace: one(exports.workspaces, {
        fields: [exports.subscriptions.workspace_id],
        references: [exports.workspaces.id],
    }),
}));
//# sourceMappingURL=schema.js.map