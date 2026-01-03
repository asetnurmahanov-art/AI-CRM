
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { View, Company, Branch } from '../types';

// Initial data constants (copied from App.tsx - can be removed from App.tsx later)
const INITIAL_BRANCHES: Branch[] = [
  { id: 'b1', name: 'Главный склад', address: 'Алматы, пр. Аль-Фараби 77/7', mapUrl: 'https://2gis.kz', phone: '+7 727 000 0000', isMain: true },
  { id: 'b2', name: 'Филиал Esentai', address: 'Алматы, ТРЦ Esentai Mall, 3 этаж', mapUrl: 'https://2gis.kz', phone: '+7 727 111 1111', isMain: false },
];

const INITIAL_COMPANIES: Company[] = [
  { 
    id: 'c1', 
    name: 'Умный Бизнес (Алматы)', 
    bin: '123456789012', 
    address: 'Алматы, Достык 100', 
    account: 'KZ1234567890', 
    logoUrl: 'https://picsum.photos/100/100?seed=shop1',
    branches: INITIAL_BRANCHES
  },
];

export type ThemeType = 'gray' | 'royal' | 'olive' | 'champagne' | 'nordic';

interface AppState {
  theme: ThemeType;
  currentView: View;
  isMobile: boolean;
  companies: Company[];
  activeCompany: Company;
  
  // Actions
  setTheme: (theme: ThemeType) => void;
  setView: (view: View) => void;
  setIsMobile: (isMobile: boolean) => void;
  setCompanies: (companies: Company[]) => void;
  setActiveCompany: (company: Company) => void;
  updateCompany: (updated: Company) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      theme: 'gray',
      currentView: View.DASHBOARD,
      isMobile: typeof window !== 'undefined' ? window.innerWidth < 1024 : false,
      companies: INITIAL_COMPANIES,
      activeCompany: INITIAL_COMPANIES[0],

      setTheme: (theme) => set({ theme }),
      setView: (currentView) => set({ currentView }),
      setIsMobile: (isMobile) => set({ isMobile }),
      setCompanies: (companies) => set({ companies }),
      setActiveCompany: (activeCompany) => set({ activeCompany }),
      updateCompany: (updated) => set((state) => {
        const newCompanies = state.companies.map(c => c.id === updated.id ? updated : c);
        return { companies: newCompanies, activeCompany: updated };
      }),
    }),
    {
      name: 'app-storage',
      partialize: (state) => ({ 
        theme: state.theme, 
        companies: state.companies, 
        activeCompany: state.activeCompany 
      }),
    }
  )
);
