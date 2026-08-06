import React, { useState, useMemo } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  FlatList,
  Pressable,
} from 'react-native';
import { Text } from '@/components/common/Text';
import { router, useLocalSearchParams } from 'expo-router';
import Head from 'expo-router/head';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SlidersHorizontalIcon, MagnifyingGlassIcon, XCircleIcon } from 'phosphor-react-native';
import { useVendors, useVendorSearch } from '@/hooks/useQueries';
import { useAppStore } from '@/store';
import { colors, radii, typography } from '@/theme/tokens';
import { VendorCard } from '@/components/vendors/VendorCard';
import { LoadingSpinner, EmptyState, VendorCardSkeleton } from '@/components/common';
import { ResponsiveContainer } from '@/components/common/ResponsiveContainer';
import { useBreakpoint } from '@/hooks/useResponsive';
import { useThemeColors } from '@/hooks/useThemeColors';

export default function VendorsScreen() {
  const insets = useSafeAreaInsets();
  const { isDesktop, isTablet } = useBreakpoint();
  const numColumns = isDesktop ? 3 : isTablet ? 2 : 1;
  const t = useThemeColors();
  const dyn = useMemo(() => StyleSheet.create({
    screen: { backgroundColor: t.bg },
    count: { color: t.textSecondary },
  }), [t]);
  const { mode } = useLocalSearchParams<{ mode?: string }>();
  const isSavedMode = mode === 'saved';
  const [query, setQuery] = useState('');
  const savedVendorIds = useAppStore(s => s.savedVendorIds);

  const { data: allVendors, isLoading } = useVendors();
  const { data: searchResults } = useVendorSearch(query);

  const vendors = isSavedMode
    ? allVendors?.filter(v => savedVendorIds.has(v.id))
    : query.trim() ? searchResults : allVendors;

  return (
    <View style={[styles.screen, dyn.screen, { paddingTop: insets.top }]}>
      <Head>
        <title>{isSavedMode ? 'Saved Vendors' : 'Vendors'} — SokoPrice</title>
        <meta name="description" content={isSavedMode ? 'Your saved and favorited vendors.' : 'Browse verified vendors in the Nairobi market.'} />
      </Head>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.subtitle}>{isSavedMode ? 'Your favorites' : 'Nairobi market'}</Text>
            <Text style={styles.title}>{isSavedMode ? 'Saved vendors' : 'Vendors'}</Text>
          </View>
          {!isSavedMode && (
          <Pressable style={styles.filterBtn}>
            <SlidersHorizontalIcon size={18} color={colors.white} />
          </Pressable>
          )}
        </View>
        {!isSavedMode && (
        <View style={styles.searchWrap}>
          <MagnifyingGlassIcon size={16} color="rgba(255,255,255,0.45)" />
          <TextInput
            style={styles.input}
            placeholder="Search vendors, categories…"
            placeholderTextColor="rgba(255,255,255,0.35)"
            value={query}
            onChangeText={setQuery}
            autoCapitalize="words"
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery('')}>
              <XCircleIcon size={18} color="rgba(255,255,255,0.45)" />
            </Pressable>
          )}
        </View>
        )}
      </View>

      {/* List */}
      {isLoading ? (
        <ResponsiveContainer>
          <View style={numColumns > 1 ? [styles.gridRow, { flexWrap: 'wrap', paddingTop: 16 }] : { paddingTop: 16 }}>
            {Array.from({ length: numColumns > 1 ? numColumns * 2 : 5 }).map((_, i) => (
              <VendorCardSkeleton key={i} style={numColumns > 1 ? styles.gridCard : undefined} />
            ))}
          </View>
        </ResponsiveContainer>
      ) : !vendors || vendors.length === 0 ? (
        isSavedMode ? (
          <EmptyState
            title="No saved vendors yet"
            subtitle="Tap the bookmark icon on any vendor page to save it here."
          />
        ) : (
          <EmptyState
            title="No vendors found"
            subtitle="Try searching with different terms."
            actionLabel="Clear search"
            onAction={() => setQuery('')}
          />
        )
      ) : (
        <ResponsiveContainer>
          <FlatList
            key={numColumns}
            data={vendors}
            keyExtractor={item => item.id}
            numColumns={numColumns}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.list}
            columnWrapperStyle={numColumns > 1 ? styles.gridRow : undefined}
            ListHeaderComponent={
              <Text style={[styles.count, dyn.count]}>
                {vendors.length} {vendors.length === 1 ? 'vendor' : 'vendors'} {isSavedMode ? 'saved' : 'in Nairobi'}
              </Text>
            }
            renderItem={({ item, index }) => (
              <VendorCard
                vendor={item}
                style={numColumns > 1 ? styles.gridCard : undefined}
                onPress={() => router.push(`/vendor/${item.id}`)}
                index={index}
              />
            )}
          />
        </ResponsiveContainer>
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
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: typography.sizes.xs,
    color: 'rgba(255,255,255,0.5)',
  },
  title: {
    fontSize: typography.sizes.xl,
    fontFamily: typography.displayFont,
    color: colors.white,
    marginTop: 2,
  },
  filterBtn: {
    width: 36,
    height: 36,
    borderRadius: radii.full,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: radii.lg,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  input: {
    flex: 1,
    fontSize: typography.sizes.base,
    color: colors.white,
  },
  list: {
    paddingTop: 16,
    paddingBottom: 24,
  },
  count: {
    fontSize: typography.sizes.sm,
    color: colors.gray[500],
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  gridRow: {
    gap: 16,
    paddingHorizontal: 20,
  },
  gridCard: {
    flex: 1,
    marginHorizontal: 0,
    marginBottom: 16,
  },
});
