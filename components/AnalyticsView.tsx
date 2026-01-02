
import React, { useState, useEffect, useMemo } from 'react';
import { Product, Customer } from '../types';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { getBusinessInsights } from '../services/geminiService';

interface AnalyticsViewProps {
  products: Product[];
  customers: Customer[];
}

const AnalyticsView: React.FC<AnalyticsViewProps> = ({ products, customers }) => {
  const [strategy, setStrategy] = useState<string>('Провожу глубокий анализ данных...');

  useEffect(() => {
    const fetchDeepInsights = async () => {
      // Small delay to allow initial render
      setTimeout(async () => {
          const text = await getBusinessInsights(products, customers);
          setStrategy(text || 'Нет данных для анализа');
      }, 500);
    };
    fetchDeepInsights();
  }, [products, customers]);

  // Memoized Heavy Calculations
  const revenueData = useMemo(() => [
    { name: 'Янв', value: 450000 }, { name: 'Фев', value: 520000 }, { name: 'Мар', value: 480000 },
    { name: 'Апр', value: 610000 }, { name: 'Май', value: 550000 }, { name: 'Июн', value: 670000 },
  ], []);

  const categoryData = useMemo(() => {
    const data = products.reduce((acc: any[], p) => {
      const existing = acc.find(x => x.name === p.category);
      if (existing) existing.value++;
      else acc.push({ name: p.category, value: 1 });
      return acc;
    }, []);
    return data.length > 0 ? data : [{name: 'Нет данных', value: 1}];
  }, [products]);

  const topCustomers = useMemo(() => {
      return [...customers].sort((a,b) => b.totalSpent - a.totalSpent).slice(0, 4);
  }, [customers]);

  return (
    <div className="space-y-6 pb-40 animate-ios-slide">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-ios-primary tracking-tight">Аналитический центр</h2>
          <p className="text-ios-secondary font-bold uppercase text-[10px] tracking-[0.2em] mt-1">Полный срез по бизнесу</p>
        </div>
        <button onClick={() => window.print()} className="bg-ios-card border border-ios px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-ios-sub transition-all">Экспорт PDF</button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-ios-card p-8 rounded-[3rem] border border-ios shadow-ios">
          <h3 className="text-[10px] font-black text-ios-primary uppercase tracking-widest mb-6">Динамика выручки (₸)</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--ios-accent)" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="var(--ios-accent)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'var(--ios-text-secondary)', fontSize: 10}} />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ borderRadius: '20px', border: 'none', backgroundColor: 'var(--ios-card)', color: 'var(--ios-text)', fontWeight: 800 }}
                  formatter={(value: number) => [`₸${value.toLocaleString()}`, 'Выручка']}
                />
                <Area type="monotone" dataKey="value" stroke="var(--ios-accent)" strokeWidth={4} fill="url(#revenueGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-ios-card p-8 rounded-[3rem] border border-ios shadow-ios">
          <h3 className="text-[10px] font-black text-ios-primary uppercase tracking-widest mb-6">Категории</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value"
                  stroke="none"
                >
                  {categoryData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={`var(--ios-accent)`} opacity={1 - index * 0.15} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '15px', border: 'none', backgroundColor: 'var(--ios-card)', color: 'var(--ios-text)', fontWeight: 800, fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-ios-card p-8 rounded-[3rem] border border-ios">
          <h3 className="text-[10px] font-black text-ios-primary uppercase tracking-widest mb-6">VIP Клиенты</h3>
          <div className="space-y-4">
            {topCustomers.map((c, i) => (
              <div key={c.id} className="flex items-center justify-between p-4 bg-ios-sub rounded-2xl border border-ios">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-black text-ios-accent opacity-50">#0{i+1}</span>
                  <div>
                    <p className="text-xs font-black text-ios-primary">{c.name}</p>
                    <p className="text-[9px] text-ios-accent font-bold uppercase">{c.handle}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-black text-ios-primary">₸{c.totalSpent.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-ios-accent p-8 rounded-[3rem] text-white shadow-heavy flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <span className="text-2xl">🧠</span>
              <h3 className="text-xl font-black tracking-tight">ИИ Прогноз</h3>
            </div>
            <p className="text-white/80 text-[11px] font-medium leading-relaxed italic border-l-2 border-white/30 pl-4 mb-4">
              "Основано на анализе текущего склада и активности чатов WhatsApp/Instagram."
            </p>
            <div className="p-4 bg-white/10 rounded-2xl text-[10px] font-bold border border-white/10">
              {strategy}
            </div>
          </div>
          <button className="mt-8 w-full py-4 bg-white text-ios-accent rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl">Полный аудит</button>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsView;
