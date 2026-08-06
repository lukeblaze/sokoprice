import { Redirect } from 'expo-router';
import { useAppStore } from '@/store';

export default function Index() {
  const isAuthenticated = useAppStore(s => s.isAuthenticated);
  const hasOnboarded = useAppStore(s => s.hasOnboarded);

  if (!hasOnboarded) return <Redirect href="/welcome" />;
  return <Redirect href={isAuthenticated ? '/(tabs)' : '/(auth)/login'} />;
}
