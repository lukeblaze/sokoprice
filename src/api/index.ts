import axios from 'axios';
import { tokenStorage } from '@/utils/tokenStorage';
import type {
  Product, Vendor, VendorListing, PriceTrend, MarketSummary, TickerItem, UserProfile,
  PriceAlert, Notification,
} from '@/types';

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

const ACCESS_TOKEN_KEY = 'sokoprice_access_token';
const REFRESH_TOKEN_KEY = 'sokoprice_refresh_token';

// Requests to these endpoints never get an auto-refresh-and-retry — a 401
// here means "bad credentials" or "already invalid", not "expired session".
const AUTH_ENDPOINTS = ['/auth/login/', '/auth/register/', '/auth/refresh/'];

// Request interceptor — attach auth token
api.interceptors.request.use(async config => {
  const token = await tokenStorage.getItem(ACCESS_TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Extracts a human-readable message from a DRF error response — plain
// {detail} for auth failures, or the first field's first validation
// message for {field: [messages]} shaped 400s (e.g. register's
// "email: this account already exists").
function extractErrorMessage(err: any): string {
  const data = err.response?.data;
  if (typeof data === 'string' && data) return data;
  if (data?.detail) return data.detail;
  if (data?.message) return data.message;
  if (data && typeof data === 'object') {
    const firstValue = Object.values(data)[0];
    const text = Array.isArray(firstValue) ? firstValue[0] : firstValue;
    if (typeof text === 'string') return text;
  }
  return err.message ?? 'Network error';
}

// Response interceptor — silent refresh-and-retry on 401, then normalize errors
api.interceptors.response.use(
  res => res,
  async err => {
    const originalRequest = err.config;
    const isAuthEndpoint = AUTH_ENDPOINTS.some(p => originalRequest?.url?.includes(p));

    if (err.response?.status === 401 && !originalRequest?._retry && !isAuthEndpoint) {
      originalRequest._retry = true;
      const refreshToken = await tokenStorage.getItem(REFRESH_TOKEN_KEY);
      if (refreshToken) {
        try {
          const { data } = await axios.post(`${api.defaults.baseURL}/auth/refresh/`, { refresh: refreshToken });
          await tokenStorage.setItem(ACCESS_TOKEN_KEY, data.access);
          originalRequest.headers.Authorization = `Bearer ${data.access}`;
          return api(originalRequest);
        } catch {
          await tokenStorage.removeItem(ACCESS_TOKEN_KEY);
          await tokenStorage.removeItem(REFRESH_TOKEN_KEY);
        }
      }
    }

    return Promise.reject(new Error(extractErrorMessage(err)));
  }
);

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
    const { data } = await api.post<Vendor>('/vendors/', input);
    return data;
  },

  update: async (id: string, patch: Partial<VendorInput>): Promise<Vendor> => {
    const { data } = await api.patch<Vendor>(`/vendors/${id}/`, patch);
    return data;
  },

  remove: async (id: string): Promise<void> => {
    await api.delete(`/vendors/${id}/`);
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

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface RegisterInput {
  name: string;
  businessName?: string;
  phone?: string;
  email: string;
  password: string;
}

interface AuthTokens {
  access: string;
  refresh: string;
}

interface AuthResponse extends AuthTokens {
  user: UserProfile;
}

async function persistTokens(tokens: AuthTokens): Promise<void> {
  await tokenStorage.setItem(ACCESS_TOKEN_KEY, tokens.access);
  await tokenStorage.setItem(REFRESH_TOKEN_KEY, tokens.refresh);
}

export const authApi = {
  register: async (input: RegisterInput): Promise<UserProfile> => {
    const { data } = await api.post<AuthResponse>('/auth/register/', input);
    await persistTokens(data);
    return data.user;
  },

  login: async (email: string, password: string): Promise<UserProfile> => {
    const { data } = await api.post<AuthResponse>('/auth/login/', { email, password });
    await persistTokens(data);
    return data.user;
  },

  logout: async (): Promise<void> => {
    const refresh = await tokenStorage.getItem(REFRESH_TOKEN_KEY);
    if (refresh) {
      // Best-effort — the tokens are cleared locally regardless of whether
      // the server-side blacklist call succeeds (e.g. already expired).
      await api.post('/auth/logout/', { refresh }).catch(() => {});
    }
    await tokenStorage.removeItem(ACCESS_TOKEN_KEY);
    await tokenStorage.removeItem(REFRESH_TOKEN_KEY);
  },

  getMe: async (): Promise<UserProfile> => {
    const { data } = await api.get<UserProfile>('/auth/me/');
    return data;
  },

  updateMe: async (
    patch: Partial<Pick<UserProfile, 'businessName' | 'phone' | 'location' | 'currency'>>
  ): Promise<UserProfile> => {
    const { data } = await api.patch<UserProfile>('/auth/me/', patch);
    return data;
  },

  hasStoredSession: async (): Promise<boolean> => {
    return !!(await tokenStorage.getItem(ACCESS_TOKEN_KEY));
  },

  requestPasswordReset: async (email: string): Promise<void> => {
    await api.post('/auth/password-reset/', { email });
  },

  confirmPasswordReset: async (uid: string, token: string, password: string): Promise<void> => {
    await api.post('/auth/password-reset/confirm/', { uid, token, password });
  },
};

// ─── Engagement (watchlist, saved vendors, price alerts, notifications) ───────

export interface CreateAlertInput {
  productId: string;
  targetPrice: number;
  direction: 'below' | 'above';
}

export interface NotificationsResponse {
  results: Notification[];
  unreadCount: number;
}

export const engagementApi = {
  getWatchlist: async (): Promise<string[]> => {
    const { data } = await api.get<string[]>('/watchlist/');
    return data;
  },
  addToWatchlist: async (productId: string): Promise<void> => {
    await api.post('/watchlist/', { productId });
  },
  removeFromWatchlist: async (productId: string): Promise<void> => {
    await api.delete(`/watchlist/${productId}/`);
  },

  getSavedVendors: async (): Promise<string[]> => {
    const { data } = await api.get<string[]>('/saved-vendors/');
    return data;
  },
  saveVendor: async (vendorId: string): Promise<void> => {
    await api.post('/saved-vendors/', { vendorId });
  },
  unsaveVendor: async (vendorId: string): Promise<void> => {
    await api.delete(`/saved-vendors/${vendorId}/`);
  },

  getAlerts: async (): Promise<PriceAlert[]> => {
    const { data } = await api.get<PriceAlert[]>('/alerts/');
    return data;
  },
  createAlert: async (input: CreateAlertInput): Promise<PriceAlert> => {
    const { data } = await api.post<PriceAlert>('/alerts/', input);
    return data;
  },
  updateAlert: async (id: string, patch: Partial<Pick<PriceAlert, 'isActive' | 'targetPrice'>>): Promise<PriceAlert> => {
    const { data } = await api.patch<PriceAlert>(`/alerts/${id}/`, patch);
    return data;
  },
  deleteAlert: async (id: string): Promise<void> => {
    await api.delete(`/alerts/${id}/`);
  },

  getNotifications: async (): Promise<NotificationsResponse> => {
    const { data } = await api.get<NotificationsResponse>('/notifications/');
    return data;
  },
  markNotificationRead: async (id: string): Promise<Notification> => {
    const { data } = await api.post<Notification>(`/notifications/${id}/read/`);
    return data;
  },
  markAllNotificationsRead: async (): Promise<void> => {
    await api.post('/notifications/read-all/');
  },
};

export default api;
