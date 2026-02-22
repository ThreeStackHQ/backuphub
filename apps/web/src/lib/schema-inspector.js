"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.inspectSchema = inspectSchema;
exports.diffSchemas = diffSchemas;
// @ts-ignore - postgres package has incomplete type declarations
const postgres_1 = __importDefault(require("postgres"));
/**
 * Connect to a PostgreSQL database and extract its schema
 * Uses a short timeout to avoid hanging on bad connections
 */
async function inspectSchema(connectionString) {
    const sql = (0, postgres_1.default)(connectionString, {
        max: 1,
        connect_timeout: 10,
        idle_timeout: 5,
        connection: { statement_timeout: 10000 }, // 10s query timeout
    });
    try {
        // Get all user tables (exclude pg_* and information_schema)
        const tableRows = await sql `
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `;
        const tables = [];
        for (const { table_name } of tableRows) {
            // Get column info
            const columns = await sql `
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
            const indexRows = await sql `
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
            const indexMap = new Map();
            for (const row of indexRows) {
                if (!indexMap.has(row.index_name)) {
                    indexMap.set(row.index_name, { index_name: row.index_name, is_unique: row.is_unique, columns: [] });
                }
                indexMap.get(row.index_name).columns.push(row.column_name);
            }
            // Get foreign keys
            const foreignKeys = await sql `
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
            const [countRow] = await sql `
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
    }
    finally {
        await sql.end();
    }
}
/**
 * Compare two database schemas and return a structured diff
 */
function diffSchemas(before, after) {
    const beforeTables = new Map(before.tables.map(t => [t.table_name, t]));
    const afterTables = new Map(after.tables.map(t => [t.table_name, t]));
    const tables_added = [];
    const tables_removed = [];
    const tables_modified = [];
    // Find added tables
    for (const name of afterTables.keys()) {
        if (!beforeTables.has(name))
            tables_added.push(name);
    }
    // Find removed tables
    for (const name of beforeTables.keys()) {
        if (!afterTables.has(name))
            tables_removed.push(name);
    }
    // Find modified tables
    for (const [name, afterTable] of afterTables.entries()) {
        const beforeTable = beforeTables.get(name);
        if (!beforeTable)
            continue; // Added (already handled)
        const beforeCols = new Map(beforeTable.columns.map(c => [c.column_name, c]));
        const afterCols = new Map(afterTable.columns.map(c => [c.column_name, c]));
        const columns_added = [];
        const columns_removed = [];
        const columns_modified = [];
        // Added columns
        for (const colName of afterCols.keys()) {
            if (!beforeCols.has(colName))
                columns_added.push(colName);
        }
        // Removed columns
        for (const colName of beforeCols.keys()) {
            if (!afterCols.has(colName))
                columns_removed.push(colName);
        }
        // Modified columns
        for (const [colName, afterCol] of afterCols.entries()) {
            const beforeCol = beforeCols.get(colName);
            if (!beforeCol)
                continue;
            const changes = [];
            if (beforeCol.data_type !== afterCol.data_type) {
                changes.push(`type: ${beforeCol.data_type} → ${afterCol.data_type}`);
            }
            if (beforeCol.is_nullable !== afterCol.is_nullable) {
                changes.push(`nullable: ${beforeCol.is_nullable} → ${afterCol.is_nullable}`);
            }
            if (beforeCol.column_default !== afterCol.column_default) {
                changes.push(`default: ${beforeCol.column_default ?? 'null'} → ${afterCol.column_default ?? 'null'}`);
            }
            if (changes.length > 0)
                columns_modified.push({ column_name: colName, changes });
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
//# sourceMappingURL=schema-inspector.js.map