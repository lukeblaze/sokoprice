import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import LoginScreen from '../../app/(auth)/login';
import { authApi } from '@/api';
import { useAppStore } from '@/store';
import { router } from 'expo-router';
import { showMessage } from 'react-native-flash-message';

jest.mock('@/api', () => ({
  authApi: {
    login: jest.fn(),
  },
}));

jest.mock('expo-router', () => ({
  router: { replace: jest.fn(), push: jest.fn(), back: jest.fn() },
}));

jest.mock('expo-router/head', () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock('react-native-flash-message', () => ({
  showMessage: jest.fn(),
}));

const mockUser = {
  id: 'u1',
  name: 'Blaze Murimi',
  email: 'blaze@sokoprice.co.ke',
  role: 'user',
  currency: 'KES',
  location: 'Nairobi',
  watchlistCount: 0,
  alertCount: 0,
  savedVendorCount: 0,
} as any;

describe('LoginScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAppStore.setState({ isAuthenticated: false, user: null });
  });

  it('signs the user in and navigates to the tabs on success', async () => {
    (authApi.login as jest.Mock).mockResolvedValueOnce(mockUser);
    const { getByPlaceholderText, getAllByText } = render(<LoginScreen />);

    fireEvent.changeText(getByPlaceholderText('you@company.co.ke'), 'blaze@sokoprice.co.ke');
    fireEvent.changeText(getByPlaceholderText('Your password'), 'hunter2222');
    fireEvent.press(getAllByText('Sign in')[1]);

    await waitFor(() => expect(authApi.login).toHaveBeenCalledWith('blaze@sokoprice.co.ke', 'hunter2222'));
    expect(useAppStore.getState().isAuthenticated).toBe(true);
    expect(useAppStore.getState().user).toEqual(mockUser);
    expect(router.replace).toHaveBeenCalledWith('/(tabs)');
  });

  it('shows an error toast and does not sign in on failure', async () => {
    (authApi.login as jest.Mock).mockRejectedValueOnce(new Error('Invalid email or password'));
    const { getByPlaceholderText, getAllByText } = render(<LoginScreen />);

    fireEvent.changeText(getByPlaceholderText('you@company.co.ke'), 'blaze@sokoprice.co.ke');
    fireEvent.changeText(getByPlaceholderText('Your password'), 'wrongpass');
    fireEvent.press(getAllByText('Sign in')[1]);

    await waitFor(() =>
      expect(showMessage).toHaveBeenCalledWith({ message: 'Invalid email or password', type: 'danger' })
    );
    expect(useAppStore.getState().isAuthenticated).toBe(false);
    expect(router.replace).not.toHaveBeenCalled();
  });

  it('warns instead of calling the API when fields are empty', () => {
    const { getAllByText } = render(<LoginScreen />);
    fireEvent.press(getAllByText('Sign in')[1]);

    expect(showMessage).toHaveBeenCalledWith({ message: 'Enter your email and password', type: 'warning' });
    expect(authApi.login).not.toHaveBeenCalled();
  });
});
