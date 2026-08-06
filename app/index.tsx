import { Redirect } from 'expo-router';
import { useAppStore } from '@/store';

export default function Index() {
  const isAuthenticated = useAppStore(s => s.isAuthenticated);
  return <Redirect href={isAuthenticated ? '/(tabs)' : '/(auth)/login'} />;
}
