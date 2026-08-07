import React from 'react';
import { Stack, Redirect } from 'expo-router';
import { useAppStore } from '@/store';

export default function AdminLayout() {
  const isAdmin = useAppStore(s => s.isAdmin);

  // Real auth would derive this server-side; here it's a mock flag
  // (Profile > Preferences > Admin access) so the route is only
  // reachable when it's actually meant to be.
  if (!isAdmin) {
    return <Redirect href="/(tabs)/profile" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="vendor-form" options={{ presentation: 'card', animation: 'slide_from_right' }} />
    </Stack>
  );
}
