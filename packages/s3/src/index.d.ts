import { Readable } from 'stream';
export interface UploadOptions {
    key: string;
    body: Buffer | Readable | ReadableStream;
    contentType?: string;
    contentLength?: number;
}
/**
 * Upload a backup file to R2
 */
export declare function uploadBackup(options: UploadOptions): Promise<string>;
/**
 * Download a backup file from R2 as a stream
 */
export declare function downloadBackup(key: string): Promise<Readable>;
/**
 * Generate a pre-signed URL for temporary download access
 */
export declare function getPresignedDownloadUrl(key: string, expiresInSeconds?: number): Promise<string>;
/**
 * Delete a backup from R2
 */
export declare function deleteBackup(key: string): Promise<void>;
/**
 * Get metadata for a backup object
 */
export declare function getBackupMetadata(key: string): Promise<{
    size: number;
    lastModified: Date;
}>;
/**
 * List backups for a database (by prefix)
 */
export declare function listBackups(prefix: string): Promise<Array<{
    key: string;
    size: number;
    lastModified: Date;
}>>;
/**
 * Generate a canonical S3 key for a backup
 * Format: workspaces/{workspaceId}/databases/{dbId}/backups/{jobId}.sql.gz
 */
export declare function buildBackupKey(workspaceId: string, databaseId: string, jobId: string): string;
//# sourceMappingURL=index.d.ts.map