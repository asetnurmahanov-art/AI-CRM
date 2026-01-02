
import React, { useState, useEffect, useCallback, useRef } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Inventory from './components/Inventory';
import SocialHub from './components/SocialHub';
import SocialScheduler from './components/SocialScheduler';
import CRMManager from './components/CRMManager';
import AnalyticsView from './components/AnalyticsView';
import Settings from './components/Settings';
import ToolsView from './components/ToolsView';
import { View, Product, Customer, Company, SocialPost, Branch } from './types';

const INITIAL_BRANCHES: Branch[] = [
  { id: 'b1', name: 'Главный склад', address: 'Алматы, пр. Аль-Фараби 77/7', mapUrl: 'https://2gis.kz', phone: '+7 727 000 0000', isMain: true },
  { id: 'b2', name: 'Филиал Esentai', address: 'Алматы, ТРЦ Esentai Mall, 3 этаж', mapUrl: 'https://2gis.kz', phone: '+7 727 111 1111', isMain: false },
];

const INITIAL_CUSTOMERS: Customer[] = [
  { id: '1', name: 'Мария Иванова', handle: '@mama_mashy', platform: 'instagram', lastInteraction: '2024-10-20', totalSpent: 125000, status: 'won' },
  { id: '2', name: 'Анна Кузнецова', handle: '@ann_mom', platform: 'whatsapp', lastInteraction: '2024-10-18', totalSpent: 34000, status: 'payment' },
  { id: '3', name: 'Ольга Смирнова', handle: 'Olga Smirnova', platform: 'facebook', lastInteraction: '2024-10-05', totalSpent: 450000, status: 'won' },
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

const App: React.FC = () => {
  const [theme, setTheme] = useState<ThemeType>(() => {
    const saved = localStorage.getItem('theme-style') as ThemeType;
    const validThemes: ThemeType[] = ['gray', 'royal', 'olive', 'champagne', 'nordic'];
    return validThemes.includes(saved) ? saved : 'gray';
  });
  
  const [currentView, setView] = useState<View>(View.DASHBOARD);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  // DATA STATE INITIALIZATION
  const [companies, setCompanies] = useState<Company[]>(() => JSON.parse(localStorage.getItem('crm_companies') || JSON.stringify(INITIAL_COMPANIES)));
  const [activeCompany, setActiveCompany] = useState<Company>(() => {
    const saved = JSON.parse(localStorage.getItem('crm_companies') || '[]');
    return saved.length > 0 ? saved[0] : INITIAL_COMPANIES[0];
  });
  
  const [products, setProducts] = useState<Product[]>(() => JSON.parse(localStorage.getItem('crm_products') || '[]'));
  const [customers, setCustomers] = useState<Customer[]>(() => JSON.parse(localStorage.getItem('crm_customers') || JSON.stringify(INITIAL_CUSTOMERS)));
  const [scheduledPosts, setScheduledPosts] = useState<SocialPost[]>(() => JSON.parse(localStorage.getItem('crm_posts') || '[]'));

  // Navigation State
  const [productToPromote, setProductToPromote] = useState<Product | null>(null);

  // Debounce refs for high-load persistence
  const saveTimeout = useRef<NodeJS.Timeout>(null);

  // Handler to keep activeCompany and companies array in sync
  const handleUpdateCompany = useCallback((updated: Company) => {
    setActiveCompany(updated);
    setCompanies(prev => {
      const newList = prev.map(c => c.id === updated.id ? updated : c);
      localStorage.setItem('crm_companies', JSON.stringify(newList));
      return newList;
    });
  }, []);

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

  // Debounced Persistence Effect
  useEffect(() => {
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    
    saveTimeout.current = setTimeout(() => {
      localStorage.setItem('crm_products', JSON.stringify(products));
      localStorage.setItem('crm_customers', JSON.stringify(customers));
      localStorage.setItem('crm_posts', JSON.stringify(scheduledPosts));
    }, 1000); // 1 second debounce for high-load performance

    return () => {
        if(saveTimeout.current) clearTimeout(saveTimeout.current);
    };
  }, [products, customers, scheduledPosts]);

  const navItems = [
    { id: View.DASHBOARD, label: 'Обзор', icon: '🏠' },
    { id: View.INVENTORY, label: 'Склад', icon: '📦' },
    { id: View.SOCIAL, label: 'Чаты', icon: '💬' },
    { id: View.CUSTOMERS, label: 'CRM', icon: '👥' },
    { id: View.SCHEDULER, label: 'Посты', icon: '📝' },
    { id: View.SETTINGS, label: 'Опции', icon: '⚙️' },
  ];

  const handlePromoteProduct = useCallback((product: Product) => {
    setProductToPromote(product);
    setView(View.SCHEDULER);
  }, []);

  return (
    <div className="flex min-h-screen bg-ios-bg selection:bg-ios-accent selection:text-white transition-colors duration-500 overflow-hidden">
      {!isMobile && (
        <div className="fixed inset-y-0 left-0 w-64 z-40">
          <Sidebar 
            currentView={currentView} 
            setView={setView} 
            activeCompany={activeCompany}
            companies={companies}
            setCompany={setActiveCompany}
            onLogout={() => console.log('Logout')}
          />
        </div>
      )}

      <div className={`flex-1 flex flex-col h-screen ${!isMobile ? 'pl-64' : ''}`}>
        <main className={`flex-1 ${isMobile ? 'p-3 pb-36 pt-4' : 'p-6'} overflow-y-auto overflow-x-hidden scroll-smooth no-scrollbar`}>
          <div className="max-w-[1600px] mx-auto pb-10">
            {currentView === View.DASHBOARD && <Dashboard products={products} customers={customers} branches={activeCompany.branches} />}
            {currentView === View.INVENTORY && <Inventory products={products} setProducts={setProducts} setScheduledPosts={setScheduledPosts} onPromote={handlePromoteProduct} />}
            {currentView === View.SOCIAL && <SocialHub />}
            {currentView === View.CUSTOMERS && <CRMManager customers={customers} setCustomers={setCustomers} />}
            {currentView === View.SCHEDULER && (
              <SocialScheduler 
                products={products} 
                scheduledPosts={scheduledPosts} 
                setScheduledPosts={setScheduledPosts} 
                preselectedProduct={productToPromote}
                onClearPreselected={() => setProductToPromote(null)}
              />
            )}
            {currentView === View.ANALYTICS && <AnalyticsView products={products} customers={customers} />}
            {currentView === View.SETTINGS && <Settings companies={companies} activeCompany={activeCompany} updateCompany={handleUpdateCompany} currentTheme={theme} setTheme={setTheme} />}
            {currentView === View.TOOLS && <ToolsView activeCompany={activeCompany} />}
          </div>
        </main>

        {isMobile && (
          <nav className="fixed bottom-0 inset-x-0 bg-ios-card/80 border-t border-ios backdrop-blur-xl flex justify-between items-center px-6 pb-safe pt-2 z-[90] shadow-ios-heavy">
            {navItems.map(item => (
              <button 
                key={item.id} 
                onClick={() => setView(item.id)}
                className={`flex flex-col items-center gap-1 transition-all p-2 rounded-xl active:scale-90 ${currentView === item.id ? 'text-ios-accent' : 'text-ios-secondary opacity-60'}`}
              >
                <span className={`text-2xl ${currentView === item.id ? 'scale-110' : ''} transition-transform`}>{item.icon}</span>
              </button>
            ))}
          </nav>
        )}
      </div>
    </div>
  );
};

export default App;
