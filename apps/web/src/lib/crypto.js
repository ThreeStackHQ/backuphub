"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.encrypt = encrypt;
exports.decrypt = decrypt;
const crypto_1 = require("crypto");
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;
const TAG_LENGTH = 16;
function getEncryptionKey() {
    const hexKey = process.env.ENCRYPTION_KEY;
    if (!hexKey)
        throw new Error('Missing ENCRYPTION_KEY environment variable');
    if (hexKey.length !== 64)
        throw new Error('ENCRYPTION_KEY must be 32 bytes (64 hex chars)');
    return Buffer.from(hexKey, 'hex');
}
/**
 * Encrypt a plaintext string using AES-256-GCM
 * Returns: base64(iv + authTag + ciphertext)
 */
function encrypt(plaintext) {
    const key = getEncryptionKey();
    const iv = (0, crypto_1.randomBytes)(IV_LENGTH);
    const cipher = (0, crypto_1.createCipheriv)(ALGORITHM, key, iv);
    const encrypted = Buffer.concat([
        cipher.update(plaintext, 'utf8'),
        cipher.final(),
    ]);
    const authTag = cipher.getAuthTag();
    return Buffer.concat([iv, authTag, encrypted]).toString('base64');
}
/**
 * Decrypt a previously encrypted string
 */
function decrypt(ciphertext) {
    const key = getEncryptionKey();
    const buf = Buffer.from(ciphertext, 'base64');
    const iv = buf.subarray(0, IV_LENGTH);
    const authTag = buf.subarray(IV_LENGTH, IV_LENGTH + TAG_LENGTH);
    const encrypted = buf.subarray(IV_LENGTH + TAG_LENGTH);
    const decipher = (0, crypto_1.createDecipheriv)(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);
    return Buffer.concat([
        decipher.update(encrypted),
        decipher.final(),
    ]).toString('utf8');
}
//# sourceMappingURL=crypto.js.map