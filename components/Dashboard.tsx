
import React, { useState, useEffect } from 'react';
import { getBusinessInsights } from '../services/geminiService';
import { Tooltip, ResponsiveContainer, AreaChart, Area, XAxis, BarChart, Bar } from 'recharts';
import { useInventory } from '../contexts/InventoryContext';
import { useCRM } from '../contexts/CRMContext';
import { useApp } from '../contexts/AppContext';

const Dashboard: React.FC = () => {
  const { products } = useInventory();
  const { customers } = useCRM();
  const { activeCompany } = useApp();
  const branches = activeCompany.branches;
  const [insights, setInsights] = useState<string>('Провожу глубокий анализ данных...');

  const soldProducts = products.filter(p => p.status === 'sold');
  const revenue = soldProducts.reduce((acc, p) => acc + p.price, 0);
  const costs = soldProducts.reduce((acc, p) => acc + (p.costPrice || p.price * 0.6), 0);
  const profit = revenue - costs;
  const margin = revenue > 0 ? ((profit / revenue) * 100).toFixed(1) : '0';

  // Dummy data for chart if empty
  const chartData = soldProducts.length > 0
    ? soldProducts.map((p, i) => ({ n: i.toString(), v: p.price, c: p.costPrice || 0 }))
    : [
      { n: 'Пн', v: 4000, c: 2000 }, { n: 'Вт', v: 3000, c: 1800 }, { n: 'Ср', v: 5000, c: 2200 },
      { n: 'Чт', v: 2780, c: 1500 }, { n: 'Пт', v: 1890, c: 900 }, { n: 'Сб', v: 6390, c: 2500 },
    ];

  useEffect(() => {
    const fetchInsights = async () => {
      if (products.length === 0 && customers.length === 0) {
        setInsights("Добавьте товары и клиентов для получения советов.");
        return;
      }
      const text = await getBusinessInsights(products, customers);
      setInsights(text || 'Аналитика готова к просмотру');
    };
    fetchInsights();
  }, [products, customers]);

  const activityLog = [
    { time: '10:45', user: 'Марина С.', action: 'Продажа: Платье "Зефир"', icon: '✅', color: 'text-green-500' },
    { time: '10:30', user: 'ИИ', action: 'Новый лид из Instagram', icon: '📸', color: 'text-ios-accent' },
    { time: '09:15', user: 'Система', action: 'Смена статуса филиала Esentai', icon: '🏪', color: 'text-ios-secondary' },
  ];

  return (
    <div className="space-y-6 animate-ios-slide pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between px-2 gap-4">
        <div>
          <h2 className="text-3xl md:text-4xl font-black text-ios-primary tracking-tighter">Сводка</h2>
          <p className="text-[10px] font-black text-ios-secondary uppercase tracking-[0.2em] mt-1">Данные по всей сети</p>
        </div>
        <div className="bg-ios-card px-4 py-3 rounded-2xl border border-ios flex items-center gap-3 shadow-sm self-start">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          <span className="text-[10px] font-black uppercase text-ios-primary">Live: 4 активных сессии</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-6">
        {/* TOP STATS */}
        <div className="lg:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {[
            { label: 'Выручка', val: `₸${revenue.toLocaleString()}`, color: 'text-ios-primary', icon: '💰' },
            { label: 'Профит', val: `₸${profit.toLocaleString()}`, color: 'text-green-500', icon: '📈' },
            { label: 'Маржа', val: `${margin}%`, color: 'text-ios-accent', icon: '💎' },
            { label: 'Клиенты', val: customers.length, color: 'text-ios-primary', icon: '👥' }
          ].map((s, i) => (
            <div key={i} className="bg-ios-card p-4 md:p-6 rounded-[2rem] md:rounded-[2.5rem] border border-ios shadow-ios group hover:shadow-ios-heavy transition-all">
              <span className="text-xl mb-3 md:mb-4 block group-hover:scale-110 transition-transform">{s.icon}</span>
              <p className="text-[8px] font-black text-ios-secondary uppercase tracking-widest mb-1 opacity-60">{s.label}</p>
              <h3 className={`text-lg md:text-xl font-black tracking-tight ${s.color} truncate`}>{s.val}</h3>
            </div>
          ))}

          {/* MAIN CHART */}
          <div className="col-span-full bg-ios-card p-6 md:p-8 rounded-[2.5rem] md:rounded-[3rem] border border-ios shadow-ios">
            <div className="flex justify-between items-center mb-6 md:mb-10">
              <h4 className="text-[10px] font-black text-ios-primary uppercase tracking-widest">Продажи vs Закупы</h4>
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-ios-accent"></div>
                <div className="w-3 h-3 rounded-full bg-ios-accent opacity-30"></div>
              </div>
            </div>
            <div className="h-48 md:h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="vGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--ios-accent)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="var(--ios-accent)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Tooltip contentStyle={{ borderRadius: '20px', border: 'none', background: 'var(--ios-card)', fontWeight: 800, fontSize: '10px' }} />
                  <Area type="monotone" dataKey="v" stroke="var(--ios-accent)" strokeWidth={4} fill="url(#vGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* SIDEBAR: AI & ACTIVITY */}
        <div className="space-y-4 md:space-y-6">
          <div className="bg-ios-accent p-6 md:p-8 rounded-[2.5rem] md:rounded-[3rem] text-white shadow-ios-heavy relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-3xl rounded-full"></div>
            <h3 className="text-lg md:text-xl font-black mb-4 flex items-center gap-2">✨ AI Советы</h3>
            <p className="text-[10px] font-medium leading-relaxed opacity-90 italic mb-4">
              {insights.split('.')[0]}.
            </p>
            <button className="w-full py-4 bg-white text-ios-accent rounded-2xl font-black text-[9px] uppercase tracking-widest shadow-xl">Сгенерировать отчет</button>
          </div>

          <div className="bg-ios-card p-6 rounded-[2.5rem] border border-ios shadow-ios">
            <h3 className="text-[10px] font-black text-ios-primary uppercase tracking-widest mb-4">Лог активности</h3>
            <div className="space-y-4">
              {activityLog.map((log, i) => (
                <div key={i} className="flex gap-4 items-start">
                  <span className="text-lg">{log.icon}</span>
                  <div className="min-w-0 flex-1">
                    <p className={`text-[10px] font-black truncate ${log.color}`}>{log.action}</p>
                    <p className="text-[8px] font-bold text-ios-secondary uppercase">{log.user} • {log.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
