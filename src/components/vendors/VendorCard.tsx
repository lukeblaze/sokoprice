import React, { useState, useMemo } from 'react';
import { View, Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { Text } from '@/components/common/Text';
import { CheckCircleIcon, StarIcon, MapPinIcon } from 'phosphor-react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, FadeInDown } from 'react-native-reanimated';
import { colors, radii, typography } from '@/theme/tokens';
import { VendorBadgeChip, VendorAvatar } from '@/components/common';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useTilt } from '@/hooks/useTilt';
import type { Vendor } from '@/types';

interface Props {
  vendor: Vendor;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  index?: number;
}

const MAX_STAGGER_INDEX = 12;

export function VendorCard({ vendor, onPress, style, index }: Props) {
  const scale = useSharedValue(1);
  const [hovered, setHovered] = useState(false);
  const t = useThemeColors();
  const dyn = useMemo(() => StyleSheet.create({
    card: { backgroundColor: t.surface, borderColor: t.border },
    name: { color: t.textPrimary },
    category: { color: t.textSecondary },
    rating: { color: t.textPrimary },
    reviews: { color: t.textMuted },
    dot: { backgroundColor: t.border },
    area: { color: t.textSecondary },
    products: { color: t.textMuted },
  }), [t]);
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  const tilt = useTilt(3);

  return (
    <Animated.View ref={tilt.ref} style={tilt.tiltStyle}>
    <Animated.View
      entering={
        index !== undefined
          ? FadeInDown.delay(Math.min(index, MAX_STAGGER_INDEX) * 45).springify().damping(18)
          : undefined
      }
      style={[styles.card, dyn.card, hovered && styles.cardHovered, animStyle, style]}
    >
      <Pressable
        onPress={onPress}
        onPressIn={() => { scale.value = withSpring(0.98, { damping: 15 }); }}
        onPressOut={() => { scale.value = withSpring(1, { damping: 15 }); }}
        onHoverIn={() => setHovered(true)}
        onHoverOut={() => setHovered(false)}
        style={styles.inner}
      >
        <VendorAvatar initials={vendor.initials} colorHex={vendor.colorHex} size={48} logoUrl={vendor.logoUrl} />

        <View style={styles.info}>
          <View style={styles.nameRow}>
            <Text style={[styles.name, dyn.name]} numberOfLines={1}>{vendor.name}</Text>
            {vendor.isVerified && (
              <CheckCircleIcon size={15} color={colors.green[400]} weight="fill" />
            )}
          </View>
          <Text style={[styles.category, dyn.category]} numberOfLines={1}>{vendor.category}</Text>
          <View style={styles.metaRow}>
            <StarIcon size={12} color={colors.amber[400]} weight="fill" />
            <Text style={[styles.rating, dyn.rating]}>{vendor.rating.toFixed(1)}</Text>
            <Text style={[styles.reviews, dyn.reviews]}>({vendor.reviewCount})</Text>
            <View style={[styles.dot, dyn.dot]} />
            <MapPinIcon size={12} color={t.textMuted} />
            <Text style={[styles.area, dyn.area]}>{vendor.area}</Text>
          </View>
        </View>

        <View style={styles.right}>
          <VendorBadgeChip badge={vendor.badge} />
          <Text style={[styles.products, dyn.products]}>{vendor.productCount} products</Text>
        </View>
      </Pressable>
    </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    borderWidth: 0.5,
    borderColor: colors.gray[200],
    marginHorizontal: 20,
    marginBottom: 10,
    overflow: 'hidden',
  },
  cardHovered: {
    borderColor: colors.amber[400],
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    padding: 14,
  },
  info: {
    flex: 1,
    gap: 3,
    minWidth: 0,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  name: {
    fontSize: typography.sizes.md,
    fontWeight: '500',
    color: colors.navy[800],
    flex: 1,
  },
  category: {
    fontSize: typography.sizes.xs,
    color: colors.gray[500],
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  rating: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.navy[800],
  },
  reviews: {
    fontSize: 11,
    color: colors.gray[400],
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.gray[300],
  },
  area: {
    fontSize: 11,
    color: colors.gray[500],
  },
  right: {
    alignItems: 'flex-end',
    gap: 6,
    flexShrink: 0,
  },
  products: {
    fontSize: 11,
    color: colors.gray[400],
  },
});
