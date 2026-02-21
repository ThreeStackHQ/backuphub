export interface ColumnInfo {
    column_name: string;
    data_type: string;
    is_nullable: 'YES' | 'NO';
    column_default: string | null;
    character_maximum_length: number | null;
    numeric_precision: number | null;
    numeric_scale: number | null;
}
export interface IndexInfo {
    index_name: string;
    is_unique: boolean;
    columns: string[];
}
export interface ForeignKeyInfo {
    constraint_name: string;
    column_name: string;
    foreign_table: string;
    foreign_column: string;
}
export interface TableSchema {
    table_name: string;
    columns: ColumnInfo[];
    indexes: IndexInfo[];
    foreign_keys: ForeignKeyInfo[];
    row_count?: number;
}
export interface DatabaseSchema {
    tables: TableSchema[];
    captured_at: string;
}
export type ColumnDiffAction = 'added' | 'removed' | 'modified';
export type TableDiffAction = 'added' | 'removed' | 'modified';
export interface ColumnDiff {
    action: ColumnDiffAction;
    column_name: string;
    before?: Partial<ColumnInfo>;
    after?: Partial<ColumnInfo>;
    changes?: string[];
}
export interface TableDiff {
    action: TableDiffAction;
    table_name: string;
    columns?: ColumnDiff[];
}
export interface SchemaDiff {
    tables_added: string[];
    tables_removed: string[];
    tables_modified: Array<{
        table_name: string;
        columns_added: string[];
        columns_removed: string[];
        columns_modified: Array<{
            column_name: string;
            changes: string[];
        }>;
    }>;
    has_changes: boolean;
}
/**
 * Connect to a PostgreSQL database and extract its schema
 * Uses a short timeout to avoid hanging on bad connections
 */
export declare function inspectSchema(connectionString: string): Promise<DatabaseSchema>;
/**
 * Compare two database schemas and return a structured diff
 */
export declare function diffSchemas(before: DatabaseSchema, after: DatabaseSchema): SchemaDiff;
//# sourceMappingURL=schema-inspector.d.ts.map