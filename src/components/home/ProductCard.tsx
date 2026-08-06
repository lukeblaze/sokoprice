import React, { useState, useMemo } from 'react';
import { View, Pressable, StyleSheet, Image, type StyleProp, type ViewStyle } from 'react-native';
import { Text } from '@/components/common/Text';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, FadeInDown } from 'react-native-reanimated';
import { colors, radii, shadows, typography } from '@/theme/tokens';
import { PriceChangePill, CATEGORY_ICONS, CATEGORY_ICON_FALLBACK } from '@/components/common';
import { Sparkline } from '@/components/common/Sparkline';
import { useThemeColors } from '@/hooks/useThemeColors';
import { formatKES } from '@/utils/format';
import { getSparklinePoints } from '@/utils/mockData';
import type { Product } from '@/types';

interface Props {
  product: Product;
  onPress: () => void;
  variant?: 'horizontal' | 'vertical';
  style?: StyleProp<ViewStyle>;
  index?: number;
}

// Caps stagger to the first dozen cards so long lists don't queue up
// dozens of overlapping entrance animations.
const MAX_STAGGER_INDEX = 12;

function ProductThumb({ product, wrapStyle, iconSize }: {
  product: Product;
  wrapStyle: object;
  iconSize: number;
}) {
  const [failed, setFailed] = useState(false);
  const CategoryIcon = CATEGORY_ICONS[product.category] ?? CATEGORY_ICON_FALLBACK;

  return (
    <View style={wrapStyle}>
      {product.imageUrl && !failed ? (
        <Image
          source={{ uri: product.imageUrl }}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <CategoryIcon size={iconSize} color={colors.amber[600]} />
      )}
    </View>
  );
}

export function ProductCard({ product, onPress, variant = 'vertical', style, index }: Props) {
  const scale = useSharedValue(1);
  const [hovered, setHovered] = useState(false);
  const t = useThemeColors();
  const dyn = useMemo(() => StyleSheet.create({
    cardVertical: { backgroundColor: t.surface, borderColor: t.border },
    cardHorizontal: { backgroundColor: t.surface, borderColor: t.divider },
    name: { color: t.textPrimary },
    price: { color: t.textPrimary },
    vendors: { color: t.textSecondary },
    hName: { color: t.textPrimary },
    hMeta: { color: t.textSecondary },
    hPrice: { color: t.textPrimary },
  }), [t]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const sparkPoints = useMemo(() => getSparklinePoints(product.id), [product.id]);

  return (
    <Animated.View
      entering={
        index !== undefined
          ? FadeInDown.delay(Math.min(index, MAX_STAGGER_INDEX) * 45).springify().damping(18)
          : undefined
      }
      style={[
        variant === 'vertical' ? [styles.cardVertical, dyn.cardVertical] : [styles.cardHorizontal, dyn.cardHorizontal],
        hovered && styles.cardHovered,
        animStyle,
        style,
      ]}
    >
      <Pressable
        onPress={onPress}
        onPressIn={() => { scale.value = withSpring(0.97, { damping: 15 }); }}
        onPressOut={() => { scale.value = withSpring(1, { damping: 15 }); }}
        onHoverIn={() => setHovered(true)}
        onHoverOut={() => setHovered(false)}
        style={styles.inner}
      >
        {variant === 'vertical' ? (
          <>
            <ProductThumb product={product} wrapStyle={styles.iconWrap} iconSize={22} />
            <Text style={[styles.name, dyn.name]} numberOfLines={2}>{product.name}</Text>
            <View style={styles.priceRow}>
              <Text style={[styles.price, dyn.price]}>{formatKES(product.bestPrice)}</Text>
              {sparkPoints.length > 1 && (
                <Sparkline points={sparkPoints} width={52} height={22} />
              )}
            </View>
            <View style={styles.footer}>
              <Text style={[styles.vendors, dyn.vendors]}>{product.vendorCount} vendors</Text>
              <PriceChangePill pct={product.priceChangePct} />
            </View>
          </>
        ) : (
          <View style={styles.hRow}>
            <ProductThumb product={product} wrapStyle={styles.iconWrapSmall} iconSize={18} />
            <View style={styles.hInfo}>
              <Text style={[styles.hName, dyn.hName]} numberOfLines={1}>{product.name}</Text>
              <Text style={[styles.hMeta, dyn.hMeta]}>{product.category} · {product.vendorCount} vendors</Text>
            </View>
            {sparkPoints.length > 1 && (
              <Sparkline points={sparkPoints} width={44} height={18} />
            )}
            <View style={styles.hRight}>
              <Text style={[styles.hPrice, dyn.hPrice]}>{formatKES(product.bestPrice)}</Text>
              <PriceChangePill pct={product.priceChangePct} />
            </View>
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  cardVertical: {
    width: 160,
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    borderWidth: 0.5,
    borderColor: colors.gray[200],
    ...shadows.sm,
  },
  cardHorizontal: {
    backgroundColor: colors.white,
    borderBottomWidth: 0.5,
    borderColor: colors.gray[100],
  },
  cardHovered: {
    borderColor: colors.amber[400],
    ...shadows.md,
  },
  inner: {
    padding: 14,
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: radii.md,
    backgroundColor: colors.amber[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    overflow: 'hidden',
  },
  name: {
    fontSize: typography.sizes.base,
    fontWeight: '500',
    color: colors.navy[800],
    marginBottom: 6,
    lineHeight: 20,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  price: {
    fontSize: typography.sizes.lg,
    fontFamily: typography.displayFontMedium,
    color: colors.navy[800],
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  vendors: {
    fontSize: typography.sizes.xs,
    color: colors.gray[500],
  },
  // Horizontal
  hRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconWrapSmall: {
    width: 36,
    height: 36,
    borderRadius: radii.md,
    backgroundColor: colors.amber[50],
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    overflow: 'hidden',
  },
  hInfo: {
    flex: 1,
  },
  hName: {
    fontSize: typography.sizes.base,
    fontWeight: '500',
    color: colors.navy[800],
    marginBottom: 3,
  },
  hMeta: {
    fontSize: typography.sizes.xs,
    color: colors.gray[500],
  },
  hRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  hPrice: {
    fontSize: typography.sizes.md,
    fontFamily: typography.displayFontMedium,
    color: colors.navy[800],
  },
});
