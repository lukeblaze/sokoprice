import React, { useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator, Pressable, Image, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Text } from './Text';
import { useThemeColors } from '@/hooks/useThemeColors';
import {
  LaptopIcon,
  WifiHighIcon,
  BriefcaseIcon,
  LightningIcon,
  PrinterIcon,
  FileTextIcon,
  ArmchairIcon,
  CubeIcon,
  type IconProps,
} from 'phosphor-react-native';
import { colors, radii, typography } from '@/theme/tokens';
import type { VendorBadge } from '@/types';

// ─── Badge ────────────────────────────────────────────────────────────────────

const BADGE_STYLES: Record<VendorBadge, { bg: string; text: string }> = {
  Premium:  { bg: colors.amber[50],   text: colors.amber[700] },
  Verified: { bg: colors.green[50],   text: colors.green[800] },
  Trusted:  { bg: colors.navy[50],    text: colors.navy[700] },
  New:      { bg: colors.gray[100],   text: colors.gray[600] },
};

export function VendorBadgeChip({ badge }: { badge: VendorBadge }) {
  const style = BADGE_STYLES[badge];
  return (
    <View style={[styles.badge, { backgroundColor: style.bg }]}>
      <Text style={[styles.badgeText, { color: style.text }]}>{badge}</Text>
    </View>
  );
}

// ─── Price change pill ────────────────────────────────────────────────────────

export function PriceChangePill({ pct, size = 'sm' }: { pct: number; size?: 'sm' | 'md' }) {
  const isUp = pct >= 0;
  const bg  = isUp ? colors.green[50]  : colors.red[50];
  const fg  = isUp ? colors.green[600] : colors.red[600];
  const arrow = isUp ? '▲' : '▼';
  const fontSize = size === 'md' ? 13 : 11;

  return (
    <View style={[styles.pricePill, { backgroundColor: bg }]}>
      <Text style={[styles.pricePillText, { color: fg, fontSize }]}>
        {arrow} {Math.abs(pct).toFixed(1)}%
      </Text>
    </View>
  );
}

// ─── Tag chip ─────────────────────────────────────────────────────────────────

export function TagChip({ label }: { label: string }) {
  return (
    <View style={styles.tagChip}>
      <Text style={styles.tagChipText}>{label}</Text>
    </View>
  );
}

// ─── Section label ────────────────────────────────────────────────────────────

export function SectionLabel({ children }: { children: string }) {
  return <Text style={styles.sectionLabel}>{children}</Text>;
}

// ─── Vendor avatar ────────────────────────────────────────────────────────────

export function VendorAvatar({ initials, colorHex, size = 46, logoUrl }: {
  initials: string;
  colorHex: string;
  size?: number;
  logoUrl?: string;
}) {
  const [failed, setFailed] = React.useState(false);
  const bg = colorHex + '22'; // 13% opacity
  return (
    <View style={[styles.vendorAvatar, { width: size, height: size, borderRadius: radii.md, backgroundColor: bg, overflow: 'hidden' }]}>
      {logoUrl && !failed ? (
        <Image
          source={{ uri: logoUrl }}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <Text style={[styles.vendorAvatarText, { color: colorHex, fontSize: size * 0.33 }]}>
          {initials}
        </Text>
      )}
    </View>
  );
}

// ─── Category icon mapping ────────────────────────────────────────────────────

export const CATEGORY_ICONS: Record<string, React.ComponentType<IconProps>> = {
  'IT & Computers':  LaptopIcon,
  'Networking':      WifiHighIcon,
  'Office Supplies': BriefcaseIcon,
  'Power':           LightningIcon,
  'Consumables':     PrinterIcon,
  'Stationery':      FileTextIcon,
  'Furniture':       ArmchairIcon,
};

export const CATEGORY_ICON_FALLBACK = CubeIcon;

// ─── Loading spinner ──────────────────────────────────────────────────────────

export function LoadingSpinner({ size = 24 }: { size?: number }) {
  return (
    <View style={styles.spinnerWrap}>
      <ActivityIndicator size={size} color={colors.amber[400]} />
    </View>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

export function EmptyState({
  title,
  subtitle,
  actionLabel,
  onAction,
}: {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  const t = useThemeColors();
  return (
    <View style={styles.emptyState}>
      <Text style={[styles.emptyTitle, { color: t.textPrimary }]}>{title}</Text>
      {subtitle && <Text style={[styles.emptySubtitle, { color: t.textSecondary }]}>{subtitle}</Text>}
      {actionLabel && onAction && (
        <Pressable onPress={onAction} style={styles.emptyAction}>
          <Text style={styles.emptyActionText}>{actionLabel}</Text>
        </Pressable>
      )}
    </View>
  );
}

// ─── Divider ──────────────────────────────────────────────────────────────────

export function Divider() {
  return <View style={styles.divider} />;
}

// ─── Skeleton (shimmer loading placeholder) ───────────────────────────────────

export function Skeleton({ width, height, radius = radii.md, style }: {
  width: number;
  height: number;
  radius?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const shimmer = useSharedValue(0);
  const t = useThemeColors();

  useEffect(() => {
    shimmer.value = withRepeat(
      withTiming(1, { duration: 1100, easing: Easing.inOut(Easing.ease) }),
      -1,
      false
    );
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: (shimmer.value * 2 - 1) * width }],
  }));

  return (
    <View style={[{ width, height, borderRadius: radius, backgroundColor: t.surfaceAlt, overflow: 'hidden' }, style]}>
      <Animated.View style={[{ position: 'absolute', top: 0, bottom: 0, width: width * 0.6 }, animStyle]}>
        <LinearGradient
          colors={t.isDark
            ? ['transparent', 'rgba(255,255,255,0.12)', 'transparent']
            : ['transparent', 'rgba(255,255,255,0.7)', 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </View>
  );
}

// Kept for any lingering references — static, non-shimmering block.
export function SkeletonBlock({ width, height, style }: { width: number | string; height: number; style?: object }) {
  return (
    <View style={[{ width: width as any, height, borderRadius: radii.md, backgroundColor: colors.gray[100] }, style]} />
  );
}

export function ProductCardSkeleton({ variant = 'vertical' }: { variant?: 'vertical' | 'horizontal' }) {
  const t = useThemeColors();
  if (variant === 'horizontal') {
    return (
      <View style={skeletonStyles.hCard}>
        <Skeleton width={36} height={36} radius={radii.md} />
        <View style={{ flex: 1, gap: 6 }}>
          <Skeleton width={160} height={13} />
          <Skeleton width={100} height={11} />
        </View>
        <Skeleton width={60} height={16} />
      </View>
    );
  }
  return (
    <View style={[skeletonStyles.vCard, { backgroundColor: t.surface, borderColor: t.border }]}>
      <Skeleton width={42} height={42} radius={radii.md} style={{ marginBottom: 10 }} />
      <Skeleton width={130} height={14} style={{ marginBottom: 6 }} />
      <Skeleton width={70} height={18} style={{ marginBottom: 8 }} />
      <Skeleton width={90} height={11} />
    </View>
  );
}

export function VendorCardSkeleton({ style }: { style?: StyleProp<ViewStyle> }) {
  const t = useThemeColors();
  return (
    <View style={[skeletonStyles.vendorCard, { backgroundColor: t.surface, borderColor: t.border }, style]}>
      <Skeleton width={48} height={48} radius={radii.md} />
      <View style={{ flex: 1, gap: 6 }}>
        <Skeleton width={140} height={14} />
        <Skeleton width={90} height={11} />
      </View>
    </View>
  );
}

const skeletonStyles = StyleSheet.create({
  hCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  vCard: {
    width: 160,
    borderRadius: radii.lg,
    borderWidth: 0.5,
    padding: 14,
  },
  vendorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    borderRadius: radii.lg,
    borderWidth: 0.5,
    marginHorizontal: 20,
    marginBottom: 10,
    padding: 14,
  },
});

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radii.full,
  },
  badgeText: {
    fontSize: typography.sizes.xs,
    fontWeight: '500',
  },
  pricePill: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: radii.full,
  },
  pricePillText: {
    fontWeight: '500',
  },
  tagChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radii.full,
    backgroundColor: colors.gray[100],
  },
  tagChipText: {
    fontSize: typography.sizes.xs,
    color: colors.gray[600],
    fontWeight: '500',
  },
  sectionLabel: {
    fontSize: typography.sizes.xs,
    color: colors.gray[500],
    fontWeight: '500',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  vendorAvatar: {
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  vendorAvatarText: {
    fontWeight: '600',
  },
  spinnerWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: '500',
    color: colors.navy[800],
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: typography.sizes.base,
    color: colors.gray[500],
    textAlign: 'center',
    lineHeight: 22,
  },
  emptyAction: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: radii.lg,
    backgroundColor: colors.navy[800],
  },
  emptyActionText: {
    color: colors.white,
    fontSize: typography.sizes.base,
    fontWeight: '500',
  },
  divider: {
    height: 0.5,
    backgroundColor: colors.gray[200],
  },
});
