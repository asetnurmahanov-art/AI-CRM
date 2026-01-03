
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { SocialPost, Product } from '../types';

interface SocialContextType {
  scheduledPosts: SocialPost[];
  setScheduledPosts: React.Dispatch<React.SetStateAction<SocialPost[]>>;
  productToPromote: Product | null;
  setProductToPromote: (product: Product | null) => void;
}

const SocialContext = createContext<SocialContextType | undefined>(undefined);

export const SocialProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [scheduledPosts, setScheduledPosts] = useState<SocialPost[]>(() => JSON.parse(localStorage.getItem('crm_posts') || '[]'));
  const [productToPromote, setProductToPromote] = useState<Product | null>(null);

  useEffect(() => {
    localStorage.setItem('crm_posts', JSON.stringify(scheduledPosts));
  }, [scheduledPosts]);

  return (
    <SocialContext.Provider value={{ scheduledPosts, setScheduledPosts, productToPromote, setProductToPromote }}>
      {children}
    </SocialContext.Provider>
  );
};

export const useSocial = () => {
  const context = useContext(SocialContext);
  if (!context) throw new Error('useSocial must be used within a SocialProvider');
  return context;
};
