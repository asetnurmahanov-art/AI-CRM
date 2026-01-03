
import React, { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import { Product } from '../types';
import { scanProductTag } from '../services/geminiService';
import { useInventory } from '../contexts/InventoryContext';
import { useSocial } from '../contexts/SocialContext';
import { useApp } from '../contexts/AppContext';
import { View } from '../types';


const ProductCard = React.memo(({ product, onClick }: { product: Product, onClick: (p: Product) => void }) => (
  <div onClick={() => onClick(product)} className={`bg-ios-card rounded-[1.5rem] md:rounded-[2.5rem] border border-ios overflow-hidden shadow-sm hover:shadow-ios-heavy transition-all spring-press cursor-pointer group relative h-full flex flex-col ${product.status === 'sold' ? 'opacity-50 grayscale' : product.status === 'reserved' ? 'border-amber-400' : ''}`}>
    {product.status === 'reserved' && <div className="absolute top-0 right-0 bg-amber-400 text-white text-[8px] font-black uppercase px-2 py-1 md:px-3 rounded-bl-xl z-10">Бронь</div>}
    {product.status === 'sold' && <div className="absolute top-0 right-0 bg-ios-primary text-ios-bg text-[8px] font-black uppercase px-2 py-1 md:px-3 rounded-bl-xl z-10">Продано</div>}

    <div className="aspect-square bg-ios-sub relative overflow-hidden shrink-0">
      {product.imageUrl ? <img src={product.imageUrl} loading="lazy" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" /> : <div className="w-full h-full flex items-center justify-center text-3xl opacity-10">👕</div>}
      <div className="absolute top-2 left-2 md:top-3 md:left-3 px-1.5 py-0.5 md:px-2 bg-ios-accent text-white rounded-lg text-[7px] md:text-[8px] font-black uppercase shadow-sm">{product.size}</div>
    </div>
    <div className="p-3 md:p-5 flex-1 flex flex-col justify-between gap-1">
      <p className="font-black text-[9px] md:text-[10px] truncate uppercase tracking-tight text-ios-primary">{product.name}</p>
      <div className="flex justify-between items-center mt-1">
        <p className="text-ios-accent font-black text-[10px] md:text-[11px]">₸{product.price.toLocaleString()}</p>
        <div className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full shadow-sm ${product.status === 'available' ? 'bg-green-500' : product.status === 'reserved' ? 'bg-amber-500' : 'bg-gray-400'}`}></div>
      </div>
    </div>
  </div>
));

const Inventory: React.FC = () => {

  const { products, setProducts } = useInventory();
  const { setProductToPromote } = useSocial(); // We only need this for promotion
  const { setView } = useApp(); // To navigate to Scheduler

  const onPromote = (product: Product) => {
    setProductToPromote(product);
    setView(View.SCHEDULER);
  };
  const [isScanning, setIsScanning] = useState(false);
  const [generationStep, setGenerationStep] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showManualAdd, setShowManualAdd] = useState(false);

  // Edit Mode State
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Product>>({});

  const [manualProduct, setManualProduct] = useState<Partial<Product>>({
    name: '', brand: '', price: 0, size: '', category: 'General'
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync edit form when product is selected
  useEffect(() => {
    if (selectedProduct) {
      setEditForm(selectedProduct);
      setIsEditing(false);
    }
  }, [selectedProduct]);

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsScanning(true);
    setGenerationStep('Анализирую бирку...');
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = (reader.result as string).split(',')[1];
      const result = await scanProductTag(base64);
      if (result) {
        const newProduct: Product = {
          id: Date.now().toString(),
          name: result.name || 'Новый товар',
          brand: result.brand || 'N/A',
          size: result.size || 'N/A',
          price: result.price || 0,
          costPrice: Math.floor(result.price * 0.6),
          category: result.category || 'Общее',
          barcode: result.barcode !== 'null' ? result.barcode : undefined,
          status: 'available',
          createdAt: new Date().toISOString(),
          imageUrl: reader.result as string
        };
        setProducts(prev => [newProduct, ...prev]);
        setIsScanning(false);
      }
    };
    reader.readAsDataURL(file);
    if (e.target) e.target.value = '';
  }, [setProducts]);

  const handleManualSubmit = useCallback(() => {
    if (!manualProduct.name || !manualProduct.price) return;
    const newProduct: Product = {
      id: Date.now().toString(),
      name: manualProduct.name!,
      brand: manualProduct.brand || 'No Brand',
      size: manualProduct.size || 'ONE',
      price: Number(manualProduct.price),
      costPrice: Math.floor(Number(manualProduct.price) * 0.6),
      category: manualProduct.category || 'General',
      status: 'available',
      createdAt: new Date().toISOString(),
      imageUrl: ''
    };
    setProducts(prev => [newProduct, ...prev]);
    setShowManualAdd(false);
    setManualProduct({ name: '', brand: '', price: 0, size: '', category: 'General' });
  }, [manualProduct, setProducts]);

  const handleSaveChanges = () => {
    if (!selectedProduct || !editForm.id) return;
    const updatedProduct = { ...selectedProduct, ...editForm } as Product;
    setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
    setSelectedProduct(updatedProduct);
    setIsEditing(false);
  };

  const handleDeleteProduct = () => {
    if (!selectedProduct) return;
    if (confirm('Вы уверены, что хотите удалить этот товар?')) {
      setProducts(prev => prev.filter(p => p.id !== selectedProduct.id));
      setSelectedProduct(null);
    }
  };

  const cycleStatus = useCallback((product: Product) => {
    const nextStatus = product.status === 'available' ? 'reserved' : product.status === 'reserved' ? 'sold' : 'available';
    setProducts(prev => prev.map(p => p.id === product.id ? { ...p, status: nextStatus } : p));
    if (selectedProduct && selectedProduct.id === product.id) {
      setSelectedProduct(prev => prev ? { ...prev, status: nextStatus } : null);
    }
  }, [selectedProduct, setProducts]);

  const filteredProducts = useMemo(() => {
    return products.filter(p =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [products, searchQuery]);

  return (
    <div className="space-y-6 pb-20 animate-ios-slide relative z-0">
      {isScanning && (
        <div className="modal-backdrop z-[200]">
          <div className="bg-ios-card p-10 rounded-[3rem] shadow-ios-heavy border border-ios text-center space-y-4">
            <div className="w-12 h-12 border-4 border-ios-accent/20 border-t-ios-accent rounded-full animate-spin mx-auto"></div>
            <h3 className="font-black text-ios-primary uppercase tracking-widest text-[10px]">{generationStep}</h3>
          </div>
        </div>
      )}

      {/* MANUAL ADD MODAL - FULL SCREEN ON MOBILE */}
      {showManualAdd && (
        <div className="modal-backdrop z-[150]" onClick={() => setShowManualAdd(false)}>
          <div className="bg-ios-card w-full h-full md:h-auto md:max-w-lg md:rounded-[3rem] p-6 md:p-8 shadow-2xl border border-ios animate-modal md:mx-4 flex flex-col fixed inset-0 md:relative md:inset-auto" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black text-ios-primary">Новый товар</h3>
              <button onClick={() => setShowManualAdd(false)} className="w-10 h-10 rounded-full bg-ios-sub flex items-center justify-center font-bold text-ios-secondary hover:bg-ios-border">✕</button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4">
              <input placeholder="Название" value={manualProduct.name} onChange={e => setManualProduct({ ...manualProduct, name: e.target.value })} className="w-full bg-ios-sub p-4 rounded-2xl font-bold" />
              <div className="grid grid-cols-2 gap-4">
                <input placeholder="Бренд" value={manualProduct.brand} onChange={e => setManualProduct({ ...manualProduct, brand: e.target.value })} className="bg-ios-sub p-4 rounded-2xl font-bold" />
                <input placeholder="Размер" value={manualProduct.size} onChange={e => setManualProduct({ ...manualProduct, size: e.target.value })} className="bg-ios-sub p-4 rounded-2xl font-bold" />
              </div>
              <input type="number" placeholder="Цена (₸)" value={manualProduct.price || ''} onChange={e => setManualProduct({ ...manualProduct, price: Number(e.target.value) })} className="w-full bg-ios-sub p-4 rounded-2xl font-bold" />
              <input placeholder="Категория" value={manualProduct.category} onChange={e => setManualProduct({ ...manualProduct, category: e.target.value })} className="w-full bg-ios-sub p-4 rounded-2xl font-bold" />
            </div>

            <div className="pt-4 mt-auto">
              <button onClick={handleManualSubmit} className="w-full py-4 bg-ios-accent text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg spring-press">Добавить товар</button>
            </div>
          </div>
        </div>
      )}

      {/* INVENTORY HEADER */}
      <div className="bg-ios-card p-6 rounded-[2.5rem] border border-ios shadow-ios flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-6 w-full md:w-auto">
          <div className="w-14 h-14 bg-ios-accent rounded-2xl flex items-center justify-center text-white text-3xl shadow-xl shrink-0">📦</div>
          <div>
            <h2 className="text-2xl font-black text-ios-primary tracking-tight">Склад</h2>
            <p className="text-[9px] font-black text-ios-secondary uppercase tracking-widest">Позиций: {products.length}</p>
          </div>
        </div>
        <div className="flex gap-2 w-full md:w-auto overflow-x-auto no-scrollbar pb-1">
          <input
            type="text"
            placeholder="Поиск..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 min-w-[120px] bg-ios-sub border-none rounded-2xl px-5 py-3 text-xs font-bold outline-none"
          />
          <button onClick={() => setShowManualAdd(true)} className="bg-ios-sub text-ios-primary px-5 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest border border-ios shrink-0">
            + Руч.
          </button>
          <button onClick={() => fileInputRef.current?.click()} className="bg-ios-accent text-white px-5 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shrink-0 flex items-center gap-2">
            <span>📷</span>
          </button>
        </div>
      </div>

      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />

      {/* GRID: 2 COLS ON MOBILE, MORE ON DESKTOP */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-6">
        {filteredProducts.map(p => (
          <ProductCard key={p.id} product={p} onClick={setSelectedProduct} />
        ))}
        {filteredProducts.length === 0 && (
          <div className="col-span-full py-20 flex flex-col items-center justify-center opacity-40">
            <span className="text-6xl mb-4">🔍</span>
            <p className="font-black text-xs uppercase tracking-widest">Пусто</p>
          </div>
        )}
      </div>

      {/* DETAIL MODAL - FULL SCREEN MOBILE */}
      {selectedProduct && (
        <div className="modal-backdrop z-[150]" onClick={() => setSelectedProduct(null)}>
          <div className="bg-ios-card w-full h-full md:h-auto md:max-w-4xl md:rounded-[3.5rem] overflow-hidden border border-ios shadow-ios-heavy flex flex-col md:flex-row animate-modal fixed inset-0 md:relative md:inset-auto max-h-[100dvh] md:max-h-[90vh]" onClick={e => e.stopPropagation()}>

            {/* Image Area */}
            <div className="h-[40vh] md:h-auto md:w-1/2 bg-ios-sub relative shrink-0">
              {selectedProduct.imageUrl ? <img src={selectedProduct.imageUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-8xl opacity-10">👕</div>}
              <div className="absolute top-6 left-6 px-4 py-2 bg-ios-card/80 backdrop-blur-md rounded-xl text-xs font-black uppercase shadow-lg border border-ios">
                {isEditing ? <input value={editForm.category} onChange={e => setEditForm({ ...editForm, category: e.target.value })} className="bg-transparent border-b border-ios-primary w-20 outline-none" /> : selectedProduct.category}
              </div>
              <button onClick={() => setSelectedProduct(null)} className="absolute top-6 right-6 w-10 h-10 bg-ios-card/80 backdrop-blur-md rounded-full flex items-center justify-center font-bold text-ios-primary border border-ios md:hidden z-20">✕</button>
            </div>

            {/* Info Area */}
            <div className="flex-1 p-6 md:p-12 flex flex-col overflow-y-auto">
              <div className="space-y-6 flex-1">
                <div className="flex justify-between items-start">
                  <div className="w-full">
                    {isEditing ? (
                      <div className="space-y-2">
                        <input value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} className="w-full text-2xl font-black bg-ios-sub p-2 rounded-xl" placeholder="Название" />
                        <input value={editForm.brand} onChange={e => setEditForm({ ...editForm, brand: e.target.value })} className="w-full text-xs font-black uppercase bg-ios-sub p-2 rounded-xl" placeholder="Бренд" />
                      </div>
                    ) : (
                      <>
                        <h3 className="text-2xl md:text-3xl font-black text-ios-primary mb-1 leading-tight">{selectedProduct.name}</h3>
                        <p className="text-ios-accent font-black uppercase tracking-[0.2em] text-[10px]">{selectedProduct.brand}</p>
                      </>
                    )}
                  </div>
                  {!isEditing && (
                    <div className="text-right whitespace-nowrap ml-4">
                      <p className="text-[8px] font-black text-ios-secondary uppercase tracking-widest mb-1">Маржа</p>
                      <p className="text-lg md:text-xl font-black text-green-500">₸{(selectedProduct.price - (selectedProduct.costPrice || 0)).toLocaleString()}</p>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 md:p-5 bg-ios-sub rounded-[2rem] border border-ios">
                    <p className="text-[8px] font-black text-ios-secondary uppercase mb-2">Статус</p>
                    <p className={`text-base md:text-lg font-black uppercase ${selectedProduct.status === 'available' ? 'text-green-500' : selectedProduct.status === 'reserved' ? 'text-amber-500' : 'text-gray-400'}`}>
                      {selectedProduct.status === 'available' ? 'В наличии' : selectedProduct.status === 'reserved' ? 'Бронь' : 'Продано'}
                    </p>
                  </div>
                  <div className="p-4 md:p-5 bg-ios-sub rounded-[2rem] border border-ios">
                    <p className="text-[8px] font-black text-ios-secondary uppercase mb-2">Цена</p>
                    {isEditing ? (
                      <input type="number" value={editForm.price} onChange={e => setEditForm({ ...editForm, price: Number(e.target.value) })} className="w-full bg-ios-card p-1 rounded-lg font-black text-lg" />
                    ) : (
                      <p className="text-base md:text-xl font-black text-ios-primary">₸{selectedProduct.price.toLocaleString()}</p>
                    )}
                  </div>
                </div>

                {isEditing && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-ios-sub rounded-[2rem] border border-ios">
                      <p className="text-[8px] font-black text-ios-secondary uppercase mb-1">Размер</p>
                      <input value={editForm.size} onChange={e => setEditForm({ ...editForm, size: e.target.value })} className="w-full bg-ios-card p-1 rounded-lg font-bold" />
                    </div>
                    <div className="p-4 bg-ios-sub rounded-[2rem] border border-ios">
                      <p className="text-[8px] font-black text-ios-secondary uppercase mb-1">Себестоимость</p>
                      <input type="number" value={editForm.costPrice} onChange={e => setEditForm({ ...editForm, costPrice: Number(e.target.value) })} className="w-full bg-ios-card p-1 rounded-lg font-bold" />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-3 mt-8">
                {!isEditing ? (
                  <>
                    <button
                      onClick={() => onPromote && onPromote(selectedProduct)}
                      className="w-full py-4 md:py-5 bg-ios-accent text-white rounded-[2rem] font-black uppercase text-[10px] tracking-widest shadow-xl spring-press"
                    >
                      📢 Продвигать
                    </button>
                    <div className="flex gap-3">
                      <button
                        onClick={() => cycleStatus(selectedProduct)}
                        className={`flex-1 py-4 md:py-5 rounded-[2rem] font-black uppercase text-[10px] tracking-widest shadow-lg spring-press text-white transition-colors ${selectedProduct.status === 'available' ? 'bg-amber-500 shadow-amber-200' :
                          selectedProduct.status === 'reserved' ? 'bg-ios-primary shadow-gray-300' :
                            'bg-green-500 shadow-green-200'
                          }`}
                      >
                        {selectedProduct.status === 'available' ? 'Бронь' : selectedProduct.status === 'reserved' ? 'Продано' : 'Вернуть'}
                      </button>
                      <button onClick={() => setIsEditing(true)} className="flex-1 py-4 bg-ios-sub text-ios-primary rounded-[2rem] font-black uppercase text-[10px] tracking-widest border border-ios spring-press">Изменить</button>
                    </div>
                  </>
                ) : (
                  <>
                    <button onClick={handleSaveChanges} className="w-full py-5 bg-ios-accent text-white rounded-[2rem] font-black uppercase text-[10px] tracking-widest shadow-xl spring-press">💾 Сохранить</button>
                    <div className="flex gap-3">
                      <button onClick={handleDeleteProduct} className="flex-1 py-4 bg-red-500/10 text-red-500 border border-red-500/20 rounded-[2rem] font-black uppercase text-[10px] tracking-widest spring-press">🗑️ Удалить</button>
                      <button onClick={() => { setIsEditing(false); setEditForm(selectedProduct); }} className="flex-1 py-4 bg-ios-sub text-ios-secondary rounded-[2rem] font-black uppercase text-[10px] tracking-widest border border-ios spring-press">Отмена</button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
