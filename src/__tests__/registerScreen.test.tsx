import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import RegisterScreen from '../../app/(auth)/register';
import { authApi } from '@/api';
import { useAppStore } from '@/store';
import { router } from 'expo-router';
import { showMessage } from 'react-native-flash-message';

jest.mock('@/api', () => ({
  authApi: {
    register: jest.fn(),
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
  id: 'u2',
  name: 'New Vendor',
  email: 'new@sokoprice.co.ke',
  role: 'user',
  currency: 'KES',
  location: 'Nairobi',
  watchlistCount: 0,
  alertCount: 0,
  savedVendorCount: 0,
} as any;

describe('RegisterScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAppStore.setState({ isAuthenticated: false, user: null });
  });

  it('registers, signs the user in, and navigates to the tabs on success', async () => {
    (authApi.register as jest.Mock).mockResolvedValueOnce(mockUser);
    const { getByPlaceholderText, getAllByText } = render(<RegisterScreen />);

    fireEvent.changeText(getByPlaceholderText('Blaze Murimi'), 'New Vendor');
    fireEvent.changeText(getByPlaceholderText('you@company.co.ke'), 'new@sokoprice.co.ke');
    fireEvent.changeText(getByPlaceholderText('Choose a strong password'), 'supersecret1');
    fireEvent.press(getAllByText('Create account')[1]);

    await waitFor(() =>
      expect(authApi.register).toHaveBeenCalledWith({
        name: 'New Vendor',
        businessName: undefined,
        phone: undefined,
        email: 'new@sokoprice.co.ke',
        password: 'supersecret1',
      })
    );
    expect(useAppStore.getState().isAuthenticated).toBe(true);
    expect(router.replace).toHaveBeenCalledWith('/(tabs)');
  });

  it('shows an error toast and does not sign in when the email is taken', async () => {
    (authApi.register as jest.Mock).mockRejectedValueOnce(new Error('This email is already registered'));
    const { getByPlaceholderText, getAllByText } = render(<RegisterScreen />);

    fireEvent.changeText(getByPlaceholderText('Blaze Murimi'), 'New Vendor');
    fireEvent.changeText(getByPlaceholderText('you@company.co.ke'), 'taken@sokoprice.co.ke');
    fireEvent.changeText(getByPlaceholderText('Choose a strong password'), 'supersecret1');
    fireEvent.press(getAllByText('Create account')[1]);

    await waitFor(() =>
      expect(showMessage).toHaveBeenCalledWith({ message: 'This email is already registered', type: 'danger' })
    );
    expect(useAppStore.getState().isAuthenticated).toBe(false);
  });

  it('warns instead of calling the API when required fields are empty', () => {
    const { getAllByText } = render(<RegisterScreen />);
    fireEvent.press(getAllByText('Create account')[1]);

    expect(showMessage).toHaveBeenCalledWith({ message: 'Fill in your name, email, and password', type: 'warning' });
    expect(authApi.register).not.toHaveBeenCalled();
  });
});
