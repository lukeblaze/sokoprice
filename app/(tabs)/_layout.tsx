import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '@/components/common/Text';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radii } from '@/theme/tokens';
import { useNotifications } from '@/hooks/useQueries';
import { useBreakpoint } from '@/hooks/useResponsive';
import { useThemeColors } from '@/hooks/useThemeColors';
import { TAB_ROUTE_ICONS } from '@/components/navigation/tabConfig';
import { DesktopSidebar } from '@/components/navigation/DesktopSidebar';

function TabIcon({
  route,
  focused,
  badge,
}: {
  route: keyof typeof TAB_ROUTE_ICONS;
  focused: boolean;
  badge?: number;
}) {
  const IconCmp = TAB_ROUTE_ICONS[route];
  const t = useThemeColors();
  return (
    <View style={styles.iconWrap}>
      <IconCmp
        size={24}
        color={focused ? colors.amber[400] : t.textMuted}
        weight={focused ? 'fill' : 'duotone'}
      />
      {badge !== undefined && badge > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badge > 9 ? '9+' : badge}</Text>
        </View>
      )}
    </View>
  );
}

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const { data: notificationsData } = useNotifications();
  const unreadCount = notificationsData?.unreadCount ?? 0;
  const { isDesktop } = useBreakpoint();
  const t = useThemeColors();

  return (
    <Tabs
      tabBar={isDesktop ? DesktopSidebar : undefined}
      screenOptions={{
        headerShown: false,
        tabBarPosition: isDesktop ? 'left' : 'bottom',
        tabBarStyle: {
          backgroundColor: t.surface,
          borderTopWidth: t.isDark ? 0 : 0.5,
          borderTopColor: t.border,
          height: 56 + insets.bottom,
          paddingBottom: insets.bottom,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '500',
          marginTop: 2,
        },
        tabBarActiveTintColor: colors.amber[500],
        tabBarInactiveTintColor: t.textMuted,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused }) => <TabIcon route="index" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Search',
          tabBarIcon: ({ focused }) => <TabIcon route="search" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="vendors"
        options={{
          title: 'Vendors',
          tabBarIcon: ({ focused }) => <TabIcon route="vendors" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="alerts"
        options={{
          title: 'Alerts',
          tabBarIcon: ({ focused }) => (
            <TabIcon route="alerts" focused={focused} badge={unreadCount} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused }) => <TabIcon route="profile" focused={focused} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconWrap: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -8,
    minWidth: 16,
    height: 16,
    borderRadius: radii.full,
    backgroundColor: colors.red[400],
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.white,
  },
});
