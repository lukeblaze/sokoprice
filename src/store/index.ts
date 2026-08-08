import { create } from 'zustand';
import type { Product, Vendor, PriceAlert, Notification, UserProfile } from '@/types';

// ─── App Store ────────────────────────────────────────────────────────────────

interface AppState {
  // Auth
  isAuthenticated: boolean;
  user: UserProfile | null;
  signIn: (user: UserProfile) => void;
  signOut: () => void;

  // Admin — gates /admin/* routes. Real auth would derive this from the
  // signed-in account's role; this is a settable mock flag for now.
  isAdmin: boolean;
  setIsAdmin: (isAdmin: boolean) => void;

  // Onboarding — has this session seen the welcome/advert screen yet
  hasOnboarded: boolean;
  completeOnboarding: () => void;

  // Preferences
  colorScheme: 'light' | 'dark' | 'system';
  setColorScheme: (scheme: 'light' | 'dark' | 'system') => void;
  setUserLocation: (location: string) => void;
  setUserCurrency: (currency: UserProfile['currency']) => void;

  // Watchlist
  watchlistIds: Set<string>;
  addToWatchlist: (id: string) => void;
  removeFromWatchlist: (id: string) => void;
  toggleWatchlist: (id: string) => void;
  isWatchlisted: (id: string) => boolean;

  // Saved vendors
  savedVendorIds: Set<string>;
  toggleSavedVendor: (id: string) => void;
  isSavedVendor: (id: string) => boolean;

  // Price alerts
  alerts: PriceAlert[];
  addAlert: (alert: PriceAlert) => void;
  removeAlert: (id: string) => void;
  toggleAlert: (id: string) => void;

  // Notifications
  notifications: Notification[];
  unreadCount: number;
  markNotificationRead: (id: string) => void;
  markAllRead: () => void;
  addNotification: (n: Notification) => void;

  // Search
  recentSearches: string[];
  addRecentSearch: (query: string) => void;
  clearRecentSearches: () => void;

  // UI state
  activeFilter: string;
  setActiveFilter: (f: string) => void;
  selectedCategory: string | null;
  setSelectedCategory: (c: string | null) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  // Auth
  isAuthenticated: false,
  user: null,
  signIn: (user) => set({ isAuthenticated: true, user }),
  signOut: () => set(s => ({
    isAuthenticated: false,
    user: null,
    watchlistIds: new Set(),
    savedVendorIds: new Set(),
  })),

  isAdmin: true, // default on for this prototype — flip off in Profile to test the gate
  setIsAdmin: (isAdmin) => set({ isAdmin }),

  hasOnboarded: false,
  completeOnboarding: () => set({ hasOnboarded: true }),

  // Preferences
  colorScheme: 'light',
  setColorScheme: (scheme) => set({ colorScheme: scheme }),
  setUserLocation: (location) => set(s => ({ user: s.user ? { ...s.user, location } : s.user })),
  setUserCurrency: (currency) => set(s => ({ user: s.user ? { ...s.user, currency } : s.user })),

  // Watchlist
  watchlistIds: new Set(['laptop-hp-840', 'ups-apc-650va']),
  addToWatchlist: (id) => set(s => ({ watchlistIds: new Set([...s.watchlistIds, id]) })),
  removeFromWatchlist: (id) => set(s => {
    const next = new Set(s.watchlistIds);
    next.delete(id);
    return { watchlistIds: next };
  }),
  toggleWatchlist: (id) => {
    const { isWatchlisted, addToWatchlist, removeFromWatchlist } = get();
    if (isWatchlisted(id)) removeFromWatchlist(id);
    else addToWatchlist(id);
  },
  isWatchlisted: (id) => get().watchlistIds.has(id),

  // Saved vendors
  savedVendorIds: new Set(['ms-computers']),
  toggleSavedVendor: (id) => set(s => {
    const next = new Set(s.savedVendorIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    return { savedVendorIds: next };
  }),
  isSavedVendor: (id) => get().savedVendorIds.has(id),

  // Alerts
  alerts: [
    {
      id: 'alert-1',
      productId: 'toner-cf230a',
      productName: 'HP CF230A Toner',
      targetPrice: 3000,
      currentPrice: 3200,
      direction: 'below',
      isActive: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'alert-2',
      productId: 'laptop-hp-840',
      productName: 'HP EliteBook 840 G8',
      targetPrice: 75000,
      currentPrice: 78500,
      direction: 'below',
      isActive: true,
      createdAt: new Date().toISOString(),
    },
  ],
  addAlert: (alert) => set(s => ({ alerts: [...s.alerts, alert] })),
  removeAlert: (id) => set(s => ({ alerts: s.alerts.filter(a => a.id !== id) })),
  toggleAlert: (id) => set(s => ({
    alerts: s.alerts.map(a => a.id === id ? { ...a, isActive: !a.isActive } : a),
  })),

  // Notifications
  notifications: [
    {
      id: 'notif-1',
      type: 'price_drop',
      title: 'Price dropped — CF230A Toner',
      body: 'Almiria Solutions: KES 3,200. Down 8% from last week.',
      productId: 'toner-cf230a',
      isRead: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
    },
    {
      id: 'notif-2',
      type: 'new_vendor',
      title: 'New vendor in your area',
      body: 'Almiria Solutions has joined SokoPrice with 29 products.',
      vendorId: 'almiria',
      isRead: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    },
    {
      id: 'notif-3',
      type: 'price_drop',
      title: 'CAT6 Cable price dipped',
      body: 'Gadgetronix Kenya: KES 8,900 — 3.2% lower than yesterday.',
      productId: 'cable-cat6-305m',
      isRead: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    },
  ],
  unreadCount: 2,
  markNotificationRead: (id) => set(s => ({
    notifications: s.notifications.map(n => n.id === id ? { ...n, isRead: true } : n),
    unreadCount: Math.max(0, s.unreadCount - 1),
  })),
  markAllRead: () => set(s => ({
    notifications: s.notifications.map(n => ({ ...n, isRead: true })),
    unreadCount: 0,
  })),
  addNotification: (n) => set(s => ({
    notifications: [n, ...s.notifications],
    unreadCount: s.unreadCount + (n.isRead ? 0 : 1),
  })),

  // Search
  recentSearches: ['HP toner', 'CAT6 cable', 'Cisco switch'],
  addRecentSearch: (query) => set(s => ({
    recentSearches: [query, ...s.recentSearches.filter(q => q !== query)].slice(0, 10),
  })),
  clearRecentSearches: () => set({ recentSearches: [] }),

  // UI
  activeFilter: 'All',
  setActiveFilter: (f) => set({ activeFilter: f }),
  selectedCategory: null,
  setSelectedCategory: (c) => set({ selectedCategory: c }),
}));
