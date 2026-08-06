import React from 'react';
import { View, StyleSheet, type ViewStyle, type StyleProp } from 'react-native';
import { useBreakpoint } from '@/hooks/useResponsive';

const MAX_CONTENT_WIDTH = 1200;

interface Props {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

// Centers content with a max width on wide screens so it doesn't stretch
// edge-to-edge at desktop resolutions. No-op on mobile/tablet.
export function ResponsiveContainer({ children, style }: Props) {
  const { isDesktop } = useBreakpoint();
  if (!isDesktop) return <>{children}</>;
  return (
    <View style={styles.outer}>
      <View style={[styles.inner, style]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    width: '100%',
    alignItems: 'center',
  },
  inner: {
    width: '100%',
    maxWidth: MAX_CONTENT_WIDTH,
  },
});
