
/**
 * Service to handle interactions with Social Media APIs (Facebook Graph API)
 */
class SocialService {
    constructor() {
        this.baseUrl = 'https://graph.facebook.com/v19.0';
    }

    /**
     * Fetch connected accounts (Pages) from Facebook Graph API
     */
    async getAccounts(apiKey) {
        if (!apiKey) throw new Error('API Key is required');

        try {
            const response = await fetch(`${this.baseUrl}/me/accounts?access_token=${apiKey}`);
            const data = await response.json();

            if (data.error) throw new Error(data.error.message);

            return data.data || [];
        } catch (error) {
            console.error('SocialService.getAccounts error:', error);
            throw error;
        }
    }

    /**
     * Fetch conversations/messages for a specific Page
     */
    async getMessages(accountId, apiKey) {
        if (!accountId || !apiKey) throw new Error('Account ID and API Key are required');

        try {
            // Fetch conversations
            const response = await fetch(`${this.baseUrl}/${accountId}/conversations?platform=instagram&access_token=${apiKey}`);
            const data = await response.json();

            if (data.error) throw new Error(data.error.message);

            return data.data || [];
        } catch (error) {
            console.error('SocialService.getMessages error:', error);
            throw error;
        }
    }

    /**
     * Send a reply to a conversation/message
     */
    async sendReply(messageId, text, apiKey) {
        if (!messageId || !text || !apiKey) throw new Error('Missing required parameters');

        try {
            const response = await fetch(`${this.baseUrl}/${messageId}/messages?access_token=${apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    recipient: { id: 'RECIPIENT_ID_PLACEHOLDER' }, // In real scenario, we extract this from messageId or context
                    message: { text }
                })
            });

            const data = await response.json();

            if (data.error) throw new Error(data.error.message);

            return data;
        } catch (error) {
            console.error('SocialService.sendReply error:', error);
            throw error;
        }
    }
}

module.exports = new SocialService();
