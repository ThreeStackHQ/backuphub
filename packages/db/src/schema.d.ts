export declare const databaseTypeEnum: import("drizzle-orm/pg-core").PgEnum<["postgres", "mysql"]>;
export declare const backupStatusEnum: import("drizzle-orm/pg-core").PgEnum<["pending", "running", "completed", "failed"]>;
export declare const subscriptionTierEnum: import("drizzle-orm/pg-core").PgEnum<["free", "pro", "business"]>;
export declare const subscriptionStatusEnum: import("drizzle-orm/pg-core").PgEnum<["active", "inactive", "canceled"]>;
/**
 * Users — registered accounts
 */
export declare const users: import("drizzle-orm/pg-core").PgTableWithColumns<{
    name: "users";
    schema: undefined;
    columns: {
        id: import("drizzle-orm/pg-core").PgColumn<{
            name: "id";
            tableName: "users";
            dataType: "string";
            columnType: "PgUUID";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: true;
            enumValues: undefined;
            baseColumn: never;
        }, {}, {}>;
        email: import("drizzle-orm/pg-core").PgColumn<{
            name: "email";
            tableName: "users";
            dataType: "string";
            columnType: "PgText";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
        }, {}, {}>;
        name: import("drizzle-orm/pg-core").PgColumn<{
            name: "name";
            tableName: "users";
            dataType: "string";
            columnType: "PgText";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
        }, {}, {}>;
        password_hash: import("drizzle-orm/pg-core").PgColumn<{
            name: "password_hash";
            tableName: "users";
            dataType: "string";
            columnType: "PgText";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
        }, {}, {}>;
        created_at: import("drizzle-orm/pg-core").PgColumn<{
            name: "created_at";
            tableName: "users";
            dataType: "date";
            columnType: "PgTimestamp";
            data: Date;
            driverParam: string;
            notNull: true;
            hasDefault: true;
            enumValues: undefined;
            baseColumn: never;
        }, {}, {}>;
        updated_at: import("drizzle-orm/pg-core").PgColumn<{
            name: "updated_at";
            tableName: "users";
            dataType: "date";
            columnType: "PgTimestamp";
            data: Date;
            driverParam: string;
            notNull: true;
            hasDefault: true;
            enumValues: undefined;
            baseColumn: never;
        }, {}, {}>;
    };
    dialect: "pg";
}>;
/**
 * Workspaces — team/org container
 */
export declare const workspaces: import("drizzle-orm/pg-core").PgTableWithColumns<{
    name: "workspaces";
    schema: undefined;
    columns: {
        id: import("drizzle-orm/pg-core").PgColumn<{
            name: "id";
            tableName: "workspaces";
            dataType: "string";
            columnType: "PgUUID";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: true;
            enumValues: undefined;
            baseColumn: never;
        }, {}, {}>;
        owner_id: import("drizzle-orm/pg-core").PgColumn<{
            name: "owner_id";
            tableName: "workspaces";
            dataType: "string";
            columnType: "PgUUID";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: false;
            enumValues: undefined;
            baseColumn: never;
        }, {}, {}>;
        name: import("drizzle-orm/pg-core").PgColumn<{
            name: "name";
            tableName: "workspaces";
            dataType: "string";
            columnType: "PgText";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
        }, {}, {}>;
        slug: import("drizzle-orm/pg-core").PgColumn<{
            name: "slug";
            tableName: "workspaces";
            dataType: "string";
            columnType: "PgText";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
        }, {}, {}>;
        created_at: import("drizzle-orm/pg-core").PgColumn<{
            name: "created_at";
            tableName: "workspaces";
            dataType: "date";
            columnType: "PgTimestamp";
            data: Date;
            driverParam: string;
            notNull: true;
            hasDefault: true;
            enumValues: undefined;
            baseColumn: never;
        }, {}, {}>;
        updated_at: import("drizzle-orm/pg-core").PgColumn<{
            name: "updated_at";
            tableName: "workspaces";
            dataType: "date";
            columnType: "PgTimestamp";
            data: Date;
            driverParam: string;
            notNull: true;
            hasDefault: true;
            enumValues: undefined;
            baseColumn: never;
        }, {}, {}>;
    };
    dialect: "pg";
}>;
/**
 * Databases — user-registered database connections
 */
export declare const databases: import("drizzle-orm/pg-core").PgTableWithColumns<{
    name: "databases";
    schema: undefined;
    columns: {
        id: import("drizzle-orm/pg-core").PgColumn<{
            name: "id";
            tableName: "databases";
            dataType: "string";
            columnType: "PgUUID";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: true;
            enumValues: undefined;
            baseColumn: never;
        }, {}, {}>;
        workspace_id: import("drizzle-orm/pg-core").PgColumn<{
            name: "workspace_id";
            tableName: "databases";
            dataType: "string";
            columnType: "PgUUID";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: false;
            enumValues: undefined;
            baseColumn: never;
        }, {}, {}>;
        name: import("drizzle-orm/pg-core").PgColumn<{
            name: "name";
            tableName: "databases";
            dataType: "string";
            columnType: "PgText";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
        }, {}, {}>;
        type: import("drizzle-orm/pg-core").PgColumn<{
            name: "type";
            tableName: "databases";
            dataType: "string";
            columnType: "PgEnumColumn";
            data: "postgres" | "mysql";
            driverParam: string;
            notNull: true;
            hasDefault: false;
            enumValues: ["postgres", "mysql"];
            baseColumn: never;
        }, {}, {}>;
        host: import("drizzle-orm/pg-core").PgColumn<{
            name: "host";
            tableName: "databases";
            dataType: "string";
            columnType: "PgText";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
        }, {}, {}>;
        port: import("drizzle-orm/pg-core").PgColumn<{
            name: "port";
            tableName: "databases";
            dataType: "number";
            columnType: "PgInteger";
            data: number;
            driverParam: string | number;
            notNull: true;
            hasDefault: false;
            enumValues: undefined;
            baseColumn: never;
        }, {}, {}>;
        username: import("drizzle-orm/pg-core").PgColumn<{
            name: "username";
            tableName: "databases";
            dataType: "string";
            columnType: "PgText";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
        }, {}, {}>;
        password_encrypted: import("drizzle-orm/pg-core").PgColumn<{
            name: "password_encrypted";
            tableName: "databases";
            dataType: "string";
            columnType: "PgText";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
        }, {}, {}>;
        database_name: import("drizzle-orm/pg-core").PgColumn<{
            name: "database_name";
            tableName: "databases";
            dataType: "string";
            columnType: "PgText";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
        }, {}, {}>;
        ssl: import("drizzle-orm/pg-core").PgColumn<{
            name: "ssl";
            tableName: "databases";
            dataType: "boolean";
            columnType: "PgBoolean";
            data: boolean;
            driverParam: boolean;
            notNull: true;
            hasDefault: true;
            enumValues: undefined;
            baseColumn: never;
        }, {}, {}>;
        schedule_cron: import("drizzle-orm/pg-core").PgColumn<{
            name: "schedule_cron";
            tableName: "databases";
            dataType: "string";
            columnType: "PgText";
            data: string;
            driverParam: string;
            notNull: false;
            hasDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
        }, {}, {}>;
        next_backup_at: import("drizzle-orm/pg-core").PgColumn<{
            name: "next_backup_at";
            tableName: "databases";
            dataType: "date";
            columnType: "PgTimestamp";
            data: Date;
            driverParam: string;
            notNull: false;
            hasDefault: false;
            enumValues: undefined;
            baseColumn: never;
        }, {}, {}>;
        retention_days: import("drizzle-orm/pg-core").PgColumn<{
            name: "retention_days";
            tableName: "databases";
            dataType: "number";
            columnType: "PgInteger";
            data: number;
            driverParam: string | number;
            notNull: true;
            hasDefault: true;
            enumValues: undefined;
            baseColumn: never;
        }, {}, {}>;
        created_at: import("drizzle-orm/pg-core").PgColumn<{
            name: "created_at";
            tableName: "databases";
            dataType: "date";
            columnType: "PgTimestamp";
            data: Date;
            driverParam: string;
            notNull: true;
            hasDefault: true;
            enumValues: undefined;
            baseColumn: never;
        }, {}, {}>;
        updated_at: import("drizzle-orm/pg-core").PgColumn<{
            name: "updated_at";
            tableName: "databases";
            dataType: "date";
            columnType: "PgTimestamp";
            data: Date;
            driverParam: string;
            notNull: true;
            hasDefault: true;
            enumValues: undefined;
            baseColumn: never;
        }, {}, {}>;
    };
    dialect: "pg";
}>;
/**
 * Backup Jobs — individual backup records
 */
export declare const backup_jobs: import("drizzle-orm/pg-core").PgTableWithColumns<{
    name: "backup_jobs";
    schema: undefined;
    columns: {
        id: import("drizzle-orm/pg-core").PgColumn<{
            name: "id";
            tableName: "backup_jobs";
            dataType: "string";
            columnType: "PgUUID";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: true;
            enumValues: undefined;
            baseColumn: never;
        }, {}, {}>;
        database_id: import("drizzle-orm/pg-core").PgColumn<{
            name: "database_id";
            tableName: "backup_jobs";
            dataType: "string";
            columnType: "PgUUID";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: false;
            enumValues: undefined;
            baseColumn: never;
        }, {}, {}>;
        status: import("drizzle-orm/pg-core").PgColumn<{
            name: "status";
            tableName: "backup_jobs";
            dataType: "string";
            columnType: "PgEnumColumn";
            data: "pending" | "running" | "completed" | "failed";
            driverParam: string;
            notNull: true;
            hasDefault: true;
            enumValues: ["pending", "running", "completed", "failed"];
            baseColumn: never;
        }, {}, {}>;
        s3_key: import("drizzle-orm/pg-core").PgColumn<{
            name: "s3_key";
            tableName: "backup_jobs";
            dataType: "string";
            columnType: "PgText";
            data: string;
            driverParam: string;
            notNull: false;
            hasDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
        }, {}, {}>;
        size_bytes: import("drizzle-orm/pg-core").PgColumn<{
            name: "size_bytes";
            tableName: "backup_jobs";
            dataType: "number";
            columnType: "PgBigInt53";
            data: number;
            driverParam: string | number;
            notNull: false;
            hasDefault: false;
            enumValues: undefined;
            baseColumn: never;
        }, {}, {}>;
        started_at: import("drizzle-orm/pg-core").PgColumn<{
            name: "started_at";
            tableName: "backup_jobs";
            dataType: "date";
            columnType: "PgTimestamp";
            data: Date;
            driverParam: string;
            notNull: false;
            hasDefault: false;
            enumValues: undefined;
            baseColumn: never;
        }, {}, {}>;
        completed_at: import("drizzle-orm/pg-core").PgColumn<{
            name: "completed_at";
            tableName: "backup_jobs";
            dataType: "date";
            columnType: "PgTimestamp";
            data: Date;
            driverParam: string;
            notNull: false;
            hasDefault: false;
            enumValues: undefined;
            baseColumn: never;
        }, {}, {}>;
        error_message: import("drizzle-orm/pg-core").PgColumn<{
            name: "error_message";
            tableName: "backup_jobs";
            dataType: "string";
            columnType: "PgText";
            data: string;
            driverParam: string;
            notNull: false;
            hasDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
        }, {}, {}>;
        schema_hash: import("drizzle-orm/pg-core").PgColumn<{
            name: "schema_hash";
            tableName: "backup_jobs";
            dataType: "string";
            columnType: "PgText";
            data: string;
            driverParam: string;
            notNull: false;
            hasDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
        }, {}, {}>;
        schema_snapshot: import("drizzle-orm/pg-core").PgColumn<{
            name: "schema_snapshot";
            tableName: "backup_jobs";
            dataType: "json";
            columnType: "PgJsonb";
            data: unknown;
            driverParam: unknown;
            notNull: false;
            hasDefault: false;
            enumValues: undefined;
            baseColumn: never;
        }, {}, {}>;
        created_at: import("drizzle-orm/pg-core").PgColumn<{
            name: "created_at";
            tableName: "backup_jobs";
            dataType: "date";
            columnType: "PgTimestamp";
            data: Date;
            driverParam: string;
            notNull: true;
            hasDefault: true;
            enumValues: undefined;
            baseColumn: never;
        }, {}, {}>;
    };
    dialect: "pg";
}>;
/**
 * Subscriptions — Stripe billing tiers
 */
export declare const subscriptions: import("drizzle-orm/pg-core").PgTableWithColumns<{
    name: "subscriptions";
    schema: undefined;
    columns: {
        id: import("drizzle-orm/pg-core").PgColumn<{
            name: "id";
            tableName: "subscriptions";
            dataType: "string";
            columnType: "PgUUID";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: true;
            enumValues: undefined;
            baseColumn: never;
        }, {}, {}>;
        workspace_id: import("drizzle-orm/pg-core").PgColumn<{
            name: "workspace_id";
            tableName: "subscriptions";
            dataType: "string";
            columnType: "PgUUID";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: false;
            enumValues: undefined;
            baseColumn: never;
        }, {}, {}>;
        tier: import("drizzle-orm/pg-core").PgColumn<{
            name: "tier";
            tableName: "subscriptions";
            dataType: "string";
            columnType: "PgEnumColumn";
            data: "free" | "pro" | "business";
            driverParam: string;
            notNull: true;
            hasDefault: true;
            enumValues: ["free", "pro", "business"];
            baseColumn: never;
        }, {}, {}>;
        status: import("drizzle-orm/pg-core").PgColumn<{
            name: "status";
            tableName: "subscriptions";
            dataType: "string";
            columnType: "PgEnumColumn";
            data: "active" | "inactive" | "canceled";
            driverParam: string;
            notNull: true;
            hasDefault: true;
            enumValues: ["active", "inactive", "canceled"];
            baseColumn: never;
        }, {}, {}>;
        stripe_customer_id: import("drizzle-orm/pg-core").PgColumn<{
            name: "stripe_customer_id";
            tableName: "subscriptions";
            dataType: "string";
            columnType: "PgText";
            data: string;
            driverParam: string;
            notNull: false;
            hasDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
        }, {}, {}>;
        stripe_subscription_id: import("drizzle-orm/pg-core").PgColumn<{
            name: "stripe_subscription_id";
            tableName: "subscriptions";
            dataType: "string";
            columnType: "PgText";
            data: string;
            driverParam: string;
            notNull: false;
            hasDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
        }, {}, {}>;
        current_period_end: import("drizzle-orm/pg-core").PgColumn<{
            name: "current_period_end";
            tableName: "subscriptions";
            dataType: "date";
            columnType: "PgTimestamp";
            data: Date;
            driverParam: string;
            notNull: false;
            hasDefault: false;
            enumValues: undefined;
            baseColumn: never;
        }, {}, {}>;
        created_at: import("drizzle-orm/pg-core").PgColumn<{
            name: "created_at";
            tableName: "subscriptions";
            dataType: "date";
            columnType: "PgTimestamp";
            data: Date;
            driverParam: string;
            notNull: true;
            hasDefault: true;
            enumValues: undefined;
            baseColumn: never;
        }, {}, {}>;
        updated_at: import("drizzle-orm/pg-core").PgColumn<{
            name: "updated_at";
            tableName: "subscriptions";
            dataType: "date";
            columnType: "PgTimestamp";
            data: Date;
            driverParam: string;
            notNull: true;
            hasDefault: true;
            enumValues: undefined;
            baseColumn: never;
        }, {}, {}>;
    };
    dialect: "pg";
}>;
export declare const usersRelations: import("drizzle-orm").Relations<"users", {
    workspaces: import("drizzle-orm").Many<"workspaces">;
}>;
export declare const workspacesRelations: import("drizzle-orm").Relations<"workspaces", {
    owner: import("drizzle-orm").One<"users", true>;
    databases: import("drizzle-orm").Many<"databases">;
    subscription: import("drizzle-orm").One<"subscriptions", true>;
}>;
export declare const databasesRelations: import("drizzle-orm").Relations<"databases", {
    workspace: import("drizzle-orm").One<"workspaces", true>;
    backup_jobs: import("drizzle-orm").Many<"backup_jobs">;
}>;
export declare const backupJobsRelations: import("drizzle-orm").Relations<"backup_jobs", {
    database: import("drizzle-orm").One<"databases", true>;
}>;
export declare const subscriptionsRelations: import("drizzle-orm").Relations<"subscriptions", {
    workspace: import("drizzle-orm").One<"workspaces", true>;
}>;
//# sourceMappingURL=schema.d.ts.map