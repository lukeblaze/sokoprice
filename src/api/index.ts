import axios from 'axios';
import { MOCK_VENDORS } from '@/utils/mockData';
import type { Product, Vendor, VendorListing, PriceTrend, MarketSummary, TickerItem } from '@/types';

// Fields an admin fills in when adding/editing a vendor — the rest
// (id, initials, rating, reviewCount, productCount, joinedDate) are
// derived or start at zero for a brand-new listing.
export interface VendorInput {
  name: string;
  category: string;
  description?: string;
  location?: string;
  area?: string;
  badge?: Vendor['badge'];
  phone?: string;
  email?: string;
  whatsapp?: string;
  website?: string;
  openingHours?: string;
  isVerified?: boolean;
  colorHex?: string;
  logoUrl?: string;
}

// ─── Axios instance ───────────────────────────────────────────────────────────
// Replace BASE_URL with your Django backend URL when ready

const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL ?? 'https://api.sokoprice.co.ke/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Request interceptor — attach auth token
api.interceptors.request.use(config => {
  // Token will come from SecureStore in production
  // const token = SecureStore.getItemAsync('auth_token');
  // if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor — normalize errors
api.interceptors.response.use(
  res => res,
  err => {
    const message = err.response?.data?.message ?? err.message ?? 'Network error';
    return Promise.reject(new Error(message));
  }
);

// ─── Mock delay helper (still used by vendor mutations, Phase 4) ──────────────

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

// ─── Products ─────────────────────────────────────────────────────────────────

export const productsApi = {
  getAll: async (category?: string): Promise<Product[]> => {
    const { data } = await api.get<Product[]>('/products/', {
      params: category && category !== 'All' ? { category } : undefined,
    });
    return data;
  },

  getById: async (id: string): Promise<Product> => {
    const { data } = await api.get<Product>(`/products/${id}/`);
    return data;
  },

  search: async (query: string, category?: string): Promise<Product[]> => {
    const { data } = await api.get<Product[]>('/products/search/', {
      params: { q: query, ...(category && category !== 'All' ? { category } : {}) },
    });
    return data;
  },

  getTrend: async (productId: string): Promise<PriceTrend> => {
    const { data } = await api.get<PriceTrend>(`/products/${productId}/trend/`);
    return data;
  },

  getVendorListings: async (productId: string): Promise<VendorListing[]> => {
    const { data } = await api.get<VendorListing[]>(`/products/${productId}/vendors/`);
    return data;
  },
};

// ─── Vendors ──────────────────────────────────────────────────────────────────

export const vendorsApi = {
  getAll: async (): Promise<Vendor[]> => {
    const { data } = await api.get<Vendor[]>('/vendors/');
    return data;
  },

  getById: async (id: string): Promise<Vendor> => {
    const { data } = await api.get<Vendor>(`/vendors/${id}/`);
    return data;
  },

  search: async (query: string): Promise<Vendor[]> => {
    const { data } = await api.get<Vendor[]>('/vendors/search/', { params: { q: query } });
    return data;
  },

  create: async (input: VendorInput): Promise<Vendor> => {
    await delay(400);
    const slug = input.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'vendor';
    const id = `${slug}-${Date.now().toString(36).slice(-5)}`;
    const initials = input.name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase() || 'V';
    const vendor: Vendor = {
      id,
      name: input.name,
      initials,
      category: input.category,
      description: input.description ?? '',
      location: input.location ?? '',
      area: input.area ?? '',
      rating: 0,
      reviewCount: 0,
      badge: input.badge ?? 'New',
      productCount: 0,
      phone: input.phone,
      email: input.email,
      whatsapp: input.whatsapp,
      website: input.website,
      openingHours: input.openingHours ?? '',
      isVerified: input.isVerified ?? false,
      isFavorited: false,
      colorHex: input.colorHex ?? '#1a3a5c',
      logoUrl: input.logoUrl,
      joinedDate: new Date().toISOString().split('T')[0],
    };
    MOCK_VENDORS.unshift(vendor);
    return vendor;
  },

  update: async (id: string, patch: Partial<VendorInput>): Promise<Vendor> => {
    await delay(350);
    const idx = MOCK_VENDORS.findIndex(v => v.id === id);
    if (idx === -1) throw new Error('Vendor not found');
    MOCK_VENDORS[idx] = { ...MOCK_VENDORS[idx], ...patch };
    return MOCK_VENDORS[idx];
  },

  remove: async (id: string): Promise<void> => {
    await delay(300);
    const idx = MOCK_VENDORS.findIndex(v => v.id === id);
    if (idx === -1) throw new Error('Vendor not found');
    MOCK_VENDORS.splice(idx, 1);
  },
};

// ─── Market ───────────────────────────────────────────────────────────────────

export const marketApi = {
  getSummary: async (): Promise<MarketSummary> => {
    const { data } = await api.get<MarketSummary>('/market/summary/');
    return data;
  },

  getTicker: async (): Promise<TickerItem[]> => {
    const { data } = await api.get<TickerItem[]>('/market/ticker/');
    return data;
  },
};

export default api;
