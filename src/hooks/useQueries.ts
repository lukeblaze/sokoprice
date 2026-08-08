import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productsApi, vendorsApi, marketApi, authApi, type VendorInput } from '@/api';
import { useAppStore } from '@/store';

// ─── Query Keys ───────────────────────────────────────────────────────────────

export const queryKeys = {
  products: {
    all: (category?: string) => ['products', category ?? 'all'] as const,
    detail: (id: string) => ['products', id] as const,
    search: (q: string, cat?: string) => ['products', 'search', q, cat] as const,
    trend: (id: string) => ['products', id, 'trend'] as const,
    vendors: (id: string) => ['products', id, 'vendors'] as const,
  },
  vendors: {
    all: () => ['vendors'] as const,
    detail: (id: string) => ['vendors', id] as const,
    search: (q: string) => ['vendors', 'search', q] as const,
  },
  market: {
    summary: () => ['market', 'summary'] as const,
    ticker: () => ['market', 'ticker'] as const,
  },
  auth: {
    me: () => ['auth', 'me'] as const,
  },
};

// ─── Products ─────────────────────────────────────────────────────────────────

export function useProducts(category?: string) {
  return useQuery({
    queryKey: queryKeys.products.all(category),
    queryFn: () => productsApi.getAll(category),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: queryKeys.products.detail(id),
    queryFn: () => productsApi.getById(id),
    staleTime: 1000 * 60 * 1,
    enabled: !!id,
  });
}

export function useProductSearch(query: string, category?: string) {
  return useQuery({
    queryKey: queryKeys.products.search(query, category),
    queryFn: () => productsApi.search(query, category),
    staleTime: 1000 * 30,
    enabled: true,
  });
}

export function useProductTrend(productId: string) {
  return useQuery({
    queryKey: queryKeys.products.trend(productId),
    queryFn: () => productsApi.getTrend(productId),
    staleTime: 1000 * 60 * 5,
    enabled: !!productId,
  });
}

export function useVendorListings(productId: string) {
  return useQuery({
    queryKey: queryKeys.products.vendors(productId),
    queryFn: () => productsApi.getVendorListings(productId),
    staleTime: 1000 * 60 * 2,
    enabled: !!productId,
  });
}

// ─── Vendors ──────────────────────────────────────────────────────────────────

export function useVendors() {
  return useQuery({
    queryKey: queryKeys.vendors.all(),
    queryFn: vendorsApi.getAll,
    staleTime: 1000 * 60 * 5,
  });
}

export function useVendor(id: string) {
  return useQuery({
    queryKey: queryKeys.vendors.detail(id),
    queryFn: () => vendorsApi.getById(id),
    staleTime: 1000 * 60 * 5,
    enabled: !!id,
  });
}

export function useVendorSearch(query: string) {
  return useQuery({
    queryKey: queryKeys.vendors.search(query),
    queryFn: () => vendorsApi.search(query),
    staleTime: 1000 * 30,
  });
}

export function useCreateVendor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: VendorInput) => vendorsApi.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.vendors.all() });
    },
  });
}

export function useUpdateVendor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<VendorInput> }) => vendorsApi.update(id, patch),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.vendors.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.vendors.detail(variables.id) });
    },
  });
}

export function useDeleteVendor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => vendorsApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.vendors.all() });
    },
  });
}

// ─── Market ───────────────────────────────────────────────────────────────────

export function useMarketSummary() {
  return useQuery({
    queryKey: queryKeys.market.summary(),
    queryFn: marketApi.getSummary,
    staleTime: 1000 * 60 * 2,
    refetchInterval: 1000 * 60 * 5, // auto-refresh every 5 min
  });
}

export function useMarketTicker() {
  return useQuery({
    queryKey: queryKeys.market.ticker(),
    queryFn: marketApi.getTicker,
    staleTime: 1000 * 60,
    refetchInterval: 1000 * 60 * 3,
  });
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export function useMe() {
  const isAuthenticated = useAppStore(s => s.isAuthenticated);
  const signIn = useAppStore(s => s.signIn);
  return useQuery({
    queryKey: queryKeys.auth.me(),
    queryFn: async () => {
      const user = await authApi.getMe();
      signIn(user); // keep the store's copy in sync (role, counts, etc.)
      return user;
    },
    staleTime: 1000 * 60,
    enabled: isAuthenticated,
  });
}

export function useUpdateMe() {
  const queryClient = useQueryClient();
  const signIn = useAppStore(s => s.signIn);
  return useMutation({
    mutationFn: authApi.updateMe,
    onSuccess: (user) => {
      signIn(user);
      queryClient.setQueryData(queryKeys.auth.me(), user);
    },
  });
}
