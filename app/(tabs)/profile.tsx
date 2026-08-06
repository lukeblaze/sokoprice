import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';
import { Text } from '@/components/common/Text';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  BellIcon,
  HeartIcon,
  StorefrontIcon,
  MapPinIcon,
  CurrencyCircleDollarIcon,
  MoonIcon,
  BuildingsIcon,
  UsersThreeIcon,
  FileTextIcon,
  SignOutIcon,
  CaretRightIcon,
  type IconProps,
} from 'phosphor-react-native';
import { useAppStore } from '@/store';
import { colors, radii, typography } from '@/theme/tokens';
import { showMessage } from 'react-native-flash-message';
import { useRef } from 'react';
import { PickerSheet, type PickerSheetHandle } from '@/components/common/PickerSheet';
import Head from 'expo-router/head';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';

const NAIROBI_AREAS = ['Nairobi CBD', 'Westlands', 'Kilimani', 'Upper Hill', 'Ngara', 'Kileleshwa'];
const CURRENCIES = [
  { label: 'Kenyan Shilling (KES)', value: 'KES' },
  { label: 'US Dollar (USD)', value: 'USD' },
  { label: 'Euro (EUR)', value: 'EUR' },
];
const APPEARANCES = [
  { label: 'Light', value: 'light' },
  { label: 'Dark', value: 'dark' },
  { label: 'System', value: 'system' },
];

interface SettingsRowProps {
  icon: React.ComponentType<IconProps>;
  label: string;
  value?: string;
  onPress?: () => void;
  danger?: boolean;
  iconBg?: string;
  iconColor?: string;
  comingSoon?: boolean;
}

function SettingsRow({ icon: Icon, label, value, onPress, danger, iconBg, iconColor, comingSoon }: SettingsRowProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ hovered, focused }) => [
        styles.settingsRow,
        comingSoon && styles.settingsRowDisabled,
        (hovered || focused) && !comingSoon && styles.settingsRowHovered,
      ]}
    >
      <View style={[styles.settingsIcon, { backgroundColor: iconBg ?? colors.gray[100] }]}>
        <Icon size={17} color={iconColor ?? colors.gray[500]} />
      </View>
      <Text style={[styles.settingsLabel, danger && { color: colors.red[500] }]}>{label}</Text>
      <View style={styles.settingsRight}>
        {comingSoon && <Text style={styles.comingSoonTag}>Soon</Text>}
        {value && <Text style={styles.settingsValue}>{value}</Text>}
        <CaretRightIcon size={14} color={colors.gray[300]} />
      </View>
    </Pressable>
  );
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const user = useAppStore(s => s.user);
  const alerts = useAppStore(s => s.alerts);
  const watchlistIds = useAppStore(s => s.watchlistIds);
  const savedVendorIds = useAppStore(s => s.savedVendorIds);
  const colorScheme = useAppStore(s => s.colorScheme);
  const setColorScheme = useAppStore(s => s.setColorScheme);
  const setUserLocation = useAppStore(s => s.setUserLocation);
  const setUserCurrency = useAppStore(s => s.setUserCurrency);
  const signOut = useAppStore(s => s.signOut);

  const locationSheet = useRef<PickerSheetHandle>(null);
  const currencySheet = useRef<PickerSheetHandle>(null);
  const appearanceSheet = useRef<PickerSheetHandle>(null);

  const initials = user?.name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase() ?? 'BL';

  const handleComingSoon = () => showMessage({ message: 'Coming soon', type: 'info' });

  const handleExport = async () => {
    const lines = [
      'SokoPrice — Price Alerts & Watchlist Export',
      `Generated: ${new Date().toLocaleString()}`,
      '',
      `Price alerts (${alerts.length}):`,
      ...alerts.map(a => `  - ${a.productName}: alert ${a.direction} KES ${a.targetPrice.toLocaleString()} (now KES ${a.currentPrice.toLocaleString()})`),
      '',
      `Watchlist (${watchlistIds.size} products): ${Array.from(watchlistIds).join(', ') || 'none'}`,
    ].join('\n');

    if (Platform.OS === 'web') {
      if (typeof navigator !== 'undefined' && (navigator as any).share) {
        try {
          await (navigator as any).share({ title: 'SokoPrice export', text: lines });
        } catch {
          // user cancelled — no-op
        }
      } else if (typeof document !== 'undefined') {
        const blob = new Blob([lines], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'sokoprice-export.txt';
        a.click();
        URL.revokeObjectURL(url);
      }
      return;
    }

    const fileUri = `${FileSystem.cacheDirectory}sokoprice-export.txt`;
    await FileSystem.writeAsStringAsync(fileUri, lines);
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(fileUri);
    } else {
      showMessage({ message: 'Sharing is not available on this device', type: 'warning' });
    }
  };

  const handleSignOut = () => {
    signOut();
    showMessage({ message: 'Signed out', type: 'info' });
    router.replace('/(auth)/login');
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <Head>
        <title>Your Profile — SokoPrice</title>
        <meta name="description" content="Manage your account, preferences, and business details." />
      </Head>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Hero */}
        <View style={styles.hero}>
          <View style={styles.bigAvatar}>
            <Text style={styles.bigAvatarText}>{initials}</Text>
          </View>
          <Text style={styles.heroName}>{user?.businessName ?? 'Blaze Solutions Ltd'}</Text>
          <Text style={styles.heroRole}>
            {user?.plan === 'business' ? 'Business account' : 'Free account'} · {user?.location ?? 'Nairobi'}
          </Text>

          {/* Stats strip */}
          <View style={styles.statsStrip}>
            <View style={styles.stripStat}>
              <Text style={styles.stripValue}>{watchlistIds.size}</Text>
              <Text style={styles.stripLabel}>Watchlist</Text>
            </View>
            <View style={[styles.stripStat, styles.stripStatBorder]}>
              <Text style={styles.stripValue}>{alerts.length}</Text>
              <Text style={styles.stripLabel}>Price alerts</Text>
            </View>
            <View style={styles.stripStat}>
              <Text style={styles.stripValue}>{savedVendorIds.size}</Text>
              <Text style={styles.stripLabel}>Saved vendors</Text>
            </View>
          </View>
        </View>

        {/* Account group */}
        <View style={styles.group}>
          <SettingsRow
            icon={BellIcon}
            label="Price alerts"
            value={`${alerts.length} active`}
            iconBg={colors.amber[50]}
            iconColor={colors.amber[600]}
            onPress={() => router.push('/(tabs)/alerts')}
          />
          <View style={styles.divider} />
          <SettingsRow
            icon={HeartIcon}
            label="Watchlist"
            value={`${watchlistIds.size} products`}
            iconBg={colors.red[50]}
            iconColor={colors.red[500]}
            onPress={() => router.push({ pathname: '/(tabs)/search', params: { mode: 'watchlist' } })}
          />
          <View style={styles.divider} />
          <SettingsRow
            icon={StorefrontIcon}
            label="Saved vendors"
            value={`${savedVendorIds.size} vendors`}
            iconBg={colors.green[50]}
            iconColor={colors.green[600]}
            onPress={() => router.push({ pathname: '/(tabs)/vendors', params: { mode: 'saved' } })}
          />
        </View>

        {/* Preferences group */}
        <View style={styles.group}>
          <SettingsRow
            icon={MapPinIcon}
            label="Location"
            value={user?.location ?? 'Nairobi CBD'}
            onPress={() => locationSheet.current?.present()}
          />
          <View style={styles.divider} />
          <SettingsRow
            icon={CurrencyCircleDollarIcon}
            label="Currency"
            value={user?.currency ?? 'KES'}
            onPress={() => currencySheet.current?.present()}
          />
          <View style={styles.divider} />
          <SettingsRow
            icon={MoonIcon}
            label="Appearance"
            value={colorScheme.charAt(0).toUpperCase() + colorScheme.slice(1)}
            onPress={() => appearanceSheet.current?.present()}
          />
        </View>

        {/* Business group */}
        <View style={styles.group}>
          <SettingsRow
            icon={BuildingsIcon}
            label="Business details"
            iconBg={colors.navy[50]}
            iconColor={colors.navy[600]}
            onPress={handleComingSoon}
            comingSoon
          />
          <View style={styles.divider} />
          <SettingsRow
            icon={UsersThreeIcon}
            label="Team members"
            iconBg={colors.navy[50]}
            iconColor={colors.navy[600]}
            onPress={handleComingSoon}
            comingSoon
          />
          <View style={styles.divider} />
          <SettingsRow
            icon={FileTextIcon}
            label="Export price history"
            iconBg={colors.navy[50]}
            iconColor={colors.navy[600]}
            onPress={handleExport}
          />
        </View>

        {/* Sign out */}
        <View style={styles.group}>
          <SettingsRow
            icon={SignOutIcon}
            label="Sign out"
            danger
            iconBg={colors.red[50]}
            iconColor={colors.red[500]}
            onPress={handleSignOut}
          />
        </View>

        {/* Version */}
        <Text style={styles.version}>SokoPrice v1.0.0 · Blaze Solutions Ltd</Text>
      </ScrollView>

      <PickerSheet
        ref={locationSheet}
        title="Location"
        options={NAIROBI_AREAS.map(a => ({ label: a, value: a }))}
        value={user?.location ?? 'Nairobi CBD'}
        onSelect={setUserLocation}
      />
      <PickerSheet
        ref={currencySheet}
        title="Currency"
        options={CURRENCIES}
        value={user?.currency ?? 'KES'}
        onSelect={v => setUserCurrency(v as 'KES' | 'USD' | 'EUR')}
      />
      <PickerSheet
        ref={appearanceSheet}
        title="Appearance"
        options={APPEARANCES}
        value={colorScheme}
        onSelect={v => setColorScheme(v as 'light' | 'dark' | 'system')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  scroll: {
    paddingBottom: 32,
  },
  hero: {
    backgroundColor: colors.navy[800],
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 28,
    alignItems: 'center',
  },
  bigAvatar: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: colors.amber[400],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  bigAvatarText: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.navy[800],
  },
  heroName: {
    fontSize: typography.sizes.xl,
    fontFamily: typography.displayFont,
    color: colors.white,
  },
  heroRole: {
    fontSize: typography.sizes.sm,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 4,
  },
  statsStrip: {
    flexDirection: 'row',
    marginTop: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: radii.lg,
    overflow: 'hidden',
    width: '100%',
  },
  stripStat: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
  },
  stripStatBorder: {
    borderLeftWidth: 0.5,
    borderRightWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  stripValue: {
    fontSize: typography.sizes.xl,
    fontFamily: typography.displayFontMedium,
    color: colors.white,
  },
  stripLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.45)',
    marginTop: 2,
  },
  group: {
    marginHorizontal: 20,
    marginTop: 16,
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    borderWidth: 0.5,
    borderColor: colors.gray[200],
    overflow: 'hidden',
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  settingsRowDisabled: {
    opacity: 0.5,
  },
  settingsRowHovered: {
    backgroundColor: colors.gray[50],
  },
  comingSoonTag: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.gray[500],
    backgroundColor: colors.gray[100],
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radii.full,
    textTransform: 'uppercase',
  },
  settingsIcon: {
    width: 32,
    height: 32,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsLabel: {
    flex: 1,
    fontSize: typography.sizes.base,
    color: colors.navy[800],
  },
  settingsRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  settingsValue: {
    fontSize: typography.sizes.sm,
    color: colors.gray[400],
  },
  divider: {
    height: 0.5,
    backgroundColor: colors.gray[100],
    marginLeft: 58,
  },
  version: {
    textAlign: 'center',
    fontSize: 11,
    color: colors.gray[300],
    marginTop: 24,
  },
});
