import postgres from 'postgres';

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
    columns_modified: Array<{ column_name: string; changes: string[] }>;
  }>;
  has_changes: boolean;
}

/**
 * Connect to a PostgreSQL database and extract its schema
 * Uses a short timeout to avoid hanging on bad connections
 */
export async function inspectSchema(connectionString: string): Promise<DatabaseSchema> {
  const sql = postgres(connectionString, {
    max: 1,
    connect_timeout: 10,
    idle_timeout: 5,
    connection: { statement_timeout: '10000' }, // 10s query timeout
  });

  try {
    // Get all user tables (exclude pg_* and information_schema)
    const tableRows = await sql<{ table_name: string }[]>`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `;

    const tables: TableSchema[] = [];

    for (const { table_name } of tableRows) {
      // Get column info
      const columns = await sql<ColumnInfo[]>`
        SELECT
          column_name,
          data_type,
          is_nullable,
          column_default,
          character_maximum_length,
          numeric_precision,
          numeric_scale
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = ${table_name}
        ORDER BY ordinal_position
      `;

      // Get indexes
      const indexRows = await sql<{ index_name: string; is_unique: boolean; column_name: string }[]>`
        SELECT
          i.relname AS index_name,
          ix.indisunique AS is_unique,
          a.attname AS column_name
        FROM pg_class t
        JOIN pg_index ix ON t.oid = ix.indrelid
        JOIN pg_class i ON i.oid = ix.indexrelid
        JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = ANY(ix.indkey)
        WHERE t.relkind = 'r'
          AND t.relname = ${table_name}
        ORDER BY i.relname, a.attnum
      `;

      // Aggregate index columns
      const indexMap = new Map<string, IndexInfo>();
      for (const row of indexRows) {
        if (!indexMap.has(row.index_name)) {
          indexMap.set(row.index_name, { index_name: row.index_name, is_unique: row.is_unique, columns: [] });
        }
        indexMap.get(row.index_name)!.columns.push(row.column_name);
      }

      // Get foreign keys
      const foreignKeys = await sql<ForeignKeyInfo[]>`
        SELECT
          kcu.constraint_name,
          kcu.column_name,
          ccu.table_name AS foreign_table,
          ccu.column_name AS foreign_column
        FROM information_schema.key_column_usage kcu
        JOIN information_schema.referential_constraints rc
          ON kcu.constraint_name = rc.constraint_name
        JOIN information_schema.constraint_column_usage ccu
          ON ccu.constraint_name = rc.unique_constraint_name
        WHERE kcu.table_schema = 'public'
          AND kcu.table_name = ${table_name}
      `;

      // Get approximate row count
      const [countRow] = await sql<{ reltuples: number }[]>`
        SELECT reltuples::bigint AS reltuples
        FROM pg_class
        WHERE relname = ${table_name}
      `;

      tables.push({
        table_name,
        columns,
        indexes: Array.from(indexMap.values()),
        foreign_keys: foreignKeys,
        row_count: countRow?.reltuples ?? 0,
      });
    }

    return { tables, captured_at: new Date().toISOString() };
  } finally {
    await sql.end();
  }
}

/**
 * Compare two database schemas and return a structured diff
 */
export function diffSchemas(before: DatabaseSchema, after: DatabaseSchema): SchemaDiff {
  const beforeTables = new Map(before.tables.map(t => [t.table_name, t]));
  const afterTables = new Map(after.tables.map(t => [t.table_name, t]));

  const tables_added: string[] = [];
  const tables_removed: string[] = [];
  const tables_modified: SchemaDiff['tables_modified'] = [];

  // Find added tables
  for (const name of afterTables.keys()) {
    if (!beforeTables.has(name)) tables_added.push(name);
  }

  // Find removed tables
  for (const name of beforeTables.keys()) {
    if (!afterTables.has(name)) tables_removed.push(name);
  }

  // Find modified tables
  for (const [name, afterTable] of afterTables.entries()) {
    const beforeTable = beforeTables.get(name);
    if (!beforeTable) continue; // Added (already handled)

    const beforeCols = new Map(beforeTable.columns.map(c => [c.column_name, c]));
    const afterCols = new Map(afterTable.columns.map(c => [c.column_name, c]));

    const columns_added: string[] = [];
    const columns_removed: string[] = [];
    const columns_modified: Array<{ column_name: string; changes: string[] }> = [];

    // Added columns
    for (const colName of afterCols.keys()) {
      if (!beforeCols.has(colName)) columns_added.push(colName);
    }

    // Removed columns
    for (const colName of beforeCols.keys()) {
      if (!afterCols.has(colName)) columns_removed.push(colName);
    }

    // Modified columns
    for (const [colName, afterCol] of afterCols.entries()) {
      const beforeCol = beforeCols.get(colName);
      if (!beforeCol) continue;

      const changes: string[] = [];
      if (beforeCol.data_type !== afterCol.data_type) {
        changes.push(`type: ${beforeCol.data_type} → ${afterCol.data_type}`);
      }
      if (beforeCol.is_nullable !== afterCol.is_nullable) {
        changes.push(`nullable: ${beforeCol.is_nullable} → ${afterCol.is_nullable}`);
      }
      if (beforeCol.column_default !== afterCol.column_default) {
        changes.push(`default: ${beforeCol.column_default ?? 'null'} → ${afterCol.column_default ?? 'null'}`);
      }

      if (changes.length > 0) columns_modified.push({ column_name: colName, changes });
    }

    if (columns_added.length > 0 || columns_removed.length > 0 || columns_modified.length > 0) {
      tables_modified.push({ table_name: name, columns_added, columns_removed, columns_modified });
    }
  }

  return {
    tables_added,
    tables_removed,
    tables_modified,
    has_changes: tables_added.length > 0 || tables_removed.length > 0 || tables_modified.length > 0,
  };
}
