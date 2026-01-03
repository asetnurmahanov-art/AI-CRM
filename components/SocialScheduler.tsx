
import React, { useState, useEffect, useMemo } from 'react';
import { Product, SocialPost } from '../types';
import { generatePostCaption } from '../services/geminiService';
import { useSocial } from '../contexts/SocialContext';
import { useInventory } from '../contexts/InventoryContext';

const SocialScheduler: React.FC = () => {
  const { scheduledPosts, setScheduledPosts, productToPromote, setProductToPromote } = useSocial();
  const { products } = useInventory();

  // Alias preselectedProduct for backward compatibility with internal logic
  const preselectedProduct = productToPromote;
  const onClearPreselected = () => setProductToPromote(null);
  const [activeTab, setActiveTab] = useState<'draft' | 'scheduled' | 'archived'>('scheduled');
  const [isCreating, setIsCreating] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [caption, setCaption] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [platform, setPlatform] = useState<'instagram' | 'facebook'>('instagram');
  const [scheduledDate, setScheduledDate] = useState('');
  const [viewingPost, setViewingPost] = useState<SocialPost | null>(null);

  // Auto-open modal if product passed from inventory
  useEffect(() => {
    if (preselectedProduct) {
      setSelectedProduct(preselectedProduct);
      setIsCreating(true);
      if (onClearPreselected) onClearPreselected();
    }
  }, [preselectedProduct, onClearPreselected]);

  // --- DERIVED STATE ---
  const filteredPosts = useMemo(() => {
    return scheduledPosts.filter(p => {
      if (activeTab === 'draft') return p.status === 'draft';
      if (activeTab === 'scheduled') return p.status === 'scheduled';
      if (activeTab === 'archived') return p.status === 'posted' || p.status === 'archived';
      return true;
    });
  }, [scheduledPosts, activeTab]);

  useEffect(() => {
    if (viewingPost || isCreating) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
  }, [viewingPost, isCreating]);

  const handleCreatePost = async () => {
    if (!selectedProduct && !caption) return;
    const newPost: SocialPost = {
      id: Date.now().toString(),
      productId: selectedProduct?.id,
      productName: selectedProduct?.name,
      imageUrl: selectedProduct?.imageUrl,
      caption,
      platform,
      scheduledAt: scheduledDate || new Date().toISOString(),
      status: 'scheduled',
    };
    setScheduledPosts([newPost, ...scheduledPosts]);
    setIsCreating(false);
    resetForm();
  };

  const handleAiGenerate = async () => {
    if (!selectedProduct) return;
    setIsGenerating(true);
    const text = await generatePostCaption(
      selectedProduct.name,
      selectedProduct.brand,
      selectedProduct.price
    );
    setCaption(text || '');
    setIsGenerating(false);
  };

  const publishDraft = () => {
    if (!viewingPost) return;
    setScheduledPosts(prev => prev.map(p => p.id === viewingPost.id ? { ...p, status: 'scheduled', scheduledAt: new Date().toISOString() } : p));
    setViewingPost(null);
  };

  const resetForm = () => {
    setSelectedProduct(null);
    setCaption('');
    setScheduledDate('');
  };

  const deletePost = (id: string) => {
    setScheduledPosts(prev => prev.filter(p => p.id !== id));
    setViewingPost(null);
  };

  const moveToArchive = (id: string) => {
    setScheduledPosts(prev => prev.map(p => p.id === id ? { ...p, status: 'archived' } : p));
    setViewingPost(null);
  };

  return (
    <div className="space-y-6 pb-24 px-2 lg:px-0 animate-ios-slide relative z-0">

      {/* HEADER & TABS */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-ios-primary tracking-tight">Контент</h2>
          <p className="text-[10px] font-black text-ios-secondary uppercase tracking-widest mt-1">SMM Планировщик</p>
        </div>

        <div className="flex gap-2 bg-ios-card p-1.5 rounded-2xl border border-ios shadow-sm self-start md:self-auto w-full md:w-auto overflow-x-auto no-scrollbar">
          {[
            { id: 'draft', label: 'Черновики', icon: '📝' },
            { id: 'scheduled', label: 'В очереди', icon: '⏳' },
            { id: 'archived', label: 'Архив', icon: '📦' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap spring-press ${activeTab === tab.id ? 'bg-ios-accent text-white shadow-lg' : 'text-ios-secondary hover:bg-ios-sub'
                }`}
            >
              <span className="text-sm">{tab.icon}</span>
              <span className="inline">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {!isCreating && (
        <button onClick={() => setIsCreating(true)} className="fixed bottom-24 right-4 md:static md:w-auto bg-ios-accent text-white px-6 py-4 rounded-full md:rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl spring-press z-50 flex items-center gap-2 shadow-ios-accent/40">
          <span className="text-xl">+</span> <span className="hidden md:inline">Создать пост</span>
        </button>
      )}

      {/* POST VIEW MODAL */}
      {viewingPost && (
        <div className="modal-backdrop z-[150]" onClick={() => setViewingPost(null)}>
          <div
            className="bg-ios-card w-full h-full md:h-auto md:max-w-lg md:rounded-[2.5rem] overflow-hidden shadow-ios-heavy border border-ios animate-modal relative md:mx-4 fixed inset-0 md:relative md:inset-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex flex-col h-full max-h-[100dvh] md:max-h-[90vh]">
              <div className="relative aspect-square w-full bg-ios-sub overflow-hidden shrink-0">
                {viewingPost.imageUrl ? (
                  <img src={viewingPost.imageUrl} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-5xl opacity-10">📸</div>
                )}
                <div className="absolute top-4 left-4">
                  <span className="px-4 py-2 bg-ios-header/80 backdrop-blur-md text-ios-primary text-[9px] font-black uppercase tracking-[0.2em] rounded-full shadow-lg border border-ios">
                    {viewingPost.platform}
                  </span>
                </div>
                <button onClick={() => setViewingPost(null)} className="absolute top-4 right-4 w-10 h-10 bg-ios-header/80 backdrop-blur-md rounded-full flex items-center justify-center font-bold text-ios-primary border border-ios">✕</button>
              </div>

              <div className="p-6 md:p-10 overflow-y-auto no-scrollbar space-y-6 flex-1">
                <div className="bg-ios-sub p-6 rounded-[2rem] border border-ios relative group">
                  <textarea
                    value={viewingPost.caption}
                    onChange={(e) => setScheduledPosts(prev => prev.map(p => p.id === viewingPost.id ? { ...p, caption: e.target.value } : p))}
                    className="w-full bg-transparent border-none outline-none text-sm font-medium leading-relaxed italic text-ios-text resize-none h-32"
                    placeholder="Введите текст поста..."
                  />
                </div>

                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-[9px] font-black text-ios-secondary uppercase tracking-widest mb-1">Статус</p>
                    <p className={`text-sm font-black uppercase ${viewingPost.status === 'draft' ? 'text-amber-500' : 'text-green-500'}`}>
                      {viewingPost.status === 'draft' ? 'Черновик' : viewingPost.status === 'scheduled' ? 'Запланировано' : 'Опубликовано'}
                    </p>
                  </div>
                  <button onClick={() => deletePost(viewingPost.id)} className="text-[9px] font-black text-red-500 uppercase tracking-widest hover:underline">Удалить пост</button>
                </div>
              </div>

              <div className="p-6 md:p-10 pt-0 md:pt-0 shrink-0">
                <div className="flex gap-3">
                  {viewingPost.status === 'draft' ? (
                    <button onClick={publishDraft} className="flex-1 py-4 bg-ios-accent text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl spring-press">📅 В очередь</button>
                  ) : (
                    <button onClick={() => moveToArchive(viewingPost.id)} className="flex-1 py-4 bg-ios-sub text-ios-primary rounded-2xl font-black text-[10px] uppercase tracking-widest border border-ios spring-press">📥 В архив</button>
                  )}
                  <button onClick={() => setViewingPost(null)} className="px-6 py-4 bg-ios-sub rounded-2xl font-black text-[10px] uppercase tracking-widest spring-press text-ios-secondary border border-ios hidden md:block">Закрыть</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Grid of Posts - 1 Col on Mobile */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
        {filteredPosts.map(post => (
          <div key={post.id} onClick={() => setViewingPost(post)} className="bg-ios-card p-4 rounded-[2rem] md:rounded-[2.5rem] shadow-sm hover:shadow-ios-heavy border border-ios flex flex-col gap-4 spring-press cursor-pointer transition-all hover:scale-[1.02] group relative">
            <div className="aspect-square rounded-[1.5rem] md:rounded-[2rem] bg-ios-sub overflow-hidden shadow-inner border border-ios relative">
              {post.imageUrl ? <img src={post.imageUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-5xl opacity-10">📷</div>}
              <div className="absolute bottom-3 left-3">
                <span className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest shadow-lg ${post.platform === 'instagram' ? 'bg-pink-500 text-white' : 'bg-blue-500 text-white'}`}>
                  {post.platform === 'instagram' ? 'Insta' : 'FB'}
                </span>
              </div>
            </div>

            <div className="px-1 pb-2">
              <div className="flex justify-between items-start mb-2">
                <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border ${post.status === 'draft' ? 'bg-amber-100 text-amber-600 border-amber-200' :
                    post.status === 'scheduled' ? 'bg-blue-100 text-blue-600 border-blue-200' :
                      'bg-gray-100 text-gray-600 border-gray-200'
                  }`}>
                  {post.status === 'draft' ? 'Draft' : post.status === 'scheduled' ? 'Queued' : 'Done'}
                </span>
                <span className="text-[9px] font-bold text-ios-secondary">{new Date(post.scheduledAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
              </div>
              <p className={`text-xs font-bold truncate leading-tight ${!post.caption ? 'text-ios-secondary italic' : 'text-ios-primary'}`}>
                {post.caption || 'Нет описания...'}
              </p>
            </div>
          </div>
        ))}

        {filteredPosts.length === 0 && !isCreating && (
          <div className="col-span-full py-20 md:py-32 flex flex-col items-center justify-center border-2 border-dashed border-ios rounded-[3rem] opacity-50">
            <span className="text-4xl md:text-6xl mb-4">📭</span>
            <p className="text-xs font-black text-ios-secondary uppercase tracking-widest">
              {activeTab === 'draft' ? 'Нет новых черновиков' : activeTab === 'scheduled' ? 'Очередь пуста' : 'Архив пуст'}
            </p>
          </div>
        )}
      </div>

      {isCreating && (
        <div className="modal-backdrop z-[150]" onClick={() => setIsCreating(false)}>
          <div className="bg-ios-card w-full h-full md:h-auto md:max-w-4xl md:rounded-[3rem] shadow-2xl border border-ios animate-ios-slide flex flex-col md:flex-row overflow-hidden max-h-[100dvh] md:max-h-[90vh] md:mx-4 fixed inset-0 md:relative md:inset-auto" onClick={e => e.stopPropagation()}>

            {!selectedProduct ? (
              <div className="p-6 md:p-10 w-full flex flex-col h-full">
                <div className="flex justify-between items-center mb-6 shrink-0">
                  <div>
                    <h3 className="text-2xl font-black text-ios-primary">Выберите товар</h3>
                    <p className="text-[10px] font-bold text-ios-secondary uppercase tracking-widest">Шаг 1 из 2</p>
                  </div>
                  <button onClick={() => setIsCreating(false)} className="w-10 h-10 rounded-full bg-ios-sub flex items-center justify-center text-ios-secondary font-bold hover:bg-ios-border">✕</button>
                </div>

                <div className="flex-1 overflow-y-auto no-scrollbar grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4 pb-4">
                  {products.map(p => (
                    <div
                      key={p.id}
                      onClick={() => setSelectedProduct(p)}
                      className="bg-ios-sub rounded-[1.5rem] p-3 cursor-pointer hover:bg-ios-border transition-all border border-ios group spring-press"
                    >
                      <div className="aspect-square rounded-[1rem] bg-white overflow-hidden mb-2 relative">
                        {p.imageUrl ? <img src={p.imageUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform" /> : <div className="w-full h-full flex items-center justify-center text-3xl opacity-20">👕</div>}
                        <div className="absolute top-2 left-2 bg-ios-accent text-white px-1.5 py-0.5 rounded-md text-[7px] font-black uppercase">{p.size}</div>
                      </div>
                      <p className="font-black text-[10px] text-ios-primary truncate px-1">{p.name}</p>
                      <p className="text-[9px] font-bold text-ios-secondary px-1">₸{p.price.toLocaleString()}</p>
                    </div>
                  ))}
                  {products.length === 0 && (
                    <div className="col-span-full text-center py-20 opacity-50">
                      <p className="text-xs font-black uppercase">Склад пуст</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <>
                <div className="h-[35vh] md:h-auto md:w-1/2 bg-ios-sub relative shrink-0">
                  {selectedProduct.imageUrl ? <img src={selectedProduct.imageUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-6xl opacity-20">📸</div>}
                  <button onClick={() => setSelectedProduct(null)} className="absolute top-6 left-6 px-4 py-2 bg-ios-card/80 backdrop-blur-md rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg border border-ios">← Назад</button>
                </div>

                <div className="flex-1 p-6 md:p-10 flex flex-col overflow-y-auto">
                  <div className="flex justify-between items-start mb-6">
                    <div className="min-w-0 pr-4">
                      <h3 className="text-xl font-black text-ios-primary leading-tight truncate">{selectedProduct.name}</h3>
                      <p className="text-[10px] font-bold text-ios-accent uppercase tracking-widest mt-1">{selectedProduct.brand}</p>
                    </div>
                    <div className="flex bg-ios-sub p-1 rounded-xl shrink-0">
                      {(['instagram', 'facebook'] as const).map(p => (
                        <button
                          key={p}
                          onClick={() => setPlatform(p)}
                          className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all spring-press ${platform === p ? 'bg-ios-card shadow-sm text-ios-primary' : 'text-ios-secondary'}`}
                        >
                          {p === 'instagram' ? 'Insta' : 'FB'}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex-1 mb-6 relative group min-h-[120px]">
                    <textarea
                      value={caption}
                      onChange={(e) => setCaption(e.target.value)}
                      className="w-full h-full bg-ios-sub rounded-[2rem] p-6 text-sm font-medium border-none outline-none resize-none placeholder:text-ios-secondary/50"
                      placeholder="Напишите текст поста..."
                    />
                    {!caption && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <button
                          onClick={handleAiGenerate}
                          disabled={isGenerating}
                          className="pointer-events-auto bg-ios-accent text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl spring-press flex items-center gap-2"
                        >
                          {isGenerating ? '🔮 Пишу...' : '✨ Создать описание с AI'}
                        </button>
                      </div>
                    )}
                    {caption && (
                      <button onClick={handleAiGenerate} disabled={isGenerating} className="absolute bottom-4 right-4 bg-ios-card/80 backdrop-blur border border-ios text-ios-accent px-3 py-1.5 rounded-xl text-[8px] font-black uppercase shadow-sm">
                        {isGenerating ? '...' : '✨ Переписать'}
                      </button>
                    )}
                  </div>

                  <div className="flex gap-4 mt-auto">
                    <button onClick={handleCreatePost} className="flex-1 py-5 bg-ios-accent text-white rounded-[2rem] font-black uppercase text-[10px] tracking-widest shadow-xl spring-press">
                      Опубликовать
                    </button>
                    <button onClick={() => setIsCreating(false)} className="px-8 py-5 bg-ios-sub text-ios-secondary rounded-[2rem] font-black uppercase text-[10px] tracking-widest border border-ios spring-press hidden md:block">
                      Отмена
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SocialScheduler;
