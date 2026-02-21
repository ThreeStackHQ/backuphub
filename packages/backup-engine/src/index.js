"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.BackupError = void 0;
exports.createPostgresBackup = createPostgresBackup;
exports.createMysqlBackup = createMysqlBackup;
exports.createBackup = createBackup;
exports.testConnection = testConnection;
exports.extractSchema = extractSchema;
const child_process_1 = require("child_process");
const zlib_1 = require("zlib");
const promises_1 = require("stream/promises");
const stream_1 = require("stream");
class BackupError extends Error {
    constructor(message, stderr) {
        super(message);
        this.stderr = stderr;
        this.name = 'BackupError';
    }
}
exports.BackupError = BackupError;
/**
 * Run pg_dump and return a gzip-compressed stream
 */
function createPostgresBackup(conn) {
    const env = {
        ...process.env,
        PGPASSWORD: conn.password,
    };
    const args = [
        '--host', conn.host,
        '--port', String(conn.port),
        '--username', conn.username,
        '--dbname', conn.database,
        '--format', 'plain', // SQL format
        '--no-password', // use PGPASSWORD env var
        '--verbose',
    ];
    if (conn.ssl) {
        args.push('--sslmode=require');
    }
    const proc = (0, child_process_1.spawn)('pg_dump', args, { env });
    const gzip = (0, zlib_1.createGzip)({ level: 6 });
    const output = new stream_1.PassThrough();
    const stderrChunks = [];
    proc.stderr.on('data', (chunk) => stderrChunks.push(chunk));
    // Pipe pg_dump stdout → gzip → output stream
    proc.stdout.pipe(gzip).pipe(output);
    proc.on('close', (code) => {
        if (code !== 0) {
            const stderr = Buffer.concat(stderrChunks).toString();
            output.destroy(new BackupError(`pg_dump exited with code ${code}`, stderr));
        }
    });
    proc.on('error', (err) => {
        output.destroy(new BackupError(`Failed to spawn pg_dump: ${err.message}`, ''));
    });
    return {
        stream: output,
        cleanup: () => {
            if (!proc.killed)
                proc.kill();
        },
    };
}
/**
 * Run mysqldump and return a gzip-compressed stream
 */
function createMysqlBackup(conn) {
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
    const proc = (0, child_process_1.spawn)('mysqldump', args);
    const gzip = (0, zlib_1.createGzip)({ level: 6 });
    const output = new stream_1.PassThrough();
    const stderrChunks = [];
    proc.stderr.on('data', (chunk) => stderrChunks.push(chunk));
    proc.stdout.pipe(gzip).pipe(output);
    proc.on('close', (code) => {
        if (code !== 0) {
            const stderr = Buffer.concat(stderrChunks).toString();
            // mysqldump exits 0 on success, non-zero on failure
            // but also writes warnings to stderr which is normal
            const isError = code !== 0 && !stderr.includes('Warning');
            if (isError) {
                output.destroy(new BackupError(`mysqldump exited with code ${code}`, stderr));
            }
        }
    });
    proc.on('error', (err) => {
        output.destroy(new BackupError(`Failed to spawn mysqldump: ${err.message}`, ''));
    });
    return {
        stream: output,
        cleanup: () => {
            if (!proc.killed)
                proc.kill();
        },
    };
}
/**
 * Create a backup based on database type
 */
function createBackup(conn) {
    if (conn.type === 'postgres') {
        return createPostgresBackup(conn);
    }
    else if (conn.type === 'mysql') {
        return createMysqlBackup(conn);
    }
    throw new Error(`Unsupported database type: ${conn.type}`);
}
/**
 * Test connectivity to a database without doing a full backup
 */
async function testConnection(conn) {
    return new Promise((resolve, reject) => {
        let proc;
        if (conn.type === 'postgres') {
            const env = {
                ...process.env,
                PGPASSWORD: conn.password,
            };
            proc = (0, child_process_1.spawn)('pg_isready', [
                '--host', conn.host,
                '--port', String(conn.port),
                '--username', conn.username,
                '--dbname', conn.database,
            ], { env });
        }
        else {
            proc = (0, child_process_1.spawn)('mysqladmin', [
                `--host=${conn.host}`,
                `--port=${conn.port}`,
                `--user=${conn.username}`,
                `--password=${conn.password}`,
                'ping',
            ]);
        }
        const stderrChunks = [];
        proc.stderr?.on('data', (chunk) => stderrChunks.push(chunk));
        proc.on('close', (code) => {
            if (code === 0) {
                resolve();
            }
            else {
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
async function extractSchema(backupStream) {
    const { createGunzip } = await Promise.resolve().then(() => __importStar(require('zlib')));
    const gunzip = createGunzip();
    const chunks = [];
    const collector = new stream_1.PassThrough();
    collector.on('data', (chunk) => chunks.push(chunk));
    await (0, promises_1.pipeline)(backupStream, gunzip, collector);
    const sql = Buffer.concat(chunks).toString('utf-8');
    // Extract CREATE TABLE statements
    const createTableRegex = /CREATE TABLE[^;]+;/gs;
    const matches = sql.match(createTableRegex) ?? [];
    return matches.join('\n\n');
}
//# sourceMappingURL=index.js.map