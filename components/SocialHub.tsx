
import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { SocialMessage } from '../types';
import { generateSocialReply } from '../services/geminiService';

const mockMessages: SocialMessage[] = [
  { 
    id: '1', 
    customerName: 'Мария Иванова',
    customerHandle: '@mama_mashy', 
    customerAvatar: 'https://picsum.photos/100/100?seed=1',
    platform: 'instagram', 
    text: 'Здравствуйте! Есть ли это платье в 92 размере?', 
    timestamp: '10:42', 
    isRead: false,
    history: [{ text: 'Здравствуйте! Есть ли это платье в 92 размере?', sender: 'user', time: '10:42' }]
  },
  { 
    id: '2', 
    customerName: 'Анна Кузнецова',
    customerHandle: 'Anna K.', 
    customerAvatar: 'https://picsum.photos/100/100?seed=2',
    platform: 'whatsapp', 
    text: 'Отправьте, пожалуйста, геолокацию магазина в Алматы.', 
    timestamp: 'Вчера', 
    isRead: true,
    history: [
      { text: 'Спасибо за покупку!', sender: 'agent', time: 'Вчера' },
      { text: 'Отправьте, пожалуйста, геолокацию магазина в Алматы.', sender: 'user', time: 'Вчера' }
    ]
  }
];

const MessageListItem = React.memo(({ msg, isActive, onClick }: { msg: SocialMessage, isActive: boolean, onClick: (msg: SocialMessage) => void }) => (
    <button
      onClick={() => onClick(msg)}
      className={`w-full p-4 flex gap-4 border-b border-ios transition-all active:scale-[0.98] ${isActive ? 'bg-ios-accent/10 border-l-4 border-l-ios-accent' : 'hover:bg-ios-sub/50 border-l-4 border-l-transparent'}`}
    >
      <div className="relative shrink-0">
        <img src={msg.customerAvatar} loading="lazy" className="w-12 h-12 rounded-2xl object-cover border border-ios" />
        <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-ios flex items-center justify-center text-[10px] shadow-md ${msg.platform === 'instagram' ? 'bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600' : 'bg-green-500'}`}>
          {msg.platform === 'instagram' ? '📸' : '💬'}
        </div>
      </div>
      <div className="flex-1 min-w-0 text-left">
        <div className="flex justify-between items-start">
          <span className="font-black text-xs truncate text-ios-primary">{msg.customerName}</span>
          <span className="text-[9px] text-ios-secondary font-bold uppercase">{msg.timestamp}</span>
        </div>
        <p className={`text-[11px] truncate mt-1 font-medium ${!msg.isRead ? 'text-ios-text font-bold' : 'text-ios-secondary'}`}>{msg.text}</p>
      </div>
    </button>
));

const ChatBubble = React.memo(({ chat }: { chat: { text: string; sender: 'user' | 'bot' | 'agent'; time: string } }) => (
    <div className={`flex ${chat.sender === 'user' ? 'justify-start' : 'justify-end'}`}>
        <div className={`max-w-[85%] p-4 rounded-3xl text-xs font-medium shadow-sm border border-ios ${
            chat.sender === 'user' ? 'bg-ios-card rounded-tl-none text-ios-text' : 'bg-ios-accent text-white rounded-tr-none'
        }`}>
            <p className="leading-relaxed whitespace-pre-wrap">{chat.text}</p>
            <span className={`text-[8px] font-black uppercase mt-2 block ${chat.sender === 'user' ? 'text-ios-secondary' : 'text-white/60'}`}>{chat.time}</span>
        </div>
    </div>
));

const SocialHub: React.FC = () => {
  const [platformTab, setPlatformTab] = useState<'all' | 'instagram' | 'whatsapp'>('all');
  const [messages, setMessages] = useState(mockMessages);
  const [activeMsgId, setActiveMsgId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const activeMsg = useMemo(() => messages.find(m => m.id === activeMsgId), [messages, activeMsgId]);

  const filteredMessages = useMemo(() => {
     return platformTab === 'all' ? messages : messages.filter(m => m.platform === platformTab);
  }, [messages, platformTab]);

  useEffect(() => {
     if(scrollRef.current) {
         scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
     }
  }, [activeMsg?.history]);

  const handleAIReply = useCallback(async () => {
    if (!activeMsg) return;
    setIsGenerating(true);
    const aiResponse = await generateSocialReply(activeMsg.text, activeMsg.customerName);
    setReplyText(aiResponse || '');
    setIsGenerating(false);
  }, [activeMsg]);

  const handleSendMessage = useCallback(() => {
    if (!replyText || !activeMsg) return;
    const newMsg = { text: replyText, sender: 'agent' as const, time: 'Только что' };
    setMessages(prev => prev.map(m => m.id === activeMsg.id ? { ...m, history: [...(m.history || []), newMsg] } : m));
    setReplyText('');
  }, [replyText, activeMsg]);

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col bg-ios-card rounded-[2.5rem] border border-ios shadow-ios-heavy overflow-hidden animate-ios-slide relative z-0">
      
      {/* PLATFORM NAV - Sticky & Solid */}
      <div className="px-6 py-4 border-b border-ios flex items-center justify-between bg-ios-header shrink-0 z-30">
        <div className="flex gap-2">
          {[
            { id: 'all', label: 'Все', icon: '📩' },
            { id: 'instagram', label: 'Instagram', icon: '📸' },
            { id: 'whatsapp', label: 'WhatsApp', icon: '💬' }
          ].map((tab) => (
            <button 
              key={tab.id}
              onClick={() => setPlatformTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all spring-press ${platformTab === tab.id ? 'bg-ios-accent text-white shadow-lg' : 'text-ios-secondary hover:bg-ios-card'}`}
            >
              <span>{tab.icon}</span>
              <span className="hidden md:inline">{tab.label}</span>
            </button>
          ))}
        </div>
        <div className="flex items-center gap-4">
           <div className="text-right hidden sm:block">
             <p className="text-[8px] font-black text-ios-secondary uppercase tracking-widest">Статус шлюза</p>
             <p className="text-[10px] font-black text-green-500 uppercase flex items-center gap-2 justify-end">
               <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span> Активен
             </p>
           </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden relative">
        {/* LIST VIEW */}
        <div className={`w-full lg:w-[400px] border-r border-ios flex flex-col bg-ios-card relative z-10 ${activeMsgId ? 'hidden lg:flex' : 'flex'}`}>
          <div className="p-4 border-b border-ios bg-ios-header z-20">
             <input type="text" placeholder="Поиск в чатах..." className="w-full bg-ios-sub border-none rounded-xl px-4 py-3 text-xs font-bold outline-none" />
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar relative z-0">
            {filteredMessages.map((msg) => (
                <MessageListItem 
                    key={msg.id} 
                    msg={msg} 
                    isActive={activeMsgId === msg.id} 
                    onClick={(m) => setActiveMsgId(m.id)} 
                />
            ))}
          </div>
        </div>

        {/* CHAT AREA */}
        <div className={`flex-1 flex flex-col bg-ios-sub relative z-0 ${!activeMsgId ? 'hidden lg:flex' : 'flex'}`}>
          {activeMsg ? (
            <>
              <div className="p-4 bg-ios-header border-b border-ios flex items-center justify-between z-30 shadow-sm shrink-0 sticky top-0">
                <div className="flex items-center gap-3">
                  <button onClick={() => setActiveMsgId(null)} className="lg:hidden w-8 h-8 flex items-center justify-center bg-ios-sub rounded-xl text-ios-accent">←</button>
                  <div className="flex items-center gap-3">
                    <img src={activeMsg.customerAvatar} className="w-10 h-10 rounded-xl object-cover border border-ios" />
                    <div>
                      <h3 className="font-black text-xs text-ios-primary">{activeMsg.customerName}</h3>
                      <p className="text-[8px] text-ios-secondary font-black uppercase tracking-widest">{activeMsg.customerHandle}</p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="bg-ios-sub px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border border-ios transition-all spring-press hidden sm:block">Профиль</button>
                  <button className="bg-ios-accent text-white px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-md spring-press">+ Продажа</button>
                </div>
              </div>

              <div ref={scrollRef} className="flex-1 p-6 overflow-y-auto space-y-6 custom-scrollbar scroll-smooth relative z-0">
                {activeMsg.history?.map((chat, idx) => (
                    <ChatBubble key={idx} chat={chat} />
                ))}
              </div>

              <div className="p-4 sm:p-6 bg-ios-header border-t border-ios pb-20 lg:pb-6 shrink-0 z-30 relative">
                <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar pb-1">
                  <button onClick={handleAIReply} disabled={isGenerating} className="whitespace-nowrap bg-ios-accent/10 text-ios-accent px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border border-ios-accent/20 spring-press">
                    {isGenerating ? '⌛ ИИ Думает...' : '✨ Ответ AI'}
                  </button>
                  <button onClick={() => setReplyText(prev => prev + "Цена товара: 15 000тг. ")} className="whitespace-nowrap bg-ios-sub text-ios-secondary px-4 py-2 rounded-xl text-[9px] font-black uppercase border border-ios">🏷️ Цена</button>
                  <button onClick={() => setReplyText(prev => prev + "Пришлите мерки ребенка. ")} className="whitespace-nowrap bg-ios-sub text-ios-secondary px-4 py-2 rounded-xl text-[9px] font-black uppercase border border-ios">📏 Замер</button>
                  <button onClick={() => setReplyText(prev => prev + "Наш адрес: пр. Аль-Фараби 77/7. ")} className="whitespace-nowrap bg-ios-sub text-ios-secondary px-4 py-2 rounded-xl text-[9px] font-black uppercase border border-ios">🏠 Адрес</button>
                </div>
                <div className="flex gap-3">
                  <input 
                    type="text" 
                    placeholder="Напишите ответ..." 
                    value={replyText} 
                    onChange={(e) => setReplyText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    className="flex-1 bg-ios-sub border border-ios rounded-2xl px-6 py-4 text-xs font-bold outline-none focus:ring-2 focus:ring-ios-accent transition-all" 
                  />
                  <button onClick={handleSendMessage} className="bg-ios-accent text-white w-14 h-14 rounded-2xl flex items-center justify-center shadow-xl shadow-ios-accent/20 spring-press shrink-0">
                     🚀
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-ios-secondary opacity-30">
              <span className="text-7xl mb-6">📬</span>
              <p className="font-black text-[12px] uppercase tracking-[0.3em]">Выберите диалог</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SocialHub;
