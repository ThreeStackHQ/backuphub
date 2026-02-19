import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Readable } from 'stream';

function getS3Client(): S3Client {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

  if (!accountId || !accessKeyId || !secretAccessKey) {
    throw new Error('Missing Cloudflare R2 credentials (R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY)');
  }

  return new S3Client({
    region: 'auto',
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
  });
}

let _client: S3Client | null = null;

function getClient(): S3Client {
  if (!_client) _client = getS3Client();
  return _client;
}

function getBucket(): string {
  const bucket = process.env.R2_BUCKET_NAME;
  if (!bucket) throw new Error('Missing R2_BUCKET_NAME environment variable');
  return bucket;
}

export interface UploadOptions {
  key: string;
  body: Buffer | Readable | ReadableStream;
  contentType?: string;
  contentLength?: number;
}

/**
 * Upload a backup file to R2
 */
export async function uploadBackup(options: UploadOptions): Promise<string> {
  const { key, body, contentType = 'application/gzip', contentLength } = options;

  await getClient().send(
    new PutObjectCommand({
      Bucket: getBucket(),
      Key: key,
      Body: body as Buffer,
      ContentType: contentType,
      ContentLength: contentLength,
    })
  );

  return key;
}

/**
 * Download a backup file from R2 as a stream
 */
export async function downloadBackup(key: string): Promise<Readable> {
  const response = await getClient().send(
    new GetObjectCommand({
      Bucket: getBucket(),
      Key: key,
    })
  );

  if (!response.Body) {
    throw new Error(`No body in S3 response for key: ${key}`);
  }

  return response.Body as Readable;
}

/**
 * Generate a pre-signed URL for temporary download access
 */
export async function getPresignedDownloadUrl(
  key: string,
  expiresInSeconds = 3600
): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: getBucket(),
    Key: key,
  });

  return getSignedUrl(getClient(), command, { expiresIn: expiresInSeconds });
}

/**
 * Delete a backup from R2
 */
export async function deleteBackup(key: string): Promise<void> {
  await getClient().send(
    new DeleteObjectCommand({
      Bucket: getBucket(),
      Key: key,
    })
  );
}

/**
 * Get metadata for a backup object
 */
export async function getBackupMetadata(key: string): Promise<{
  size: number;
  lastModified: Date;
}> {
  const response = await getClient().send(
    new HeadObjectCommand({
      Bucket: getBucket(),
      Key: key,
    })
  );

  return {
    size: response.ContentLength ?? 0,
    lastModified: response.LastModified ?? new Date(),
  };
}

/**
 * List backups for a database (by prefix)
 */
export async function listBackups(prefix: string): Promise<Array<{
  key: string;
  size: number;
  lastModified: Date;
}>> {
  const response = await getClient().send(
    new ListObjectsV2Command({
      Bucket: getBucket(),
      Prefix: prefix,
    })
  );

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
export function buildBackupKey(
  workspaceId: string,
  databaseId: string,
  jobId: string
): string {
  return `workspaces/${workspaceId}/databases/${databaseId}/backups/${jobId}.sql.gz`;
}
