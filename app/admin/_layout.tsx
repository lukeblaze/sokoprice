import React from 'react';
import { Stack } from 'expo-router';

export default function AdminLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="vendor-form" options={{ presentation: 'card', animation: 'slide_from_right' }} />
    </Stack>
  );
}
