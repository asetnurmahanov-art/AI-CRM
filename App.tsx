
import React from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Inventory from './components/Inventory';
import SocialHub from './components/SocialHub';
import SocialScheduler from './components/SocialScheduler';
import CRMManager from './components/CRMManager';
import AnalyticsView from './components/AnalyticsView';
import Settings from './components/Settings';
import ToolsView from './components/ToolsView';
import DatabaseDashboard from './components/admin/DatabaseDashboard';
import { View } from './types';
import { AppProvider, useApp } from './contexts/AppContext';
import { InventoryProvider } from './contexts/InventoryContext';
import { CRMProvider } from './contexts/CRMContext';
import { SocialProvider } from './contexts/SocialContext';

import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/Login';

const AppInner: React.FC = () => {
  const { currentView, setView, isMobile } = useApp();
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-100">Загрузка...</div>;
  }

  if (!user) {
    return <Login />;
  }

  const navItems = [
    { id: View.DASHBOARD, label: 'Обзор', icon: '🏠' },
    { id: View.INVENTORY, label: 'Склад', icon: '📦' },
    { id: View.SOCIAL, label: 'Чаты', icon: '💬' },
    { id: View.CUSTOMERS, label: 'CRM', icon: '👥' },
    { id: View.SCHEDULER, label: 'Посты', icon: '📝' },
    { id: View.SETTINGS, label: 'Опции', icon: '⚙️' },
    { id: View.TOOLS, label: 'Инструменты', icon: '🛠️' },
  ];

  return (
    <div className="flex min-h-screen bg-ios-bg selection:bg-ios-accent selection:text-white transition-colors duration-500 overflow-hidden">
      {!isMobile && (
        <div className="fixed inset-y-0 left-0 w-64 z-40">
          <Sidebar onLogout={() => console.log('Logout handled in Sidebar')} />
        </div>
      )}

      <div className={`flex-1 flex flex-col h-screen ${!isMobile ? 'pl-64' : ''}`}>
        <main className={`flex-1 ${isMobile ? 'p-3 pb-36 pt-4' : 'p-6'} overflow-y-auto overflow-x-hidden scroll-smooth no-scrollbar`}>
          <div className="max-w-[1600px] mx-auto pb-10">
            {currentView === View.DASHBOARD && <Dashboard />}
            {currentView === View.INVENTORY && <Inventory />}
            {currentView === View.SOCIAL && <SocialHub />}
            {currentView === View.CUSTOMERS && <CRMManager />}
            {currentView === View.SCHEDULER && <SocialScheduler />}
            {currentView === View.ANALYTICS && <AnalyticsView />}
            {currentView === View.SETTINGS && <Settings />}
            {currentView === View.TOOLS && <ToolsView />}
            {currentView === View.DATABASE && <DatabaseDashboard />}
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

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppProvider>
        <InventoryProvider>
          <CRMProvider>
            <SocialProvider>
              <AppInner />
            </SocialProvider>
          </CRMProvider>
        </InventoryProvider>
      </AppProvider>
    </AuthProvider>
  );
};

export default App;
