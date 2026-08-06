import React, { useCallback, useMemo } from 'react';
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
import Head from 'expo-router/head';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BellIcon, MagnifyingGlassIcon, TagIcon } from 'phosphor-react-native';
import { useMarketSummary, useMarketTicker, useProducts } from '@/hooks/useQueries';
import { useAppStore } from '@/store';
import { colors, radii, shadows, spacing, typography } from '@/theme/tokens';
import { PriceTicker } from '@/components/home/PriceTicker';
import { ProductCard } from '@/components/home/ProductCard';
import { DealOfDayTile } from '@/components/home/DealOfDayTile';
import { SectionLabel, LoadingSpinner, PriceChangePill, ProductCardSkeleton } from '@/components/common';
import { ResponsiveContainer } from '@/components/common/ResponsiveContainer';
import { useBreakpoint } from '@/hooks/useResponsive';
import { useThemeColors } from '@/hooks/useThemeColors';
import { formatKES, formatRelativeTime } from '@/utils/format';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { isDesktop } = useBreakpoint();
  const t = useThemeColors();
  const dyn = useMemo(() => StyleSheet.create({
    screen: { backgroundColor: t.bg },
    statCard: { backgroundColor: t.surface, borderColor: t.border },
    statLabel: { color: t.textSecondary },
    statValue: { color: t.textPrimary },
    statSubMuted: { color: t.textSecondary },
    feedCard: { backgroundColor: t.surface, borderColor: t.border },
    feedRow: { borderBottomColor: t.divider },
    feedIconWrap: { backgroundColor: t.surfaceAlt },
    feedName: { color: t.textPrimary },
    feedMeta: { color: t.textSecondary },
    feedPrice: { color: t.textPrimary },
  }), [t]);
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
  const dealProduct = useMemo(() => {
    if (!products || products.length === 0) return null;
    return [...products].sort((a, b) => a.priceChangePct - b.priceChangePct)[0];
  }, [products]);

  return (
    <View style={[styles.screen, dyn.screen, { paddingTop: insets.top }]}>
      <Head>
        <title>SokoPrice — Compare vendor prices in Nairobi, live</title>
        <meta name="description" content="Track and compare product prices across Nairobi vendors in real time. IT, office supplies, and more." />
      </Head>
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
        <ResponsiveContainer>
        {/* Deal of the day + market stats bento */}
        {productsLoading || summaryLoading ? (
          <View style={styles.section}>
            <View style={styles.dealSkeletonTile} />
          </View>
        ) : dealProduct && summary ? (
          <View style={styles.section}>
            {isDesktop ? (
              <View style={styles.bentoRow}>
                <DealOfDayTile
                  product={dealProduct}
                  onPress={() => router.push(`/product/${dealProduct.id}`)}
                  style={styles.bentoDeal}
                />
                <View style={styles.bentoStatCol}>
                  <StatCard dyn={dyn} full label="Products tracked" value={summary.totalProducts.toLocaleString()} sub="+12 added today" subPositive />
                  <StatCard dyn={dyn} full label="Price movement" value={`+${summary.avgPriceMovement.toFixed(1)}%`} sub="vs. last week" />
                  <StatCard dyn={dyn} full label="Active vendors" value={summary.activeVendors.toString()} sub="Nairobi" subPositive />
                </View>
              </View>
            ) : (
              <>
                <DealOfDayTile
                  product={dealProduct}
                  onPress={() => router.push(`/product/${dealProduct.id}`)}
                  style={styles.dealMobile}
                />
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.statRow}
                >
                  <StatCard dyn={dyn} label="Products tracked" value={summary.totalProducts.toLocaleString()} sub="+12 added today" subPositive />
                  <StatCard dyn={dyn} label="Price movement" value={`+${summary.avgPriceMovement.toFixed(1)}%`} sub="vs. last week" />
                  <StatCard dyn={dyn} label="Active vendors" value={summary.activeVendors.toString()} sub="Nairobi" subPositive />
                </ScrollView>
              </>
            )}
          </View>
        ) : null}

        {/* Trending */}
        {productsLoading ? (
          <View style={styles.section}>
            <SectionLabel>Trending products</SectionLabel>
            <View style={[styles.hScroll, { flexDirection: 'row' }]}>
              {Array.from({ length: 4 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </View>
          </View>
        ) : (
          <View style={styles.section}>
            <SectionLabel>Trending products</SectionLabel>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.hScroll}
            >
              {trending.map((p, i) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  variant="vertical"
                  onPress={() => router.push(`/product/${p.id}`)}
                  index={i}
                />
              ))}
            </ScrollView>
          </View>
        )}

        {/* Latest price updates */}
        <View style={styles.section}>
          <SectionLabel>Latest updates</SectionLabel>
          {isDesktop ? (
            <View style={styles.updatesGrid}>
              {recent.slice(0, 8).map((p, i) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  variant="vertical"
                  style={styles.updatesGridCard}
                  onPress={() => router.push(`/product/${p.id}`)}
                  index={i}
                />
              ))}
            </View>
          ) : (
            <View style={[styles.feedCard, dyn.feedCard]}>
              {recent.slice(0, 6).map((p, i) => (
                <Pressable
                  key={p.id}
                  onPress={() => router.push(`/product/${p.id}`)}
                  style={[styles.feedRow, dyn.feedRow, i === Math.min(5, recent.length - 1) && styles.feedRowLast]}
                >
                  <View style={[styles.feedIconWrap, dyn.feedIconWrap]}>
                    <TagIcon size={16} color={t.textSecondary} />
                  </View>
                  <View style={styles.feedInfo}>
                    <Text style={[styles.feedName, dyn.feedName]} numberOfLines={1}>{p.name}</Text>
                    <Text style={[styles.feedMeta, dyn.feedMeta]}>{p.category} · {p.vendorCount} vendors</Text>
                  </View>
                  <View style={styles.feedRight}>
                    <Text style={[styles.feedPrice, dyn.feedPrice]}>{formatKES(p.bestPrice)}</Text>
                    <PriceChangePill pct={p.priceChangePct} />
                  </View>
                </Pressable>
              ))}
            </View>
          )}
        </View>

        <View style={{ height: 24 }} />
        </ResponsiveContainer>
      </ScrollView>
    </View>
  );
}

function StatCard({
  label,
  value,
  sub,
  subPositive,
  dyn,
  full,
}: {
  label: string;
  value: string;
  sub: string;
  subPositive?: boolean;
  dyn: ReturnType<typeof StyleSheet.create>;
  full?: boolean;
}) {
  return (
    <View style={[styles.statCard, full && styles.statCardFull, dyn.statCard]}>
      <Text style={[styles.statLabel, dyn.statLabel]}>{label}</Text>
      <Text style={[styles.statValue, full && styles.statValueFull, dyn.statValue]}>{value}</Text>
      <Text style={[styles.statSub, subPositive ? styles.statSubGreen : dyn.statSubMuted]}>
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
  statCardFull: {
    width: '100%',
    flex: 1,
    justifyContent: 'center',
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
  statValueFull: {
    fontSize: 20,
  },
  statSub: {
    fontSize: 11,
    marginTop: 4,
  },
  statSubGreen: { color: colors.green[600] },
  statSubMuted: { color: colors.gray[500] },
  dealSkeletonTile: {
    height: 200,
    marginHorizontal: 20,
    borderRadius: radii.xl,
    backgroundColor: colors.gray[100],
  },
  dealMobile: {
    marginHorizontal: 20,
    marginBottom: 14,
  },
  bentoRow: {
    flexDirection: 'row',
    gap: 16,
    paddingHorizontal: 20,
  },
  bentoDeal: {
    flex: 2,
  },
  bentoStatCol: {
    flex: 1,
    gap: 10,
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
  updatesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    paddingHorizontal: 20,
  },
  updatesGridCard: {
    width: 200,
  },
});
