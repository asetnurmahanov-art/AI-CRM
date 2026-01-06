import React from 'react';
import { useApp } from '../contexts/AppContext';
import SubscriptionPlans from './SubscriptionPlans';
import { Title, Subtitle, Caption } from './ui/Typography';


const ToolsView: React.FC = () => {
  const { activeCompany } = useApp();


  return (
    <div className="space-y-6 pb-24 animate-fade-in-up relative z-0">
      <header className="px-2">
        <Title>Инструменты</Title>
        <Caption className="mt-1">Помощник продавца</Caption>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* BLOCK 1: SUBSCRIPTION PLANS */}
        <div className="lg:col-span-2">
          <div className="flex items-center gap-4 mb-4 md:mb-6 px-2">
            <span className="text-3xl bg-indigo-100 dark:bg-indigo-900/50 w-12 h-12 flex items-center justify-center rounded-2xl shadow-sm">💎</span>
            <div>
              <Subtitle>Пакеты подписок</Subtitle>
              <Caption className="mt-0.5">Выберите свой тариф</Caption>
            </div>
          </div>
          <SubscriptionPlans />
        </div>

      </div>
    </div>
  );
};

export default ToolsView;
