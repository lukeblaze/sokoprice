import React, { useEffect, useRef } from 'react';
import {
  View,
  ScrollView,
  Animated,
  StyleSheet,
  Easing,
} from 'react-native';
import { Text } from '@/components/common/Text';
import { colors, typography } from '@/theme/tokens';
import { formatKES } from '@/utils/format';
import type { TickerItem } from '@/types';

interface Props {
  items: TickerItem[];
}

export function PriceTicker({ items }: Props) {
  const scrollX = useRef(new Animated.Value(0)).current;
  const containerWidth = useRef(0);
  const contentWidth = useRef(0);
  const animRef = useRef<Animated.CompositeAnimation | null>(null);

  // Double items so we can loop seamlessly
  const doubled = [...items, ...items];

  const startAnimation = () => {
    if (contentWidth.current === 0) return;
    const halfWidth = contentWidth.current / 2;
    scrollX.setValue(0);
    animRef.current = Animated.loop(
      Animated.timing(scrollX, {
        toValue: -halfWidth,
        duration: halfWidth * 25, // speed: 25ms per px
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    animRef.current.start();
  };

  useEffect(() => {
    return () => { animRef.current?.stop(); };
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.liveLabel}>
        <Text style={styles.liveLabelText}>LIVE</Text>
      </View>

      <View
        style={styles.trackWrap}
        onLayout={e => {
          containerWidth.current = e.nativeEvent.layout.width;
        }}
      >
        <Animated.View
          style={[styles.track, { transform: [{ translateX: scrollX }] }]}
          onLayout={e => {
            contentWidth.current = e.nativeEvent.layout.width;
            startAnimation();
          }}
        >
          {doubled.map((item, i) => (
            <View key={`${item.productId}-${i}`} style={styles.tickerItem}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemPrice}>{formatKES(item.price)}</Text>
              <Text style={[styles.itemChange, item.isUp ? styles.up : styles.dn]}>
                {item.isUp ? '▲' : '▼'} {Math.abs(item.change).toFixed(1)}%
              </Text>
              <View style={styles.dot} />
            </View>
          ))}
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 32,
    backgroundColor: colors.navy[800],
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(255,255,255,0.08)',
  },
  liveLabel: {
    height: '100%',
    paddingHorizontal: 10,
    backgroundColor: colors.amber[400],
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  liveLabelText: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.navy[800],
    letterSpacing: 1,
  },
  trackWrap: {
    flex: 1,
    overflow: 'hidden',
    height: '100%',
  },
  track: {
    flexDirection: 'row',
    alignItems: 'center',
    height: '100%',
  },
  tickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    height: '100%',
    borderRightWidth: 0.5,
    borderRightColor: 'rgba(255,255,255,0.1)',
  },
  itemName: {
    fontSize: typography.sizes.xs,
    color: 'rgba(255,255,255,0.6)',
  },
  itemPrice: {
    fontSize: typography.sizes.xs,
    color: colors.white,
    fontWeight: '500',
  },
  itemChange: {
    fontSize: 10,
    fontWeight: '500',
  },
  up: { color: colors.green[400] },
  dn: { color: colors.red[400] },
  dot: {
    display: 'none',
  },
});
