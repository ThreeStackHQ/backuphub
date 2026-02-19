import {
  pgTable,
  text,
  timestamp,
  uuid,
  integer,
  bigint,
  boolean,
  pgEnum,
  index,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ─── Enums ────────────────────────────────────────────────────────────────────

export const databaseTypeEnum = pgEnum('database_type', ['postgres', 'mysql']);

export const backupStatusEnum = pgEnum('backup_status', [
  'pending',
  'running',
  'completed',
  'failed',
]);

export const subscriptionTierEnum = pgEnum('subscription_tier', [
  'free',
  'pro',
  'business',
]);

export const subscriptionStatusEnum = pgEnum('subscription_status', [
  'active',
  'inactive',
  'canceled',
]);

// ─── Tables ───────────────────────────────────────────────────────────────────

/**
 * Users — registered accounts
 */
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  password_hash: text('password_hash').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

/**
 * Workspaces — team/org container
 */
export const workspaces = pgTable('workspaces', {
  id: uuid('id').primaryKey().defaultRandom(),
  owner_id: uuid('owner_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

/**
 * Databases — user-registered database connections
 */
export const databases = pgTable(
  'databases',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    workspace_id: uuid('workspace_id')
      .notNull()
      .references(() => workspaces.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    type: databaseTypeEnum('type').notNull(),
    host: text('host').notNull(),
    port: integer('port').notNull(),
    username: text('username').notNull(),
    password_encrypted: text('password_encrypted').notNull(), // AES-256-GCM encrypted
    database_name: text('database_name').notNull(),
    ssl: boolean('ssl').default(false).notNull(),
    // Scheduling
    schedule_cron: text('schedule_cron'), // e.g. "0 2 * * *" (2am daily)
    next_backup_at: timestamp('next_backup_at'),
    retention_days: integer('retention_days').default(30).notNull(),
    created_at: timestamp('created_at').defaultNow().notNull(),
    updated_at: timestamp('updated_at').defaultNow().notNull(),
  },
  (t) => ({
    workspace_idx: index('databases_workspace_idx').on(t.workspace_id),
    next_backup_idx: index('databases_next_backup_idx').on(t.next_backup_at),
  })
);

/**
 * Backup Jobs — individual backup records
 */
export const backup_jobs = pgTable(
  'backup_jobs',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    database_id: uuid('database_id')
      .notNull()
      .references(() => databases.id, { onDelete: 'cascade' }),
    status: backupStatusEnum('status').notNull().default('pending'),
    // Storage
    s3_key: text('s3_key'), // R2 object key
    size_bytes: bigint('size_bytes', { mode: 'number' }), // compressed size
    // Timing
    started_at: timestamp('started_at'),
    completed_at: timestamp('completed_at'),
    error_message: text('error_message'),
    // Schema snapshot (for diff)
    schema_hash: text('schema_hash'), // SHA-256 of schema DDL
    // Metadata
    created_at: timestamp('created_at').defaultNow().notNull(),
  },
  (t) => ({
    database_idx: index('backup_jobs_database_idx').on(t.database_id),
    status_idx: index('backup_jobs_status_idx').on(t.status),
    created_idx: index('backup_jobs_created_idx').on(t.created_at),
  })
);

/**
 * Subscriptions — Stripe billing tiers
 */
export const subscriptions = pgTable('subscriptions', {
  id: uuid('id').primaryKey().defaultRandom(),
  workspace_id: uuid('workspace_id')
    .notNull()
    .references(() => workspaces.id, { onDelete: 'cascade' })
    .unique(),
  tier: subscriptionTierEnum('tier').notNull().default('free'),
  status: subscriptionStatusEnum('status').notNull().default('active'),
  stripe_customer_id: text('stripe_customer_id'),
  stripe_subscription_id: text('stripe_subscription_id'),
  current_period_end: timestamp('current_period_end'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// ─── Relations ────────────────────────────────────────────────────────────────

export const usersRelations = relations(users, ({ many }) => ({
  workspaces: many(workspaces),
}));

export const workspacesRelations = relations(workspaces, ({ one, many }) => ({
  owner: one(users, { fields: [workspaces.owner_id], references: [users.id] }),
  databases: many(databases),
  subscription: one(subscriptions, {
    fields: [workspaces.id],
    references: [subscriptions.workspace_id],
  }),
}));

export const databasesRelations = relations(databases, ({ one, many }) => ({
  workspace: one(workspaces, {
    fields: [databases.workspace_id],
    references: [workspaces.id],
  }),
  backup_jobs: many(backup_jobs),
}));

export const backupJobsRelations = relations(backup_jobs, ({ one }) => ({
  database: one(databases, {
    fields: [backup_jobs.database_id],
    references: [databases.id],
  }),
}));

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  workspace: one(workspaces, {
    fields: [subscriptions.workspace_id],
    references: [workspaces.id],
  }),
}));
