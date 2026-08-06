import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '@/store';
import { colors, radii, typography } from '@/theme/tokens';
import { showMessage } from 'react-native-flash-message';

interface SettingsRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string;
  onPress?: () => void;
  danger?: boolean;
  iconBg?: string;
  iconColor?: string;
}

function SettingsRow({ icon, label, value, onPress, danger, iconBg, iconColor }: SettingsRowProps) {
  return (
    <Pressable onPress={onPress} style={styles.settingsRow}>
      <View style={[styles.settingsIcon, { backgroundColor: iconBg ?? colors.gray[100] }]}>
        <Ionicons name={icon} size={17} color={iconColor ?? colors.gray[500]} />
      </View>
      <Text style={[styles.settingsLabel, danger && { color: colors.red[500] }]}>{label}</Text>
      <View style={styles.settingsRight}>
        {value && <Text style={styles.settingsValue}>{value}</Text>}
        <Ionicons name="chevron-forward" size={14} color={colors.gray[300]} />
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

  const initials = user?.name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase() ?? 'BL';

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
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
            icon="notifications-outline"
            label="Price alerts"
            value={`${alerts.length} active`}
            iconBg={colors.amber[50]}
            iconColor={colors.amber[600]}
            onPress={() => {}}
          />
          <View style={styles.divider} />
          <SettingsRow
            icon="heart-outline"
            label="Watchlist"
            value={`${watchlistIds.size} products`}
            iconBg={colors.red[50]}
            iconColor={colors.red[500]}
            onPress={() => {}}
          />
          <View style={styles.divider} />
          <SettingsRow
            icon="storefront-outline"
            label="Saved vendors"
            value={`${savedVendorIds.size} vendors`}
            iconBg={colors.green[50]}
            iconColor={colors.green[600]}
            onPress={() => {}}
          />
        </View>

        {/* Preferences group */}
        <View style={styles.group}>
          <SettingsRow
            icon="location-outline"
            label="Location"
            value="Nairobi CBD"
            onPress={() => {}}
          />
          <View style={styles.divider} />
          <SettingsRow
            icon="cash-outline"
            label="Currency"
            value="KES"
            onPress={() => {}}
          />
          <View style={styles.divider} />
          <SettingsRow
            icon="moon-outline"
            label="Appearance"
            value="Light"
            onPress={() => {}}
          />
        </View>

        {/* Business group */}
        <View style={styles.group}>
          <SettingsRow
            icon="business-outline"
            label="Business details"
            iconBg={colors.navy[50]}
            iconColor={colors.navy[600]}
            onPress={() => {}}
          />
          <View style={styles.divider} />
          <SettingsRow
            icon="people-outline"
            label="Team members"
            value="1 member"
            iconBg={colors.navy[50]}
            iconColor={colors.navy[600]}
            onPress={() => {}}
          />
          <View style={styles.divider} />
          <SettingsRow
            icon="document-text-outline"
            label="Export price history"
            iconBg={colors.navy[50]}
            iconColor={colors.navy[600]}
            onPress={() => showMessage({ message: 'Export started', type: 'success' })}
          />
        </View>

        {/* Sign out */}
        <View style={styles.group}>
          <SettingsRow
            icon="log-out-outline"
            label="Sign out"
            danger
            iconBg={colors.red[50]}
            iconColor={colors.red[500]}
            onPress={() => showMessage({ message: 'Signed out', type: 'info' })}
          />
        </View>

        {/* Version */}
        <Text style={styles.version}>SokoPrice v1.0.0 · Blaze Solutions Ltd</Text>
      </ScrollView>
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
    fontWeight: '600',
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
    fontWeight: '600',
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
