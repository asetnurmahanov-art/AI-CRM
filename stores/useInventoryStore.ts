
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product } from '../types';

interface InventoryState {
  products: Product[];
  setProducts: (products: Product[]) => void;
  addProduct: (product: Product) => void;
  updateProduct: (product: Product) => void;
}

export const useInventoryStore = create<InventoryState>()(
  persist(
    (set) => ({
      products: [],
      setProducts: (products) => set({ products }),
      addProduct: (product) => set((state) => ({ products: [...state.products, product] })),
      updateProduct: (product) => set((state) => ({
        products: state.products.map((p) => (p.id === product.id ? product : p)),
      })),
    }),
    {
      name: 'crm_products',
    }
  )
);
