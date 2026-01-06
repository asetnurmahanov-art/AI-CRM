import React from 'react';
import { useApp } from '../../contexts/AppContext';
import { MOBILE_BOTTOM_NAV } from '../../config/navigation';

interface BottomNavProps {
    onMenuClick: () => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ onMenuClick }) => {
    const { currentView, setView } = useApp();

    return (
        <nav className="fixed bottom-0 inset-x-0 bg-ios-card/90 backdrop-blur-xl flex justify-between items-center px-4 pb-safe pt-2 z-[90] border-t border-ios shadow-ios-heavy bottom-nav-safe">
            {MOBILE_BOTTOM_NAV.map((item) => (
                <button
                    key={item.id}
                    onClick={() => setView(item.id)}
                    className={`flex flex-col items-center gap-1 transition-all p-2 rounded-xl active:scale-95 w-1/5 ${currentView === item.id ? 'text-ios-accent' : 'text-ios-secondary opacity-60'
                        }`}
                >
                    <span className={`text-2xl ${currentView === item.id ? 'scale-110' : ''} transition-transform`}>
                        {item.icon}
                    </span>
                    <span className="text-[9px] font-bold tracking-tight">{item.label}</span>
                </button>
            ))}

            {/* Menu Button */}
            <button
                onClick={onMenuClick}
                className="flex flex-col items-center gap-1 transition-all p-2 rounded-xl active:scale-95 w-1/5 text-ios-secondary opacity-60 hover:opacity-100"
            >
                <span className="text-2xl">☰</span>
                <span className="text-[9px] font-bold tracking-tight">Меню</span>
            </button>
        </nav>
    );
};

export default BottomNav;
