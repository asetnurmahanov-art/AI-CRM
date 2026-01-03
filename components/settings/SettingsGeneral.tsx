import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { Branch } from '../../types';

const SettingsGeneral: React.FC = () => {
    const { activeCompany, updateCompany } = useApp();
    const [isSaving, setIsSaving] = useState(false);
    const [showAddBranch, setShowAddBranch] = useState(false);
    const [newBranch, setNewBranch] = useState<Partial<Branch>>({
        name: '', address: '', mapUrl: '', phone: ''
    });

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
        <div className="space-y-8 animate-ios-slide max-w-4xl">
            <header>
                <h2 className="text-2xl font-black text-ios-primary tracking-tight">О компании</h2>
                <p className="text-ios-secondary text-sm font-medium mt-1">Реквизиты и филиалы</p>
            </header>

            {/* BUSINESS INFO */}
            <section className="bg-ios-card p-8 rounded-[2.5rem] border border-ios shadow-sm">
                <h3 className="text-xs font-black text-ios-primary uppercase tracking-widest mb-6 flex items-center gap-2">
                    📋 Основные данные
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="text-[9px] font-black text-ios-secondary uppercase ml-3 mb-2 block">Название компании</label>
                        <input
                            value={activeCompany.name}
                            onChange={(e) => updateCompany({ ...activeCompany, name: e.target.value })}
                            className="w-full bg-ios-sub rounded-2xl py-3 px-4 text-sm font-bold outline-none border border-transparent focus:border-ios-accent transition-all"
                        />
                    </div>
                    <div>
                        <label className="text-[9px] font-black text-ios-secondary uppercase ml-3 mb-2 block">БИН / ИИН</label>
                        <input
                            value={activeCompany.bin}
                            onChange={(e) => updateCompany({ ...activeCompany, bin: e.target.value })}
                            className="w-full bg-ios-sub rounded-2xl py-3 px-4 text-sm font-bold outline-none border border-transparent focus:border-ios-accent transition-all"
                        />
                    </div>
                </div>
                <div className="mt-6 flex justify-end">
                    <button
                        onClick={() => { setIsSaving(true); setTimeout(() => setIsSaving(false), 1000); }}
                        className="px-8 py-3 bg-ios-accent text-white rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg spring-press"
                    >
                        {isSaving ? '⏳ Сохранено' : 'Сохранить изменения'}
                    </button>
                </div>
            </section>

            {/* BRANCHES */}
            <section className="bg-ios-card p-8 rounded-[2.5rem] border border-ios shadow-sm">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xs font-black text-ios-primary uppercase tracking-widest flex items-center gap-2">
                        📍 Точки продаж
                    </h3>
                    <button
                        onClick={() => setShowAddBranch(true)}
                        className="flex items-center gap-2 bg-ios-sub text-ios-primary border border-ios px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-ios-accent hover:text-white transition-all"
                    >
                        <span>+</span> Добавить
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {activeCompany.branches.map((branch) => (
                        <div key={branch.id} className="bg-ios-sub p-5 rounded-3xl border border-ios group relative hover:shadow-md transition-all">
                            <button
                                onClick={() => removeBranch(branch.id)}
                                className="absolute top-4 right-4 w-6 h-6 flex items-center justify-center bg-white dark:bg-black/20 rounded-full text-red-500 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                            >
                                ✕
                            </button>
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-ios-card rounded-2xl flex items-center justify-center text-xl shadow-sm border border-ios">🏢</div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-[11px] font-black uppercase text-ios-primary mb-1">{branch.name}</p>
                                    <p className="text-[10px] font-medium text-ios-secondary truncate mb-1">{branch.address}</p>
                                    {branch.phone && <p className="text-[10px] font-bold text-ios-secondary opacity-80">{branch.phone}</p>}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* ADD BRANCH MODAL/FORM */}
                {showAddBranch && (
                    <div className="mt-6 p-6 bg-ios-sub/50 rounded-[2rem] border border-ios animate-ios-slide">
                        <h4 className="text-[10px] font-black text-ios-primary uppercase tracking-widest mb-4">Новый филиал</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div className="space-y-1">
                                <input placeholder="Название" value={newBranch.name} onChange={e => setNewBranch({ ...newBranch, name: e.target.value })} className="w-full bg-ios-card rounded-xl py-3 px-4 text-xs font-bold border-none" />
                            </div>
                            <div className="space-y-1">
                                <input placeholder="Телефон" value={newBranch.phone} onChange={e => setNewBranch({ ...newBranch, phone: e.target.value })} className="w-full bg-ios-card rounded-xl py-3 px-4 text-xs font-bold border-none" />
                            </div>
                            <div className="md:col-span-2 space-y-1">
                                <input placeholder="Адрес" value={newBranch.address} onChange={e => setNewBranch({ ...newBranch, address: e.target.value })} className="w-full bg-ios-card rounded-xl py-3 px-4 text-xs font-bold border-none" />
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={handleAddBranch} className="flex-1 bg-ios-primary text-ios-bg py-3 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg transform active:scale-95 transition-transform">Добавить</button>
                            <button onClick={() => setShowAddBranch(false)} className="px-6 bg-ios-card text-ios-secondary py-3 rounded-xl text-[9px] font-black uppercase tracking-widest border border-ios transform active:scale-95 transition-transform">Отмена</button>
                        </div>
                    </div>
                )}
            </section>
        </div>
    );
};

export default SettingsGeneral;
