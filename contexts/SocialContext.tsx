
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { SocialPost, Product, SocialAccount, SocialMessage } from '../types';
import { socialService } from '../services/socialService';

interface SocialContextType {
  scheduledPosts: SocialPost[];
  setScheduledPosts: React.Dispatch<React.SetStateAction<SocialPost[]>>;
  productToPromote: Product | null;
  setProductToPromote: (product: Product | null) => void;
  accounts: SocialAccount[];
  connectAccount: (platform: SocialAccount['platform'], credentials: any) => Promise<void>;
  disconnectAccount: (id: string) => Promise<void>;
  refreshAccounts: () => Promise<void>;
}

const SocialContext = createContext<SocialContextType | undefined>(undefined);

export const SocialProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [scheduledPosts, setScheduledPosts] = useState<SocialPost[]>(() => JSON.parse(localStorage.getItem('crm_posts') || '[]'));
  const [productToPromote, setProductToPromote] = useState<Product | null>(null);
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    const data = await socialService.getAccounts();
    setAccounts(data);
  };

  const connectAccount = async (platform: SocialAccount['platform'], credentials: any) => {
    await socialService.connectAccount(platform, credentials);
    await loadAccounts();
  };

  const disconnectAccount = async (id: string) => {
    await socialService.disconnectAccount(id);
    await loadAccounts();
  };

  useEffect(() => {
    localStorage.setItem('crm_posts', JSON.stringify(scheduledPosts));
  }, [scheduledPosts]);

  return (
    <SocialContext.Provider value={{
      scheduledPosts, setScheduledPosts, productToPromote, setProductToPromote,
      accounts, connectAccount, disconnectAccount, refreshAccounts: loadAccounts
    }}>
      {children}
    </SocialContext.Provider>
  );
};

export const useSocial = () => {
  const context = useContext(SocialContext);
  if (!context) throw new Error('useSocial must be used within a SocialProvider');
  return context;
};
