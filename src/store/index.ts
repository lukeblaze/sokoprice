import { create } from 'zustand';
import type { UserProfile } from '@/types';

// ─── App Store ────────────────────────────────────────────────────────────────
// Server state (products, vendors, watchlist, saved vendors, alerts,
// notifications) lives in React Query — see src/hooks/useQueries.ts. This
// store holds only session/local-UI state that has no backend counterpart.

interface AppState {
  // Auth
  isAuthenticated: boolean;
  user: UserProfile | null;
  signIn: (user: UserProfile) => void;
  signOut: () => void;

  // Onboarding — has this session seen the welcome/advert screen yet
  hasOnboarded: boolean;
  completeOnboarding: () => void;

  // Preferences
  colorScheme: 'light' | 'dark' | 'system';
  setColorScheme: (scheme: 'light' | 'dark' | 'system') => void;
  setUserLocation: (location: string) => void;
  setUserCurrency: (currency: UserProfile['currency']) => void;

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

export const useAppStore = create<AppState>((set) => ({
  // Auth
  isAuthenticated: false,
  user: null,
  signIn: (user) => set({ isAuthenticated: true, user }),
  signOut: () => set({ isAuthenticated: false, user: null }),

  hasOnboarded: false,
  completeOnboarding: () => set({ hasOnboarded: true }),

  // Preferences
  colorScheme: 'light',
  setColorScheme: (scheme) => set({ colorScheme: scheme }),
  setUserLocation: (location) => set(s => ({ user: s.user ? { ...s.user, location } : s.user })),
  setUserCurrency: (currency) => set(s => ({ user: s.user ? { ...s.user, currency } : s.user })),

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
