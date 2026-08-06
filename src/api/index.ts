import axios from 'axios';
import {
  MOCK_PRODUCTS,
  MOCK_VENDORS,
  MOCK_VENDOR_LISTINGS,
  MOCK_TRENDS,
  MOCK_MARKET_SUMMARY,
  MOCK_TICKER,
} from '@/utils/mockData';
import type { Product, Vendor, VendorListing, PriceTrend, MarketSummary, TickerItem } from '@/types';

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

// ─── Mock delay helper ────────────────────────────────────────────────────────

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

// ─── Products ─────────────────────────────────────────────────────────────────

export const productsApi = {
  getAll: async (category?: string): Promise<Product[]> => {
    await delay(400);
    if (category && category !== 'All') {
      return MOCK_PRODUCTS.filter(p => p.category === category);
    }
    return MOCK_PRODUCTS;
  },

  getById: async (id: string): Promise<Product> => {
    await delay(250);
    const product = MOCK_PRODUCTS.find(p => p.id === id);
    if (!product) throw new Error('Product not found');
    return product;
  },

  search: async (query: string, category?: string): Promise<Product[]> => {
    await delay(300);
    let results = MOCK_PRODUCTS;
    if (category && category !== 'All') {
      results = results.filter(p => p.category === category);
    }
    if (query.trim()) {
      const q = query.toLowerCase();
      results = results.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.tags.some(t => t.toLowerCase().includes(q))
      );
    }
    return results;
  },

  getTrend: async (productId: string): Promise<PriceTrend> => {
    await delay(300);
    const trend = MOCK_TRENDS[productId];
    if (!trend) {
      // Generate on the fly for products without explicit trend data
      const product = MOCK_PRODUCTS.find(p => p.id === productId);
      if (!product) throw new Error('Product not found');
      const points = [];
      let price = product.bestPrice * 1.05;
      for (let i = 30; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        price = price + (product.bestPrice - price) * 0.08 + (Math.random() - 0.5) * product.bestPrice * 0.01;
        points.push({ date: d.toISOString().split('T')[0], avgPrice: Math.round(price), minPrice: Math.round(price * 0.97) });
      }
      return { productId, period: '30d', dataPoints: points };
    }
    return trend;
  },

  getVendorListings: async (productId: string): Promise<VendorListing[]> => {
    await delay(350);
    return MOCK_VENDOR_LISTINGS[productId] ?? [];
  },
};

// ─── Vendors ──────────────────────────────────────────────────────────────────

export const vendorsApi = {
  getAll: async (): Promise<Vendor[]> => {
    await delay(400);
    return MOCK_VENDORS;
  },

  getById: async (id: string): Promise<Vendor> => {
    await delay(250);
    const vendor = MOCK_VENDORS.find(v => v.id === id);
    if (!vendor) throw new Error('Vendor not found');
    return vendor;
  },

  search: async (query: string): Promise<Vendor[]> => {
    await delay(300);
    if (!query.trim()) return MOCK_VENDORS;
    const q = query.toLowerCase();
    return MOCK_VENDORS.filter(v =>
      v.name.toLowerCase().includes(q) ||
      v.category.toLowerCase().includes(q) ||
      v.area.toLowerCase().includes(q)
    );
  },
};

// ─── Market ───────────────────────────────────────────────────────────────────

export const marketApi = {
  getSummary: async (): Promise<MarketSummary> => {
    await delay(400);
    return MOCK_MARKET_SUMMARY;
  },

  getTicker: async (): Promise<TickerItem[]> => {
    await delay(200);
    return MOCK_TICKER;
  },
};

export default api;
