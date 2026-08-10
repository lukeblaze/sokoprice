import React from 'react';
import { Stack, Redirect } from 'expo-router';
import { useMe } from '@/hooks/useQueries';
import { LoadingSpinner } from '@/components/common';

export default function AdminLayout() {
  const { data: user, isLoading } = useMe();

  // Wait for the real role to resolve before deciding — redirecting
  // while `user` is merely still loading would bounce a legitimate
  // admin out before their role is known.
  if (isLoading) return <LoadingSpinner />;

  if (user?.role !== 'admin') {
    return <Redirect href="/(tabs)/profile" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="vendor-form" options={{ presentation: 'card', animation: 'slide_from_right' }} />
    </Stack>
  );
}
