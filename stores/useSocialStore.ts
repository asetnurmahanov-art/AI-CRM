
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { SocialPost, Product } from '../types';

interface SocialState {
  scheduledPosts: SocialPost[];
  productToPromote: Product | null;
  
  setScheduledPosts: (posts: SocialPost[]) => void;
  addPost: (post: SocialPost) => void;
  updatePost: (post: SocialPost) => void;
  setProductToPromote: (product: Product | null) => void;
}

export const useSocialStore = create<SocialState>()(
  persist(
    (set) => ({
      scheduledPosts: [],
      productToPromote: null,
      
      setScheduledPosts: (scheduledPosts) => set({ scheduledPosts }),
      addPost: (post) => set((state) => ({ scheduledPosts: [...state.scheduledPosts, post] })),
      updatePost: (post) => set((state) => ({
        scheduledPosts: state.scheduledPosts.map((p) => p.id === post.id ? post : p)
      })),
      setProductToPromote: (productToPromote) => set({ productToPromote }),
    }),
    {
      name: 'crm_posts',
      partialize: (state) => ({ scheduledPosts: state.scheduledPosts }),
    }
  )
);
