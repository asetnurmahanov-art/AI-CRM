import React, { useState } from 'react';
import SettingsGeneral from './settings/SettingsGeneral';
import SettingsIntegrations from './settings/SettingsIntegrations';
import SettingsSecurity from './settings/SettingsSecurity';
import SettingsAppearance from './settings/SettingsAppearance';

type SettingsTab = 'general' | 'integrations' | 'security' | 'appearance';

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');

  const tabs: { id: SettingsTab; label: string; icon: string }[] = [
    { id: 'general', label: 'Общее', icon: '🏢' },
    { id: 'integrations', label: 'Интеграции', icon: '⚡' },
    { id: 'security', label: 'Безопасность', icon: '🔐' },
    { id: 'appearance', label: 'Внешний вид', icon: '🎨' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'general': return <SettingsGeneral />;
      case 'integrations': return <SettingsIntegrations />;
      case 'security': return <SettingsSecurity />;
      case 'appearance': return <SettingsAppearance />;
      default: return <SettingsGeneral />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto pb-20 h-[calc(100vh-100px)] flex flex-col md:flex-row gap-6">

      {/* SIDEBAR NAVIGATION */}
      <nav className="w-full md:w-64 flex-shrink-0">
        <div className="sticky top-6 space-y-6">
          <header className="px-4">
            <h2 className="text-3xl font-black text-ios-primary tracking-tight">Настройки</h2>
            <p className="text-ios-secondary font-bold uppercase text-[10px] tracking-widest mt-1">Управление системой</p>
          </header>

          <div className="bg-ios-card/50 backdrop-blur-xl p-2 rounded-[2rem] border border-ios shadow-sm flex flex-row md:flex-col gap-1 overflow-x-auto md:overflow-visible">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center gap-3 px-4 py-3 rounded-2xl transition-all spring-press text-left min-w-[120px] md:min-w-0 ${activeTab === tab.id
                    ? 'bg-ios-bg shadow-md text-ios-primary'
                    : 'text-ios-secondary hover:bg-ios-sub/50 hover:text-ios-primary'
                  }`}
              >
                <span className="text-xl">{tab.icon}</span>
                <div className="flex-1">
                  <span className="text-[11px] font-black uppercase tracking-wide block">{tab.label}</span>
                </div>
                {activeTab === tab.id && (
                  <div className="absolute left-0 w-1 h-8 bg-ios-accent rounded-r-full hidden md:block"></div>
                )}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* CONTENT AREA */}
      <main className="flex-1 min-w-0 bg-ios-bg/50 rounded-[3rem] p-1 md:p-6 overflow-y-auto custom-scrollbar">
        {renderContent()}
      </main>

    </div>
  );
};

export default Settings;
