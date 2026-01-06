const crypto = require('crypto');
const config = require('../config/env');

const dbService = require('./db.service');

class WebhookService {
    /**
     * Verifies the SHA256 signature of the incoming request
     * @param {string} payload - The raw request body
     * @param {string} signature - The X-Hub-Signature-256 header value
     * @returns {boolean} - True if signature is valid
     */
    verifySignature(payload, signature) {
        if (!signature) return false;

        const appSecret = config.facebookAppSecret;
        if (!appSecret) {
            // If secret is missing, fail open in dev, closed in prod? 
            // For now, let's log error and return false to be safe.
            console.error('Facebook App Secret is not configured.');
            return false;
        }

        const hmac = crypto.createHmac('sha256', appSecret);
        const digest = 'sha256=' + hmac.update(payload).digest('hex');

        return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
    }

    /**
     * Process the incoming Instagram webhook event
     * @param {Object} body - Parsed JSON body
     */
    async processInstagramEvent(body) {
        try {
            // Instagram events are typically inside the 'entry' array
            if (body.object === 'instagram' && body.entry) {
                for (const entry of body.entry) {
                    // Messaging events
                    if (entry.messaging) {
                        for (const event of entry.messaging) {
                            await this.handleMessagingEvent(event);
                        }
                    }
                    // Changes (comments, mentions)
                    if (entry.changes) {
                        for (const change of entry.changes) {
                            await this.handleChangeEvent(change);
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Error processing Instagram event:', error);
        }
    }

    async handleMessagingEvent(event) {
        const senderId = event.sender.id;
        const recipientId = event.recipient.id;
        const timestamp = event.timestamp;

        if (event.message) {
            // It's a text message or attachment
            const messageData = {
                id: event.message.mid,
                senderId,
                recipientId,
                timestamp,
                type: 'message',
                text: event.message.text,
                isEcho: event.message.is_echo || false,
                attachments: event.message.attachments || []
            };

            if (!messageData.isEcho) {
                console.log(`Received message from ${senderId}: ${messageData.text}`);
                await dbService.saveMessage(messageData);
            }
        }
    }

    async handleChangeEvent(change) {
        // Handle comments, mentions etc.
        // Example structure: field: 'comments', value: { text: ... }
        console.log('Received Change Event:', change.field);
        // Implement saving logic for comments if needed
        if (change.field === 'comments') {
            await dbService.saveMessage({
                type: 'comment',
                id: change.value.id,
                text: change.value.text,
                senderId: change.value.from.id,
                timestamp: Date.now() // specific timestamp might vary
            });
        }
    }
}

module.exports = new WebhookService();
