"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BUCKET_NAME = void 0;
exports.getR2Client = getR2Client;
exports.getPresignedDownloadUrl = getPresignedDownloadUrl;
exports.deleteBackupObject = deleteBackupObject;
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
let _client = null;
function getR2Client() {
    if (!_client) {
        const accountId = process.env.R2_ACCOUNT_ID;
        const accessKeyId = process.env.R2_ACCESS_KEY_ID;
        const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
        if (!accountId || !accessKeyId || !secretAccessKey) {
            throw new Error('R2 credentials are not configured (R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY)');
        }
        _client = new client_s3_1.S3Client({
            region: 'auto',
            endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
            credentials: { accessKeyId, secretAccessKey },
        });
    }
    return _client;
}
exports.BUCKET_NAME = process.env.R2_BUCKET_NAME ?? 'backuphub-backups';
/**
 * Generate a pre-signed download URL for a backup (1 hour expiry)
 */
async function getPresignedDownloadUrl(s3Key, expiresInSeconds = 3600) {
    const client = getR2Client();
    const command = new client_s3_1.GetObjectCommand({
        Bucket: exports.BUCKET_NAME,
        Key: s3Key,
    });
    return (0, s3_request_presigner_1.getSignedUrl)(client, command, { expiresIn: expiresInSeconds });
}
/**
 * Delete a backup object from R2
 */
async function deleteBackupObject(s3Key) {
    const client = getR2Client();
    await client.send(new client_s3_1.DeleteObjectCommand({ Bucket: exports.BUCKET_NAME, Key: s3Key }));
}
//# sourceMappingURL=storage.js.map