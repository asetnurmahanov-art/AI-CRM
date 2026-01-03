
import React, { useState, useRef, useEffect } from 'react';
import { View } from '../types';
import { useApp } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';

const Sidebar: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
  const { currentView, setView, activeCompany, companies, setActiveCompany } = useApp();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    onLogout();
  };

  const [showCompanyMenu, setShowCompanyMenu] = useState(false);
  const companyRef = useRef<HTMLDivElement>(null);

  const menuItems = [
    { id: View.DASHBOARD, label: 'Обзор', icon: '🏠' },
    { id: View.INVENTORY, label: 'Склад', icon: '📦' },
    { id: View.SOCIAL, label: 'Чаты', icon: '💬', badge: '3' },
    { id: View.SCHEDULER, label: 'Контент', icon: '📅' },
    { id: View.CUSTOMERS, label: 'Клиенты', icon: '👥' },
    { id: View.ANALYTICS, label: 'Аналитика', icon: '📈' },
    { id: View.SETTINGS, label: 'Настройки', icon: '⚙️' },
    { id: View.TOOLS, label: 'Инструменты', icon: '🛠️' },
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (companyRef.current && !companyRef.current.contains(event.target as Node)) {
        setShowCompanyMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="w-64 bg-ios-card border-r border-ios h-screen flex flex-col relative z-sidebar overflow-hidden">
      {/* Brand Section */}
      <div className="p-6 relative" ref={companyRef}>
        <button
          onClick={() => setShowCompanyMenu(!showCompanyMenu)}
          className="flex items-center gap-3 w-full group"
        >
          <div className="w-10 h-10 bg-ios-accent rounded-xl flex items-center justify-center text-white shadow-lg shrink-0 text-xl font-black">
            {activeCompany.name.charAt(0)}
          </div>
          <div className="text-left flex-1 min-w-0">
            <h1 className="text-sm font-black text-ios-primary truncate">{activeCompany.name}</h1>
            <p className="text-[10px] text-ios-secondary font-bold uppercase tracking-widest opacity-60">Smart CRM</p>
          </div>
          <svg className={`w-3 h-3 text-ios-secondary transition-transform ${showCompanyMenu ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {showCompanyMenu && (
          <div className="absolute top-full left-4 right-4 mt-2 bg-ios-card border border-ios rounded-2xl shadow-ios-heavy p-1.5 z-30 animate-ios-slide">
            {companies.map(company => (
              <button
                key={company.id}
                onClick={() => { setActiveCompany(company); setShowCompanyMenu(false); }}
                className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${activeCompany.id === company.id ? 'bg-ios-accent text-white' : 'text-ios-secondary hover:bg-ios-sub'
                  }`}
              >
                {company.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto no-scrollbar pt-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setView(item.id)}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-all spring-press ${currentView === item.id
              ? 'bg-ios-accent text-white font-black shadow-md'
              : 'text-ios-secondary hover:bg-ios-sub font-bold'
              }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-lg">{item.icon}</span>
              <span className="text-xs tracking-tight">{item.label}</span>
            </div>
            {item.badge && (
              <span className={`w-5 h-5 flex items-center justify-center rounded-full text-[9px] font-black ${currentView === item.id ? 'bg-white text-ios-accent' : 'bg-red-500 text-white'}`}>
                {item.badge}
              </span>
            )}
          </button>
        ))}
      </nav>

      {/* Info Widget Area (Every Millimeter Used) */}
      <div className="p-4 space-y-3">
        {/* Network Pulse Widget */}
        <div className="bg-ios-sub rounded-2xl p-4 border border-ios">
          <div className="flex justify-between items-center mb-3">
            <p className="text-[8px] font-black text-ios-secondary uppercase tracking-[0.2em]">Пульс сети</p>
            <div className="flex gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-sm"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-sm"></span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="px-2 py-1 bg-ios-card rounded-lg text-[7px] font-black uppercase text-ios-accent border border-ios">Insta: ON</div>
            <div className="px-2 py-1 bg-ios-card rounded-lg text-[7px] font-black uppercase text-green-500 border border-ios">WA: ON</div>
          </div>
        </div>

        <div className="bg-ios-sub rounded-2xl p-4 border border-ios">
          <div className="flex justify-between items-center mb-2">
            <p className="text-[9px] font-black text-ios-secondary uppercase tracking-widest">Склад</p>
            <p className="text-[9px] font-black text-ios-primary">84%</p>
          </div>
          <div className="w-full h-1 bg-ios-border rounded-full overflow-hidden">
            <div className="h-full bg-ios-accent" style={{ width: '84%' }}></div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 bg-red-500/5 hover:bg-red-500/10 text-red-500 rounded-2xl transition-all text-[10px] font-black uppercase tracking-widest spring-press"
        >
          🚪 Выйти
        </button>

        <div className="flex items-center gap-3 px-2">
          <img src={user?.photoURL || "https://picsum.photos/100/100?seed=admin"} className="w-8 h-8 rounded-full border border-ios" />
          <div className="min-w-0">
            <p className="text-[10px] font-black text-ios-primary truncate">{user?.displayName || 'Пользователь'}</p>
            <p className="text-[8px] font-bold text-ios-secondary uppercase overflow-hidden text-ellipsis">{user?.email}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
