
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Customer } from '../types';

const INITIAL_CUSTOMERS: Customer[] = [
  { id: '1', name: 'Мария Иванова', handle: '@mama_mashy', platform: 'instagram', lastInteraction: '2024-10-20', totalSpent: 125000, status: 'won' },
  { id: '2', name: 'Анна Кузнецова', handle: '@ann_mom', platform: 'whatsapp', lastInteraction: '2024-10-18', totalSpent: 34000, status: 'payment' },
  { id: '3', name: 'Ольга Смирнова', handle: 'Olga Smirnova', platform: 'facebook', lastInteraction: '2024-10-05', totalSpent: 450000, status: 'won' },
];

import { dbService } from '../services/db';

interface CRMContextType {
  customers: Customer[];
  setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>;
  addCustomer: (customer: Customer) => Promise<void>;
  updateCustomer: (customer: Customer) => Promise<void>;
}

const CRMContext = createContext<CRMContextType | undefined>(undefined);

export const CRMProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [customers, setCustomers] = useState<Customer[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await dbService.getAll('customers');
        if (data.length === 0) {
          // Initial seed if empty
          // Optionally seed from INITIAL_CUSTOMERS if DB is empty
          // For now, leave empty
        }
        setCustomers(data as Customer[]);
      } catch (e) {
        console.error("Failed to load customers", e);
      }
    };
    load();
  }, []);

  const addCustomer = async (customer: Customer) => {
    setCustomers(prev => [customer, ...prev]);
    try {
      const { id, ...rest } = customer;
      const newId = await dbService.add('customers', rest);
      setCustomers(prev => prev.map(c => c.id === customer.id ? { ...c, id: newId } : c));
    } catch (e) {
      console.error(e);
    }
  };

  const updateCustomer = async (customer: Customer) => {
    setCustomers(prev => prev.map(c => c.id === customer.id ? customer : c));
    try {
      const { id, ...data } = customer;
      await dbService.update('customers', id, data);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <CRMContext.Provider value={{ customers, setCustomers, addCustomer, updateCustomer }}>
      {children}
    </CRMContext.Provider>
  );
};

export const useCRM = () => {
  const context = useContext(CRMContext);
  if (!context) throw new Error('useCRM must be used within a CRMProvider');
  return context;
};
