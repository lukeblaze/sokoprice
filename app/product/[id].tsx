import React, { useState, useMemo, Suspense, lazy } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  Linking,
  Image,
} from 'react-native';
import { Text } from '@/components/common/Text';
import { useLocalSearchParams, router } from 'expo-router';
import Head from 'expo-router/head';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ArrowLeftIcon,
  HeartIcon,
  ShareNetworkIcon,
  StorefrontIcon,
  WhatsappLogoIcon,
  PhoneIcon,
  CheckCircleIcon,
  BellIcon,
} from 'phosphor-react-native';
import { showMessage } from 'react-native-flash-message';
import * as Haptics from 'expo-haptics';
import { useProduct, useProductTrend, useVendorListings } from '@/hooks/useQueries';
import { useAppStore } from '@/store';
import { colors, radii, typography, shadows } from '@/theme/tokens';
import { TagChip, VendorBadgeChip, LoadingSpinner } from '@/components/common';
import { formatKES, formatPriceChange, pricePercentage, formatShortDate } from '@/utils/format';
import { useSkiaWebReady } from '@/utils/skiaWeb';
import { useBreakpoint } from '@/hooks/useResponsive';
import { ResponsiveContainer } from '@/components/common/ResponsiveContainer';
import { usePressScale } from '@/hooks/usePressScale';
import { useMagnetic } from '@/hooks/useMagnetic';
import { useThemeColors } from '@/hooks/useThemeColors';
import Animated from 'react-native-reanimated';

// Deferred until Skia's CanvasKit WASM is confirmed ready (web) — importing
// victory-native/@shopify/react-native-skia any earlier binds their Skia
// primitives before CanvasKit exists and crashes the whole screen.
const LazyPriceChart = lazy(() => import('@/components/product/PriceChart'));

function PriceChartLoading() {
  return (
    <View style={chartStyles.canvasLoading}>
      <LoadingSpinner size={20} />
    </View>
  );
}

function PriceChart({ dataPoints }: { dataPoints: Array<{ date: string; avgPrice: number }> }) {
  const skiaReady = useSkiaWebReady();
  if (!dataPoints || dataPoints.length === 0) return null;
  if (!skiaReady) return <PriceChartLoading />;
  return (
    <Suspense fallback={<PriceChartLoading />}>
      <LazyPriceChart dataPoints={dataPoints} />
    </Suspense>
  );
}

const chartStyles = StyleSheet.create({
  canvasLoading: {
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { isDesktop } = useBreakpoint();

  const { data: product, isLoading: productLoading } = useProduct(id);
  const { data: trend } = useProductTrend(id);
  const { data: listings } = useVendorListings(id);

  const toggleWatchlist = useAppStore(s => s.toggleWatchlist);
  const isWatchlisted = useAppStore(s => s.isWatchlisted);
  const addAlert = useAppStore(s => s.addAlert);

  const [alertSet, setAlertSet] = useState(false);
  const watchlisted = isWatchlisted(id);
  const ctaPress = usePressScale();
  const ctaMagnetic = useMagnetic();
  const t = useThemeColors();
  const dyn = useMemo(() => StyleSheet.create({
    screen: { backgroundColor: t.bg },
    header: { backgroundColor: t.surface, borderBottomColor: t.border, borderBottomWidth: t.isDark ? 0 : 0.5 },
    iconBtn: { backgroundColor: t.surfaceAlt },
    hero: { backgroundColor: t.surface },
    heroImageWrap: { backgroundColor: t.surfaceAlt },
    heroCategory: { color: t.textMuted },
    heroName: { color: t.textPrimary },
    heroPriceLabel: { color: t.textMuted },
    metaItem: { color: t.textSecondary },
    metaDot: { color: t.textMuted },
    card: { backgroundColor: t.surface, borderColor: t.border },
    sectionTitle: { color: t.textSecondary },
    vendorCard: { backgroundColor: t.surface, borderColor: t.border },
    vendorName: { color: t.textPrimary },
    vendorLocation: { color: t.textSecondary },
    vendorPrice: { color: t.textPrimary },
    barBg: { backgroundColor: t.surfaceAlt },
    description: { color: t.textSecondary },
  }), [t]);

  const handleWatchlist = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    toggleWatchlist(id);
    showMessage({
      message: watchlisted ? 'Removed from watchlist' : 'Added to watchlist',
      type: watchlisted ? 'info' : 'success',
    });
  };

  const handleSetAlert = () => {
    if (!product) return;
    const targetPrice = Math.round(product.bestPrice * 0.95); // 5% below current best
    addAlert({
      id: `alert-${Date.now()}`,
      productId: id,
      productName: product.name,
      targetPrice,
      currentPrice: product.bestPrice,
      direction: 'below',
      isActive: true,
      createdAt: new Date().toISOString(),
    });
    setAlertSet(true);
    showMessage({ message: `Alert set for below ${formatKES(targetPrice)}`, type: 'success' });
  };

  const handleContactVendor = (phone?: string) => {
    if (!phone) return;
    Linking.openURL(`tel:${phone.replace(/\s/g, '')}`);
  };

  const handleWhatsApp = (phone?: string, productName?: string) => {
    if (!phone) return;
    const msg = `Hello, I'm inquiring about ${productName} — can you confirm current pricing and availability?`;
    Linking.openURL(`https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`);
  };

  if (productLoading || !product) {
    return (
      <View style={[styles.screen, dyn.screen, { paddingTop: insets.top }]}>
        <Pressable onPress={() => router.back()} style={[styles.backBtn, dyn.iconBtn]}>
          <ArrowLeftIcon size={22} color={t.textPrimary} />
        </Pressable>
        <LoadingSpinner />
      </View>
    );
  }

  const isUp = product.priceChangePct >= 0;

  const heroContent = (
    <>
      {product.imageUrl && (
        <View style={[styles.heroImageWrap, dyn.heroImageWrap]}>
          <Image
            source={{ uri: product.imageUrl }}
            style={StyleSheet.absoluteFill}
            resizeMode="cover"
          />
        </View>
      )}
      <Text style={[styles.heroCategory, dyn.heroCategory]}>{product.category} · {product.subcategory}</Text>
      <Text style={[styles.heroName, dyn.heroName]}>{product.name}</Text>
      <View style={styles.heroPriceRow}>
        <Text style={styles.heroBestPrice}>{formatKES(product.bestPrice)}</Text>
        <Text style={[styles.heroPriceLabel, dyn.heroPriceLabel]}>best price</Text>
        <View style={[styles.changeChip, isUp ? styles.changeUp : styles.changeDn]}>
          <Text style={[styles.changeText, isUp ? styles.changeTextUp : styles.changeTextDn]}>
            {isUp ? '▲' : '▼'} {Math.abs(product.priceChangePct).toFixed(1)}%
          </Text>
        </View>
      </View>
      <View style={styles.heroMeta}>
        <View style={styles.metaIconRow}>
          <StorefrontIcon size={12} color={t.textMuted} />
          <Text style={[styles.metaItem, dyn.metaItem]}>{product.vendorCount} vendors</Text>
        </View>
        <Text style={[styles.metaDot, dyn.metaDot]}>·</Text>
        <Text style={[styles.metaItem, dyn.metaItem]}>Avg {formatKES(product.avgPrice)}</Text>
        <Text style={[styles.metaDot, dyn.metaDot]}>·</Text>
        <Text style={[styles.metaItem, dyn.metaItem]}>{product.unit}</Text>
      </View>
    </>
  );

  const mainSections = (
    <>
      {/* Price trend */}
        {trend && trend.dataPoints.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, dyn.sectionTitle]}>30-day price trend</Text>
            <View style={[styles.card, dyn.card]}>
              <PriceChart dataPoints={trend.dataPoints} />
            </View>
          </View>
        )}

        {/* Tags */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, dyn.sectionTitle]}>Specifications</Text>
          <View style={styles.tagsWrap}>
            {product.tags.map(tag => <TagChip key={tag} label={tag} />)}
          </View>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, dyn.sectionTitle]}>About this product</Text>
          <View style={[styles.card, dyn.card]}>
            <Text style={[styles.description, dyn.description]}>{product.description}</Text>
          </View>
        </View>

        {/* Vendor comparison */}
        {listings && listings.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, dyn.sectionTitle]}>Compare vendors</Text>
            {listings.map((listing, i) => {
              const pct = pricePercentage(listing.price, product.bestPrice, product.worstPrice);
              const isBest = listing.price === product.bestPrice;
              return (
                <View key={listing.vendorId} style={[styles.vendorCard, dyn.vendorCard, i > 0 && styles.vendorCardGap]}>
                  <View style={styles.vendorCardTop}>
                    <View style={styles.vendorCardLeft}>
                      <View style={[styles.vendorDot, { backgroundColor: isBest ? colors.green[400] : colors.gray[300] }]} />
                      <View>
                        <Text style={[styles.vendorName, dyn.vendorName]}>{listing.vendorName}</Text>
                        <Text style={[styles.vendorLocation, dyn.vendorLocation]}>{listing.vendorLocation}</Text>
                        {listing.notes && (
                          <Text style={styles.vendorNotes}>{listing.notes}</Text>
                        )}
                      </View>
                    </View>
                    <View style={styles.vendorCardRight}>
                      <Text style={[styles.vendorPrice, dyn.vendorPrice]}>{formatKES(listing.price)}</Text>
                      {isBest && (
                        <View style={styles.bestBadge}>
                          <Text style={styles.bestBadgeText}>Best price</Text>
                        </View>
                      )}
                      {!listing.inStock && (
                        <Text style={styles.outOfStock}>Out of stock</Text>
                      )}
                    </View>
                  </View>

                  {/* Price bar */}
                  <View style={styles.barWrap}>
                    <View style={[styles.barBg, dyn.barBg]}>
                      <View
                        style={[
                          styles.barFill,
                          {
                            width: `${pct}%`,
                            backgroundColor: isBest ? colors.green[400] : colors.amber[400],
                          },
                        ]}
                      />
                    </View>
                  </View>

                  {/* Contact buttons */}
                  <View style={styles.contactRow}>
                    <VendorBadgeChip badge={listing.vendorBadge} />
                    {listing.contactPhone && (
                      <Pressable
                        onPress={() => handleWhatsApp(listing.contactPhone, product.name)}
                        style={({ pressed, hovered }) => [
                          styles.contactBtn,
                          (pressed || hovered) && styles.contactBtnPressed,
                        ]}
                      >
                        <WhatsappLogoIcon size={14} color={colors.green[600]} weight="fill" />
                        <Text style={styles.contactBtnText}>WhatsApp</Text>
                      </Pressable>
                    )}
                    {listing.contactPhone && (
                      <Pressable
                        onPress={() => handleContactVendor(listing.contactPhone)}
                        style={({ pressed, hovered }) => [
                          styles.contactBtnSecondary,
                          (pressed || hovered) && styles.contactBtnSecondaryPressed,
                        ]}
                      >
                        <PhoneIcon size={14} color={colors.navy[700]} />
                        <Text style={styles.contactBtnSecondaryText}>Call</Text>
                      </Pressable>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* Alert CTA */}
        <View style={styles.ctaRow}>
          <Animated.View ref={ctaMagnetic.ref} style={ctaMagnetic.magneticStyle}>
          <Animated.View style={ctaPress.animStyle}>
            <Pressable
              onPress={handleSetAlert}
              onPressIn={ctaPress.onPressIn}
              onPressOut={ctaPress.onPressOut}
              style={[styles.ctaBtn, alertSet && styles.ctaBtnDone]}
            >
              {alertSet ? (
                <CheckCircleIcon size={18} color={colors.green[600]} weight="fill" />
              ) : (
                <BellIcon size={18} color={colors.amber[600]} />
              )}
              <Text style={[styles.ctaBtnText, alertSet && { color: colors.green[600] }]}>
                {alertSet ? 'Alert set' : 'Set price alert'}
              </Text>
            </Pressable>
          </Animated.View>
          </Animated.View>
        </View>
    </>
  );

  return (
    <View style={[styles.screen, dyn.screen, { paddingTop: insets.top }]}>
      <Head>
        <title>{product.name} — {formatKES(product.bestPrice)} — SokoPrice</title>
        <meta name="description" content={`Compare prices for ${product.name} across ${product.vendorCount} vendors in Nairobi. Best price: ${formatKES(product.bestPrice)}.`} />
      </Head>
      {/* Header */}
      <View style={[styles.header, dyn.header]}>
        <Pressable onPress={() => router.back()} style={[styles.backBtn, dyn.iconBtn]}>
          <ArrowLeftIcon size={20} color={t.textPrimary} />
        </Pressable>
        <View style={styles.headerActions}>
          <Pressable onPress={handleWatchlist} style={[styles.iconBtn, dyn.iconBtn]}>
            <HeartIcon
              size={20}
              color={watchlisted ? colors.red[400] : t.textPrimary}
              weight={watchlisted ? 'fill' : 'duotone'}
            />
          </Pressable>
          <Pressable onPress={() => {}} style={[styles.iconBtn, dyn.iconBtn]}>
            <ShareNetworkIcon size={20} color={t.textPrimary} />
          </Pressable>
        </View>
      </View>

      {isDesktop ? (
        <ResponsiveContainer>
          <View style={styles.desktopRow}>
            <View style={[styles.desktopHeroPane, dyn.hero]}>{heroContent}</View>
            <ScrollView
              style={styles.desktopContentPane}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
            >
              {mainSections}
              <View style={{ height: insets.bottom + 24 }} />
            </ScrollView>
          </View>
        </ResponsiveContainer>
      ) : (
        <>
          <View style={[styles.productHero, dyn.hero]}>{heroContent}</View>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {mainSections}
            <View style={{ height: insets.bottom + 24 }} />
          </ScrollView>
        </>
      )}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: radii.full,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: radii.full,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  productHero: {
    backgroundColor: colors.navy[800],
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 24,
  },
  heroImageWrap: {
    height: 160,
    borderRadius: radii.lg,
    overflow: 'hidden',
    backgroundColor: colors.navy[700],
    marginBottom: 16,
  },
  heroCategory: {
    fontSize: typography.sizes.xs,
    color: 'rgba(255,255,255,0.45)',
    marginBottom: 4,
  },
  heroName: {
    fontSize: typography.sizes['2xl'],
    fontFamily: typography.displayFont,
    color: colors.white,
    lineHeight: 28,
    marginBottom: 12,
  },
  heroPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    marginBottom: 8,
  },
  heroBestPrice: {
    fontSize: typography.sizes['4xl'],
    fontFamily: typography.displayFont,
    color: colors.amber[400],
  },
  heroPriceLabel: {
    fontSize: typography.sizes.sm,
    color: 'rgba(255,255,255,0.4)',
  },
  changeChip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radii.full,
    marginLeft: 4,
  },
  changeUp: { backgroundColor: 'rgba(74,222,128,0.15)' },
  changeDn: { backgroundColor: 'rgba(248,113,113,0.15)' },
  changeText: { fontSize: 12, fontWeight: '500' },
  changeTextUp: { color: '#4ADE80' },
  changeTextDn: { color: '#F87171' },
  heroMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaItem: {
    fontSize: typography.sizes.xs,
    color: 'rgba(255,255,255,0.45)',
  },
  metaDot: {
    fontSize: typography.sizes.xs,
    color: 'rgba(255,255,255,0.2)',
  },
  scrollContent: {
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  desktopRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 24,
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  desktopHeroPane: {
    width: 380,
    flexShrink: 0,
    backgroundColor: colors.navy[800],
    borderRadius: radii.xl,
    padding: 24,
    position: 'sticky' as any,
    top: 24,
  },
  desktopContentPane: {
    flex: 1,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: '500',
    color: colors.gray[500],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    borderWidth: 0.5,
    borderColor: colors.gray[200],
    padding: 16,
  },
  description: {
    fontSize: typography.sizes.base,
    color: colors.gray[600],
    lineHeight: 22,
  },
  tagsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  vendorCard: {
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    borderWidth: 0.5,
    borderColor: colors.gray[200],
    overflow: 'hidden',
    padding: 14,
  },
  vendorCardGap: {
    marginTop: 10,
  },
  vendorCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  vendorCardLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    flex: 1,
  },
  vendorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 3,
    flexShrink: 0,
  },
  vendorName: {
    fontSize: typography.sizes.base,
    fontWeight: '500',
    color: colors.navy[800],
  },
  vendorLocation: {
    fontSize: typography.sizes.xs,
    color: colors.gray[500],
    marginTop: 2,
  },
  vendorNotes: {
    fontSize: typography.sizes.xs,
    color: colors.amber[600],
    marginTop: 3,
  },
  vendorCardRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  vendorPrice: {
    fontSize: typography.sizes.lg,
    fontFamily: typography.displayFontMedium,
    color: colors.navy[800],
  },
  bestBadge: {
    backgroundColor: colors.amber[50],
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radii.full,
  },
  bestBadgeText: {
    fontSize: 10,
    fontWeight: '500',
    color: colors.amber[700],
  },
  outOfStock: {
    fontSize: 10,
    color: colors.red[400],
  },
  barWrap: {
    marginBottom: 10,
  },
  barBg: {
    height: 4,
    backgroundColor: colors.gray[100],
    borderRadius: 2,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 2,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  contactBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radii.full,
    backgroundColor: colors.green[50],
    borderWidth: 0.5,
    borderColor: colors.green[400] + '44',
  },
  contactBtnPressed: {
    borderColor: colors.green[600],
    transform: [{ scale: 0.96 }],
  },
  contactBtnText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.green[600],
  },
  contactBtnSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radii.full,
    backgroundColor: colors.navy[50],
    borderWidth: 0.5,
    borderColor: colors.navy[200],
  },
  contactBtnSecondaryPressed: {
    borderColor: colors.navy[500],
    transform: [{ scale: 0.96 }],
  },
  contactBtnSecondaryText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.navy[700],
  },
  ctaRow: {
    paddingBottom: 8,
  },
  ctaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: radii.lg,
    backgroundColor: colors.amber[50],
    borderWidth: 0.5,
    borderColor: colors.amber[200],
  },
  ctaBtnDone: {
    backgroundColor: colors.green[50],
    borderColor: colors.green[400] + '44',
  },
  ctaBtnText: {
    fontSize: typography.sizes.base,
    fontWeight: '500',
    color: colors.amber[700],
  },
});
