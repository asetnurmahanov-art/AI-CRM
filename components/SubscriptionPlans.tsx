import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const SubscriptionPlans: React.FC = () => {
    const { userProfile } = useAuth();
    const currentPlanId = userProfile?.plan || 'free';

    const plans = [
        {
            id: 'free',
            name: 'Free',
            price: '0₸',
            period: '/мес',
            description: 'Для начинающих продавцов',
            features: [
                'Базовая CRM (до 100 клиентов)',
                'Складской учет (до 50 товаров)',
                '1 пользователь',
                'Базовая поддержка',
            ],
            color: 'bg-gray-100 dark:bg-gray-800',
            textColor: 'text-gray-900 dark:text-gray-100',
            buttonColor: 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900',
        },
        {
            id: 'pro',
            name: 'Pro',
            price: '4,990₸',
            period: '/мес',
            description: 'Для растущего бизнеса',
            features: [
                'Расширенная CRM (безлимит)',
                'Полный складской учет',
                'До 3 пользователей',
                'Аналитика продаж',
                'Приоритетная поддержка',
            ],
            color: 'bg-blue-500',
            textColor: 'text-white',
            buttonColor: 'bg-white text-blue-600',
            popular: true,
        },
        {
            id: 'premium',
            name: 'Premium',
            price: '9,990₸',
            period: '/мес',
            description: 'Максимальные возможности',
            features: [
                'Все функции Pro',
                'Неограниченное число пользователей',
                'AI-ассистент (Beta)',
                'Персональный менеджер',
                'API доступ',
            ],
            color: 'bg-gradient-to-br from-purple-600 to-indigo-600',
            textColor: 'text-white',
            buttonColor: 'bg-white text-indigo-600',
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => (
                <div
                    key={plan.id}
                    className={`relative rounded-[2.5rem] p-8 border border-ios shadow-lg transition-transform duration-300 hover:scale-[1.02] ${plan.popular ? 'md:-mt-4 md:mb-4 shadow-xl z-10' : ''
                        } ${plan.id === 'free' ? 'bg-ios-card' : ''} ${plan.id !== 'free' ? plan.color : ''}`}
                >
                    {plan.popular && (
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-orange-400 to-pink-500 text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-md">
                            Популярный
                        </div>
                    )}

                    <div className="text-center mb-8">
                        <h3 className={`text-lg font-black uppercase tracking-widest mb-2 ${plan.id === 'free' ? 'text-ios-primary' : plan.textColor}`}>
                            {plan.name}
                        </h3>
                        <div className="flex items-baseline justify-center gap-1">
                            <span className={`text-4xl font-black ${plan.id === 'free' ? 'text-ios-primary' : plan.textColor}`}>
                                {plan.price}
                            </span>
                            <span className={`text-sm font-bold ${plan.id === 'free' ? 'text-ios-secondary' : 'text-white/80'}`}>
                                {plan.period}
                            </span>
                        </div>
                        <p className={`text-xs font-bold mt-2 ${plan.id === 'free' ? 'text-ios-secondary' : 'text-white/80'}`}>
                            {plan.description}
                        </p>
                    </div>

                    <ul className="space-y-4 mb-8">
                        {plan.features.map((feature, idx) => (
                            <li key={idx} className="flex items-start gap-3">
                                <span className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${plan.id === 'free' ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' : 'bg-white/20 text-white'
                                    }`}>
                                    ✓
                                </span>
                                <span className={`text-xs font-bold ${plan.id === 'free' ? 'text-ios-primary' : 'text-white/90'}`}>
                                    {feature}
                                </span>
                            </li>
                        ))}
                    </ul>

                    <button
                        className={`w-full py-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all active:scale-95 ${plan.buttonColor} ${currentPlanId === plan.id ? 'border border-green-500 ring-2 ring-green-500 ring-offset-2' : ''} ${plan.id === 'free' ? 'border border-ios hover:bg-gray-100 dark:hover:bg-gray-700' : 'shadow-lg hover:shadow-xl'
                            }`}
                        disabled={currentPlanId === plan.id}
                    >
                        {currentPlanId === plan.id ? 'Ваш текущий план' : 'Выбрать'}
                    </button>
                </div>
            ))
            }
        </div >
    );
};

export default SubscriptionPlans;
