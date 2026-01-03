
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Customer } from '../types';

const INITIAL_CUSTOMERS: Customer[] = [
  { id: '1', name: 'Мария Иванова', handle: '@mama_mashy', platform: 'instagram', lastInteraction: '2024-10-20', totalSpent: 125000, status: 'won' },
  { id: '2', name: 'Анна Кузнецова', handle: '@ann_mom', platform: 'whatsapp', lastInteraction: '2024-10-18', totalSpent: 34000, status: 'payment' },
  { id: '3', name: 'Ольга Смирнова', handle: 'Olga Smirnova', platform: 'facebook', lastInteraction: '2024-10-05', totalSpent: 450000, status: 'won' },
];

interface CRMContextType {
  customers: Customer[];
  setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>;
}

const CRMContext = createContext<CRMContextType | undefined>(undefined);

export const CRMProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [customers, setCustomers] = useState<Customer[]>(() => JSON.parse(localStorage.getItem('crm_customers') || JSON.stringify(INITIAL_CUSTOMERS)));

  useEffect(() => {
    localStorage.setItem('crm_customers', JSON.stringify(customers));
  }, [customers]);

  return (
    <CRMContext.Provider value={{ customers, setCustomers }}>
      {children}
    </CRMContext.Provider>
  );
};

export const useCRM = () => {
  const context = useContext(CRMContext);
  if (!context) throw new Error('useCRM must be used within a CRMProvider');
  return context;
};
