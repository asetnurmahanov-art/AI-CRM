
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product } from '../types';

import { dbService } from '../services/db';

interface InventoryContextType {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>; // Kept for types, but effectively readonly from outside except for special cases
  addProduct: (product: Product) => Promise<void>;
  updateProduct: (product: Product) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  refreshInventory: () => Promise<void>;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export const InventoryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  const refreshInventory = async () => {
    try {
      const data = await dbService.getAll('products');
      // Fix dates converting from Firestore Timestamp if needed, though dbService returns .data()
      // We assume data matches Product interface approximately
      setProducts(data as Product[]);
    } catch (e) {
      console.error("Failed to load products", e);
    }
  };

  useEffect(() => {
    refreshInventory();
  }, []);

  const addProduct = async (product: Product) => {
    // Optimistic update
    setProducts(prev => [product, ...prev]);
    try {
      // Remove ID if it's purely client-side generated timestamp to let Firestore generate one, 
      // OR keep it if we want to enforce it.
      // db.service.add creates a new ID. 
      // If product has an ID, we might want to use set/update or just add.
      // current implementation of dbService.add ignores ID passed in data and returns new ID.
      // For consistency, let's use the ID returned by firestore.

      const { id, ...rest } = product;
      const newId = await dbService.add('products', rest);

      // Update local state with real ID
      setProducts(prev => prev.map(p => p.id === product.id ? { ...p, id: newId } : p));
    } catch (e) {
      console.error("Failed to add product", e);
      // Revert on failure
      setProducts(prev => prev.filter(p => p.id !== product.id));
    }
  };

  const updateProduct = async (product: Product) => {
    setProducts(prev => prev.map(p => p.id === product.id ? product : p));
    try {
      const { id, ...data } = product;
      await dbService.update('products', id, data);
    } catch (e) {
      console.error("Failed to update product", e);
    }
  };

  const deleteProduct = async (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
    try {
      await dbService.delete('products', id);
    } catch (e) {
      console.error("Failed to delete product", e);
    }
  };

  return (
    <InventoryContext.Provider value={{ products, setProducts, addProduct, updateProduct, deleteProduct, refreshInventory }}>
      {children}
    </InventoryContext.Provider>
  );
};

export const useInventory = () => {
  const context = useContext(InventoryContext);
  if (!context) throw new Error('useInventory must be used within an InventoryProvider');
  return context;
};
