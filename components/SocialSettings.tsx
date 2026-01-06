import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';

const SocialSettings: React.FC = () => {
    const { activeCompany } = useApp();
    const [copiedId, setCopiedId] = useState<string | null>(null);

    // --- SCRIPTS ---
    const scripts = [
        { id: 'card', label: '💳 Карта (Kaspi)', text: `Оплата на Kaspi Gold: ${activeCompany.account}\nИП "${activeCompany.name}"\nПришлите чек после оплаты, пожалуйста! ✨` },
        { id: 'delivery', label: '🚚 Доставка', text: 'Доставка по городу через Яндекс.Курьер (по тарифам). В другие города отправляем через СДЭК или КазПочту (от 1500тг). Сроки: 3-5 дней. 📦' },
        { id: 'address', label: '📍 Адрес', text: `Наш адрес: ${activeCompany.branches.find(b => b.isMain)?.address || activeCompany.address}. Работаем каждый день с 10:00 до 21:00. Ждем вас! ❤️` },
        { id: 'return', label: '🔄 Возврат', text: 'Возврат/обмен возможен в течение 14 дней при сохранении бирок и товарного вида. При себе иметь чек (или скриншот перевода).' },
    ];

    const copyToClipboard = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 1500);
    };

    return (
        <div className="p-6 h-full flex flex-col bg-ios-sub/30 animate-fade-in">
            <h2 className="text-2xl font-black text-ios-primary mb-6 flex items-center gap-3">
                <span className="bg-ios-accent text-white w-10 h-10 rounded-xl flex items-center justify-center text-lg shadow-lg">⚙️</span>
                Настройки Чатов
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* QUICK REPLIES CARD */}
                <div className="bg-ios-card rounded-[2.5rem] p-8 border border-ios shadow-ios flex flex-col md:col-span-2">
                    <div className="flex items-center gap-3 mb-6">
                        <span className="text-3xl bg-green-100 dark:bg-green-900 w-12 h-12 flex items-center justify-center rounded-2xl">💬</span>
                        <div>
                            <h3 className="text-lg font-black text-ios-primary">Быстрые ответы</h3>
                            <p className="text-[10px] font-bold text-ios-secondary uppercase">Шаблоны сообщений</p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        {scripts.map(script => (
                            <button
                                key={script.id}
                                onClick={() => copyToClipboard(script.text, script.id)}
                                className={`w-full text-left p-4 rounded-3xl border transition-all spring-press group relative overflow-hidden ${copiedId === script.id
                                    ? 'bg-green-500 text-white border-green-500'
                                    : 'bg-ios-sub border-ios hover:border-ios-accent'
                                    }`}
                            >
                                <div className="flex justify-between items-center mb-2">
                                    <span className={`text-xs font-black uppercase tracking-wide ${copiedId === script.id ? 'text-white' : 'text-ios-primary'}`}>
                                        {script.label}
                                    </span>
                                    <span className={`text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity ${copiedId === script.id ? 'text-white' : 'text-ios-accent'}`}>
                                        {copiedId === script.id ? 'Скопировано!' : 'Копировать'}
                                    </span>
                                </div>
                                <p className={`text-[11px] font-medium leading-relaxed line-clamp-2 ${copiedId === script.id ? 'text-white/90' : 'text-ios-secondary'}`}>
                                    {script.text}
                                </p>
                            </button>
                        ))}
                    </div>
                </div>

                {/* PLACEHOLDER FOR MORE SETTINGS */}
                <div className="bg-ios-card rounded-[2.5rem] p-8 border border-ios shadow-ios flex flex-col items-center justify-center text-center opacity-60">
                    <span className="text-4xl mb-4">🤖</span>
                    <h3 className="text-sm font-black text-ios-primary mb-1">AI Ассистент</h3>
                    <p className="text-[10px] font-bold text-ios-secondary uppercase">Скоро</p>
                </div>
            </div>
        </div>
    );
};

export default SocialSettings;
