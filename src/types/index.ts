// ─── Core domain types ────────────────────────────────────────────────────────

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  subcategory: string;
  description: string;
  imageUrl?: string;
  tags: string[];
  vendorCount: number;
  bestPrice: number;
  avgPrice: number;
  worstPrice: number;
  priceChange24h: number;       // percentage
  priceChangePct: number;       // alias
  lastUpdated: string;          // ISO date
  isFavorited: boolean;
  hasAlert: boolean;
  alertPrice?: number;
  unit: string;                 // e.g. "per unit", "per box", "per ream"
}

export interface ProductPricePoint {
  date: string;                 // ISO date
  price: number;
  vendorId: string;
  vendorName: string;
}

export interface PriceTrend {
  productId: string;
  period: '7d' | '30d' | '90d';
  dataPoints: Array<{ date: string; avgPrice: number; minPrice: number }>;
}

export interface VendorListing {
  vendorId: string;
  vendorName: string;
  vendorLocation: string;
  vendorBadge: VendorBadge;
  price: number;
  inStock: boolean;
  minOrderQty: number;
  updatedAt: string;
  contactPhone?: string;
  contactEmail?: string;
  notes?: string;
}

export interface Vendor {
  id: string;
  name: string;
  initials: string;
  category: string;
  description: string;
  location: string;
  area: string;                 // e.g. "Westlands", "CBD"
  rating: number;
  reviewCount: number;
  badge: VendorBadge;
  productCount: number;
  phone?: string;
  email?: string;
  whatsapp?: string;
  website?: string;
  openingHours: string;
  isVerified: boolean;
  isFavorited: boolean;
  colorHex: string;             // brand color for avatar
  logoUrl?: string;
  joinedDate: string;
}

export interface PriceAlert {
  id: string;
  productId: string;
  productName: string;
  targetPrice: number;
  currentPrice: number;
  direction: 'below' | 'above';
  isActive: boolean;
  triggeredAt?: string;
  createdAt: string;
}

export interface UserProfile {
  id: string;
  name: string;
  businessName: string;
  email: string;
  phone: string;
  location: string;
  currency: 'KES' | 'USD' | 'EUR';
  plan: 'free' | 'business' | 'enterprise';
  role: 'user' | 'admin';
  watchlistCount: number;
  alertCount: number;
  savedVendorCount: number;
  createdAt: string;
}

export interface Notification {
  id: string;
  type: 'price_drop' | 'price_rise' | 'alert_triggered' | 'new_vendor' | 'system';
  title: string;
  body: string;
  productId?: string;
  vendorId?: string;
  isRead: boolean;
  createdAt: string;
}

export interface TickerItem {
  productId: string;
  name: string;
  price: number;
  change: number;               // percentage
  isUp: boolean;
}

export interface MarketSummary {
  totalProducts: number;
  activeVendors: number;
  avgPriceMovement: number;
  topDrops: Product[];
  topGains: Product[];
  recentUpdates: Product[];
}

// ─── Enums / Union types ──────────────────────────────────────────────────────

export type ProductCategory =
  | 'IT & Computers'
  | 'Networking'
  | 'Office Supplies'
  | 'Power'
  | 'Consumables'
  | 'Furniture'
  | 'Stationery';

export type VendorBadge = 'Verified' | 'Premium' | 'New' | 'Trusted';

export type SortOption = 'price_asc' | 'price_desc' | 'change_desc' | 'name_asc' | 'vendors_desc';

// ─── API response wrappers ────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  timestamp: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// ─── Navigation param types ───────────────────────────────────────────────────

export type RootStackParamList = {
  '(tabs)': undefined;
  'product/[id]': { id: string };
  'vendor/[id]': { id: string };
  '(auth)/login': undefined;
  '(auth)/register': undefined;
};
