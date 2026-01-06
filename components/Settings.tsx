import React, { useState } from 'react';
import SettingsGeneral from './settings/SettingsGeneral';
import SettingsIntegrations from './settings/SettingsIntegrations';
import SettingsSecurity from './settings/SettingsSecurity';
import SettingsAppearance from './settings/SettingsAppearance';
import UserManagement from './admin/UserManagement';
import { useAuth } from '../contexts/AuthContext';
import { useApp } from '../contexts/AppContext';
import { UserRole, View } from '../types';
import { Card } from './ui/Card';
import { Title, Caption } from './ui/Typography';


type SettingsTab = 'general' | 'integrations' | 'security' | 'appearance' | 'users';

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');
  const { userProfile } = useAuth();
  const { setView } = useApp();


  const isAdminOrOwner = userProfile?.role === UserRole.ADMIN || userProfile?.role === UserRole.OWNER;

  const tabs: { id: SettingsTab; label: string; icon: string }[] = [
    { id: 'general', label: 'Общее', icon: '🏢' },
    { id: 'integrations', label: 'Интеграции', icon: '⚡' },
    { id: 'security', label: 'Безопасность', icon: '🔐' },
    { id: 'appearance', label: 'Внешний вид', icon: '🎨' },
    ...(isAdminOrOwner ? [{ id: 'users' as SettingsTab, label: 'Пользователи', icon: '👥' }] : []),
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'general': return <SettingsGeneral />;
      case 'integrations': return <SettingsIntegrations />;
      case 'security': return <SettingsSecurity />;
      case 'appearance': return <SettingsAppearance />;
      case 'users': return <UserManagement />;
      default: return <SettingsGeneral />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-100px)] flex flex-col md:flex-row gap-8 pb-4">
      {/* SIDEBAR NAVIGATION */}
      <nav className="w-full md:w-64 flex-shrink-0">
        <div className="sticky top-6 space-y-6">
          <header className="px-2">
            <Title>Настройки</Title>
            <Caption className="mt-1">Управление системой</Caption>
          </header>

          <Card className="!p-2 flex flex-row md:flex-col gap-1 overflow-x-auto md:overflow-visible no-scrollbar">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center gap-3 px-4 py-3 rounded-[1.2rem] transition-all duration-200 outline-none text-left min-w-[140px] md:min-w-0 ${activeTab === tab.id
                  ? 'bg-ios-bg shadow-sm text-ios-primary font-bold'
                  : 'text-ios-secondary hover:bg-ios-bg/50 hover:text-ios-primary font-medium'
                  }`}
              >
                <span className="text-xl shrink-0">{tab.icon}</span>
                <span className="text-xs uppercase tracking-wide truncate">{tab.label}</span>
                {activeTab === tab.id && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-ios-accent rounded-r-full hidden md:block"></div>
                )}
              </button>
            ))}

            {/* External Links / Switches */}
            <button
              onClick={() => setView(View.DOCS)}
              className="relative flex items-center gap-3 px-4 py-3 rounded-[1.2rem] transition-all duration-200 outline-none text-left min-w-[140px] md:min-w-0 text-ios-secondary hover:bg-ios-bg/50 hover:text-ios-primary font-medium"
            >
              <span className="text-xl shrink-0">📚</span>
              <span className="text-xs uppercase tracking-wide truncate">Документация</span>
            </button>
          </Card>
        </div>
      </nav>

      {/* CONTENT AREA - Inner components should use Cards themselves */}
      <main className="flex-1 min-w-0 h-full overflow-y-auto custom-scrollbar md:pr-2">
        {renderContent()}
      </main>
    </div>
  );
};
export default Settings;
