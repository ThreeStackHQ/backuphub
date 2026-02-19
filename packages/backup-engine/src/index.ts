import { spawn } from 'child_process';
import { createGzip } from 'zlib';
import { Readable } from 'stream';
import { pipeline } from 'stream/promises';
import { PassThrough } from 'stream';

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

export class BackupError extends Error {
  constructor(
    message: string,
    public readonly stderr: string
  ) {
    super(message);
    this.name = 'BackupError';
  }
}

/**
 * Run pg_dump and return a gzip-compressed stream
 */
export function createPostgresBackup(conn: DatabaseConnection): BackupResult {
  const env: NodeJS.ProcessEnv = {
    ...process.env,
    PGPASSWORD: conn.password,
  };

  const args = [
    '--host', conn.host,
    '--port', String(conn.port),
    '--username', conn.username,
    '--dbname', conn.database,
    '--format', 'plain',     // SQL format
    '--no-password',          // use PGPASSWORD env var
    '--verbose',
  ];

  if (conn.ssl) {
    args.push('--sslmode=require');
  }

  const proc = spawn('pg_dump', args, { env });

  const gzip = createGzip({ level: 6 });
  const output = new PassThrough();

  const stderrChunks: Buffer[] = [];
  proc.stderr.on('data', (chunk: Buffer) => stderrChunks.push(chunk));

  // Pipe pg_dump stdout → gzip → output stream
  proc.stdout.pipe(gzip).pipe(output);

  proc.on('close', (code) => {
    if (code !== 0) {
      const stderr = Buffer.concat(stderrChunks).toString();
      output.destroy(
        new BackupError(`pg_dump exited with code ${code}`, stderr)
      );
    }
  });

  proc.on('error', (err) => {
    output.destroy(new BackupError(`Failed to spawn pg_dump: ${err.message}`, ''));
  });

  return {
    stream: output,
    cleanup: () => {
      if (!proc.killed) proc.kill();
    },
  };
}

/**
 * Run mysqldump and return a gzip-compressed stream
 */
export function createMysqlBackup(conn: DatabaseConnection): BackupResult {
  const args = [
    `--host=${conn.host}`,
    `--port=${conn.port}`,
    `--user=${conn.username}`,
    `--password=${conn.password}`,
    '--single-transaction',
    '--routines',
    '--triggers',
    '--add-drop-table',
    conn.database,
  ];

  if (conn.ssl) {
    args.push('--ssl-mode=REQUIRED');
  }

  const proc = spawn('mysqldump', args);

  const gzip = createGzip({ level: 6 });
  const output = new PassThrough();

  const stderrChunks: Buffer[] = [];
  proc.stderr.on('data', (chunk: Buffer) => stderrChunks.push(chunk));

  proc.stdout.pipe(gzip).pipe(output);

  proc.on('close', (code) => {
    if (code !== 0) {
      const stderr = Buffer.concat(stderrChunks).toString();
      // mysqldump exits 0 on success, non-zero on failure
      // but also writes warnings to stderr which is normal
      const isError = code !== 0 && !stderr.includes('Warning');
      if (isError) {
        output.destroy(
          new BackupError(`mysqldump exited with code ${code}`, stderr)
        );
      }
    }
  });

  proc.on('error', (err) => {
    output.destroy(new BackupError(`Failed to spawn mysqldump: ${err.message}`, ''));
  });

  return {
    stream: output,
    cleanup: () => {
      if (!proc.killed) proc.kill();
    },
  };
}

/**
 * Create a backup based on database type
 */
export function createBackup(conn: DatabaseConnection): BackupResult {
  if (conn.type === 'postgres') {
    return createPostgresBackup(conn);
  } else if (conn.type === 'mysql') {
    return createMysqlBackup(conn);
  }
  throw new Error(`Unsupported database type: ${conn.type}`);
}

/**
 * Test connectivity to a database without doing a full backup
 */
export async function testConnection(conn: DatabaseConnection): Promise<void> {
  return new Promise((resolve, reject) => {
    let proc: ReturnType<typeof spawn>;

    if (conn.type === 'postgres') {
      const env: NodeJS.ProcessEnv = {
        ...process.env,
        PGPASSWORD: conn.password,
      };
      proc = spawn(
        'pg_isready',
        [
          '--host', conn.host,
          '--port', String(conn.port),
          '--username', conn.username,
          '--dbname', conn.database,
        ],
        { env }
      );
    } else {
      proc = spawn('mysqladmin', [
        `--host=${conn.host}`,
        `--port=${conn.port}`,
        `--user=${conn.username}`,
        `--password=${conn.password}`,
        'ping',
      ]);
    }

    const stderrChunks: Buffer[] = [];
    proc.stderr?.on('data', (chunk: Buffer) => stderrChunks.push(chunk));

    proc.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        const stderr = Buffer.concat(stderrChunks).toString();
        reject(new BackupError(`Connection test failed (exit ${code})`, stderr));
      }
    });

    proc.on('error', (err) => {
      reject(new BackupError(`Failed to test connection: ${err.message}`, ''));
    });
  });
}

/**
 * Extract schema DDL from a compressed backup stream (for diff purposes)
 * Returns only CREATE TABLE statements
 */
export async function extractSchema(backupStream: Readable): Promise<string> {
  const { createGunzip } = await import('zlib');
  const gunzip = createGunzip();
  
  const chunks: Buffer[] = [];
  const collector = new PassThrough();
  collector.on('data', (chunk: Buffer) => chunks.push(chunk));

  await pipeline(backupStream, gunzip, collector);

  const sql = Buffer.concat(chunks).toString('utf-8');

  // Extract CREATE TABLE statements
  const createTableRegex = /CREATE TABLE[^;]+;/gs;
  const matches = sql.match(createTableRegex) ?? [];

  return matches.join('\n\n');
}
