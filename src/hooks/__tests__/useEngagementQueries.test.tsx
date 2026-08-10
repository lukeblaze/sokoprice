import React from 'react';
import { renderHook, waitFor, act } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  useWatchlist,
  useToggleWatchlist,
  useAlerts,
  useCreateAlert,
  useNotifications,
  useMarkNotificationRead,
} from '../useQueries';
import { engagementApi } from '@/api';
import { useAppStore } from '@/store';

jest.mock('@/api', () => ({
  engagementApi: {
    getWatchlist: jest.fn(),
    addToWatchlist: jest.fn(),
    removeFromWatchlist: jest.fn(),
    getSavedVendors: jest.fn(),
    getAlerts: jest.fn(),
    createAlert: jest.fn(),
    getNotifications: jest.fn(),
    markNotificationRead: jest.fn(),
  },
}));

function wrapper({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

describe('engagement query hooks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAppStore.setState({ isAuthenticated: true, user: null });
  });

  it('useWatchlist does not fetch when the user is signed out', () => {
    useAppStore.setState({ isAuthenticated: false });
    const { result } = renderHook(() => useWatchlist(), { wrapper });
    expect(result.current.fetchStatus).toBe('idle');
    expect(engagementApi.getWatchlist).not.toHaveBeenCalled();
  });

  it('useWatchlist returns the product ids for a signed-in user', async () => {
    (engagementApi.getWatchlist as jest.Mock).mockResolvedValueOnce(['laptop-hp-840', 'cisco-switch-24p']);
    const { result } = renderHook(() => useWatchlist(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(['laptop-hp-840', 'cisco-switch-24p']);
  });

  it('useToggleWatchlist adds when not already watchlisted', async () => {
    (engagementApi.addToWatchlist as jest.Mock).mockResolvedValueOnce(undefined);
    const { result } = renderHook(() => useToggleWatchlist(), { wrapper });

    act(() => {
      result.current.mutate({ productId: 'laptop-hp-840', isWatchlisted: false });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(engagementApi.addToWatchlist).toHaveBeenCalledWith('laptop-hp-840');
    expect(engagementApi.removeFromWatchlist).not.toHaveBeenCalled();
  });

  it('useToggleWatchlist removes when already watchlisted', async () => {
    (engagementApi.removeFromWatchlist as jest.Mock).mockResolvedValueOnce(undefined);
    const { result } = renderHook(() => useToggleWatchlist(), { wrapper });

    act(() => {
      result.current.mutate({ productId: 'laptop-hp-840', isWatchlisted: true });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(engagementApi.removeFromWatchlist).toHaveBeenCalledWith('laptop-hp-840');
    expect(engagementApi.addToWatchlist).not.toHaveBeenCalled();
  });

  it('useCreateAlert posts the alert input', async () => {
    const input = { productId: 'laptop-hp-840', targetPrice: 60000, direction: 'below' as const };
    (engagementApi.createAlert as jest.Mock).mockResolvedValueOnce({ id: 'a1', ...input });
    const { result } = renderHook(() => useCreateAlert(), { wrapper });

    act(() => {
      result.current.mutate(input);
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(engagementApi.createAlert).toHaveBeenCalledWith(input);
  });

  it('useAlerts surfaces a fetch failure', async () => {
    (engagementApi.getAlerts as jest.Mock).mockRejectedValueOnce(new Error('Network error'));
    const { result } = renderHook(() => useAlerts(), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeInstanceOf(Error);
  });

  it('useNotifications returns results and unreadCount', async () => {
    (engagementApi.getNotifications as jest.Mock).mockResolvedValueOnce({
      results: [{ id: '1', isRead: false }],
      unreadCount: 1,
    });
    const { result } = renderHook(() => useNotifications(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.unreadCount).toBe(1);
    expect(result.current.data?.results).toHaveLength(1);
  });

  it('useMarkNotificationRead calls the API with the notification id', async () => {
    (engagementApi.markNotificationRead as jest.Mock).mockResolvedValueOnce(undefined);
    const { result } = renderHook(() => useMarkNotificationRead(), { wrapper });

    act(() => {
      result.current.mutate('notif-1');
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(engagementApi.markNotificationRead).toHaveBeenCalledWith('notif-1');
  });
});
