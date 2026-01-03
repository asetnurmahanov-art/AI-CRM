const crypto = require('crypto');
const bcrypt = require('bcryptjs');

class SecurityService {
    constructor() {
        this.ALGORITHM = 'aes-256-gcm';
        this.SALT_ROUNDS = 10;
    }

    /**
     * Hashes a plain password for storage (Master Password)
     */
    async hashPassword(password) {
        return await bcrypt.hash(password, this.SALT_ROUNDS);
    }

    /**
     * Verifies a password against hash
     */
    async verifyPassword(password, hash) {
        return await bcrypt.compare(password, hash);
    }

    /**
     * Derives a 32-byte key from the master password (PBKDF2)
     * This ensures the encryption key is strong even if the password is simple.
     */
    deriveKey(password, salt) {
        return crypto.pbkdf2Sync(password, salt, 100000, 32, 'sha256');
    }

    /**
     * Encrypts text using AES-256-GCM
     * Returns: { iv: hex, content: hex, authTag: hex, salt: hex }
     */
    encrypt(text, masterPassword) {
        const salt = crypto.randomBytes(16);
        const key = this.deriveKey(masterPassword, salt);
        const iv = crypto.randomBytes(16);

        const cipher = crypto.createCipheriv(this.ALGORITHM, key, iv);
        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');

        const authTag = cipher.getAuthTag().toString('hex');

        return {
            iv: iv.toString('hex'),
            content: encrypted,
            authTag: authTag,
            salt: salt.toString('hex')
        };
    }

    /**
     * Decrypts text
     * Expects encryptedData object with { iv, content, authTag, salt }
     */
    decrypt(encryptedData, masterPassword) {
        const { iv, content, authTag, salt } = encryptedData;

        const key = this.deriveKey(masterPassword, Buffer.from(salt, 'hex'));
        const decipher = crypto.createDecipheriv(this.ALGORITHM, key, Buffer.from(iv, 'hex'));

        decipher.setAuthTag(Buffer.from(authTag, 'hex'));

        let decrypted = decipher.update(content, 'hex', 'utf8');
        decrypted += decipher.final('utf8');

        return decrypted;
    }
}

module.exports = new SecurityService();
