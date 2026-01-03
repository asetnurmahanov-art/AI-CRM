
const socialService = require('../services/social.service');

class SocialController {

    async getAccounts(req, res) {
        try {
            const apiKey = req.headers['x-api-key']; // Expect API Key in header
            if (!apiKey) {
                return res.status(400).json({ error: 'API Key is missing in headers' });
            }

            const accounts = await socialService.getAccounts(apiKey);
            res.json({ success: true, accounts });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async getMessages(req, res) {
        try {
            const { accountId } = req.query;
            const apiKey = req.headers['x-api-key'];

            if (!apiKey || !accountId) {
                return res.status(400).json({ error: 'API Key or Account ID missing' });
            }

            const messages = await socialService.getMessages(accountId, apiKey);
            res.json({ success: true, messages });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async sendReply(req, res) {
        try {
            const { messageId, text } = req.body;
            const apiKey = req.headers['x-api-key'];

            if (!apiKey || !messageId || !text) {
                return res.status(400).json({ error: 'Missing required parameters' });
            }

            const result = await socialService.sendReply(messageId, text, apiKey);
            res.json({ success: true, result });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = new SocialController();
