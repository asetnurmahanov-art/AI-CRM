import { SocialAccount, SocialMessage, SocialPost } from '../types';

// Mock data to simulate API responses
const MOCK_ACCOUNTS: SocialAccount[] = [
    {
        id: 'acc_1',
        name: 'Instagram Main',
        platform: 'instagram',
        isConnected: true,
        username: '@smart_business_kz',
        avatarUrl: 'https://picsum.photos/seed/insta/200',
        stats: { followers: 12500, posts: 142, engagement: 4.5 }
    }
];

const MOCK_MESSAGES: SocialMessage[] = [
    {
        id: 'msg_1',
        accountId: 'acc_1',
        customerName: 'Мария Иванова',
        customerHandle: '@mama_mashy',
        customerAvatar: 'https://picsum.photos/100/100?seed=1',
        platform: 'instagram',
        text: 'Здравствуйте! Есть ли это платье в 92 размере?',
        timestamp: '10:42',
        isRead: false,
        history: [{ text: 'Здравствуйте! Есть ли это платье в 92 размере?', sender: 'user', time: '10:42' }]
    },
    {
        id: 'msg_2',
        accountId: 'acc_1',
        customerName: 'Анна Кузнецова',
        customerHandle: 'Anna K.',
        customerAvatar: 'https://picsum.photos/100/100?seed=2',
        platform: 'whatsapp',
        text: 'Отправьте, пожалуйста, геолокацию магазина в Алматы.',
        timestamp: 'Вчера',
        isRead: true,
        history: [
            { text: 'Спасибо за покупку!', sender: 'agent', time: 'Вчера' },
            { text: 'Отправьте, пожалуйста, геолокацию магазина в Алматы.', sender: 'user', time: 'Вчера' }
        ]
    }
];

class SocialService {
    private accounts: SocialAccount[] = [...MOCK_ACCOUNTS];
    private messages: SocialMessage[] = [...MOCK_MESSAGES];

    /** 
     * Mimic an async API call to fetch connected accounts 
     */
    async getAccounts(): Promise<SocialAccount[]> {
        // Mock fallback if one specific account (initial mock) is present
        // In real app, we might merge both or just use real

        // 1. Check for accounts with API Keys
        const realAccounts = this.accounts.filter(a => a.apiKey);

        if (realAccounts.length === 0) {
            return new Promise((resolve) => {
                setTimeout(() => resolve(this.accounts), 500);
            });
        }

        // 2. Fetch real data for each account via Backend
        const updatedAccounts = await Promise.all(this.accounts.map(async (acc) => {
            if (!acc.apiKey || acc.platform !== 'instagram') return acc;

            try {
                // Call Backend API
                const res = await fetch(`http://localhost:3005/api/social/accounts`, {
                    headers: { 'x-api-key': acc.apiKey }
                });
                const data = await res.json();

                if (data.success && data.accounts && data.accounts.length > 0) {
                    // Update account name/id from real data (taking the first page for simplicity)
                    const page = data.accounts[0];
                    return {
                        ...acc,
                        name: page.name,
                        username: '@' + page.name.replace(/\s+/g, ''), // Simplify for demo
                        id: page.id, // Update ID to real Page ID
                        stats: { ...acc.stats, followers: 100 } // Mock stats for now as they require different endpoint
                    };
                }
                return acc;
            } catch (e) {
                console.error("Failed to fetch real account data via backend", e);
                return acc;
            }
        }));

        this.accounts = updatedAccounts;
        return this.accounts;
    }

    /**
     * Connect a new account (Mock)
     */
    async connectAccount(platform: SocialAccount['platform'], credentials: any): Promise<SocialAccount> {
        return new Promise((resolve) => {
            setTimeout(() => {
                const newAccount: SocialAccount = {
                    id: `acc_${Date.now()}`,
                    name: `${platform} Account`,
                    platform,
                    isConnected: true,
                    username: credentials.username || `@user_${Date.now().toString().slice(-4)}`,
                    avatarUrl: `https://picsum.photos/seed/${Date.now()}/200`,
                    apiKey: credentials.apiKey, // Store real API Key
                    apiSecret: credentials.apiSecret, // Store real API Secret
                    accessToken: credentials.apiKey, // Use API Key as access token for now
                    stats: { followers: 0, posts: 0, engagement: 0 }
                };
                this.accounts.push(newAccount);
                resolve(newAccount);
            }, 1000);
        });
    }

    /**
     * Disconnect an account
     */
    async disconnectAccount(id: string): Promise<boolean> {
        return new Promise((resolve) => {
            setTimeout(() => {
                this.accounts = this.accounts.filter(a => a.id !== id);
                resolve(true);
            }, 500);
        });
    }

    /**
     * Get messages (for all or specific account)
     */
    async getMessages(accountId?: string): Promise<SocialMessage[]> {
        if (!accountId) return this.messages;

        const account = this.accounts.find(a => a.id === accountId);
        if (!account?.apiKey || account.platform !== 'instagram') {
            return new Promise((resolve) => {
                setTimeout(() => {
                    if (accountId) {
                        resolve(this.messages.filter(m => m.accountId === accountId));
                    } else {
                        resolve(this.messages);
                    }
                }, 500);
            });
        }

        try {
            // Call Backend API
            const res = await fetch(`http://localhost:3005/api/social/messages?accountId=${account.id}`, {
                headers: { 'x-api-key': account.apiKey }
            });
            const data = await res.json();

            if (data.success && data.messages) {
                // Transform FB data to our SocialMessage format
                const realMessages: SocialMessage[] = data.messages.map((conv: any) => ({
                    id: conv.id,
                    accountId: account.id,
                    customerName: 'Instagram User', // Would need another fetch for name
                    customerHandle: '@user',
                    platform: 'instagram',
                    text: 'Conversation started', // Would need fetch for messages attached
                    timestamp: conv.updated_time,
                    isRead: false,
                    history: []
                }));
                return realMessages;
            }
            return [];
        } catch (e) {
            console.error("Error fetching real messages via backend", e);
            return [];
        }
    }

    /**
     * Send a reply
     */
    async sendReply(messageId: string, text: string): Promise<SocialMessage | null> {
        // Find message to get account info
        const msgIndex = this.messages.findIndex(m => m.id === messageId);
        // If not found in mock, it might be a real message not in 'this.messages' yet depending on how we sync
        // For simplicity, we assume we find it or we pass account info differently.

        let accountId = this.messages[msgIndex]?.accountId;
        // Search in real accounts logic if needed. 

        // MIXED MODE: If message is real (ID starting with 't_' usually for FB), try real send

        const account = this.accounts.find(a => a.id === accountId);

        if (account?.apiKey) {
            try {
                // Backend Call
                await fetch(`http://localhost:3005/api/social/reply`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-api-key': account.apiKey
                    },
                    body: JSON.stringify({ messageId, text })
                });
            } catch (e) { console.error("Real send via backend failed", e); }
        }


        // Fallback / Optimistic local update
        if (msgIndex === -1) return null;

        const updatedMsg = { ...this.messages[msgIndex] };
        updatedMsg.history = [
            ...(updatedMsg.history || []),
            { text, sender: 'agent' as const, time: 'Now' }
        ];
        this.messages[msgIndex] = updatedMsg;

        return updatedMsg;
    }

    /**
     * Schedule or Publish a post
     */
    async publishPost(post: SocialPost): Promise<boolean> {
        return new Promise(resolve => setTimeout(() => resolve(true), 1500));
    }
}

export const socialService = new SocialService();
