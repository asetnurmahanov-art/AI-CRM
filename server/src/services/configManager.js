const fs = require('fs').promises;
const path = require('path');
const securityService = require('./securityService');

class ConfigManager {
    constructor() {
        this.configPath = path.join(__dirname, '../../config/secure.json');
        this.decryptedConfig = null; // Memory-only cache
        this.isUnlocked = false;
    }

    async init() {
        try {
            await fs.access(this.configPath);
        } catch {
            // Create empty vault if not exists
            await this.saveEncryptedConfig({});
        }
    }

    /**
     * Saves the entire config object encrypted with the master password.
     */
    async initializeVault(masterPassword) {
        // Hash password for authentication
        const passwordHash = await securityService.hashPassword(masterPassword);

        // Initial empty config
        const initialConfig = {
            apiKeys: {
                GEMINI_API_KEY: ''
            },
            lastUpdated: new Date().toISOString()
        };

        // Encrypt payload
        const encryptedPayload = securityService.encrypt(JSON.stringify(initialConfig), masterPassword);

        const vaultData = {
            meta: {
                hash: passwordHash, // Storing hash to verify password before attempting decryption
                version: 1,
                createdAt: new Date().toISOString()
            },
            data: encryptedPayload
        };

        // Ensure directory exists
        await fs.mkdir(path.dirname(this.configPath), { recursive: true });
        await fs.writeFile(this.configPath, JSON.stringify(vaultData, null, 2));
        this.decryptedConfig = initialConfig;
        this.isUnlocked = true;
        return true;
    }

    /**
     * Unlocks the vault, loads into memory.
     */
    async unlock(masterPassword) {
        try {
            const fileContent = await fs.readFile(this.configPath, 'utf8');
            const vaultData = JSON.parse(fileContent);

            if (!vaultData.meta || !vaultData.data) throw new Error('Invalid vault format');

            // 1. Verify Password
            const isValid = await securityService.verifyPassword(masterPassword, vaultData.meta.hash);
            if (!isValid) return false;

            // 2. Decrypt
            const decryptedJson = securityService.decrypt(vaultData.data, masterPassword);
            this.decryptedConfig = JSON.parse(decryptedJson);
            this.isUnlocked = true;
            return true;
        } catch (e) {
            console.error('Unlock Failed:', e);
            return false;
        }
    }

    /**
     * Updates a specific API key (requires vault to be unlocked)
     * Also re-encrypts the file with the master password provided (or we'd need to cache the password, which is risky)
     * For simplicity, we require the password again OR we assume the API is stateful.
     * Statefulness is tricky in serverless but okay for a running Express server. 
     * However, we can't re-encrypt without the password.
     * Solution: We simply assume 'unlock' keeps the config in memory. 
     * To SAVE, we need the password again to Encrypt.
     */
    async updateApiKey(keyName, value, masterPassword) {
        if (!this.isUnlocked) throw new Error('Vault is locked');

        // Update memory
        this.decryptedConfig.apiKeys[keyName] = value;
        this.decryptedConfig.lastUpdated = new Date().toISOString();

        // Re-encrypt and Save
        const fileContent = await fs.readFile(this.configPath, 'utf8');
        const vaultData = JSON.parse(fileContent); // Need meta.hash

        // Verify pwd again just to be safe/ensure correct encryption key
        const isValid = await securityService.verifyPassword(masterPassword, vaultData.meta.hash);
        if (!isValid) throw new Error('Invalid password for save operation');

        const encryptedPayload = securityService.encrypt(JSON.stringify(this.decryptedConfig), masterPassword);

        vaultData.data = encryptedPayload;
        vaultData.meta.updatedAt = new Date().toISOString();

        await fs.writeFile(this.configPath, JSON.stringify(vaultData, null, 2));
        return true;
    }

    getApiKey(keyName) {
        if (!this.isUnlocked) return null;
        return this.decryptedConfig?.apiKeys?.[keyName] || null;
    }

    getMaskedKeys() {
        if (!this.isUnlocked) return null;
        const keys = {};
        for (const [k, v] of Object.entries(this.decryptedConfig.apiKeys)) {
            keys[k] = v ? `${v.substring(0, 4)}...${v.substring(v.length - 4)}` : '(empty)';
        }
        return keys;
    }

    isVaultInitialized() {
        // Check if secure.json exists and has hash
        return fs.access(this.configPath).then(() => true).catch(() => false);
    }
}

module.exports = new ConfigManager();
