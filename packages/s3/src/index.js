"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadBackup = uploadBackup;
exports.downloadBackup = downloadBackup;
exports.getPresignedDownloadUrl = getPresignedDownloadUrl;
exports.deleteBackup = deleteBackup;
exports.getBackupMetadata = getBackupMetadata;
exports.listBackups = listBackups;
exports.buildBackupKey = buildBackupKey;
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
function getS3Client() {
    const accountId = process.env.R2_ACCOUNT_ID;
    const accessKeyId = process.env.R2_ACCESS_KEY_ID;
    const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
    if (!accountId || !accessKeyId || !secretAccessKey) {
        throw new Error('Missing Cloudflare R2 credentials (R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY)');
    }
    return new client_s3_1.S3Client({
        region: 'auto',
        endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
        credentials: { accessKeyId, secretAccessKey },
    });
}
let _client = null;
function getClient() {
    if (!_client)
        _client = getS3Client();
    return _client;
}
function getBucket() {
    const bucket = process.env.R2_BUCKET_NAME;
    if (!bucket)
        throw new Error('Missing R2_BUCKET_NAME environment variable');
    return bucket;
}
/**
 * Upload a backup file to R2
 */
async function uploadBackup(options) {
    const { key, body, contentType = 'application/gzip', contentLength } = options;
    await getClient().send(new client_s3_1.PutObjectCommand({
        Bucket: getBucket(),
        Key: key,
        Body: body,
        ContentType: contentType,
        ContentLength: contentLength,
    }));
    return key;
}
/**
 * Download a backup file from R2 as a stream
 */
async function downloadBackup(key) {
    const response = await getClient().send(new client_s3_1.GetObjectCommand({
        Bucket: getBucket(),
        Key: key,
    }));
    if (!response.Body) {
        throw new Error(`No body in S3 response for key: ${key}`);
    }
    return response.Body;
}
/**
 * Generate a pre-signed URL for temporary download access
 */
async function getPresignedDownloadUrl(key, expiresInSeconds = 3600) {
    const command = new client_s3_1.GetObjectCommand({
        Bucket: getBucket(),
        Key: key,
    });
    return (0, s3_request_presigner_1.getSignedUrl)(getClient(), command, { expiresIn: expiresInSeconds });
}
/**
 * Delete a backup from R2
 */
async function deleteBackup(key) {
    await getClient().send(new client_s3_1.DeleteObjectCommand({
        Bucket: getBucket(),
        Key: key,
    }));
}
/**
 * Get metadata for a backup object
 */
async function getBackupMetadata(key) {
    const response = await getClient().send(new client_s3_1.HeadObjectCommand({
        Bucket: getBucket(),
        Key: key,
    }));
    return {
        size: response.ContentLength ?? 0,
        lastModified: response.LastModified ?? new Date(),
    };
}
/**
 * List backups for a database (by prefix)
 */
async function listBackups(prefix) {
    const response = await getClient().send(new client_s3_1.ListObjectsV2Command({
        Bucket: getBucket(),
        Prefix: prefix,
    }));
    return (response.Contents ?? []).map((obj) => ({
        key: obj.Key ?? '',
        size: obj.Size ?? 0,
        lastModified: obj.LastModified ?? new Date(),
    }));
}
/**
 * Generate a canonical S3 key for a backup
 * Format: workspaces/{workspaceId}/databases/{dbId}/backups/{jobId}.sql.gz
 */
function buildBackupKey(workspaceId, databaseId, jobId) {
    return `workspaces/${workspaceId}/databases/${databaseId}/backups/${jobId}.sql.gz`;
}
//# sourceMappingURL=index.js.map