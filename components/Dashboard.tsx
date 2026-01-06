
import React, { useState, useEffect } from 'react';
import { getBusinessInsights } from '../services/geminiService';
import { Tooltip, ResponsiveContainer, AreaChart, Area, XAxis, BarChart, Bar } from 'recharts';
import { useInventory } from '../contexts/InventoryContext';
import { useCRM } from '../contexts/CRMContext';
import { useApp } from '../contexts/AppContext';

import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Title, Caption } from './ui/Typography';

const Dashboard: React.FC = () => {
  const { products } = useInventory();
  const { customers } = useCRM();
  const { activeCompany } = useApp();
  const [insights, setInsights] = useState<string>('Провожу глубокий анализ данных...');

  const soldProducts = products.filter(p => p.status === 'sold');
  const revenue = soldProducts.reduce((acc, p) => acc + p.price, 0);
  const costs = soldProducts.reduce((acc, p) => acc + (p.costPrice || p.price * 0.6), 0);
  const profit = revenue - costs;
  const margin = revenue > 0 ? ((profit / revenue) * 100).toFixed(1) : '0';

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
    <div className="space-y-6 pb-20 animate-fade-in-up">
      <div className="flex flex-col md:flex-row md:items-end justify-between px-2 gap-4">
        <div>
          <Title>Сводка</Title>
          <Caption className="mt-1">Данные по всей сети</Caption>
        </div>
        <Card className="!p-3 !rounded-2xl flex items-center gap-3 self-start">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          <span className="text-xs font-bold uppercase text-ios-primary">Live: 4 активных сессии</span>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* TOP STATS */}
        <div className="lg:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Выручка', val: `₸${revenue.toLocaleString()}`, color: 'text-ios-primary', icon: '💰' },
            { label: 'Профит', val: `₸${profit.toLocaleString()}`, color: 'text-green-500', icon: '📈' },
            { label: 'Маржа', val: `${margin}%`, color: 'text-ios-accent', icon: '💎' },
            { label: 'Клиенты', val: customers.length, color: 'text-ios-primary', icon: '👥' }
          ].map((s, i) => (
            <Card key={i} hoverEffect className="!p-5 flex flex-col justify-between aspect-[4/3] md:aspect-auto">
              <div>
                <span className="text-2xl mb-2 block">{s.icon}</span>
                <Caption className="mb-1 opacity-70">{s.label}</Caption>
              </div>
              <h3 className={`text-xl font-bold tracking-tight ${s.color} truncate`}>{s.val}</h3>
            </Card>
          ))}

          {/* MAIN CHART */}
          <Card className="col-span-full min-h-[300px]">
            <div className="flex justify-between items-center mb-6">
              <Caption>Продажи vs Закупы</Caption>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="vGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--ios-accent)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="var(--ios-accent)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', background: 'var(--ios-card)', fontWeight: 600, fontSize: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                  <Area type="monotone" dataKey="v" stroke="var(--ios-accent)" strokeWidth={3} fill="url(#vGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* SIDEBAR: AI & ACTIVITY */}
        <div className="space-y-6">
          <div className="bg-ios-accent p-6 rounded-3xl text-white shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-3xl rounded-full"></div>
            <h3 className="text-lg font-bold mb-3 flex items-center gap-2">✨ AI Советы</h3>
            <p className="text-sm font-medium leading-relaxed opacity-90 italic mb-6">
              {insights.split('.')[0]}.
            </p>
            <Button variant="secondary" size="sm" className="w-full bg-white/20 text-white backdrop-blur-md hover:bg-white/30 border-none">
              Сгенерировать отчет
            </Button>
          </div>

          <Card>
            <Caption className="mb-4">Лог активности</Caption>
            <div className="space-y-4">
              {activityLog.map((log, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <span className="text-lg mt-0.5">{log.icon}</span>
                  <div className="min-w-0 flex-1">
                    <p className={`text-xs font-semibold truncate ${log.color}`}>{log.action}</p>
                    <p className="text-[10px] font-medium text-ios-secondary uppercase mt-0.5">{log.user} • {log.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
