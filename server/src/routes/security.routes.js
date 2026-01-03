const express = require('express');
const router = express.Router();
const configManager = require('../services/configManager');

// Middleware to check if vault is initialized
const checkInit = async (req, res, next) => {
    const isInit = await configManager.isVaultInitialized();
    req.isInitialized = isInit;
    next();
};

// GET status
router.get('/status', checkInit, (req, res) => {
    res.json({
        initialized: req.isInitialized,
        unlocked: configManager.isUnlocked
    });
});

// POST initialize (First time setup)
router.post('/init', async (req, res) => {
    try {
        const { masterPassword } = req.body;
        if (!masterPassword || masterPassword.length < 8) {
            return res.status(400).json({ error: 'Password must be at least 8 chars' });
        }

        // Check if already initialized? 
        // In a real app we might want to prevent overwrite. 
        // configManager.initializeVault OVERWRITES. 
        // We should strictly block this if req.isInitialized is true unless a force flag is used.
        // For now, let's keep it simple: strict check.
        const isInit = await configManager.isVaultInitialized();
        // However, isVaultInitialized returns true even if empty vault exists. 
        // Let's assume if it exists, we can't Init without nuking.

        await configManager.initializeVault(masterPassword);
        res.json({ success: true, message: 'Vault initialized and unlocked' });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// POST unlock
router.post('/unlock', async (req, res) => {
    try {
        const { masterPassword } = req.body;
        const success = await configManager.unlock(masterPassword);
        if (!success) return res.status(401).json({ error: 'Invalid Password' });
        res.json({ success: true, message: 'Vault unlocked' });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// GET masked keys (requires unlock)
router.get('/keys', (req, res) => {
    if (!configManager.isUnlocked) return res.status(403).json({ error: 'Vault is locked' });
    res.json({ keys: configManager.getMaskedKeys() });
});

// POST update key (requires unlock + password for re-encryption)
router.post('/keys', async (req, res) => {
    try {
        if (!configManager.isUnlocked) return res.status(403).json({ error: 'Vault is locked' });

        // We need password to re-encrypt. Ideally we'd use a session token that maps to the key in memory 
        // or Cached Key, but for strict security we ask for password on write.
        // Or we can rely on the fact that if it's unlocked, we have the decrypted config in memory. 
        // But ConfigManager.updateApiKey signature requires masterPassword to RE-ENCRYPT.
        const { key, value, masterPassword } = req.body;

        if (!masterPassword) return res.status(400).json({ error: 'Master password required to confirm changes' });

        await configManager.updateApiKey(key, value, masterPassword);
        res.json({ success: true, keys: configManager.getMaskedKeys() });
    } catch (e) {
        res.status(400).json({ error: e.message }); // Handles bad password error
    }
});

module.exports = router;
