import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { Text } from '@/components/common/Text';
import { CheckCircleIcon, StarIcon, MapPinIcon } from 'phosphor-react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { colors, radii, typography } from '@/theme/tokens';
import { VendorBadgeChip, VendorAvatar } from '@/components/common';
import type { Vendor } from '@/types';

interface Props {
  vendor: Vendor;
  onPress: () => void;
}

export function VendorCard({ vendor, onPress }: Props) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[styles.card, animStyle]}>
      <Pressable
        onPress={onPress}
        onPressIn={() => { scale.value = withSpring(0.98, { damping: 15 }); }}
        onPressOut={() => { scale.value = withSpring(1, { damping: 15 }); }}
        style={styles.inner}
      >
        <VendorAvatar initials={vendor.initials} colorHex={vendor.colorHex} size={48} logoUrl={vendor.logoUrl} />

        <View style={styles.info}>
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={1}>{vendor.name}</Text>
            {vendor.isVerified && (
              <CheckCircleIcon size={15} color={colors.green[400]} weight="fill" />
            )}
          </View>
          <Text style={styles.category} numberOfLines={1}>{vendor.category}</Text>
          <View style={styles.metaRow}>
            <StarIcon size={12} color={colors.amber[400]} weight="fill" />
            <Text style={styles.rating}>{vendor.rating.toFixed(1)}</Text>
            <Text style={styles.reviews}>({vendor.reviewCount})</Text>
            <View style={styles.dot} />
            <MapPinIcon size={12} color={colors.gray[400]} />
            <Text style={styles.area}>{vendor.area}</Text>
          </View>
        </View>

        <View style={styles.right}>
          <VendorBadgeChip badge={vendor.badge} />
          <Text style={styles.products}>{vendor.productCount} products</Text>
        </View>
      </Pressable>
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
