
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { View, Company, Branch } from '../types';
import { dbService } from '../services/db';

export type ThemeType = 'gray' | 'royal' | 'olive' | 'champagne' | 'nordic';
export type AIProvider = 'api' | 'local';

// New Local AI Types
export type LocalModelProfile = 'mobile' | 'pc' | 'imac';
export type LocalDeviceType = 'ios' | 'android' | 'web';

export interface LocalAIConfig {
  profile: LocalModelProfile; // Computing power simulation (Nano vs Pro)
  device: LocalDeviceType; // Platform behavior simulation
}

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

interface AppContextType {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
  aiProvider: AIProvider;
  setAiProvider: (provider: AIProvider) => void;
  localModelConfig: LocalAIConfig;
  setLocalModelConfig: (config: LocalAIConfig) => void;
  currentView: View;
  setView: (view: View) => void;
  isMobile: boolean;
  companies: Company[];
  setCompanies: (companies: Company[]) => void;
  activeCompany: Company;
  setActiveCompany: (company: Company) => void;
  updateCompany: (updated: Company) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Theme
  const [theme, setTheme] = useState<ThemeType>(() => {
    const saved = localStorage.getItem('theme-style') as ThemeType;
    const validThemes: ThemeType[] = ['gray', 'royal', 'olive', 'champagne', 'nordic'];
    return validThemes.includes(saved) ? saved : 'gray';
  });

  // AI Provider
  const [aiProvider, setAiProvider] = useState<AIProvider>(() => {
    const saved = localStorage.getItem('ai_provider_mode') as AIProvider;
    return saved === 'local' ? 'local' : 'api';
  });

  // Local Model Config
  const [localModelConfig, setLocalModelConfig] = useState<LocalAIConfig>(() => {
    const saved = localStorage.getItem('local_ai_config');
    return saved ? JSON.parse(saved) : { profile: 'pc', device: 'web' };
  });

  // View
  const [currentView, setView] = useState<View>(View.DASHBOARD);

  // Mobile
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < 1024 : false);

  // Companies
  const [companies, setCompanies] = useState<Company[]>(() => JSON.parse(localStorage.getItem('crm_companies') || JSON.stringify(INITIAL_COMPANIES)));
  const [activeCompany, setActiveCompany] = useState<Company>(() => {
    const saved = JSON.parse(localStorage.getItem('crm_companies') || '[]');
    return saved.length > 0 ? saved[0] : INITIAL_COMPANIES[0];
  });

  // Load companies from DB
  useEffect(() => {
    const loadCompanies = async () => {
      try {
        const data = await dbService.getAll('companies');
        if (data.length > 0) {
          setCompanies(data as Company[]);
          // Default to first if active not set or invalid
          if (data.length > 0) setActiveCompany(data[0] as Company);
        }
      } catch (e) {
        console.error("Failed to load companies", e);
      }
    };
    loadCompanies();
  }, []);

  // Effects
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    document.body.className = `theme-${theme}`;
    const isDark = ['nordic', 'royal'].includes(theme);
    document.documentElement.classList.toggle('dark', isDark);
    localStorage.setItem('theme-style', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('ai_provider_mode', aiProvider);
  }, [aiProvider]);

  useEffect(() => {
    localStorage.setItem('local_ai_config', JSON.stringify(localModelConfig));
  }, [localModelConfig]);

  // Sync companies to DB
  const updateCompany = async (updated: Company) => {
    // Optimistic
    setActiveCompany(updated);
    setCompanies(prev => prev.map(c => c.id === updated.id ? updated : c));

    try {
      // Check if it exists to decide update vs add (though in this context we usually update existing)
      await dbService.update('companies', updated.id, updated);
      // Fallback for localStorage to keep it sync just in case
      localStorage.setItem('crm_companies', JSON.stringify(companies.map(c => c.id === updated.id ? updated : c)));
    } catch (e) {
      console.error("Failed to update company", e);
    }
  };

  return (
    <AppContext.Provider value={{
      theme, setTheme,
      aiProvider, setAiProvider,
      localModelConfig, setLocalModelConfig,
      currentView, setView,
      isMobile,
      companies, setCompanies,
      activeCompany, setActiveCompany,
      updateCompany
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
