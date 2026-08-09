import React, { useMemo } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  Linking,
} from 'react-native';
import { Text } from '@/components/common/Text';
import { useLocalSearchParams, router } from 'expo-router';
import Head from 'expo-router/head';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ArrowLeftIcon,
  BookmarkSimpleIcon,
  CheckCircleIcon,
  StarIcon,
  PhoneIcon,
  EnvelopeSimpleIcon,
  WhatsappLogoIcon,
  GlobeIcon,
  MapPinIcon,
  ClockIcon,
  TagIcon,
  CaretRightIcon,
  type IconProps,
} from 'phosphor-react-native';
import { showMessage } from 'react-native-flash-message';
import { impactLight } from '@/utils/haptics';
import { useVendor } from '@/hooks/useQueries';
import { useAppStore } from '@/store';
import { colors, radii, typography } from '@/theme/tokens';
import { VendorAvatar, VendorBadgeChip, LoadingSpinner } from '@/components/common';
import { useBreakpoint } from '@/hooks/useResponsive';
import { usePressScale } from '@/hooks/usePressScale';
import { useMagnetic } from '@/hooks/useMagnetic';
import { useThemeColors } from '@/hooks/useThemeColors';
import Animated from 'react-native-reanimated';

function ContactRow({
  icon: Icon,
  label,
  value,
  onPress,
  dyn,
  t,
}: {
  icon: React.ComponentType<IconProps>;
  label: string;
  value: string;
  onPress?: () => void;
  dyn: ReturnType<typeof StyleSheet.create>;
  t: ReturnType<typeof useThemeColors>;
}) {
  const press = usePressScale(0.98);
  return (
    <Animated.View style={press.animStyle}>
      <Pressable
        onPress={onPress}
        onPressIn={press.onPressIn}
        onPressOut={press.onPressOut}
        style={({ hovered }) => [styles.contactRow, hovered && dyn.contactRowHovered]}
      >
        <View style={[styles.contactIcon, dyn.contactIcon]}>
          <Icon size={16} color={t.textSecondary} />
        </View>
        <View style={styles.contactInfo}>
          <Text style={[styles.contactLabel, dyn.contactLabel]}>{label}</Text>
          <Text style={[styles.contactValue, dyn.contactValue]}>{value}</Text>
        </View>
        {onPress && <CaretRightIcon size={14} color={t.textMuted} />}
      </Pressable>
    </Animated.View>
  );
}

export default function VendorDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { isDesktop } = useBreakpoint();

  const { data: vendor, isLoading } = useVendor(id);
  const toggleSavedVendor = useAppStore(s => s.toggleSavedVendor);
  const isSaved = useAppStore(s => s.isSavedVendor(id));
  const ctaPress = usePressScale();
  const ctaMagnetic = useMagnetic();
  const t = useThemeColors();
  const dyn = useMemo(() => StyleSheet.create({
    screen: { backgroundColor: t.bg },
    header: { backgroundColor: t.surface, borderBottomColor: t.border, borderBottomWidth: t.isDark ? 0 : 0.5 },
    iconBtn: { backgroundColor: t.surfaceAlt },
    hero: { backgroundColor: t.surface },
    heroName: { color: t.textPrimary },
    heroCategory: { color: t.textSecondary },
    heroRating: { color: t.textPrimary },
    heroReviews: { color: t.textMuted },
    statsRow: { backgroundColor: t.surface, borderColor: t.border },
    statCellBorder: { borderColor: t.border },
    statValue: { color: t.textPrimary },
    statLabel: { color: t.textSecondary },
    sectionTitle: { color: t.textSecondary },
    card: { backgroundColor: t.surface, borderColor: t.border },
    description: { color: t.textSecondary },
    contactRowHovered: { backgroundColor: t.surfaceAlt },
    contactIcon: { backgroundColor: t.surfaceAlt },
    contactLabel: { color: t.textMuted },
    contactValue: { color: t.textPrimary },
    contactDivider: { backgroundColor: t.divider },
    infoDivider: { backgroundColor: t.divider },
    infoText: { color: t.textPrimary },
  }), [t]);

  const handleSave = async () => {
    await impactLight();
    toggleSavedVendor(id);
    showMessage({
      message: isSaved ? 'Removed from saved vendors' : 'Vendor saved',
      type: isSaved ? 'info' : 'success',
    });
  };

  if (isLoading || !vendor) {
    return (
      <View style={[styles.screen, dyn.screen, { paddingTop: insets.top }]}>
        <Pressable onPress={() => router.back()} style={[styles.backBtn, dyn.iconBtn]}>
          <ArrowLeftIcon size={22} color={t.textPrimary} />
        </Pressable>
        <LoadingSpinner />
      </View>
    );
  }

  const heroContent = (
    <>
      <VendorAvatar initials={vendor.initials} colorHex={vendor.colorHex} size={64} logoUrl={vendor.logoUrl} />
      <View style={styles.heroInfo}>
        <View style={styles.heroNameRow}>
          <Text style={[styles.heroName, dyn.heroName]}>{vendor.name}</Text>
          {vendor.isVerified && (
            <CheckCircleIcon size={18} color={colors.green[400]} weight="fill" />
          )}
        </View>
        <Text style={[styles.heroCategory, dyn.heroCategory]}>{vendor.category}</Text>
        <View style={styles.heroMeta}>
          <StarIcon size={13} color={colors.amber[400]} weight="fill" />
          <Text style={[styles.heroRating, dyn.heroRating]}>{vendor.rating.toFixed(1)}</Text>
          <Text style={[styles.heroReviews, dyn.heroReviews]}>({vendor.reviewCount} reviews)</Text>
          <VendorBadgeChip badge={vendor.badge} />
        </View>
      </View>
    </>
  );

  const mainSections = (
    <>
        {/* Stats */}
        <View style={[styles.statsRow, dyn.statsRow]}>
          <View style={styles.statCell}>
            <Text style={[styles.statValue, dyn.statValue]}>{vendor.productCount}</Text>
            <Text style={[styles.statLabel, dyn.statLabel]}>Products listed</Text>
          </View>
          <View style={[styles.statCell, styles.statCellBorder, dyn.statCellBorder]}>
            <Text style={[styles.statValue, dyn.statValue]}>{vendor.rating.toFixed(1)}</Text>
            <Text style={[styles.statLabel, dyn.statLabel]}>Rating</Text>
          </View>
          <View style={styles.statCell}>
            <Text style={[styles.statValue, dyn.statValue]}>{vendor.reviewCount}</Text>
            <Text style={[styles.statLabel, dyn.statLabel]}>Reviews</Text>
          </View>
        </View>

        {/* About */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, dyn.sectionTitle]}>About</Text>
          <View style={[styles.card, dyn.card]}>
            <Text style={[styles.description, dyn.description]}>{vendor.description}</Text>
          </View>
        </View>

        {/* Contact */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, dyn.sectionTitle]}>Contact</Text>
          <View style={[styles.card, dyn.card]}>
            {vendor.phone && (
              <ContactRow
                icon={PhoneIcon}
                label="Phone"
                value={vendor.phone}
                onPress={() => Linking.openURL(`tel:${vendor.phone!.replace(/\s/g, '')}`)}
                dyn={dyn}
                t={t}
              />
            )}
            {vendor.email && (
              <>
                <View style={[styles.contactDivider, dyn.contactDivider]} />
                <ContactRow
                  icon={EnvelopeSimpleIcon}
                  label="Email"
                  value={vendor.email}
                  onPress={() => Linking.openURL(`mailto:${vendor.email}`)}
                  dyn={dyn}
                  t={t}
                />
              </>
            )}
            {vendor.whatsapp && (
              <>
                <View style={[styles.contactDivider, dyn.contactDivider]} />
                <ContactRow
                  icon={WhatsappLogoIcon}
                  label="WhatsApp"
                  value={vendor.whatsapp}
                  onPress={() => {
                    const msg = `Hello ${vendor.name}, I found you on SokoPrice and would like to inquire about your products.`;
                    Linking.openURL(`https://wa.me/${vendor.whatsapp!.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`);
                  }}
                  dyn={dyn}
                  t={t}
                />
              </>
            )}
            {vendor.website && (
              <>
                <View style={[styles.contactDivider, dyn.contactDivider]} />
                <ContactRow
                  icon={GlobeIcon}
                  label="Website"
                  value={vendor.website}
                  onPress={() => Linking.openURL(vendor.website!)}
                  dyn={dyn}
                  t={t}
                />
              </>
            )}
          </View>
        </View>

        {/* Location & hours */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, dyn.sectionTitle]}>Location & hours</Text>
          <View style={[styles.card, dyn.card]}>
            <View style={styles.infoRow}>
              <MapPinIcon size={16} color={t.textSecondary} />
              <Text style={[styles.infoText, dyn.infoText]}>{vendor.location}</Text>
            </View>
            <View style={[styles.infoDivider, dyn.infoDivider]} />
            <View style={styles.infoRow}>
              <ClockIcon size={16} color={t.textSecondary} />
              <Text style={[styles.infoText, dyn.infoText]}>{vendor.openingHours}</Text>
            </View>
          </View>
        </View>

        {/* CTA */}
        <Animated.View ref={ctaMagnetic.ref} style={ctaMagnetic.magneticStyle}>
        <Animated.View style={ctaPress.animStyle}>
          <Pressable
            onPress={() => router.push({ pathname: '/(tabs)/search', params: { vendor: vendor.name } })}
            onPressIn={ctaPress.onPressIn}
            onPressOut={ctaPress.onPressOut}
            style={styles.ctaBtn}
          >
            <TagIcon size={18} color={colors.white} />
            <Text style={styles.ctaBtnText}>View {vendor.productCount} products</Text>
          </Pressable>
        </Animated.View>
        </Animated.View>
    </>
  );

  return (
    <View style={[styles.screen, dyn.screen, { paddingTop: insets.top }]}>
      <Head>
        <title>{vendor.name} — {vendor.category} — SokoPrice</title>
        <meta name="description" content={`${vendor.name} in ${vendor.location}. ${vendor.productCount} products, ${vendor.rating.toFixed(1)} rating from ${vendor.reviewCount} reviews.`} />
      </Head>
      {/* Header */}
      <View style={[styles.header, dyn.header]}>
        <Pressable onPress={() => router.back()} style={[styles.backBtn, dyn.iconBtn]}>
          <ArrowLeftIcon size={20} color={t.textPrimary} />
        </Pressable>
        <Pressable onPress={handleSave} style={[styles.saveBtn, dyn.iconBtn]}>
          <BookmarkSimpleIcon
            size={20}
            color={isSaved ? colors.amber[400] : t.textPrimary}
            weight={isSaved ? 'fill' : 'duotone'}
          />
        </Pressable>
      </View>

      {isDesktop ? (
        <View style={styles.desktopOuter}>
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
        </View>
      ) : (
        <>
          <View style={[styles.vendorHero, dyn.hero]}>{heroContent}</View>
          <ScrollView style={styles.mobileScroll} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
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
  saveBtn: {
    width: 36,
    height: 36,
    borderRadius: radii.full,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  vendorHero: {
    backgroundColor: colors.navy[800],
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 24,
  },
  heroInfo: {
    flex: 1,
    gap: 4,
  },
  heroNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  heroName: {
    fontSize: typography.sizes.xl,
    fontFamily: typography.displayFont,
    color: colors.white,
    flex: 1,
  },
  heroCategory: {
    fontSize: typography.sizes.sm,
    color: 'rgba(255,255,255,0.5)',
  },
  heroMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  heroRating: {
    fontSize: typography.sizes.sm,
    fontWeight: '500',
    color: colors.white,
  },
  heroReviews: {
    fontSize: typography.sizes.xs,
    color: 'rgba(255,255,255,0.4)',
  },
  mobileScroll: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  // Replicates ResponsiveContainer's centering (width:'100%', max 1200,
  // centered) inline instead of using the shared component — that
  // component has no flex:1 in its own tree (by design, since it's also
  // used inside ScrollView content elsewhere), so wrapping this row in it
  // would leave the row's height undefined and the ScrollView unscrollable.
  desktopOuter: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
  },
  desktopRow: {
    flex: 1,
    width: '100%',
    maxWidth: 1200,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 24,
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  desktopHeroPane: {
    width: 380,
    flexShrink: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: colors.navy[800],
    borderRadius: radii.xl,
    padding: 24,
    position: 'sticky' as any,
    top: 24,
  },
  desktopContentPane: {
    flex: 1,
    // desktopRow uses alignItems:'flex-start' so the sticky hero pane sizes
    // to its own content instead of stretching — but that also means this
    // ScrollView never gets a bounded height from flex:1 alone (flex:1 in a
    // row only governs width). alignSelf:'stretch' overrides the row's
    // cross-axis alignment for this child only, giving it the full row
    // height so scroll overflow can actually be computed.
    alignSelf: 'stretch',
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    borderWidth: 0.5,
    borderColor: colors.gray[200],
    marginBottom: 20,
    overflow: 'hidden',
  },
  statCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
  },
  statCellBorder: {
    borderLeftWidth: 0.5,
    borderRightWidth: 0.5,
    borderColor: colors.gray[200],
  },
  statValue: {
    fontSize: typography.sizes['2xl'],
    fontFamily: typography.displayFontMedium,
    color: colors.navy[800],
  },
  statLabel: {
    fontSize: 11,
    color: colors.gray[400],
    marginTop: 3,
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
    overflow: 'hidden',
    padding: 16,
  },
  description: {
    fontSize: typography.sizes.base,
    color: colors.gray[600],
    lineHeight: 22,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 2,
    borderRadius: radii.md,
  },
  contactRowHovered: {
    backgroundColor: colors.gray[50],
  },
  contactIcon: {
    width: 32,
    height: 32,
    borderRadius: radii.md,
    backgroundColor: colors.navy[50],
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  contactInfo: {
    flex: 1,
  },
  contactLabel: {
    fontSize: 11,
    color: colors.gray[400],
  },
  contactValue: {
    fontSize: typography.sizes.base,
    color: colors.navy[800],
    marginTop: 1,
  },
  contactDivider: {
    height: 0.5,
    backgroundColor: colors.gray[100],
    marginVertical: 10,
    marginLeft: 44,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  infoDivider: {
    height: 0.5,
    backgroundColor: colors.gray[100],
    marginVertical: 12,
    marginLeft: 26,
  },
  infoText: {
    flex: 1,
    fontSize: typography.sizes.base,
    color: colors.navy[800],
    lineHeight: 22,
  },
  ctaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: radii.lg,
    backgroundColor: colors.navy[800],
    marginBottom: 8,
  },
  ctaBtnText: {
    fontSize: typography.sizes.base,
    fontWeight: '500',
    color: colors.white,
  },
});
