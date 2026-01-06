
import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { SocialMessage } from '../types';
import { generateSocialReply } from '../services/geminiService';
import { useSocial } from '../contexts/SocialContext';
import { socialService } from '../services/socialService';
import SocialSettings from './SocialSettings';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Title, Subtitle, Caption } from './ui/Typography';


const mockMessages: SocialMessage[] = [];

const MessageListItem = React.memo(({ msg, isActive, onClick }: { msg: SocialMessage, isActive: boolean, onClick: (msg: SocialMessage) => void }) => (
  <button
    onClick={() => onClick(msg)}
    className={`w-full text-left transition-all duration-200 outline-none ${isActive ? 'bg-ios-accent/5' : 'hover:bg-ios-sub/30'}`}
  >
    <div className={`p-4 flex gap-3 border-l-4 ${isActive ? 'border-ios-accent' : 'border-transparent'}`}>
      <div className="relative shrink-0">
        <img src={msg.customerAvatar} loading="lazy" className="w-12 h-12 rounded-xl object-cover bg-ios-sub" />
        <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white dark:border-ios-card flex items-center justify-center text-[10px] shadow-sm ${msg.platform === 'instagram' ? 'bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600 text-white' :
          msg.platform === 'whatsapp' ? 'bg-green-500 text-white' :
            msg.platform === 'threads' ? 'bg-black text-white' :
              'bg-blue-600 text-white'
          }`}>
          {msg.platform === 'instagram' ? '📸' : msg.platform === 'whatsapp' ? '💬' : msg.platform === 'threads' ? '🧵' : '👤'}
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-baseline mb-0.5">
          <span className={`text-sm truncate mr-2 ${msg.isRead ? 'font-semibold text-ios-primary' : 'font-bold text-ios-primary'}`}>{msg.customerName}</span>
          <span className="text-[10px] text-ios-secondary font-medium shrink-0">{msg.timestamp}</span>
        </div>
        <p className={`text-xs truncate ${!msg.isRead ? 'text-ios-primary font-semibold' : 'text-ios-secondary font-medium'}`}>{msg.text}</p>
      </div>
    </div>
  </button>
));

const ChatBubble = React.memo(({ chat }: { chat: { text: string; sender: 'user' | 'bot' | 'agent'; time: string } }) => (
  <div className={`flex ${chat.sender === 'user' ? 'justify-start' : 'justify-end'}`}>
    <div className={`max-w-[85%] p-4 rounded-3xl text-xs font-medium shadow-sm border border-ios ${chat.sender === 'user' ? 'bg-ios-card rounded-tl-none text-ios-text' : 'bg-ios-accent text-white rounded-tr-none'
      }`}>
      <p className="leading-relaxed whitespace-pre-wrap">{chat.text}</p>
      <span className={`text-[8px] font-black uppercase mt-2 block ${chat.sender === 'user' ? 'text-ios-secondary' : 'text-white/60'}`}>{chat.time}</span>
    </div>
  </div>
));

const SocialHub: React.FC = () => {
  const { accounts } = useSocial();
  const [activePlatform, setActivePlatform] = useState<'all' | 'instagram' | 'whatsapp' | 'threads'>('all');
  const [showSettings, setShowSettings] = useState(false);
  const [messages, setMessages] = useState<SocialMessage[]>([]);
  const [activeMsgId, setActiveMsgId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadMessages();
    const interval = setInterval(loadMessages, 5000); // Poll for new messages
    return () => clearInterval(interval);
  }, []);

  const loadMessages = async () => {
    // If 'all', we get all. If specific, we filter.
    // Real API might support filtering by accountId.
    const msgs = await socialService.getMessages();
    setMessages(msgs);
  };

  const activeMsg = useMemo(() => messages.find(m => m.id === activeMsgId), [messages, activeMsgId]);

  const filteredMessages = useMemo(() => {
    // Logic moved to loadMessages/SocialService, but simple client filter for now to be safe
    return activePlatform === 'all' ? messages : messages.filter(m => m.platform === activePlatform);
  }, [messages, activePlatform]);

  useEffect(() => {
    if (scrollRef.current) {
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

  const handleSendMessage = useCallback(async () => {
    if (!replyText || !activeMsg) return;

    // Optimistic update
    const newHistoryItem = { text: replyText, sender: 'agent' as const, time: 'Только что' };
    setMessages(prev => prev.map(m => m.id === activeMsg.id ? { ...m, history: [...(m.history || []), newHistoryItem] } : m));

    // Call service
    await socialService.sendReply(activeMsg.id, replyText);
    setReplyText('');

    // Reload to confirm (optional, usually websocket does this)
    // loadMessages(); 
  }, [replyText, activeMsg]);

  return (
    <Card className="h-[calc(100vh-100px)] flex flex-col !p-0 overflow-hidden relative z-0">
      {/* PLATFORM NAV - Sticky & Solid */}
      <div className="px-4 py-3 border-b border-ios flex items-center justify-between bg-ios-card/50 backdrop-blur-xl shrink-0 z-30">
        <div className="flex gap-2 w-full">
          <div className="flex gap-2 overflow-x-auto no-scrollbar flex-1">
            {[
              { id: 'all', label: 'Все', icon: '📩' },
              { id: 'instagram', label: 'Insta', icon: '📸' },
              { id: 'whatsapp', label: 'WA', icon: '💬' },
              { id: 'threads', label: 'Threads', icon: '🧵' }
            ].map(p => (
              <Button
                key={p.id}
                variant={activePlatform === p.id ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setActivePlatform(p.id as any)}
                className="shrink-0"
              >
                <span>{p.icon}</span> <span>{p.label}</span>
              </Button>
            ))}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowSettings(!showSettings)}
              className={showSettings ? '!bg-ios-accent !text-white' : ''}
            >
              ⚙️
            </Button>
            <div className="text-right hidden sm:block">
              <div className="text-[10px] font-bold text-green-500 uppercase flex items-center gap-1.5 justify-end">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span> Активен
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden relative">
        {showSettings ? (
          <div className="w-full h-full overflow-y-auto custom-scrollbar p-0">
            <SocialSettings />
          </div>
        ) : (
          <>
            {/* LIST VIEW */}
            <div className={`w-full lg:w-[320px] xl:w-[380px] border-r border-ios flex flex-col bg-ios-card/30 relative z-10 ${activeMsgId ? 'hidden lg:flex' : 'flex'}`}>
              <div className="p-3 border-b border-ios z-20">
                <input
                  type="text"
                  placeholder="Поиск..."
                  className="w-full bg-ios-sub/50 border-none rounded-xl px-4 py-2 text-sm font-medium outline-none focus:bg-ios-sub transition-colors"
                />
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
            <div className={`flex-1 flex flex-col bg-ios-bg/50 relative z-0 ${!activeMsgId ? 'hidden lg:flex' : 'flex'}`}>
              {activeMsg ? (
                <>
                  <div className="p-3 px-4 bg-ios-card/80 backdrop-blur-md border-b border-ios flex items-center justify-between z-30 shadow-sm shrink-0 sticky top-0">
                    <div className="flex items-center gap-3">
                      <button onClick={() => setActiveMsgId(null)} className="lg:hidden w-8 h-8 flex items-center justify-center -ml-2 text-ios-accent font-bold">←</button>
                      <div className="flex items-center gap-3">
                        <img src={activeMsg.customerAvatar} className="w-9 h-9 rounded-full object-cover border border-ios" />
                        <div>
                          <h3 className="font-bold text-sm text-ios-primary leading-none">{activeMsg.customerName}</h3>
                          <p className="text-[10px] text-ios-secondary font-medium tracking-wide mt-0.5">{activeMsg.customerHandle}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="secondary" onClick={() => setShowSettings(true)}>⚙️</Button>
                      <Button size="sm">Продажа</Button>
                    </div>
                  </div>

                  <div ref={scrollRef} className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 custom-scrollbar scroll-smooth relative z-0">
                    {activeMsg.history?.map((chat, idx) => (
                      <ChatBubble key={idx} chat={chat} />
                    ))}
                  </div>

                  <div className="p-3 sm:p-4 bg-ios-card/80 backdrop-blur-md border-t border-ios pb-20 lg:pb-4 shrink-0 z-30 relative">
                    <div className="flex gap-2 mb-3 overflow-x-auto no-scrollbar pb-1">
                      <Button size="sm" variant="ghost" className="!bg-ios-accent/10 !text-ios-accent" onClick={handleAIReply} disabled={isGenerating}>
                        {isGenerating ? '⌛ Думаю...' : '✨ AI ответ'}
                      </Button>
                      <Button size="sm" variant="secondary" onClick={() => setReplyText(prev => prev + "Цена: 15.000₸ ")}>🏷️ Цена</Button>
                      <Button size="sm" variant="secondary" onClick={() => setReplyText(prev => prev + "Напишите мерки. ")}>📏 Замер</Button>
                      <Button size="sm" variant="secondary" onClick={() => setReplyText(prev => prev + "Аль-Фараби 77/7. ")}>🏠 Адрес</Button>
                    </div>
                    <div className="flex gap-2 items-end">
                      <textarea
                        placeholder="Сообщение..."
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                        className="flex-1 bg-ios-sub border-transparent rounded-2xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-ios-accent/20 transition-all resize-none max-h-32 min-h-[44px]"
                        rows={1}
                      />
                      <Button onClick={handleSendMessage} className="!h-[44px] !w-[44px] !p-0 !rounded-full shrink-0 shadow-lg">
                        🚀
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-ios-secondary opacity-30 select-none">
                  <span className="text-6xl mb-4">💬</span>
                  <p className="font-bold text-sm uppercase tracking-wider">Нет выбранных чатов</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </Card>
  );
};

export default SocialHub;
