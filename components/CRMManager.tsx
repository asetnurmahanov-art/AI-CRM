
import React, { useState, useEffect } from 'react';
import { Customer, CustomerStatus } from '../types';

interface CRMManagerProps {
  customers: Customer[];
  setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>;
}

const CRMManager: React.FC<CRMManagerProps> = ({ customers, setCustomers }) => {
  const [activeTab, setActiveTab] = useState<'kanban' | 'automation'>('kanban');
  const [showAddLead, setShowAddLead] = useState(false);
  const [draggedCustomerId, setDraggedCustomerId] = useState<string | null>(null);
  const [dragOverStatus, setDragOverStatus] = useState<CustomerStatus | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  
  // Mobile specific state
  const [mobileActiveStage, setMobileActiveStage] = useState<CustomerStatus>('new');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const [newLead, setNewLead] = useState<{
    name: string;
    handle: string;
    platform: Customer['platform'];
  }>({ name: '', handle: '', platform: 'instagram' });

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const pipelineStages: { status: CustomerStatus; label: string; color: string }[] = [
    { status: 'new', label: 'Новые', color: 'bg-blue-500' },
    { status: 'in_progress', label: 'В работе', color: 'bg-amber-500' },
    { status: 'offer', label: 'Оффер', color: 'bg-indigo-500' },
    { status: 'payment', label: 'Оплата', color: 'bg-purple-500' },
    { status: 'won', label: 'Успех', color: 'bg-green-500' },
  ];

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedCustomerId(id);
    e.dataTransfer.setData('customerId', id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, status: CustomerStatus) => {
    e.preventDefault();
    setDragOverStatus(status);
  };

  const handleDrop = (e: React.DragEvent, targetStatus: CustomerStatus) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('customerId') || draggedCustomerId;
    if (id) {
      setCustomers(prev => prev.map(c => c.id === id ? { ...c, status: targetStatus } : c));
    }
    setDraggedCustomerId(null);
    setDragOverStatus(null);
  };

  const handleDragLeave = () => {
    setDragOverStatus(null);
  };

  const handleAddLead = () => {
    if (!newLead.name) return;
    const customer: Customer = {
      id: Date.now().toString(),
      name: newLead.name,
      handle: newLead.handle || `@${newLead.name.toLowerCase().replace(/\s/g, '_')}`,
      platform: newLead.platform,
      lastInteraction: new Date().toISOString().split('T')[0],
      totalSpent: 0,
      status: 'new'
    };
    setCustomers(prev => [customer, ...prev]);
    setShowAddLead(false);
    setNewLead({ name: '', handle: '', platform: 'instagram' });
  };

  const handleUpdateNotes = (id: string, notes: string) => {
    setCustomers(prev => prev.map(c => c.id === id ? { ...c, notes } : c));
    if (selectedCustomer) setSelectedCustomer({ ...selectedCustomer, notes });
  };

  const handleStatusChange = (id: string, newStatus: CustomerStatus) => {
      setCustomers(prev => prev.map(c => c.id === id ? { ...c, status: newStatus } : c));
      if (selectedCustomer) setSelectedCustomer(prev => prev ? { ...prev, status: newStatus } : null);
  };

  return (
    <div className="space-y-6 md:space-y-8 pb-32 animate-ios-slide relative z-0">
      {/* CUSTOMER DETAIL MODAL - Full Screen on Mobile */}
      {selectedCustomer && (
        <div className="modal-backdrop" onClick={() => setSelectedCustomer(null)}>
          <div className="bg-ios-card w-full md:max-w-2xl md:rounded-[3rem] md:p-10 shadow-2xl animate-modal md:mx-4 border border-ios flex flex-col h-full md:h-auto md:max-h-[90vh] fixed inset-0 md:relative md:inset-auto z-50" onClick={e => e.stopPropagation()}>
             
             {/* Mobile Header */}
             <div className="p-6 md:p-0 border-b border-ios md:border-none flex justify-between items-center shrink-0">
                <h3 className="md:hidden text-lg font-black text-ios-primary">Карточка клиента</h3>
                <button onClick={() => setSelectedCustomer(null)} className="w-10 h-10 rounded-full bg-ios-sub flex items-center justify-center font-bold text-ios-secondary hover:bg-ios-border transition-colors">✕</button>
             </div>

             <div className="p-6 md:p-0 overflow-y-auto flex-1">
                 <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-8 gap-4">
                   <div className="flex items-center gap-5">
                     <div className="w-20 h-20 rounded-[2rem] bg-ios-sub border border-ios flex items-center justify-center text-3xl shadow-inner shrink-0">
                        {selectedCustomer.name.charAt(0)}
                     </div>
                     <div>
                       <h3 className="text-2xl font-black text-ios-primary leading-tight">{selectedCustomer.name}</h3>
                       <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs font-bold text-ios-accent">{selectedCustomer.handle}</span>
                          <span className="px-2 py-0.5 rounded-lg bg-ios-sub text-[9px] font-black uppercase text-ios-secondary border border-ios">{selectedCustomer.platform}</span>
                       </div>
                     </div>
                   </div>
                   
                   {/* Status Selector for Mobile/Desktop */}
                   <div className="w-full md:w-auto">
                      <p className="text-[9px] font-black text-ios-secondary uppercase mb-2 md:text-right">Этап воронки</p>
                      <select 
                        value={selectedCustomer.status}
                        onChange={(e) => handleStatusChange(selectedCustomer.id, e.target.value as CustomerStatus)}
                        className="w-full md:w-auto bg-ios-sub border border-ios rounded-xl px-4 py-2 text-xs font-bold outline-none appearance-none"
                      >
                         {pipelineStages.map(s => <option key={s.status} value={s.status}>{s.label}</option>)}
                      </select>
                   </div>
                 </div>

                 <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="p-5 bg-ios-sub rounded-[2rem] border border-ios">
                       <p className="text-[9px] font-black text-ios-secondary uppercase mb-1">Всего покупок</p>
                       <p className="text-2xl font-black text-ios-primary">₸{selectedCustomer.totalSpent.toLocaleString()}</p>
                    </div>
                    <div className="p-5 bg-ios-sub rounded-[2rem] border border-ios">
                       <p className="text-[9px] font-black text-ios-secondary uppercase mb-1">Последний визит</p>
                       <p className="text-lg font-black text-ios-primary">{new Date(selectedCustomer.lastInteraction).toLocaleDateString('ru-RU')}</p>
                    </div>
                 </div>

                 <div className="space-y-6">
                    <div>
                       <h4 className="text-[10px] font-black text-ios-secondary uppercase tracking-widest mb-3">Заметки</h4>
                       <textarea 
                         className="w-full h-32 bg-ios-sub rounded-2xl p-4 text-sm font-medium border-none outline-none resize-none focus:ring-2 focus:ring-ios-accent/20 transition-all placeholder:text-ios-secondary/50"
                         placeholder="Размер, предпочтения, день рождения..."
                         value={selectedCustomer.notes || ''}
                         onChange={(e) => handleUpdateNotes(selectedCustomer.id, e.target.value)}
                       />
                    </div>
                 </div>
             </div>
             
             <div className="p-6 md:p-0 md:pt-6 md:mt-auto md:border-t md:border-ios shrink-0">
                <button className="w-full py-4 bg-ios-accent text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl spring-press">Написать сообщение</button>
             </div>
          </div>
        </div>
      )}

      {/* ADD LEAD MODAL */}
      {showAddLead && (
        <div className="modal-backdrop" onClick={() => setShowAddLead(false)}>
          <div className="bg-ios-card w-full md:max-w-sm rounded-t-[2.5rem] md:rounded-[2.5rem] p-8 shadow-2xl animate-modal md:mx-4 border border-ios fixed bottom-0 md:relative" onClick={e => e.stopPropagation()}>
            <div className="w-12 h-1.5 bg-ios-border rounded-full mx-auto mb-6 md:hidden"></div>
            <h3 className="text-xl font-black mb-6 text-ios-primary">Добавить лида</h3>
            <div className="space-y-4">
              <input type="text" placeholder="Имя клиента" value={newLead.name} onChange={e => setNewLead({...newLead, name: e.target.value})} className="w-full bg-ios-sub text-ios-primary p-4 rounded-xl border-none font-bold outline-none" />
              <input type="text" placeholder="Ник / Номер" value={newLead.handle} onChange={e => setNewLead({...newLead, handle: e.target.value})} className="w-full bg-ios-sub text-ios-primary p-4 rounded-xl border-none font-bold outline-none" />
              <div className="flex gap-2">
                {(['instagram', 'whatsapp'] as const).map(p => (
                  <button 
                    key={p} 
                    onClick={() => setNewLead({...newLead, platform: p})}
                    className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${newLead.platform === p ? 'bg-indigo-600 text-white shadow-lg' : 'bg-ios-sub text-ios-secondary'}`}
                  >
                    {p === 'instagram' ? '📸 Insta' : '💬 WA'}
                  </button>
                ))}
              </div>
              <button onClick={handleAddLead} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest spring-press mt-4">Создать лид</button>
              <button onClick={() => setShowAddLead(false)} className="w-full py-4 bg-transparent text-ios-secondary font-black uppercase text-xs tracking-widest spring-press md:hidden">Отмена</button>
            </div>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
        <div>
          <h2 className="text-3xl md:text-4xl font-black tracking-tight text-ios-primary">Клиенты</h2>
          <p className="text-[10px] font-black text-ios-secondary uppercase tracking-widest mt-2">{activeTab === 'kanban' ? 'Воронка продаж' : 'Автоматизация'}</p>
        </div>
        <div className="bg-ios-card p-1.5 rounded-2xl flex self-start md:self-auto border border-ios shadow-sm">
          {['kanban', 'automation'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab as any)} className={`px-4 md:px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-indigo-600 text-white shadow-lg' : 'text-ios-secondary'}`}>
              {tab === 'kanban' ? 'Воронка' : 'Авто'}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'kanban' ? (
        <>
          {/* MOBILE: STAGE TABS SCROLLER */}
          <div className="md:hidden flex overflow-x-auto no-scrollbar gap-2 px-2 pb-2 sticky top-0 z-20 bg-ios-bg/95 backdrop-blur-sm py-2">
            {pipelineStages.map(stage => {
               const count = customers.filter(c => c.status === stage.status).length;
               const isActive = mobileActiveStage === stage.status;
               return (
                 <button
                    key={stage.status}
                    onClick={() => setMobileActiveStage(stage.status)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all whitespace-nowrap ${
                        isActive 
                        ? `bg-ios-primary text-ios-bg border-transparent shadow-lg scale-105` 
                        : `bg-ios-card text-ios-secondary border-ios`
                    }`}
                 >
                    <div className={`w-2 h-2 rounded-full ${stage.color}`}></div>
                    <span className="text-[10px] font-black uppercase">{stage.label}</span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${isActive ? 'bg-ios-bg text-ios-primary' : 'bg-ios-sub text-ios-text'}`}>{count}</span>
                 </button>
               )
            })}
          </div>

          {/* DESKTOP KANBAN & MOBILE LIST */}
          <div className={`
             ${isMobile ? 'flex flex-col gap-4 px-2' : 'flex gap-6 overflow-x-auto no-scrollbar px-4 pb-10 min-h-[600px]'}
          `}>
            {pipelineStages.map(stage => {
              // On mobile, only render the active stage
              if (isMobile && stage.status !== mobileActiveStage) return null;

              const stageCustomers = customers.filter(c => c.status === stage.status);
              const isOver = dragOverStatus === stage.status;
              
              return (
                <div 
                  key={stage.status} 
                  className={`${isMobile ? 'w-full' : 'w-[300px] shrink-0'} flex flex-col gap-5 animate-ios-slide`}
                  onDragOver={(e) => !isMobile && handleDragOver(e, stage.status)}
                  onDrop={(e) => !isMobile && handleDrop(e, stage.status)}
                  onDragLeave={!isMobile ? handleDragLeave : undefined}
                >
                  {!isMobile && (
                      <div className="flex items-center justify-between px-2">
                        <div className="flex items-center gap-2">
                          <div className={`w-2.5 h-2.5 rounded-full ${stage.color}`}></div>
                          <span className="font-black text-[11px] uppercase tracking-widest text-ios-primary">{stage.label}</span>
                          <span className="bg-ios-card border border-ios px-2 py-0.5 rounded-lg text-[9px] font-black text-ios-secondary">{stageCustomers.length}</span>
                        </div>
                        <span className="text-[10px] font-black text-ios-secondary">₸{stageCustomers.reduce((a, b) => a + b.totalSpent, 0).toLocaleString()}</span>
                      </div>
                  )}

                  <div className={`
                     ${isMobile ? '' : 'rounded-[2.5rem] p-4 border-2 bg-ios-card border-ios'} 
                     flex-1 space-y-3 transition-all duration-300
                     ${isOver ? 'bg-indigo-500/10 border-indigo-400 border-dashed scale-[1.02]' : ''}
                  `}>
                    {stageCustomers.map(customer => (
                      <div 
                        key={customer.id} 
                        draggable={!isMobile}
                        onDragStart={(e) => handleDragStart(e, customer.id)}
                        onClick={() => setSelectedCustomer(customer)}
                        className={`bg-ios-card p-5 rounded-[1.5rem] md:rounded-[2rem] border border-ios shadow-sm md:bg-ios-sub cursor-pointer active:scale-[0.98] hover:shadow-xl group transition-all relative z-10 ${
                          draggedCustomerId === customer.id ? 'opacity-40 grayscale scale-95' : 'opacity-100'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-ios-sub md:bg-ios-card border border-ios text-ios-primary flex items-center justify-center text-sm font-black pointer-events-none shrink-0">
                              {customer.name.charAt(0)}
                            </div>
                            <div className="pointer-events-none min-w-0">
                              <p className="text-xs font-black truncate text-ios-primary">{customer.name}</p>
                              <p className="text-[8px] font-black text-ios-secondary uppercase mt-0.5 truncate">{customer.handle}</p>
                            </div>
                          </div>
                          <span className="text-lg opacity-60 md:opacity-40 group-hover:opacity-100 transition-opacity pointer-events-none">
                            {customer.platform === 'instagram' ? '📸' : customer.platform === 'whatsapp' ? '💬' : '👤'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-[10px] font-black pointer-events-none">
                          <span className="text-ios-primary bg-ios-sub md:bg-ios-card px-2 py-1 rounded-lg border border-ios">₸{customer.totalSpent.toLocaleString()}</span>
                        </div>
                      </div>
                    ))}
                    
                    {stageCustomers.length === 0 && (
                        <div className="py-10 text-center opacity-30">
                            <p className="text-4xl mb-2">🍃</p>
                            <p className="text-[9px] font-black uppercase">Пусто</p>
                        </div>
                    )}

                    {stage.status === 'new' && (
                      <button 
                        onClick={() => setShowAddLead(true)}
                        className="w-full py-4 border-2 border-dashed border-ios rounded-[2rem] text-[10px] font-black text-ios-secondary uppercase tracking-widest hover:border-indigo-400 hover:text-indigo-400 transition-all bg-ios-sub/30"
                      >
                        + Лид
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <div className="max-w-4xl mx-auto px-4 space-y-8">
           <div className="bg-indigo-600 p-8 md:p-10 rounded-[2.5rem] md:rounded-[3.5rem] text-white shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-[80px] rounded-full -mr-20 -mt-20"></div>
              <div className="relative z-10 text-center md:text-left">
                 <h3 className="text-2xl md:text-3xl font-black mb-4">AI Автопилот</h3>
                 <p className="text-indigo-100 font-medium leading-relaxed max-w-lg mx-auto md:mx-0 text-sm">ИИ автоматически сегментирует лидов, анализирует их запросы в Директе и переводит на следующий этап воронки.</p>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default CRMManager;
