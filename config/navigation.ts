import { View } from '../types';

export interface NavItem {
    id: View;
    label: string;
    icon: string;
    badge?: string;
    category: 'main' | 'secondary' | 'system';
}

export const NAV_ITEMS: NavItem[] = [
    // Primary Navigation (Bottom Bar / Top Rail)
    { id: View.DASHBOARD, label: 'Обзор', icon: '🏠', category: 'main' },
    { id: View.CUSTOMERS, label: 'CRM', icon: '👥', category: 'main' },
    { id: View.SOCIAL, label: 'Чаты', icon: '💬', badge: '3', category: 'main' },
    { id: View.INVENTORY, label: 'Склад', icon: '📦', category: 'main' },

    // Secondary (Menu / Bottom Rail)
    { id: View.SCHEDULER, label: 'Контент', icon: '📅', category: 'secondary' },
    { id: View.ANALYTICS, label: 'Аналитика', icon: '📈', category: 'secondary' },
    { id: View.TOOLS, label: 'Инструменты', icon: '🛠️', category: 'secondary' },

    // System (Bottom of Sidebar / Settings)
    { id: View.SETTINGS, label: 'Настройки', icon: '⚙️', category: 'system' },
];

export const MAIN_NAV_ITEMS = NAV_ITEMS.filter(item => item.category === 'main');
export const SECONDARY_NAV_ITEMS = NAV_ITEMS.filter(item => item.category === 'secondary');
export const SYSTEM_NAV_ITEMS = NAV_ITEMS.filter(item => item.category === 'system');

// Helper to get mobile bottom nav items (limit to 4 main + menu button will be handled by layout)
export const MOBILE_BOTTOM_NAV = MAIN_NAV_ITEMS.slice(0, 4);
