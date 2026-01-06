import React from 'react';
import { useApp } from '../../contexts/AppContext';
import { NAV_ITEMS } from '../../config/navigation';

interface MobileMenuProps {
    isOpen: boolean;
    onClose: () => void;
    onLogout: () => void;
}

const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, onClose, onLogout }) => {
    const { currentView, setView } = useApp();

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] z-index-100">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in" onClick={onClose} />
            <div className="absolute bottom-0 inset-x-0 bg-ios-card rounded-t-[2.5rem] p-6 pb-safe pt-8 animate-slide-up border-t border-ios shadow-2xl">
                <div className="w-12 h-1 bg-gray-300 dark:bg-gray-700 rounded-full mx-auto mb-8" />

                <h3 className="text-xl font-black text-ios-primary mb-6 px-2">Меню</h3>

                <div className="grid grid-cols-4 gap-4 mb-8">
                    {NAV_ITEMS.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => { setView(item.id); onClose(); }}
                            className={`flex flex-col items-center gap-2 p-3 rounded-2xl active:scale-95 transition-all ${currentView === item.id ? 'bg-ios-accent/10' : 'hover:bg-ios-sub'
                                }`}
                        >
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-sm border border-ios ${currentView === item.id ? 'bg-ios-accent text-white border-transparent' : 'bg-ios-bg text-ios-primary'
                                }`}>
                                {item.icon}
                            </div>
                            <span className={`text-[10px] font-bold text-center leading-tight ${currentView === item.id ? 'text-ios-accent' : 'text-ios-secondary'
                                }`}>{item.label}</span>
                        </button>
                    ))}
                </div>

                <button
                    onClick={onLogout}
                    className="w-full py-4 bg-red-500/10 text-red-500 rounded-2xl font-black uppercase text-xs tracking-widest border border-red-500/20 active:scale-95 transition-transform"
                >
                    Выйти из аккаунта
                </button>
            </div>
        </div>
    );
};

export default MobileMenu;
