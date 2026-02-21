/**
 * Encrypt a plaintext string using AES-256-GCM
 * Returns: base64(iv + authTag + ciphertext)
 */
export declare function encrypt(plaintext: string): string;
/**
 * Decrypt a previously encrypted string
 */
export declare function decrypt(ciphertext: string): string;
//# sourceMappingURL=crypto.d.ts.map