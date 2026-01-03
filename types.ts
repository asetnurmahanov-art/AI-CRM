
export enum View {
  DASHBOARD = 'DASHBOARD',
  INVENTORY = 'INVENTORY',
  SOCIAL = 'SOCIAL',
  CUSTOMERS = 'CUSTOMERS',
  ANALYTICS = 'ANALYTICS',
  SCHEDULER = 'SCHEDULER',
  SETTINGS = 'SETTINGS',
  TOOLS = 'TOOLS',
  DATABASE = 'DATABASE'
}

export interface Branch {
  id: string;
  name: string;
  address: string;
  mapUrl?: string; // 2GIS or Google Maps
  phone: string;
  isMain: boolean;
}

export interface Company {
  id: string;
  name: string;
  bin: string;
  address: string;
  account: string;
  logoUrl?: string;
  branches: Branch[];
}

export interface ProductVariant {
  size: string;
  stock: number;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  size: string;
  variants?: ProductVariant[];
  price: number;
  costPrice?: number;
  category: string;
  imageUrl?: string;
  barcode?: string;
  status: 'available' | 'sold' | 'reserved';
  createdAt: string;
  material?: string;
  washingInstructions?: string;
  branchId?: string; // Assigned store location
}

export type CustomerStatus = 'new' | 'in_progress' | 'offer' | 'payment' | 'won';

export interface Customer {
  id: string;
  name: string;
  handle: string;
  avatar?: string;
  platform: 'instagram' | 'facebook' | 'whatsapp';
  lastInteraction: string;
  totalSpent: number;
  status: CustomerStatus;
  notes?: string;
  preferences?: string[];
}

export interface SocialPost {
  id: string;
  productId?: string;
  productName?: string;
  imageUrl?: string;
  caption: string;
  platform: 'instagram' | 'facebook';
  scheduledAt: string;
  status: 'draft' | 'scheduled' | 'posted' | 'archived';
  targetAccountId?: string; // Which account to post to
}

export interface SocialMessage {
  id: string;
  accountId?: string; // Which of our accounts received this
  customerId?: string;
  customerName: string;
  customerHandle: string;
  customerAvatar?: string;
  platform: 'instagram' | 'facebook' | 'whatsapp';
  text: string;
  timestamp: string;
  isRead: boolean;
  history?: { text: string; sender: 'user' | 'bot' | 'agent'; time: string }[];
}

export interface SocialAccount {
  id: string;
  name: string; // Account name (e.g. "My Business Page")
  platform: 'instagram' | 'facebook' | 'whatsapp';
  isConnected: boolean;
  username?: string;
  avatarUrl?: string; // Profile picture
  apiKey?: string; // Real API Key / Access Token
  apiSecret?: string; // Real API Secret (optional depending on platform)
  accessToken?: string; // For real API (mocked)
  stats?: {
    followers: number;
    posts: number;
    engagement: number;
  };
}

export interface FunnelStep {
  id: string;
  label: string;
  description: string;
  action: string;
}
