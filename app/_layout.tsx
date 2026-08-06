import React, { useEffect } from 'react';
import { View, useColorScheme as useSystemColorScheme } from 'react-native';
import { Stack } from 'expo-router';
import { PaperProvider } from 'react-native-paper';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import FlashMessage from 'react-native-flash-message';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import { IconContext } from 'phosphor-react-native';
import {
  SpaceGrotesk_500Medium,
  SpaceGrotesk_700Bold,
} from '@expo-google-fonts/space-grotesk';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
} from '@expo-google-fonts/inter';
import { Anton_400Regular } from '@expo-google-fonts/anton';
import { lightTheme, darkTheme } from '@/theme';
import { colors } from '@/theme/tokens';
import { useAppStore } from '@/store';
import { CommandPalette } from '@/components/common/CommandPalette';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 10000),
    },
  },
});

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    SpaceGrotesk_500Medium,
    SpaceGrotesk_700Bold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Anton_400Regular,
  });

  const colorScheme = useAppStore(s => s.colorScheme);
  const systemScheme = useSystemColorScheme();
  const isDark = colorScheme === 'system' ? systemScheme === 'dark' : colorScheme === 'dark';

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <IconContext.Provider value={{ weight: 'duotone' }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <PaperProvider theme={isDark ? darkTheme : lightTheme}>
            <BottomSheetModalProvider>
            <StatusBar style="light" backgroundColor={colors.navy[800]} />
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="index" />
              <Stack.Screen name="welcome" />
              <Stack.Screen name="(tabs)" />
              <Stack.Screen
                name="(auth)"
                options={{ animation: 'slide_from_bottom' }}
              />
              <Stack.Screen
                name="product/[id]"
                options={{
                  presentation: 'card',
                  animation: 'slide_from_right',
                }}
              />
              <Stack.Screen
                name="vendor/[id]"
                options={{
                  presentation: 'card',
                  animation: 'slide_from_right',
                }}
              />
            </Stack>
            <FlashMessage position="top" />
            <CommandPalette />
            </BottomSheetModalProvider>
          </PaperProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
      </IconContext.Provider>
    </GestureHandlerRootView>
  );
}
