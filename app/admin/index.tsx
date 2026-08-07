import React, { useState, useMemo } from 'react';
import { View, TextInput, StyleSheet, FlatList, Pressable, Platform, Alert } from 'react-native';
import { Text } from '@/components/common/Text';
import { router } from 'expo-router';
import Head from 'expo-router/head';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ArrowLeftIcon,
  PlusIcon,
  PencilSimpleIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  XCircleIcon,
} from 'phosphor-react-native';
import { showMessage } from 'react-native-flash-message';
import { useVendors, useDeleteVendor } from '@/hooks/useQueries';
import { colors, radii, typography } from '@/theme/tokens';
import { LoadingSpinner, EmptyState } from '@/components/common';
import { ResponsiveContainer } from '@/components/common/ResponsiveContainer';
import { useThemeColors } from '@/hooks/useThemeColors';
import type { Vendor } from '@/types';

function confirmDelete(vendorName: string): Promise<boolean> {
  if (Platform.OS === 'web') {
    return Promise.resolve(
      typeof window !== 'undefined' ? window.confirm(`Remove ${vendorName}? This can't be undone.`) : false
    );
  }
  return new Promise(resolve => {
    Alert.alert('Remove vendor', `Remove ${vendorName}? This can't be undone.`, [
      { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
      { text: 'Remove', style: 'destructive', onPress: () => resolve(true) },
    ]);
  });
}

function VendorRow({ vendor, dyn, t, onDeleting }: {
  vendor: Vendor;
  dyn: ReturnType<typeof StyleSheet.create>;
  t: ReturnType<typeof useThemeColors>;
  onDeleting: boolean;
}) {
  const deleteVendor = useDeleteVendor();

  const handleDelete = async () => {
    const ok = await confirmDelete(vendor.name);
    if (!ok) return;
    deleteVendor.mutate(vendor.id, {
      onSuccess: () => showMessage({ message: `${vendor.name} removed`, type: 'success' }),
      onError: () => showMessage({ message: 'Could not remove vendor', type: 'danger' }),
    });
  };

  return (
    <View style={[styles.row, dyn.row]}>
      <View style={[styles.avatar, { backgroundColor: vendor.colorHex }]}>
        <Text style={styles.avatarText}>{vendor.initials}</Text>
      </View>
      <View style={styles.rowInfo}>
        <Text style={[styles.rowName, dyn.rowName]} numberOfLines={1}>{vendor.name}</Text>
        <Text style={[styles.rowMeta, dyn.rowMeta]} numberOfLines={1}>{vendor.category} · {vendor.area || vendor.location}</Text>
      </View>
      {vendor.isVerified && (
        <View style={[styles.badge, dyn.badge]}>
          <Text style={[styles.badgeText, dyn.badgeText]}>{vendor.badge}</Text>
        </View>
      )}
      <Pressable
        onPress={() => router.push({ pathname: '/admin/vendor-form', params: { id: vendor.id } })}
        style={({ hovered }) => [styles.actionBtn, dyn.actionBtn, hovered && dyn.actionBtnHover]}
      >
        <PencilSimpleIcon size={16} color={t.textSecondary} />
      </Pressable>
      <Pressable
        onPress={handleDelete}
        disabled={onDeleting}
        style={({ hovered }) => [styles.actionBtn, dyn.actionBtn, hovered && { backgroundColor: colors.red[50] }, onDeleting && { opacity: 0.5 }]}
      >
        <TrashIcon size={16} color={colors.red[500]} />
      </Pressable>
    </View>
  );
}

export default function AdminVendorsScreen() {
  const insets = useSafeAreaInsets();
  const t = useThemeColors();
  const dyn = useMemo(() => StyleSheet.create({
    screen: { backgroundColor: t.bg },
    header: { backgroundColor: t.surface, borderBottomColor: t.border, borderBottomWidth: t.isDark ? 0 : 0.5 },
    back: { backgroundColor: t.surfaceAlt },
    title: { color: t.textPrimary },
    subtitle: { color: t.textSecondary },
    searchWrap: { backgroundColor: t.surfaceAlt },
    input: { color: t.textPrimary },
    row: { backgroundColor: t.surface, borderColor: t.border },
    rowName: { color: t.textPrimary },
    rowMeta: { color: t.textMuted },
    badge: { backgroundColor: t.surfaceAlt },
    badgeText: { color: t.textSecondary },
    actionBtn: { backgroundColor: t.surfaceAlt },
    actionBtnHover: { backgroundColor: t.divider },
    count: { color: t.textSecondary },
  }), [t]);

  const [query, setQuery] = useState('');
  const { data: vendors, isLoading } = useVendors();
  const deleteVendor = useDeleteVendor();

  const filtered = useMemo(() => {
    if (!vendors) return [];
    if (!query.trim()) return vendors;
    const q = query.toLowerCase();
    return vendors.filter(v => v.name.toLowerCase().includes(q) || v.category.toLowerCase().includes(q));
  }, [vendors, query]);

  return (
    <View style={[styles.screen, dyn.screen, { paddingTop: insets.top }]}>
      <Head>
        <title>Manage Vendors — SokoPrice Admin</title>
        <meta name="description" content="Add, edit, and remove vendors listed on SokoPrice." />
      </Head>

      <View style={[styles.header, dyn.header]}>
        <View style={styles.headerTop}>
          <Pressable onPress={() => router.back()} style={[styles.back, dyn.back]}>
            <ArrowLeftIcon size={20} color={t.textPrimary} />
          </Pressable>
          <View style={styles.headerTitles}>
            <Text style={[styles.subtitle, dyn.subtitle]}>Admin</Text>
            <Text style={[styles.title, dyn.title]}>Manage vendors</Text>
          </View>
          <Pressable
            onPress={() => router.push('/admin/vendor-form')}
            style={({ hovered }) => [styles.addBtn, hovered && { opacity: 0.9 }]}
          >
            <PlusIcon size={16} color={colors.navy[800]} weight="bold" />
            <Text style={styles.addBtnText}>Add vendor</Text>
          </Pressable>
        </View>

        <View style={[styles.searchWrap, dyn.searchWrap]}>
          <MagnifyingGlassIcon size={16} color={t.textMuted} />
          <TextInput
            style={[styles.input, dyn.input]}
            placeholder="Search vendors…"
            placeholderTextColor={t.textMuted}
            value={query}
            onChangeText={setQuery}
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery('')}>
              <XCircleIcon size={18} color={t.textMuted} />
            </Pressable>
          )}
        </View>
      </View>

      {isLoading ? (
        <LoadingSpinner />
      ) : filtered.length === 0 ? (
        <EmptyState
          title={query ? 'No vendors found' : 'No vendors yet'}
          subtitle={query ? 'Try a different search term.' : 'Tap "Add vendor" to list your first one.'}
        />
      ) : (
        <ResponsiveContainer>
          <FlatList
            data={filtered}
            keyExtractor={item => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.list}
            ListHeaderComponent={
              <Text style={[styles.count, dyn.count]}>{filtered.length} {filtered.length === 1 ? 'vendor' : 'vendors'}</Text>
            }
            renderItem={({ item }) => (
              <VendorRow vendor={item} dyn={dyn} t={t} onDeleting={deleteVendor.isPending && deleteVendor.variables === item.id} />
            )}
          />
        </ResponsiveContainer>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  back: {
    width: 36,
    height: 36,
    borderRadius: radii.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitles: { flex: 1 },
  subtitle: {
    fontSize: typography.sizes.xs,
  },
  title: {
    fontSize: typography.sizes.xl,
    fontFamily: typography.displayFont,
    marginTop: 2,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.amber[400],
    borderRadius: radii.full,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  addBtnText: {
    fontSize: typography.sizes.sm,
    fontWeight: '700',
    color: colors.navy[800],
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: radii.lg,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  input: {
    flex: 1,
    fontSize: typography.sizes.base,
  },
  list: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32,
  },
  count: {
    fontSize: typography.sizes.sm,
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: radii.lg,
    borderWidth: 0.5,
    padding: 12,
    marginBottom: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: radii.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.white,
  },
  rowInfo: { flex: 1, minWidth: 0 },
  rowName: {
    fontSize: typography.sizes.base,
    fontWeight: '600',
  },
  rowMeta: {
    fontSize: typography.sizes.xs,
    marginTop: 2,
  },
  badge: {
    borderRadius: radii.full,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  actionBtn: {
    width: 32,
    height: 32,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
