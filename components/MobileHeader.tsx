
import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Title, Caption } from './ui/Typography';


const MobileHeader: React.FC = () => {
    const { activeCompany, companies, setActiveCompany } = useApp();
    const { user, logout } = useAuth();
    const [showCompanyMenu, setShowCompanyMenu] = useState(false);
    const [showProfileMenu, setShowProfileMenu] = useState(false);

    if (!activeCompany) return null; // Safety guard

    return (
        <>
            {/* HEADER */}
            <header className="fixed top-0 inset-x-0 bg-ios-card/80 backdrop-blur-xl border-b border-ios z-[80] px-4 py-3 flex justify-between items-center shadow-sm h-[60px] transition-all duration-300">
                {/* Company Switcher */}
                <button
                    onClick={() => setShowCompanyMenu(true)}
                    className="flex items-center gap-3 active:opacity-60 transition-opacity outline-none"
                >
                    <div className="w-9 h-9 bg-ios-accent rounded-xl flex items-center justify-center text-white text-sm font-bold shadow-md">
                        {activeCompany.name.charAt(0)}
                    </div>
                    <div className="text-left">
                        <h1 className="text-sm font-bold text-ios-primary max-w-[140px] truncate leading-tight">{activeCompany.name}</h1>
                        <p className="text-[9px] font-bold text-ios-secondary uppercase tracking-widest mt-0.5">Smart CRM</p>
                    </div>
                    <svg className="w-3 h-3 text-ios-secondary opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                    </svg>
                </button>

                {/* Profile */}
                <button
                    onClick={() => setShowProfileMenu(true)}
                    className="w-9 h-9 rounded-full bg-ios-sub border border-ios overflow-hidden active:scale-90 transition-transform shadow-sm"
                >
                    <img src={user?.photoURL || "https://picsum.photos/100/100?seed=admin"} className="w-full h-full object-cover" />
                </button>
            </header>

            {/* COMPANY MODAL */}
            {showCompanyMenu && (
                <div className="modal-backdrop z-[100]" onClick={() => setShowCompanyMenu(false)}>
                    <Card className="w-full max-w-sm mx-4 !p-6 animate-modal" onClick={e => e.stopPropagation()}>
                        <Title className="text-center text-xl mb-4">Компании</Title>
                        <div className="space-y-2 max-h-[60vh] overflow-y-auto no-scrollbar">
                            {companies.map(c => (
                                <button
                                    key={c.id}
                                    onClick={() => { setActiveCompany(c); setShowCompanyMenu(false); }}
                                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${activeCompany.id === c.id ? 'bg-ios-accent text-white shadow-md' : 'bg-ios-sub text-ios-primary hover:bg-ios-bg'}`}
                                >
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${activeCompany.id === c.id ? 'bg-white/20' : 'bg-white'}`}>
                                        {c.name.charAt(0)}
                                    </div>
                                    <span className="text-sm font-bold truncate">{c.name}</span>
                                    {activeCompany.id === c.id && <span className="ml-auto text-lg">✓</span>}
                                </button>
                            ))}
                        </div>
                        <Button
                            variant="ghost"
                            className="w-full mt-4 !font-bold"
                            onClick={() => setShowCompanyMenu(false)}
                        >
                            Отмена
                        </Button>
                    </Card>
                </div>
            )}

            {/* PROFILE MODAL */}
            {showProfileMenu && (
                <div className="modal-backdrop z-[100]" onClick={() => setShowProfileMenu(false)}>
                    <Card className="w-full max-w-xs mx-4 !p-8 animate-modal text-center" onClick={e => e.stopPropagation()}>
                        <div className="relative inline-block mb-4">
                            <img src={user?.photoURL || "https://picsum.photos/100/100?seed=admin"} className="w-20 h-20 rounded-full border-4 border-ios-bg shadow-xl" />
                            <div className="absolute bottom-0 right-0 w-5 h-5 bg-green-500 border-2 border-ios-card rounded-full"></div>
                        </div>
                        <Title className="text-xl mb-1">{user?.displayName || 'Пользователь'}</Title>
                        <Caption className="mb-6 lowercase">{user?.email}</Caption>

                        <div className="space-y-3">
                            <Button
                                variant="destructive"
                                className="w-full"
                                onClick={logout}
                            >
                                Выйти из аккаунта
                            </Button>
                            <Button
                                variant="ghost"
                                className="w-full"
                                onClick={() => setShowProfileMenu(false)}
                            >
                                Закрыть
                            </Button>
                        </div>
                    </Card>
                </div>
            )}
        </>
    );
};

export default MobileHeader;
