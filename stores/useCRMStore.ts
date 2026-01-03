
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Customer } from '../types';

const INITIAL_CUSTOMERS: Customer[] = [
  { id: '1', name: 'Мария Иванова', handle: '@mama_mashy', platform: 'instagram', lastInteraction: '2024-10-20', totalSpent: 125000, status: 'won' },
  { id: '2', name: 'Анна Кузнецова', handle: '@ann_mom', platform: 'whatsapp', lastInteraction: '2024-10-18', totalSpent: 34000, status: 'payment' },
  { id: '3', name: 'Ольга Смирнова', handle: 'Olga Smirnova', platform: 'facebook', lastInteraction: '2024-10-05', totalSpent: 450000, status: 'won' },
];

interface CRMState {
  customers: Customer[];
  setCustomers: (customers: Customer[]) => void;
  addCustomer: (customer: Customer) => void;
  updateCustomer: (customer: Customer) => void;
}

export const useCRMStore = create<CRMState>()(
  persist(
    (set) => ({
      customers: INITIAL_CUSTOMERS,
      setCustomers: (customers) => set({ customers }),
      addCustomer: (customer) => set((state) => ({ customers: [customer, ...state.customers] })),
      updateCustomer: (customer) => set((state) => ({
        customers: state.customers.map((c) => (c.id === customer.id ? customer : c)),
      })),
    }),
    {
      name: 'crm_customers',
    }
  )
);
