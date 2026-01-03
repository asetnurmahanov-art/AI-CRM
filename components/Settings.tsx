
import React, { useState } from 'react';
import { Company, Branch } from '../types';
import { ThemeType } from '../contexts/AppContext';
import { useApp } from '../contexts/AppContext';

const Settings: React.FC = () => {
  const { companies, activeCompany, updateCompany, theme: currentTheme, setTheme } = useApp();
  const [isSaving, setIsSaving] = useState(false);
  const [showAddBranch, setShowAddBranch] = useState(false);

  const [newBranch, setNewBranch] = useState<Partial<Branch>>({
    name: '', address: '', mapUrl: '', phone: ''
  });

  // Top 5 Curated Themes
  const themes: { id: ThemeType; label: string; sub: string; icon: string; bgClass: string }[] = [
    { id: 'gray', label: 'Classic', sub: 'iOS', icon: '⚪', bgClass: 'bg-[#F2F2F7] text-gray-800' },
    { id: 'royal', label: 'Royal', sub: 'Бизнес', icon: '⚓', bgClass: 'bg-[#0B1120] text-blue-200' },
    { id: 'olive', label: 'Olive', sub: 'Эко', icon: '🌿', bgClass: 'bg-[#F5F7F2] text-green-800' },
    { id: 'champagne', label: 'Boutique', sub: 'Стиль', icon: '🍾', bgClass: 'bg-[#FFFCF7] text-amber-900' },
    { id: 'nordic', label: 'Nordic', sub: 'Моно', icon: '🌌', bgClass: 'bg-[#121212] text-gray-100' },
  ];

  const handleAddBranch = () => {
    if (!newBranch.name || !newBranch.address) return;
    const branch: Branch = {
      id: Date.now().toString(),
      name: newBranch.name!,
      address: newBranch.address!,
      mapUrl: newBranch.mapUrl || '',
      phone: newBranch.phone || '',
      isMain: activeCompany.branches.length === 0
    };
    updateCompany({ ...activeCompany, branches: [...activeCompany.branches, branch] });
    setNewBranch({ name: '', address: '', mapUrl: '', phone: '' });
    setShowAddBranch(false);
  };

  const removeBranch = (id: string) => {
    updateCompany({ ...activeCompany, branches: activeCompany.branches.filter(b => b.id !== id) });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-ios-slide pb-20">
      <header className="px-2">
        <h2 className="text-3xl font-black text-ios-primary tracking-tight">Настройки системы</h2>
        <p className="text-ios-secondary font-bold uppercase text-[10px] tracking-widest mt-1">Персонализация и управление</p>
      </header>

      {/* THEMES & STYLE */}
      <section className="bg-ios-card p-8 rounded-[3rem] border border-ios shadow-ios">
        <h3 className="text-xs font-black text-ios-primary uppercase tracking-widest mb-6 flex items-center gap-2">
          <span>🎨</span> Внешний вид
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {themes.map((t) => (
            <button
              key={t.id}
              onClick={() => setTheme(t.id)}
              className={`relative flex flex-col items-center p-4 rounded-3xl transition-all spring-press border-2 group overflow-hidden ${currentTheme === t.id ? 'border-ios-accent shadow-xl scale-105' : 'border-transparent hover:bg-ios-sub'
                }`}
            >
              {/* Color Preview Blob */}
              <div className={`w-full aspect-[4/3] ${t.bgClass} rounded-2xl mb-3 flex items-center justify-center text-2xl shadow-inner`}>
                {t.icon}
              </div>

              <div className="text-center z-10">
                <p className={`text-[11px] font-black uppercase ${currentTheme === t.id ? 'text-ios-accent' : 'text-ios-primary'}`}>{t.label}</p>
                <p className="text-[8px] font-bold text-ios-secondary uppercase opacity-60 mt-0.5">{t.sub}</p>
              </div>

              {currentTheme === t.id && (
                <div className="absolute top-3 right-3 w-4 h-4 bg-ios-accent rounded-full text-white flex items-center justify-center text-[8px] shadow-sm">✓</div>
              )}
            </button>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* BUSINESS INFO */}
        <section className="bg-ios-card p-8 rounded-[3rem] border border-ios shadow-ios flex flex-col gap-6 lg:col-span-1">
          <h3 className="text-xs font-black text-ios-primary uppercase tracking-widest">📋 Реквизиты</h3>
          <div className="space-y-4">
            <div>
              <label className="text-[8px] font-black text-ios-secondary uppercase ml-3 mb-1 block">Название</label>
              <input value={activeCompany.name} onChange={(e) => updateCompany({ ...activeCompany, name: e.target.value })} className="w-full bg-ios-sub rounded-2xl py-3 px-4 text-xs font-bold outline-none border border-transparent focus:border-ios-accent" />
            </div>
            <div>
              <label className="text-[8px] font-black text-ios-secondary uppercase ml-3 mb-1 block">БИН / ИИН</label>
              <input value={activeCompany.bin} onChange={(e) => updateCompany({ ...activeCompany, bin: e.target.value })} className="w-full bg-ios-sub rounded-2xl py-3 px-4 text-xs font-bold outline-none border border-transparent focus:border-ios-accent" />
            </div>
            <button onClick={() => { setIsSaving(true); setTimeout(() => setIsSaving(false), 1000); }} className="w-full py-4 mt-2 bg-ios-accent text-white rounded-2xl font-black uppercase text-[10px] shadow-lg spring-press">
              {isSaving ? '⏳ Сохранено' : 'Сохранить изменения'}
            </button>
          </div>
        </section>

        {/* BRANCHES & LOCATIONS */}
        <section className="bg-ios-card p-8 rounded-[3rem] border border-ios shadow-ios lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-black text-ios-primary uppercase tracking-widest flex items-center gap-2">
              <span>📍</span> Точки продаж
            </h3>
            <button onClick={() => setShowAddBranch(true)} className="bg-ios-sub text-ios-primary border border-ios px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-ios-accent hover:text-white transition-colors">+ Добавить</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeCompany.branches.map((branch) => (
              <div key={branch.id} className="bg-ios-sub p-5 rounded-3xl border border-ios group relative hover:shadow-md transition-all">
                <button onClick={() => removeBranch(branch.id)} className="absolute top-4 right-4 w-6 h-6 flex items-center justify-center bg-white dark:bg-black/20 rounded-full text-red-500 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm">✕</button>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-ios-card rounded-2xl flex items-center justify-center text-xl shadow-sm border border-ios">🏢</div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-black uppercase text-ios-primary mb-1">{branch.name}</p>
                    <p className="text-[9px] font-medium text-ios-secondary truncate mb-2">{branch.address}</p>
                    {branch.phone && <p className="text-[9px] font-bold text-ios-secondary mb-2">{branch.phone}</p>}
                    <div className="flex gap-2">
                      {branch.mapUrl && (
                        <a href={branch.mapUrl} target="_blank" className="bg-ios-accent/10 text-ios-accent px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest">Карта</a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ADD BRANCH FORM */}
          {showAddBranch && (
            <div className="p-6 bg-ios-sub/50 rounded-[2.5rem] border border-ios animate-ios-slide">
              <h4 className="text-[10px] font-black text-ios-primary uppercase tracking-widest mb-4">Новый филиал</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <input placeholder="Название" value={newBranch.name} onChange={e => setNewBranch({ ...newBranch, name: e.target.value })} className="bg-ios-card rounded-xl py-3 px-4 text-xs font-bold border-none" />
                <input placeholder="Телефон" value={newBranch.phone} onChange={e => setNewBranch({ ...newBranch, phone: e.target.value })} className="bg-ios-card rounded-xl py-3 px-4 text-xs font-bold border-none" />
                <input placeholder="Адрес" value={newBranch.address} onChange={e => setNewBranch({ ...newBranch, address: e.target.value })} className="bg-ios-card rounded-xl py-3 px-4 text-xs font-bold border-none md:col-span-2" />
              </div>
              <div className="flex gap-3">
                <button onClick={handleAddBranch} className="flex-1 bg-ios-primary text-ios-bg py-3 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg">Добавить</button>
                <button onClick={() => setShowAddBranch(false)} className="px-6 bg-ios-card text-ios-secondary py-3 rounded-xl text-[9px] font-black uppercase tracking-widest border border-ios">Отмена</button>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Settings;
