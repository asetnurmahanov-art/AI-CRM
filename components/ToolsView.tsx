
import React, { useState, useMemo } from 'react';
import { useApp } from '../contexts/AppContext';

const ToolsView: React.FC = () => {
  const { activeCompany } = useApp();
  const [height, setHeight] = useState(98);
  const [calcPrice, setCalcPrice] = useState<number | ''>(5000);
  const [calcCost, setCalcCost] = useState<number | ''>(2500);
  const [calcDiscount, setCalcDiscount] = useState<number | ''>(10);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // --- SIZE LOGIC ---
  const sizeData = useMemo(() => {
    // Basic logic for children sizing approx
    const h = height;
    let age = '';
    let sizeRU = '';
    let sizeUS = '';
    let sizeEU = '';

    if (h < 60) { age = '0-3 мес'; sizeRU = '56'; sizeUS = '0-3M'; sizeEU = '56'; }
    else if (h < 68) { age = '3-6 мес'; sizeRU = '62-68'; sizeUS = '3-6M'; sizeEU = '62'; }
    else if (h < 74) { age = '6-9 мес'; sizeRU = '74'; sizeUS = '6-9M'; sizeEU = '68'; }
    else if (h < 80) { age = '9-12 мес'; sizeRU = '80'; sizeUS = '12M'; sizeEU = '74'; }
    else if (h < 86) { age = '12-18 мес'; sizeRU = '86'; sizeUS = '18M'; sizeEU = '80'; }
    else if (h < 92) { age = '2 года'; sizeRU = '92'; sizeUS = '2T'; sizeEU = '86'; }
    else if (h < 98) { age = '3 года'; sizeRU = '98'; sizeUS = '3T'; sizeEU = '92'; }
    else if (h < 104) { age = '4 года'; sizeRU = '104'; sizeUS = '4T'; sizeEU = '98'; }
    else if (h < 110) { age = '5 лет'; sizeRU = '110'; sizeUS = '5T'; sizeEU = '104'; }
    else if (h < 116) { age = '6 лет'; sizeRU = '116'; sizeUS = '6'; sizeEU = '110'; }
    else if (h < 122) { age = '7 лет'; sizeRU = '122'; sizeUS = '7'; sizeEU = '116'; }
    else if (h < 128) { age = '8 лет'; sizeRU = '128'; sizeUS = '8'; sizeEU = '122'; }
    else if (h < 134) { age = '9 лет'; sizeRU = '134'; sizeUS = '9'; sizeEU = '128'; }
    else { age = '10+ лет'; sizeRU = '140+'; sizeUS = '10+'; sizeEU = '134+'; }

    return { age, sizeRU, sizeUS, sizeEU };
  }, [height]);

  // --- MARGIN LOGIC ---
  const marginData = useMemo(() => {
    const p = Number(calcPrice) || 0;
    const c = Number(calcCost) || 0;
    const d = Number(calcDiscount) || 0;

    const finalPrice = p - (p * (d / 100));
    const profit = finalPrice - c;
    const margin = finalPrice > 0 ? (profit / finalPrice) * 100 : 0;

    return { finalPrice, profit, margin };
  }, [calcPrice, calcCost, calcDiscount]);

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

  const copySizeResult = () => {
    const text = `Подборка на рост ${height}см:\nПримерный возраст: ${sizeData.age}\nРоссийский размер: ${sizeData.sizeRU}\nUS: ${sizeData.sizeUS} | EU: ${sizeData.sizeEU}`;
    copyToClipboard(text, 'size-result');
  };

  return (
    <div className="space-y-6 pb-24 animate-ios-slide relative z-0">
      <header className="px-2">
        <h2 className="text-3xl font-black text-ios-primary tracking-tight">Инструменты</h2>
        <p className="text-ios-secondary font-bold uppercase text-[10px] tracking-widest mt-1">Помощник продавца</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* CARD 1: SMART SIZE CALCULATOR */}
        <div className="bg-ios-card rounded-[3rem] p-8 border border-ios shadow-ios">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <span className="text-3xl bg-blue-100 dark:bg-blue-900 w-12 h-12 flex items-center justify-center rounded-2xl">📏</span>
              <div>
                <h3 className="text-lg font-black text-ios-primary">Калькулятор Размеров</h3>
                <p className="text-[10px] font-bold text-ios-secondary uppercase">Подбор по росту</p>
              </div>
            </div>
            <button
              onClick={copySizeResult}
              className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border border-ios ${copiedId === 'size-result' ? 'bg-green-500 text-white border-green-500' : 'bg-ios-sub text-ios-secondary hover:bg-ios-accent hover:text-white'}`}
            >
              {copiedId === 'size-result' ? 'Скопировано!' : 'Копировать'}
            </button>
          </div>

          <div className="space-y-8">
            <div className="relative pt-6 pb-2">
              <div className="flex justify-between text-[10px] font-black text-ios-secondary uppercase mb-2 px-1">
                <span>50 см</span>
                <span>Рост ребенка</span>
                <span>140 см</span>
              </div>
              <input
                type="range"
                min="50"
                max="140"
                value={height}
                onChange={(e) => setHeight(Number(e.target.value))}
                className="w-full h-4 bg-ios-sub rounded-full appearance-none outline-none accent-ios-accent cursor-pointer border border-ios"
              />
              <div
                className="absolute top-0 -ml-6 bg-ios-accent text-white px-3 py-1 rounded-xl text-xs font-black shadow-lg transition-all"
                style={{ left: `${((height - 50) / 90) * 100}%` }}
              >
                {height} см
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-ios-sub p-5 rounded-[2rem] text-center border border-ios">
                <p className="text-[9px] font-black text-ios-secondary uppercase mb-1">Возраст (Примерно)</p>
                <p className="text-xl font-black text-ios-primary">{sizeData.age}</p>
              </div>
              <div className="bg-ios-sub p-5 rounded-[2rem] text-center border border-ios">
                <p className="text-[9px] font-black text-ios-secondary uppercase mb-1">Размер RU</p>
                <p className="text-xl font-black text-ios-primary">{sizeData.sizeRU}</p>
              </div>
              <div className="bg-blue-500/10 p-5 rounded-[2rem] text-center border border-blue-500/20">
                <p className="text-[9px] font-black text-blue-600 dark:text-blue-400 uppercase mb-1">Размер US</p>
                <p className="text-xl font-black text-blue-600 dark:text-blue-400">{sizeData.sizeUS}</p>
              </div>
              <div className="bg-purple-500/10 p-5 rounded-[2rem] text-center border border-purple-500/20">
                <p className="text-[9px] font-black text-purple-600 dark:text-purple-400 uppercase mb-1">Размер EU</p>
                <p className="text-xl font-black text-purple-600 dark:text-purple-400">{sizeData.sizeEU}</p>
              </div>
            </div>
          </div>
        </div>

        {/* CARD 2: QUICK SCRIPTS */}
        <div className="bg-ios-card rounded-[3rem] p-8 border border-ios shadow-ios flex flex-col">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-3xl bg-green-100 dark:bg-green-900 w-12 h-12 flex items-center justify-center rounded-2xl">💬</span>
            <div>
              <h3 className="text-lg font-black text-ios-primary">Быстрые ответы</h3>
              <p className="text-[10px] font-bold text-ios-secondary uppercase">Для WhatsApp / Direct</p>
            </div>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto no-scrollbar max-h-[400px]">
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

        {/* CARD 3: MARGIN CALCULATOR */}
        <div className="bg-ios-card rounded-[3rem] p-8 border border-ios shadow-ios lg:col-span-2">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-3xl bg-amber-100 dark:bg-amber-900 w-12 h-12 flex items-center justify-center rounded-2xl">🧮</span>
            <div>
              <h3 className="text-lg font-black text-ios-primary">Расчет Маржинальности</h3>
              <p className="text-[10px] font-bold text-ios-secondary uppercase">Проверка скидок</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-[9px] font-black text-ios-secondary uppercase ml-3 mb-1 block">Цена продажи (₸)</label>
                <input type="number" value={calcPrice} onChange={e => setCalcPrice(Number(e.target.value))} className="w-full bg-ios-sub rounded-2xl p-4 text-sm font-black border border-transparent focus:border-ios-accent outline-none" />
              </div>
              <div>
                <label className="text-[9px] font-black text-ios-secondary uppercase ml-3 mb-1 block">Себестоимость (₸)</label>
                <input type="number" value={calcCost} onChange={e => setCalcCost(Number(e.target.value))} className="w-full bg-ios-sub rounded-2xl p-4 text-sm font-black border border-transparent focus:border-ios-accent outline-none" />
              </div>
              <div>
                <label className="text-[9px] font-black text-ios-secondary uppercase ml-3 mb-1 block">Скидка (%)</label>
                <input type="number" value={calcDiscount} onChange={e => setCalcDiscount(Number(e.target.value))} className="w-full bg-ios-sub rounded-2xl p-4 text-sm font-black border border-transparent focus:border-ios-accent outline-none" />
              </div>
            </div>

            <div className="md:col-span-2 bg-ios-sub rounded-[2.5rem] p-6 md:p-8 flex flex-col justify-center border border-ios">
              <div className="grid grid-cols-3 gap-4 text-center divide-x divide-ios-border">
                <div>
                  <p className="text-[9px] font-black text-ios-secondary uppercase mb-1">Цена со скидкой</p>
                  <p className="text-xl md:text-2xl font-black text-ios-primary">₸{marginData.finalPrice.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-[9px] font-black text-ios-secondary uppercase mb-1">Чистая прибыль</p>
                  <p className={`text-xl md:text-2xl font-black ${marginData.profit > 0 ? 'text-green-500' : 'text-red-500'}`}>
                    ₸{marginData.profit.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-[9px] font-black text-ios-secondary uppercase mb-1">Маржа</p>
                  <p className={`text-xl md:text-2xl font-black ${marginData.margin > 30 ? 'text-green-500' : marginData.margin > 10 ? 'text-amber-500' : 'text-red-500'}`}>
                    {marginData.margin.toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ToolsView;
