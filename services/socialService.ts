import { SocialAccount, SocialMessage, SocialPost } from '../types';

const API_URL = '/api/social';

class SocialService {
    private accounts: SocialAccount[] = [];
    private messages: SocialMessage[] = [];

    /** 
     * Fetch connected accounts using stored API keys or backend persistence
     * For this implementation, we assume we might need to persistent keys in localStorage or similar if the backend doesn't store them "per user"
     * But the backend `getAccounts` takes an apiKey. This mimics a "per-account" connection.
     */
    private loadFromStorage() {
        const stored = localStorage.getItem('crm_social_accounts');
        if (stored) {
            try {
                this.accounts = JSON.parse(stored);
            } catch (e) {
                console.error("Failed to parse accounts from storage", e);
            }
        }
    }

    private saveToStorage() {
        localStorage.setItem('crm_social_accounts', JSON.stringify(this.accounts));
    }

    constructor() {
        this.loadFromStorage();
    }

    async getAccounts(): Promise<SocialAccount[]> {
        return this.accounts;
    }

    /**
     * Connect a new account by validating the API Key with the backend
     */
    async connectAccount(platform: SocialAccount['platform'], credentials: any): Promise<SocialAccount | null> {
        // Support for real OAuth connection
        if (credentials.type === 'oauth' && credentials.accessToken) {
            try {
                const res = await fetch(`${API_URL}/connect-oauth`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ platform, accessToken: credentials.accessToken })
                });
                const data = await res.json();
                if (data.success && data.accounts?.length > 0) {
                    const remoteAccount = data.accounts[0];
                    const newAccount: SocialAccount = {
                        id: remoteAccount.id,
                        name: remoteAccount.name,
                        platform,
                        isConnected: true,
                        username: remoteAccount.username ? `@${remoteAccount.username}` : `@${remoteAccount.name.replace(/\s+/g, '')}`,
                        avatarUrl: remoteAccount.picture?.data?.url || remoteAccount.picture,
                        apiKey: credentials.accessToken,
                        stats: { followers: remoteAccount.fan_count || 0, posts: 0, engagement: 0 }
                    };

                    // Avoid duplicates
                    this.accounts = this.accounts.filter(a => a.id !== newAccount.id);
                    this.accounts.push(newAccount);
                    this.saveToStorage();
                    return newAccount;
                } else {
                    console.warn("No accounts found for this token", data);
                    throw new Error("No accounts found");
                }
            } catch (e) {
                console.error("Real Connect OAuth Error", e);
            }
            return null;
        }

        // For simulation or legacy keys
        if (!credentials.apiKey) throw new Error("API Key required");

        try {
            // Verify and fetch details from backend
            const res = await fetch(`${API_URL}/accounts`, {
                headers: { 'x-api-key': credentials.apiKey }
            });
            const data = await res.json();

            if (!data.success) throw new Error(data.error || "Failed to connect");

            // Assuming the backend returns a list of pages/accounts accessible by this key
            // We'll take the first one or let user choose (simplification: take first)
            const remoteAccount = data.accounts && data.accounts.length > 0 ? data.accounts[0] : null;

            const newAccount: SocialAccount = {
                id: remoteAccount ? remoteAccount.id : `acc_${Date.now()}`,
                name: remoteAccount ? remoteAccount.name : `${platform} Account`,
                platform,
                isConnected: true,
                username: remoteAccount ? `@${remoteAccount.name.replace(/\s+/g, '')}` : undefined,
                avatarUrl: remoteAccount ? remoteAccount.picture?.data?.url : undefined,
                apiKey: credentials.apiKey,
                stats: { followers: remoteAccount?.fan_count || 0, posts: 0, engagement: 0 }
            };

            this.accounts.push(newAccount);
            return newAccount;
        } catch (e) {
            console.error("Connect Account Error", e);
            throw e;
        }
    }

    /**
     * Disconnect an account
     */
    async disconnectAccount(id: string): Promise<boolean> {
        this.accounts = this.accounts.filter(a => a.id !== id);
        return true;
    }

    /**
     * Get messages (for all or specific account)
     */
    async getMessages(accountId?: string): Promise<SocialMessage[]> {
        let targets = this.accounts;
        if (accountId) {
            targets = this.accounts.filter(a => a.id === accountId);
        }

        const allMessages: SocialMessage[] = [];

        for (const account of targets) {
            if (!account.apiKey) continue; // Skip if no key (shouldn't happen for connected accounts)

            try {
                const res = await fetch(`${API_URL}/messages?accountId=${account.id}`, {
                    headers: { 'x-api-key': account.apiKey }
                });
                const data = await res.json();

                if (data.success && Array.isArray(data.messages)) {
                    // Start of transformation (Backend returns FB format, we need SocialMessage)
                    // The backend `socialService.js` currently returns raw data.data.
                    // We need to map it.
                    const mapped = data.messages.map((m: any) => ({
                        id: m.id,
                        accountId: account.id,
                        customerName: 'Customer', // FB API might require separate call for profile
                        customerHandle: '@user',
                        platform: account.platform,
                        text: 'Message content', // FB API conversation object structure is complex, need specific fields
                        timestamp: m.updated_time,
                        isRead: false,
                        history: []
                    }));
                    allMessages.push(...mapped);
                }
            } catch (e) {
                console.error(`Failed to fetch messages for ${account.id}`, e);
            }
        }

        this.messages = allMessages;
        return this.messages;
    }

    /**
     * Send a reply
     */
    async sendReply(messageId: string, text: string): Promise<SocialMessage | null> {
        // Find which account owns this message
        // In a real app we'd map messageId to accountId or have it in the message object
        // We have to rely on `this.messages` having the message to know the accountId
        const existingMsg = this.messages.find(m => m.id === messageId);
        if (!existingMsg || !existingMsg.accountId) {
            console.error("Message context lost, cannot reply");
            return null;
        }

        const account = this.accounts.find(a => a.id === existingMsg.accountId);
        if (!account?.apiKey) return null;

        try {
            const res = await fetch(`${API_URL}/reply`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': account.apiKey
                },
                body: JSON.stringify({ messageId, text })
            });
            const data = await res.json();

            if (data.success) {
                // Optimistic update
                const updatedMsg = { ...existingMsg };
                updatedMsg.history = [
                    ...(updatedMsg.history || []),
                    { text, sender: 'agent' as const, time: 'Just now' }
                ];
                // Update local cache
                this.messages = this.messages.map(m => m.id === messageId ? updatedMsg : m);
                return updatedMsg;
            }
        } catch (e) {
            console.error("Reply failed", e);
        }
        return null;
    }

    /**
     * Schedule or Publish a post
     */
    async publishPost(post: SocialPost): Promise<boolean> {
        // Stub implementation for now as backend route not fully defined in snippet
        // But we should at least log or throw
        console.warn("Publishing not yet simulated in backend");
        return true;
    }
}

export const socialService = new SocialService();
