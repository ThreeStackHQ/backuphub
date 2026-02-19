import { S3Client, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

let _client: S3Client | null = null;

export function getR2Client(): S3Client {
  if (!_client) {
    const accountId = process.env.R2_ACCOUNT_ID;
    const accessKeyId = process.env.R2_ACCESS_KEY_ID;
    const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

    if (!accountId || !accessKeyId || !secretAccessKey) {
      throw new Error('R2 credentials are not configured (R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY)');
    }

    _client = new S3Client({
      region: 'auto',
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: { accessKeyId, secretAccessKey },
    });
  }
  return _client;
}

export const BUCKET_NAME = process.env.R2_BUCKET_NAME ?? 'backuphub-backups';

/**
 * Generate a pre-signed download URL for a backup (1 hour expiry)
 */
export async function getPresignedDownloadUrl(s3Key: string, expiresInSeconds = 3600): Promise<string> {
  const client = getR2Client();
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: s3Key,
  });
  return getSignedUrl(client, command, { expiresIn: expiresInSeconds });
}

/**
 * Delete a backup object from R2
 */
export async function deleteBackupObject(s3Key: string): Promise<void> {
  const client = getR2Client();
  await client.send(new DeleteObjectCommand({ Bucket: BUCKET_NAME, Key: s3Key }));
}
