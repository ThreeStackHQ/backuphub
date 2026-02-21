import { S3Client } from '@aws-sdk/client-s3';
export declare function getR2Client(): S3Client;
export declare const BUCKET_NAME: string;
/**
 * Generate a pre-signed download URL for a backup (1 hour expiry)
 */
export declare function getPresignedDownloadUrl(s3Key: string, expiresInSeconds?: number): Promise<string>;
/**
 * Delete a backup object from R2
 */
export declare function deleteBackupObject(s3Key: string): Promise<void>;
//# sourceMappingURL=storage.d.ts.map