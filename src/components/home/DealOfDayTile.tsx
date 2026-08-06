import React, { useState } from 'react';
import { View, Pressable, StyleSheet, Image } from 'react-native';
import { Text } from '@/components/common/Text';
import { LinearGradient } from 'expo-linear-gradient';
import { LightningIcon, ArrowRightIcon } from 'phosphor-react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { colors, radii, typography } from '@/theme/tokens';
import { usePressScale } from '@/hooks/usePressScale';
import { CATEGORY_ICONS, CATEGORY_ICON_FALLBACK } from '@/components/common';
import { formatKES } from '@/utils/format';
import type { Product } from '@/types';

interface Props {
  product: Product;
  onPress: () => void;
  style?: object;
}

export function DealOfDayTile({ product, onPress, style }: Props) {
  const [imgFailed, setImgFailed] = useState(false);
  const press = usePressScale(0.985);
  const CategoryIcon = CATEGORY_ICONS[product.category] ?? CATEGORY_ICON_FALLBACK;
  const isDrop = product.priceChangePct < 0;

  return (
    <Animated.View entering={FadeIn.duration(400)} style={[press.animStyle, style]}>
      <Pressable
        onPress={onPress}
        onPressIn={press.onPressIn}
        onPressOut={press.onPressOut}
        style={styles.tile}
      >
        {product.imageUrl && !imgFailed ? (
          <Image
            source={{ uri: product.imageUrl }}
            style={StyleSheet.absoluteFill}
            resizeMode="cover"
            onError={() => setImgFailed(true)}
          />
        ) : (
          <View style={[StyleSheet.absoluteFill, styles.iconFallback]}>
            <CategoryIcon size={72} color="rgba(232,160,32,0.35)" />
          </View>
        )}
        <LinearGradient
          colors={['rgba(13,27,42,0.35)', 'rgba(13,27,42,0.85)', 'rgba(8,15,23,0.97)']}
          locations={[0, 0.55, 1]}
          style={StyleSheet.absoluteFill}
        />

        <View style={styles.eyebrowRow}>
          <View style={styles.eyebrowChip}>
            <LightningIcon size={12} color={colors.navy[800]} weight="fill" />
            <Text style={styles.eyebrowText}>Deal of the day</Text>
          </View>
          {isDrop && (
            <View style={styles.changeChip}>
              <Text style={styles.changeChipText}>{product.priceChangePct.toFixed(1)}%</Text>
            </View>
          )}
        </View>

        <View style={styles.bottom}>
          <Text style={styles.name} numberOfLines={2}>{product.name}</Text>
          <View style={styles.priceRow}>
            <Text style={styles.price}>{formatKES(product.bestPrice)}</Text>
            <Text style={styles.was}>was {formatKES(product.avgPrice)}</Text>
          </View>
          <View style={styles.ctaRow}>
            <Text style={styles.ctaText}>{product.vendorCount} vendors comparing</Text>
            <ArrowRightIcon size={14} color={colors.amber[400]} />
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  tile: {
    height: 200,
    borderRadius: radii.xl,
    overflow: 'hidden',
    backgroundColor: colors.navy[800],
    justifyContent: 'space-between',
    padding: 18,
  },
  iconFallback: {
    backgroundColor: colors.navy[700],
    alignItems: 'center',
    justifyContent: 'center',
  },
  eyebrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  eyebrowChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.amber[400],
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radii.full,
    alignSelf: 'flex-start',
  },
  eyebrowText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.navy[800],
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  changeChip: {
    backgroundColor: 'rgba(74,222,128,0.18)',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: radii.full,
  },
  changeChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4ADE80',
  },
  bottom: {
    gap: 4,
  },
  name: {
    fontSize: typography.sizes.xl,
    fontFamily: typography.displayFont,
    color: colors.white,
    lineHeight: 24,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  price: {
    fontSize: typography.sizes['3xl'],
    fontFamily: typography.displayFont,
    color: colors.amber[400],
  },
  was: {
    fontSize: typography.sizes.sm,
    color: 'rgba(255,255,255,0.4)',
    textDecorationLine: 'line-through',
  },
  ctaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  ctaText: {
    fontSize: typography.sizes.xs,
    color: 'rgba(255,255,255,0.55)',
  },
});
