import React, { useMemo } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Pressable,
  Switch,
} from 'react-native';
import { Text } from '@/components/common/Text';
import { router } from 'expo-router';
import Head from 'expo-router/head';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  TrendDownIcon,
  TrendUpIcon,
  BellIcon,
  StorefrontIcon,
  InfoIcon,
  BellSlashIcon,
  TrashIcon,
  type IconProps,
} from 'phosphor-react-native';
import {
  useAlerts,
  useNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
  useUpdateAlert,
  useDeleteAlert,
} from '@/hooks/useQueries';
import { colors, radii, typography } from '@/theme/tokens';
import { formatKES, formatRelativeTime } from '@/utils/format';
import { useThemeColors } from '@/hooks/useThemeColors';
import type { Notification } from '@/types';

const NOTIF_ICON: Record<string, { icon: React.ComponentType<IconProps>; color: string; bg: string }> = {
  price_drop:      { icon: TrendDownIcon, color: colors.green[600], bg: colors.green[50] },
  price_rise:      { icon: TrendUpIcon, color: colors.red[600], bg: colors.red[50] },
  alert_triggered: { icon: BellIcon, color: colors.amber[600], bg: colors.amber[50] },
  new_vendor:      { icon: StorefrontIcon, color: colors.navy[600], bg: colors.navy[50] },
  system:          { icon: InfoIcon, color: colors.gray[500], bg: colors.gray[100] },
};

function NotifRow({ notif, onPress, dyn }: {
  notif: Notification;
  onPress: () => void;
  dyn: ReturnType<typeof StyleSheet.create>;
}) {
  const config = NOTIF_ICON[notif.type] ?? NOTIF_ICON.system;
  const NotifIcon = config.icon;

  return (
    <Pressable
      onPress={onPress}
      style={[styles.notifRow, dyn.notifRow, !notif.isRead && styles.notifRowUnread]}
    >
      {!notif.isRead && <View style={styles.unreadDot} />}
      <View style={[styles.notifIcon, { backgroundColor: config.bg }]}>
        <NotifIcon size={18} color={config.color} />
      </View>
      <View style={styles.notifContent}>
        <Text style={[styles.notifTitle, dyn.notifTitle]}>{notif.title}</Text>
        <Text style={[styles.notifBody, dyn.notifBody]} numberOfLines={2}>{notif.body}</Text>
        <Text style={[styles.notifTime, dyn.notifTime]}>{formatRelativeTime(notif.createdAt)}</Text>
      </View>
    </Pressable>
  );
}

export default function AlertsScreen() {
  const insets = useSafeAreaInsets();
  const { data: alerts = [] } = useAlerts();
  const { data: notificationsData } = useNotifications();
  const notifications = notificationsData?.results ?? [];
  const unreadCount = notificationsData?.unreadCount ?? 0;
  const markReadMutation = useMarkNotificationRead();
  const markAllReadMutation = useMarkAllNotificationsRead();
  const updateAlertMutation = useUpdateAlert();
  const deleteAlertMutation = useDeleteAlert();
  const markRead = (id: string) => markReadMutation.mutate(id);
  const markAllRead = () => markAllReadMutation.mutate();
  const toggleAlert = (alert: (typeof alerts)[number]) =>
    updateAlertMutation.mutate({ id: alert.id, patch: { isActive: !alert.isActive } });
  const removeAlert = (id: string) => deleteAlertMutation.mutate(id);
  const t = useThemeColors();
  const dyn = useMemo(() => StyleSheet.create({
    screen: { backgroundColor: t.bg },
    header: { backgroundColor: t.surface, borderBottomColor: t.border },
    title: { color: t.textPrimary },
    sectionTitle: { color: t.textPrimary },
    alertsCard: { backgroundColor: t.surface, borderColor: t.border },
    alertRowBorder: { borderBottomColor: t.divider },
    alertName: { color: t.textPrimary },
    alertTarget: { color: t.textSecondary },
    notifsCard: { backgroundColor: t.surface, borderColor: t.border },
    notifRow: { borderBottomColor: t.divider },
    notifTitle: { color: t.textPrimary },
    notifBody: { color: t.textSecondary },
    notifTime: { color: t.textMuted },
    emptyText: { color: t.textPrimary },
    emptySubText: { color: t.textSecondary },
  }), [t]);

  return (
    <View style={[styles.screen, dyn.screen, { paddingTop: insets.top }]}>
      <Head>
        <title>Price Alerts & Notifications — SokoPrice</title>
        <meta name="description" content="Manage your price drop alerts and notifications for tracked products." />
      </Head>
      <View style={[styles.header, dyn.header]}>
        <Text style={[styles.title, dyn.title]}>Alerts</Text>
        {unreadCount > 0 && (
          <Pressable onPress={markAllRead}>
            <Text style={styles.markAll}>Mark all read</Text>
          </Pressable>
        )}
      </View>

      <FlatList
        style={styles.scrollView}
        data={['alerts', 'notifications'] as const}
        keyExtractor={k => k}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        renderItem={({ item }) => {
          if (item === 'alerts') {
            return (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, dyn.sectionTitle]}>Price alerts ({alerts.length})</Text>
                {alerts.length === 0 ? (
                  <View style={styles.emptyAlerts}>
                    <BellSlashIcon size={32} color={t.textMuted} />
                    <Text style={[styles.emptyText, dyn.emptyText]}>No active price alerts.</Text>
                    <Text style={[styles.emptySubText, dyn.emptySubText]}>Open any product to set an alert.</Text>
                  </View>
                ) : (
                  <View style={[styles.alertsCard, dyn.alertsCard]}>
                    {alerts.map((alert, i) => (
                      <View
                        key={alert.id}
                        style={[styles.alertRow, i < alerts.length - 1 && [styles.alertRowBorder, dyn.alertRowBorder]]}
                      >
                        <View style={styles.alertLeft}>
                          <View style={[styles.alertDot, alert.isActive ? styles.alertDotActive : styles.alertDotOff]} />
                          <View style={styles.alertInfo}>
                            <Text style={[styles.alertName, dyn.alertName]} numberOfLines={1}>{alert.productName}</Text>
                            <Text style={[styles.alertTarget, dyn.alertTarget]}>
                              Alert when {alert.direction === 'below' ? 'below' : 'above'} {formatKES(alert.targetPrice)}
                            </Text>
                            <Text style={styles.alertCurrent}>
                              Now: {formatKES(alert.currentPrice)}
                            </Text>
                          </View>
                        </View>
                        <View style={styles.alertRight}>
                          <Switch
                            value={alert.isActive}
                            onValueChange={() => toggleAlert(alert)}
                            trackColor={{ false: colors.gray[200], true: colors.amber[300] }}
                            thumbColor={alert.isActive ? colors.amber[500] : colors.gray[400]}
                          />
                          <Pressable onPress={() => removeAlert(alert.id)} style={styles.deleteBtn}>
                            <TrashIcon size={15} color={colors.gray[400]} />
                          </Pressable>
                        </View>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            );
          }

          return (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, dyn.sectionTitle]}>
                Notifications {unreadCount > 0 ? `(${unreadCount} new)` : ''}
              </Text>
              {notifications.length === 0 ? (
                <View style={styles.emptyAlerts}>
                  <Text style={[styles.emptyText, dyn.emptyText]}>No notifications yet.</Text>
                </View>
              ) : (
                <View style={[styles.notifsCard, dyn.notifsCard]}>
                  {notifications.map(notif => (
                    <NotifRow
                      key={notif.id}
                      notif={notif}
                      dyn={dyn}
                      onPress={() => {
                        markRead(notif.id);
                        if (notif.productId) router.push(`/product/${notif.productId}`);
                        if (notif.vendorId) router.push(`/vendor/${notif.vendorId}`);
                      }}
                    />
                  ))}
                </View>
              )}
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  header: {
    backgroundColor: colors.white,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.gray[200],
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: typography.sizes.xl,
    fontFamily: typography.displayFont,
    color: colors.navy[800],
  },
  markAll: {
    fontSize: typography.sizes.sm,
    color: colors.amber[600],
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  scroll: {
    paddingTop: 16,
    paddingBottom: 32,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: '500',
    color: colors.navy[800],
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  alertsCard: {
    marginHorizontal: 20,
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    borderWidth: 0.5,
    borderColor: colors.gray[200],
    overflow: 'hidden',
  },
  alertRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
  },
  alertRowBorder: {
    borderBottomWidth: 0.5,
    borderBottomColor: colors.gray[100],
  },
  alertLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  alertDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    flexShrink: 0,
  },
  alertDotActive: { backgroundColor: colors.green[400] },
  alertDotOff: { backgroundColor: colors.gray[300] },
  alertInfo: {
    flex: 1,
    minWidth: 0,
  },
  alertName: {
    fontSize: typography.sizes.base,
    fontWeight: '500',
    color: colors.navy[800],
  },
  alertTarget: {
    fontSize: typography.sizes.xs,
    color: colors.gray[500],
    marginTop: 2,
  },
  alertCurrent: {
    fontSize: typography.sizes.xs,
    color: colors.amber[600],
    marginTop: 1,
  },
  alertRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexShrink: 0,
  },
  deleteBtn: {
    padding: 4,
  },
  notifsCard: {
    marginHorizontal: 20,
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    borderWidth: 0.5,
    borderColor: colors.gray[200],
    overflow: 'hidden',
  },
  notifRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.gray[100],
    position: 'relative',
  },
  notifRowUnread: {
    backgroundColor: colors.amber[50],
  },
  unreadDot: {
    position: 'absolute',
    top: 18,
    left: 6,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.amber[400],
  },
  notifIcon: {
    width: 38,
    height: 38,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  notifContent: {
    flex: 1,
  },
  notifTitle: {
    fontSize: typography.sizes.base,
    fontWeight: '500',
    color: colors.navy[800],
    marginBottom: 3,
  },
  notifBody: {
    fontSize: typography.sizes.sm,
    color: colors.gray[500],
    lineHeight: 18,
  },
  notifTime: {
    fontSize: 11,
    color: colors.gray[400],
    marginTop: 5,
  },
  emptyAlerts: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 24,
    gap: 8,
  },
  emptyText: {
    fontSize: typography.sizes.base,
    fontWeight: '500',
    color: colors.navy[800],
  },
  emptySubText: {
    fontSize: typography.sizes.sm,
    color: colors.gray[500],
  },
});
