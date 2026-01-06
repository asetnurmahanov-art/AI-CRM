const dotenv = require('dotenv');
const path = require('path');

// Load env vars from root .env if not already loaded, or server specific .env
dotenv.config({ path: path.join(__dirname, '../../.env') });

module.exports = {
    port: process.env.PORT || 3005,
    geminiApiKey: process.env.GEMINI_API_KEY,
    nodeEnv: process.env.NODE_ENV || 'development',
    instagramWebhookVerifyToken: process.env.INSTAGRAM_WEBHOOK_VERIFY_TOKEN || 'TEST_TOKEN',
    facebookAppSecret: process.env.FACEBOOK_APP_SECRET || 'TEST_SECRET',
};
