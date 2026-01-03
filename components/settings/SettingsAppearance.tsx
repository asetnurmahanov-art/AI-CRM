import React from 'react';
import { ThemeType, useApp } from '../../contexts/AppContext';

const SettingsAppearance: React.FC = () => {
    const { theme: currentTheme, setTheme } = useApp();

    const themes: { id: ThemeType; label: string; sub: string; icon: string; bgClass: string }[] = [
        { id: 'gray', label: 'Classic', sub: 'iOS', icon: '⚪', bgClass: 'bg-[#F2F2F7] text-gray-800' },
        { id: 'royal', label: 'Royal', sub: 'Бизнес', icon: '⚓', bgClass: 'bg-[#0B1120] text-blue-200' },
        { id: 'olive', label: 'Olive', sub: 'Эко', icon: '🌿', bgClass: 'bg-[#F5F7F2] text-green-800' },
        { id: 'champagne', label: 'Boutique', sub: 'Стиль', icon: '🍾', bgClass: 'bg-[#FFFCF7] text-amber-900' },
        { id: 'nordic', label: 'Nordic', sub: 'Моно', icon: '🌌', bgClass: 'bg-[#121212] text-gray-100' },
    ];

    return (
        <div className="space-y-6 animate-ios-slide">
            <header className="mb-8">
                <h2 className="text-2xl font-black text-ios-primary tracking-tight">Внешний вид</h2>
                <p className="text-ios-secondary text-sm font-medium mt-1">Выберите тему оформления интерфейса</p>
            </header>

            <section className="bg-ios-card p-8 rounded-[2.5rem] border border-ios shadow-sm">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {themes.map((t) => (
                        <button
                            key={t.id}
                            onClick={() => setTheme(t.id)}
                            className={`relative flex flex-col items-center p-4 rounded-3xl transition-all spring-press border-2 group overflow-hidden ${currentTheme === t.id ? 'border-ios-accent shadow-xl scale-105' : 'border-transparent hover:bg-ios-sub'
                                }`}
                        >
                            <div className={`w-full aspect-[4/3] ${t.bgClass} rounded-2xl mb-3 flex items-center justify-center text-2xl shadow-inner`}>
                                {t.icon}
                            </div>
                            <div className="text-center z-10">
                                <p className={`text-[11px] font-black uppercase ${currentTheme === t.id ? 'text-ios-accent' : 'text-ios-primary'}`}>{t.label}</p>
                                <p className="text-[8px] font-bold text-ios-secondary uppercase opacity-60 mt-0.5">{t.sub}</p>
                            </div>
                            {currentTheme === t.id && (
                                <div className="absolute top-3 right-3 w-5 h-5 bg-ios-accent rounded-full text-white flex items-center justify-center text-[10px] shadow-sm">✓</div>
                            )}
                        </button>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default SettingsAppearance;
