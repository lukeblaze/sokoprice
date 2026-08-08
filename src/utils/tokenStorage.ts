import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

// expo-secure-store has no native web implementation (its web module is an
// empty stub), so calling it on web throws. Web builds are our primary
// deployed target (Vercel), so fall back to localStorage there — tokens
// aren't sensitive server secrets, just this browser's own session.
const isWeb = Platform.OS === 'web';

export const tokenStorage = {
  async getItem(key: string): Promise<string | null> {
    if (isWeb) {
      return typeof localStorage !== 'undefined' ? localStorage.getItem(key) : null;
    }
    return SecureStore.getItemAsync(key);
  },

  async setItem(key: string, value: string): Promise<void> {
    if (isWeb) {
      if (typeof localStorage !== 'undefined') localStorage.setItem(key, value);
      return;
    }
    await SecureStore.setItemAsync(key, value);
  },

  async removeItem(key: string): Promise<void> {
    if (isWeb) {
      if (typeof localStorage !== 'undefined') localStorage.removeItem(key);
      return;
    }
    await SecureStore.deleteItemAsync(key);
  },
};
