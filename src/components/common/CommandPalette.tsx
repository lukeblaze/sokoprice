import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, TextInput, Pressable, StyleSheet, Platform, Modal, FlatList } from 'react-native';
import { Text } from './Text';
import { router } from 'expo-router';
import Animated, { FadeIn, SlideInDown } from 'react-native-reanimated';
import {
  MagnifyingGlassIcon,
  HouseIcon,
  StorefrontIcon,
  BellIcon,
  UserIcon,
  MoonIcon,
  SunIcon,
  CubeIcon,
  ArrowRightIcon,
  type IconProps,
} from 'phosphor-react-native';
import { colors, radii, typography } from '@/theme/tokens';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useAppStore } from '@/store';
import { MOCK_PRODUCTS, MOCK_VENDORS } from '@/utils/mockData';
import { formatKES } from '@/utils/format';

interface Item {
  id: string;
  label: string;
  sublabel?: string;
  icon: React.ComponentType<IconProps>;
  group: 'Actions' | 'Products' | 'Vendors';
  onSelect: () => void;
}

export function CommandPalette() {
  const [visible, setVisible] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const t = useThemeColors();
  const colorScheme = useAppStore(s => s.colorScheme);
  const setColorScheme = useAppStore(s => s.setColorScheme);
  const inputRef = useRef<TextInput>(null);

  // Global ⌘K / Ctrl+K listener — web only.
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setVisible(v => !v);
      } else if (e.key === 'Escape') {
        setVisible(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (visible) {
      setQuery('');
      setActiveIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [visible]);

  const close = () => setVisible(false);

  const go = (path: string) => {
    close();
    router.push(path as any);
  };

  const actions: Item[] = useMemo(() => [
    { id: 'a-home', label: 'Go to Home', icon: HouseIcon, group: 'Actions', onSelect: () => go('/(tabs)') },
    { id: 'a-search', label: 'Go to Search', icon: MagnifyingGlassIcon, group: 'Actions', onSelect: () => go('/(tabs)/search') },
    { id: 'a-vendors', label: 'Go to Vendors', icon: StorefrontIcon, group: 'Actions', onSelect: () => go('/(tabs)/vendors') },
    { id: 'a-alerts', label: 'Go to Alerts', icon: BellIcon, group: 'Actions', onSelect: () => go('/(tabs)/alerts') },
    { id: 'a-profile', label: 'Go to Profile', icon: UserIcon, group: 'Actions', onSelect: () => go('/(tabs)/profile') },
    {
      id: 'a-theme',
      label: colorScheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode',
      icon: colorScheme === 'dark' ? SunIcon : MoonIcon,
      group: 'Actions',
      onSelect: () => { setColorScheme(colorScheme === 'dark' ? 'light' : 'dark'); close(); },
    },
  ], [colorScheme]);

  const productItems: Item[] = useMemo(() => MOCK_PRODUCTS.map(p => ({
    id: `p-${p.id}`,
    label: p.name,
    sublabel: `${formatKES(p.bestPrice)} · ${p.vendorCount} vendors`,
    icon: CubeIcon,
    group: 'Products' as const,
    onSelect: () => go(`/product/${p.id}`),
  })), []);

  const vendorItems: Item[] = useMemo(() => MOCK_VENDORS.map(v => ({
    id: `v-${v.id}`,
    label: v.name,
    sublabel: v.category,
    icon: StorefrontIcon,
    group: 'Vendors' as const,
    onSelect: () => go(`/vendor/${v.id}`),
  })), []);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const all = [...actions, ...productItems, ...vendorItems];
    if (!q) return actions;
    const scored = all
      .map(item => {
        const label = item.label.toLowerCase();
        let score = -1;
        if (label.startsWith(q)) score = 2;
        else if (label.includes(q)) score = 1;
        else if (item.sublabel?.toLowerCase().includes(q)) score = 0;
        return { item, score };
      })
      .filter(r => r.score >= 0)
      .sort((a, b) => b.score - a.score);
    return scored.slice(0, 8).map(r => r.item);
  }, [query, actions, productItems, vendorItems]);

  useEffect(() => setActiveIndex(0), [query]);

  const handleKeyPress = (e: any) => {
    const key = e.nativeEvent?.key ?? e.key;
    if (key === 'ArrowDown') {
      e.preventDefault?.();
      setActiveIndex(i => Math.min(i + 1, results.length - 1));
    } else if (key === 'ArrowUp') {
      e.preventDefault?.();
      setActiveIndex(i => Math.max(i - 1, 0));
    } else if (key === 'Enter') {
      results[activeIndex]?.onSelect();
    }
  };

  if (Platform.OS !== 'web') return null;

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={close}>
      <Animated.View entering={FadeIn.duration(150)} style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={close} />
        <Animated.View entering={SlideInDown.springify().damping(20).mass(0.7)} style={styles.wrap}>
          <View style={[styles.panel, { backgroundColor: t.surface, borderColor: t.border }]}>
            <View style={[styles.searchRow, { borderBottomColor: t.divider }]}>
              <MagnifyingGlassIcon size={18} color={t.textMuted} />
              <TextInput
                ref={inputRef}
                value={query}
                onChangeText={setQuery}
                onKeyPress={handleKeyPress}
                placeholder="Search products, vendors, or jump to a page…"
                placeholderTextColor={t.textMuted}
                style={[styles.input, { color: t.textPrimary }]}
                autoFocus
              />
              <View style={[styles.escHint, { borderColor: t.border }]}>
                <Text style={[styles.escHintText, { color: t.textMuted }]}>ESC</Text>
              </View>
            </View>

            <FlatList
              data={results}
              keyExtractor={item => item.id}
              keyboardShouldPersistTaps="handled"
              style={styles.list}
              ListEmptyComponent={
                <Text style={[styles.emptyText, { color: t.textMuted }]}>No matches for "{query}"</Text>
              }
              renderItem={({ item, index }) => {
                const Icon = item.icon;
                const active = index === activeIndex;
                return (
                  <Pressable
                    onPress={item.onSelect}
                    onHoverIn={() => setActiveIndex(index)}
                    style={[styles.row, active && { backgroundColor: t.surfaceAlt }]}
                  >
                    <Icon size={16} color={active ? colors.amber[500] : t.textSecondary} weight={active ? 'fill' : 'regular'} />
                    <View style={styles.rowInfo}>
                      <Text style={[styles.rowLabel, { color: t.textPrimary }]} numberOfLines={1}>{item.label}</Text>
                      {item.sublabel && (
                        <Text style={[styles.rowSub, { color: t.textMuted }]} numberOfLines={1}>{item.sublabel}</Text>
                      )}
                    </View>
                    {active && <ArrowRightIcon size={14} color={colors.amber[500]} />}
                  </Pressable>
                );
              }}
            />
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(8,15,23,0.55)',
    alignItems: 'center',
    paddingTop: '12%',
    paddingHorizontal: 20,
  },
  wrap: {
    width: '100%',
    maxWidth: 560,
  },
  panel: {
    borderRadius: radii.xl,
    borderWidth: 0.5,
    overflow: 'hidden',
    ...({
      boxShadow: '0 24px 64px rgba(0,0,0,0.35)',
    } as any),
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 0.5,
  },
  input: {
    flex: 1,
    fontSize: typography.sizes.base,
    outlineWidth: 0,
  } as any,
  escHint: {
    borderWidth: 0.5,
    borderRadius: radii.sm,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  escHintText: {
    fontSize: 10,
    fontWeight: '600',
  },
  list: {
    maxHeight: 360,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 11,
  },
  rowInfo: {
    flex: 1,
    minWidth: 0,
  },
  rowLabel: {
    fontSize: typography.sizes.base,
    fontWeight: '500',
  },
  rowSub: {
    fontSize: 11,
    marginTop: 1,
  },
  emptyText: {
    textAlign: 'center',
    paddingVertical: 32,
    fontSize: typography.sizes.sm,
  },
});
