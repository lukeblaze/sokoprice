import React, { useCallback } from 'react';
import {
  View,
  ScrollView,
  Pressable,
  StyleSheet,
  RefreshControl,
  FlatList,
} from 'react-native';
import { Text } from '@/components/common/Text';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BellIcon, MagnifyingGlassIcon, TrendDownIcon, TagIcon } from 'phosphor-react-native';
import { useMarketSummary, useMarketTicker, useProducts } from '@/hooks/useQueries';
import { useAppStore } from '@/store';
import { colors, radii, shadows, spacing, typography } from '@/theme/tokens';
import { PriceTicker } from '@/components/home/PriceTicker';
import { ProductCard } from '@/components/home/ProductCard';
import { SectionLabel, LoadingSpinner, PriceChangePill } from '@/components/common';
import { formatKES, formatRelativeTime } from '@/utils/format';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const user = useAppStore(s => s.user);
  const unreadCount = useAppStore(s => s.unreadCount);

  const { data: summary, isLoading: summaryLoading, refetch: refetchSummary } = useMarketSummary();
  const { data: ticker } = useMarketTicker();
  const { data: products, isLoading: productsLoading, refetch: refetchProducts } = useProducts();

  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetchSummary(), refetchProducts()]);
    setRefreshing(false);
  }, [refetchSummary, refetchProducts]);

  const trending = products?.slice(0, 5) ?? [];
  const recent = products ?? [];

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greeting}>Good morning</Text>
            <Text style={styles.appName}>SokoPrice</Text>
          </View>
          <View style={styles.headerActions}>
            <Pressable
              onPress={() => router.push('/(tabs)/alerts')}
              style={styles.notifBtn}
            >
              <BellIcon size={22} color={colors.white} />
              {unreadCount > 0 && (
                <View style={styles.notifDot}>
                  <Text style={styles.notifDotText}>{unreadCount}</Text>
                </View>
              )}
            </Pressable>
            <Pressable
              onPress={() => router.push('/(tabs)/profile')}
              style={styles.avatar}
            >
              <Text style={styles.avatarText}>
                {user?.name.slice(0, 2).toUpperCase() ?? 'BL'}
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Search bar shortcut */}
        <Pressable
          onPress={() => router.push('/(tabs)/search')}
          style={styles.searchBar}
        >
          <MagnifyingGlassIcon size={16} color="rgba(255,255,255,0.5)" />
          <Text style={styles.searchPlaceholder}>Search products, vendors…</Text>
        </Pressable>
      </View>

      {/* Ticker */}
      {ticker && ticker.length > 0 && <PriceTicker items={ticker} />}

      {/* Main scroll */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.amber[400]}
          />
        }
        contentContainerStyle={styles.scrollContent}
      >
        {/* Market stats */}
        {summaryLoading ? (
          <LoadingSpinner />
        ) : summary ? (
          <View style={styles.section}>
            <SectionLabel>Market today</SectionLabel>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.statRow}
            >
              <StatCard label="Products tracked" value={summary.totalProducts.toLocaleString()} sub="+12 added today" subPositive />
              <StatCard label="Price movement" value={`+${summary.avgPriceMovement.toFixed(1)}%`} sub="vs. last week" />
              <StatCard label="Active vendors" value={summary.activeVendors.toString()} sub="Nairobi" subPositive />
            </ScrollView>
          </View>
        ) : null}

        {/* Alert banner */}
        <View style={styles.alertBanner}>
          <TrendDownIcon size={16} color={colors.amber[700]} />
          <Text style={styles.alertText}>
            HP LaserJet toner (CF230A) dropped 8% — now {formatKES(3200)} at Almiria Solutions.
          </Text>
        </View>

        {/* Trending */}
        {productsLoading ? (
          <LoadingSpinner />
        ) : (
          <View style={styles.section}>
            <SectionLabel>Trending products</SectionLabel>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.hScroll}
            >
              {trending.map(p => (
                <ProductCard
                  key={p.id}
                  product={p}
                  variant="vertical"
                  onPress={() => router.push(`/product/${p.id}`)}
                />
              ))}
            </ScrollView>
          </View>
        )}

        {/* Latest price updates */}
        <View style={styles.section}>
          <SectionLabel>Latest updates</SectionLabel>
          <View style={styles.feedCard}>
            {recent.slice(0, 6).map((p, i) => (
              <Pressable
                key={p.id}
                onPress={() => router.push(`/product/${p.id}`)}
                style={[styles.feedRow, i === Math.min(5, recent.length - 1) && styles.feedRowLast]}
              >
                <View style={styles.feedIconWrap}>
                  <TagIcon size={16} color={colors.gray[500]} />
                </View>
                <View style={styles.feedInfo}>
                  <Text style={styles.feedName} numberOfLines={1}>{p.name}</Text>
                  <Text style={styles.feedMeta}>{p.category} · {p.vendorCount} vendors</Text>
                </View>
                <View style={styles.feedRight}>
                  <Text style={styles.feedPrice}>{formatKES(p.bestPrice)}</Text>
                  <PriceChangePill pct={p.priceChangePct} />
                </View>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </View>
  );
}

function StatCard({
  label,
  value,
  sub,
  subPositive,
}: {
  label: string;
  value: string;
  sub: string;
  subPositive?: boolean;
}) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={[styles.statSub, subPositive ? styles.statSubGreen : styles.statSubMuted]}>
        {sub}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  header: {
    backgroundColor: colors.navy[800],
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  greeting: {
    fontSize: typography.sizes.xs,
    color: 'rgba(255,255,255,0.55)',
  },
  appName: {
    fontSize: typography.sizes.xl,
    fontFamily: typography.displayFont,
    color: colors.white,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  notifBtn: {
    width: 36,
    height: 36,
    borderRadius: radii.full,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notifDot: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.red[400],
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifDotText: {
    fontSize: 8,
    fontWeight: '700',
    color: colors.white,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: radii.full,
    backgroundColor: colors.amber[400],
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.navy[800],
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: radii.lg,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  searchPlaceholder: {
    fontSize: typography.sizes.base,
    color: 'rgba(255,255,255,0.45)',
  },
  scrollContent: {
    paddingTop: 16,
  },
  section: {
    marginBottom: 20,
  },
  statRow: {
    paddingHorizontal: 20,
    gap: 10,
  },
  statCard: {
    width: 140,
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    borderWidth: 0.5,
    borderColor: colors.gray[200],
    padding: 14,
  },
  statLabel: {
    fontSize: 11,
    color: colors.gray[500],
    marginBottom: 6,
  },
  statValue: {
    fontSize: 22,
    fontFamily: typography.displayFontMedium,
    color: colors.navy[800],
  },
  statSub: {
    fontSize: 11,
    marginTop: 4,
  },
  statSubGreen: { color: colors.green[600] },
  statSubMuted: { color: colors.gray[500] },
  alertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 12,
    borderRadius: radii.lg,
    backgroundColor: colors.amber[50],
    borderWidth: 0.5,
    borderColor: 'rgba(232,160,32,0.3)',
  },
  alertText: {
    flex: 1,
    fontSize: typography.sizes.xs,
    color: colors.amber[700],
    lineHeight: 18,
  },
  hScroll: {
    paddingHorizontal: 20,
    gap: 10,
  },
  feedCard: {
    marginHorizontal: 20,
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    borderWidth: 0.5,
    borderColor: colors.gray[200],
    overflow: 'hidden',
  },
  feedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 13,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.gray[100],
  },
  feedRowLast: {
    borderBottomWidth: 0,
  },
  feedIconWrap: {
    width: 34,
    height: 34,
    borderRadius: radii.md,
    backgroundColor: colors.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  feedInfo: {
    flex: 1,
    minWidth: 0,
  },
  feedName: {
    fontSize: typography.sizes.base,
    fontWeight: '500',
    color: colors.navy[800],
    marginBottom: 2,
  },
  feedMeta: {
    fontSize: typography.sizes.xs,
    color: colors.gray[500],
  },
  feedRight: {
    alignItems: 'flex-end',
    gap: 4,
    flexShrink: 0,
  },
  feedPrice: {
    fontSize: typography.sizes.md,
    fontFamily: typography.displayFontMedium,
    color: colors.navy[800],
  },
});
