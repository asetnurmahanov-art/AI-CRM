import React from 'react';
import { useApp } from '../../contexts/AppContext';
import { NAV_ITEMS } from '../../config/navigation';

interface NavRailProps {
    onLogout: () => void;
}

const NavRail: React.FC<NavRailProps> = ({ onLogout }) => {
    const { currentView, setView, activeCompany } = useApp();

    return (
        <div className="w-20 bg-ios-card border-r border-ios h-screen flex flex-col items-center py-6 z-40 fixed left-0 top-0">
            {/* Brand Icon */}
            <div className="w-10 h-10 bg-ios-accent rounded-xl flex items-center justify-center text-white text-xl font-black shadow-lg mb-8">
                {activeCompany.name.charAt(0)}
            </div>

            {/* Nav Items */}
            <nav className="flex-1 flex flex-col gap-4 w-full px-2 overflow-y-auto no-scrollbar">
                {NAV_ITEMS.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => setView(item.id)}
                        className={`w-full aspect-square flex flex-col items-center justify-center rounded-2xl transition-all group relative ${currentView === item.id
                                ? 'bg-ios-accent/10 text-ios-accent'
                                : 'text-ios-secondary hover:bg-ios-sub'
                            }`}
                    >
                        <span className="text-2xl mb-1">{item.icon}</span>
                        <span className="text-[8px] font-black uppercase tracking-wide opacity-0 group-hover:opacity-100 absolute bottom-1 transition-opacity">
                            {item.label}
                        </span>
                        {item.badge && (
                            <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[8px] rounded-full flex items-center justify-center font-bold">
                                {item.badge}
                            </span>
                        )}
                    </button>
                ))}
            </nav>

            <button onClick={onLogout} className="mt-auto p-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors">
                <span className="text-xl">🚪</span>
            </button>
        </div>
    );
};

export default NavRail;
