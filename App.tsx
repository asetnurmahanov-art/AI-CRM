
import React from 'react';

import Sidebar from './components/Sidebar'; // Kept for types if needed, but AdaptiveLayout handles it
import AdaptiveLayout from './components/layouts/AdaptiveLayout';
import Dashboard from './components/Dashboard';
import Inventory from './components/Inventory';
import SocialHub from './components/SocialHub';
import SocialScheduler from './components/SocialScheduler';
import CRMManager from './components/CRMManager';
import AnalyticsView from './components/AnalyticsView';
import Settings from './components/Settings';
import ToolsView from './components/ToolsView';
import DocsManager from './components/DocsManager';
import DatabaseDashboard from './components/admin/DatabaseDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import { View, UserRole } from './types';
import { AppProvider, useApp } from './contexts/AppContext';
import { DeviceProvider } from './contexts/DeviceContext';
import { InventoryProvider } from './contexts/InventoryContext';
import { CRMProvider } from './contexts/CRMContext';
import { SocialProvider } from './contexts/SocialContext';

import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/Login';

const AppInner: React.FC = () => {
  const { currentView } = useApp();
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-100">Загрузка...</div>;
  }

  if (!user) {
    return <Login />;
  }

  return (
    <AdaptiveLayout>
      {currentView === View.DASHBOARD && <Dashboard />}
      {currentView === View.INVENTORY && <Inventory />}
      {currentView === View.SOCIAL && <SocialHub />}
      {currentView === View.CUSTOMERS && <CRMManager />}
      {currentView === View.SCHEDULER && <SocialScheduler />}
      {currentView === View.ANALYTICS && <AnalyticsView />}
      {currentView === View.SETTINGS && <Settings />}
      {currentView === View.TOOLS && <ToolsView />}
      {currentView === View.DOCS && <DocsManager />}
      {currentView === View.DATABASE && (
        <ProtectedRoute requiredRole={UserRole.ADMIN}>
          <DatabaseDashboard />
        </ProtectedRoute>
      )}
    </AdaptiveLayout>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <DeviceProvider>
        <AppProvider>
          <InventoryProvider>
            <CRMProvider>
              <SocialProvider>
                <AppInner />
              </SocialProvider>
            </CRMProvider>
          </InventoryProvider>
        </AppProvider>
      </DeviceProvider>
    </AuthProvider>
  );
};

export default App;
