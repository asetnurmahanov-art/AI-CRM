
/**
 * Service to handle interactions with Social Media APIs (Facebook Graph API)
 */
class SocialService {
    constructor() {
        this.baseUrl = 'https://graph.facebook.com/v19.0';
    }

    /**
     * Fetch connected accounts (Pages/Instagram) from Facebook Graph API
     */
    async getAccounts(apiKey, platform = 'facebook') {
        if (!apiKey) throw new Error('API Key is required');

        try {
            // Fetch pages with their linked Instagram accounts
            const response = await fetch(`${this.baseUrl}/me/accounts?fields=name,id,picture,access_token,instagram_business_account{id,username,profile_picture_url,name,fan_count}&access_token=${apiKey}`);
            const data = await response.json();

            if (data.error) throw new Error(data.error.message);

            const pages = data.data || [];

            if (platform === 'instagram') {
                // Extract Instagram accounts from pages
                const igAccounts = pages
                    .filter(p => p.instagram_business_account)
                    .map(p => ({
                        id: p.instagram_business_account.id,
                        name: p.instagram_business_account.name || p.name,
                        username: p.instagram_business_account.username,
                        picture: p.instagram_business_account.profile_picture_url,
                        fan_count: p.instagram_business_account.fan_count,
                        page_id: p.id,
                        page_token: p.access_token
                    }));
                return igAccounts;
            }

            return pages;
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
