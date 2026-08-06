import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { Text } from '@/components/common/Text';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { BellIcon } from 'phosphor-react-native';
import { colors, radii, typography } from '@/theme/tokens';
import { useAppStore } from '@/store';
import { TAB_ROUTE_ICONS } from './tabConfig';

const SIDEBAR_WIDTH = 232;

// react-navigation's BottomTabView invokes the `tabBar` prop as a plain
// function call inside a Context.Consumer's `children` render-prop
// (BottomTabView.js:164), not via JSX — so it never gets its own Fiber.
// Hooks called directly in that function violate the rules of hooks
// (React error #321). Returning a JSX element from the outer function
// defers rendering to a proper child Fiber, where hooks work normally.
export function DesktopSidebar(props: BottomTabBarProps) {
  return <DesktopSidebarInner {...props} />;
}

function DesktopSidebarInner({ state, descriptors, navigation }: BottomTabBarProps) {
  const user = useAppStore(s => s.user);
  const unreadCount = useAppStore(s => s.unreadCount);
  const initials = user?.name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase() ?? 'BL';

  return (
    <View style={styles.sidebar}>
      <View style={styles.brand}>
        <View style={styles.brandMark}>
          <Text style={styles.brandMarkText}>SP</Text>
        </View>
        <Text style={styles.brandName}>SokoPrice</Text>
      </View>

      <View style={styles.nav}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const focused = state.index === index;
          const IconCmp = TAB_ROUTE_ICONS[route.name];
          const label = typeof options.title === 'string' ? options.title : route.name;
          const badge = route.name === 'alerts' ? unreadCount : undefined;

          const onPress = () => {
            const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!focused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              accessibilityRole="button"
              style={({ hovered, focused: keyboardFocused }) => [
                styles.navItem,
                focused && styles.navItemActive,
                (hovered || keyboardFocused) && !focused && styles.navItemHover,
              ]}
            >
              {IconCmp && (
                <IconCmp
                  size={20}
                  color={focused ? colors.navy[800] : 'rgba(255,255,255,0.65)'}
                  weight={focused ? 'fill' : 'duotone'}
                />
              )}
              <Text style={[styles.navLabel, focused && styles.navLabelActive]}>{label}</Text>
              {badge !== undefined && badge > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{badge > 9 ? '9+' : badge}</Text>
                </View>
              )}
            </Pressable>
          );
        })}
      </View>

      <Pressable
        onPress={() => navigation.navigate('profile')}
        style={({ hovered }) => [styles.userChip, hovered && styles.userChipHover]}
      >
        <View style={styles.userAvatar}>
          <Text style={styles.userAvatarText}>{initials}</Text>
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName} numberOfLines={1}>{user?.businessName ?? 'Blaze Solutions Ltd'}</Text>
          <Text style={styles.userMeta} numberOfLines={1}>{user?.location ?? 'Nairobi, Kenya'}</Text>
        </View>
        <BellIcon size={16} color="rgba(255,255,255,0.4)" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  sidebar: {
    width: SIDEBAR_WIDTH,
    backgroundColor: colors.navy[800],
    paddingVertical: 24,
    paddingHorizontal: 16,
    justifyContent: 'flex-start',
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 8,
    marginBottom: 32,
  },
  brandMark: {
    width: 32,
    height: 32,
    borderRadius: radii.md,
    backgroundColor: colors.amber[400],
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandMarkText: {
    fontSize: 13,
    fontFamily: typography.displayFont,
    color: colors.navy[800],
  },
  brandName: {
    fontSize: typography.sizes.lg,
    fontFamily: typography.displayFont,
    color: colors.white,
  },
  nav: {
    gap: 2,
    flex: 1,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 12,
    paddingVertical: 11,
    borderRadius: radii.md,
  },
  navItemHover: {
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  navItemActive: {
    backgroundColor: colors.amber[400],
  },
  navLabel: {
    fontSize: typography.sizes.base,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.75)',
    flex: 1,
  },
  navLabelActive: {
    color: colors.navy[800],
    fontWeight: '600',
  },
  badge: {
    minWidth: 18,
    height: 18,
    borderRadius: radii.full,
    backgroundColor: colors.red[400],
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.white,
  },
  userChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 10,
    borderRadius: radii.md,
    marginTop: 8,
  },
  userChipHover: {
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  userAvatar: {
    width: 34,
    height: 34,
    borderRadius: radii.full,
    backgroundColor: colors.amber[400],
    alignItems: 'center',
    justifyContent: 'center',
  },
  userAvatarText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.navy[800],
  },
  userInfo: {
    flex: 1,
    minWidth: 0,
  },
  userName: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.white,
  },
  userMeta: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.45)',
    marginTop: 1,
  },
});
