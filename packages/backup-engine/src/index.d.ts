import { Readable } from 'stream';
export interface DatabaseConnection {
    type: 'postgres' | 'mysql';
    host: string;
    port: number;
    username: string;
    password: string;
    database: string;
    ssl?: boolean;
}
export interface BackupResult {
    stream: Readable;
    /** Call when done to clean up */
    cleanup: () => void;
}
export declare class BackupError extends Error {
    readonly stderr: string;
    constructor(message: string, stderr: string);
}
/**
 * Run pg_dump and return a gzip-compressed stream
 */
export declare function createPostgresBackup(conn: DatabaseConnection): BackupResult;
/**
 * Run mysqldump and return a gzip-compressed stream
 */
export declare function createMysqlBackup(conn: DatabaseConnection): BackupResult;
/**
 * Create a backup based on database type
 */
export declare function createBackup(conn: DatabaseConnection): BackupResult;
/**
 * Test connectivity to a database without doing a full backup
 */
export declare function testConnection(conn: DatabaseConnection): Promise<void>;
/**
 * Extract schema DDL from a compressed backup stream (for diff purposes)
 * Returns only CREATE TABLE statements
 */
export declare function extractSchema(backupStream: Readable): Promise<string>;
//# sourceMappingURL=index.d.ts.map