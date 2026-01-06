
export enum View {
  DASHBOARD = 'DASHBOARD',
  INVENTORY = 'INVENTORY',
  SOCIAL = 'SOCIAL',
  CUSTOMERS = 'CUSTOMERS',
  ANALYTICS = 'ANALYTICS',
  SCHEDULER = 'SCHEDULER',
  SETTINGS = 'SETTINGS',
  TOOLS = 'TOOLS',
  DATABASE = 'DATABASE',
  DOCS = 'DOCS'
}

export enum UserRole {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  EMPLOYEE = 'EMPLOYEE'
}

export type SubscriptionPlan = 'free' | 'pro' | 'premium';

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  role: UserRole;
  plan: SubscriptionPlan;
  status: 'active' | 'disabled';
  department?: string;
  createdAt: string;
  lastLogin: string;
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
  platform: 'instagram' | 'facebook' | 'whatsapp' | 'threads';
  text: string;
  timestamp: string;
  isRead: boolean;
  history?: { text: string; sender: 'user' | 'bot' | 'agent'; time: string }[];
}

export interface SocialAccount {
  id: string;
  name: string; // Account name (e.g. "My Business Page")
  platform: 'instagram' | 'facebook' | 'whatsapp' | 'threads';
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

export interface DocSection {
  id: string;
  title: string;
  content: string; // Markdown supported
}

export interface Specification {
  id: string;
  title: string;
  category: string; // e.g., 'Feature', 'API', 'UI', 'Schema'
  status: 'draft' | 'review' | 'approved';
  tags?: string[];
  sections: DocSection[];
  createdAt: string;
  updatedAt: string;
  authorId?: string;
  authorName?: string;
}
