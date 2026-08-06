import React from 'react';
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
import * as Haptics from 'expo-haptics';
import { useVendor } from '@/hooks/useQueries';
import { useAppStore } from '@/store';
import { colors, radii, typography } from '@/theme/tokens';
import { VendorAvatar, VendorBadgeChip, LoadingSpinner } from '@/components/common';
import { useBreakpoint } from '@/hooks/useResponsive';
import { ResponsiveContainer } from '@/components/common/ResponsiveContainer';

function ContactRow({
  icon: Icon,
  label,
  value,
  onPress,
}: {
  icon: React.ComponentType<IconProps>;
  label: string;
  value: string;
  onPress?: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.contactRow}>
      <View style={styles.contactIcon}>
        <Icon size={16} color={colors.navy[600]} />
      </View>
      <View style={styles.contactInfo}>
        <Text style={styles.contactLabel}>{label}</Text>
        <Text style={styles.contactValue}>{value}</Text>
      </View>
      {onPress && <CaretRightIcon size={14} color={colors.gray[300]} />}
    </Pressable>
  );
}

export default function VendorDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { isDesktop } = useBreakpoint();

  const { data: vendor, isLoading } = useVendor(id);
  const toggleSavedVendor = useAppStore(s => s.toggleSavedVendor);
  const isSaved = useAppStore(s => s.isSavedVendor(id));

  const handleSave = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    toggleSavedVendor(id);
    showMessage({
      message: isSaved ? 'Removed from saved vendors' : 'Vendor saved',
      type: isSaved ? 'info' : 'success',
    });
  };

  if (isLoading || !vendor) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeftIcon size={22} color={colors.white} />
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
          <Text style={styles.heroName}>{vendor.name}</Text>
          {vendor.isVerified && (
            <CheckCircleIcon size={18} color={colors.green[400]} weight="fill" />
          )}
        </View>
        <Text style={styles.heroCategory}>{vendor.category}</Text>
        <View style={styles.heroMeta}>
          <StarIcon size={13} color={colors.amber[400]} weight="fill" />
          <Text style={styles.heroRating}>{vendor.rating.toFixed(1)}</Text>
          <Text style={styles.heroReviews}>({vendor.reviewCount} reviews)</Text>
          <VendorBadgeChip badge={vendor.badge} />
        </View>
      </View>
    </>
  );

  const mainSections = (
    <>
        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCell}>
            <Text style={styles.statValue}>{vendor.productCount}</Text>
            <Text style={styles.statLabel}>Products listed</Text>
          </View>
          <View style={[styles.statCell, styles.statCellBorder]}>
            <Text style={styles.statValue}>{vendor.rating.toFixed(1)}</Text>
            <Text style={styles.statLabel}>Rating</Text>
          </View>
          <View style={styles.statCell}>
            <Text style={styles.statValue}>{vendor.reviewCount}</Text>
            <Text style={styles.statLabel}>Reviews</Text>
          </View>
        </View>

        {/* About */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <View style={styles.card}>
            <Text style={styles.description}>{vendor.description}</Text>
          </View>
        </View>

        {/* Contact */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact</Text>
          <View style={styles.card}>
            {vendor.phone && (
              <ContactRow
                icon={PhoneIcon}
                label="Phone"
                value={vendor.phone}
                onPress={() => Linking.openURL(`tel:${vendor.phone!.replace(/\s/g, '')}`)}
              />
            )}
            {vendor.email && (
              <>
                <View style={styles.contactDivider} />
                <ContactRow
                  icon={EnvelopeSimpleIcon}
                  label="Email"
                  value={vendor.email}
                  onPress={() => Linking.openURL(`mailto:${vendor.email}`)}
                />
              </>
            )}
            {vendor.whatsapp && (
              <>
                <View style={styles.contactDivider} />
                <ContactRow
                  icon={WhatsappLogoIcon}
                  label="WhatsApp"
                  value={vendor.whatsapp}
                  onPress={() => {
                    const msg = `Hello ${vendor.name}, I found you on SokoPrice and would like to inquire about your products.`;
                    Linking.openURL(`https://wa.me/${vendor.whatsapp!.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`);
                  }}
                />
              </>
            )}
            {vendor.website && (
              <>
                <View style={styles.contactDivider} />
                <ContactRow
                  icon={GlobeIcon}
                  label="Website"
                  value={vendor.website}
                  onPress={() => Linking.openURL(vendor.website!)}
                />
              </>
            )}
          </View>
        </View>

        {/* Location & hours */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location & hours</Text>
          <View style={styles.card}>
            <View style={styles.infoRow}>
              <MapPinIcon size={16} color={colors.navy[600]} />
              <Text style={styles.infoText}>{vendor.location}</Text>
            </View>
            <View style={styles.infoDivider} />
            <View style={styles.infoRow}>
              <ClockIcon size={16} color={colors.navy[600]} />
              <Text style={styles.infoText}>{vendor.openingHours}</Text>
            </View>
          </View>
        </View>

        {/* CTA */}
        <Pressable
          onPress={() => router.push({ pathname: '/(tabs)/search', params: { vendor: vendor.name } })}
          style={styles.ctaBtn}
        >
          <TagIcon size={18} color={colors.white} />
          <Text style={styles.ctaBtnText}>View {vendor.productCount} products</Text>
        </Pressable>
    </>
  );

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <Head>
        <title>{vendor.name} — {vendor.category} — SokoPrice</title>
        <meta name="description" content={`${vendor.name} in ${vendor.location}. ${vendor.productCount} products, ${vendor.rating.toFixed(1)} rating from ${vendor.reviewCount} reviews.`} />
      </Head>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeftIcon size={20} color={colors.white} />
        </Pressable>
        <Pressable onPress={handleSave} style={styles.saveBtn}>
          <BookmarkSimpleIcon
            size={20}
            color={isSaved ? colors.amber[400] : colors.white}
            weight={isSaved ? 'fill' : 'duotone'}
          />
        </Pressable>
      </View>

      {isDesktop ? (
        <ResponsiveContainer>
          <View style={styles.desktopRow}>
            <View style={styles.desktopHeroPane}>{heroContent}</View>
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
          <View style={styles.vendorHero}>{heroContent}</View>
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
