import React, { useState, useCallback } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  ScrollView,
  Pressable,
  FlatList,
} from 'react-native';
import { Text } from '@/components/common/Text';
import { router, useLocalSearchParams } from 'expo-router';
import Head from 'expo-router/head';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MagnifyingGlassIcon, XCircleIcon, ClockIcon, ArrowBendUpLeftIcon } from 'phosphor-react-native';
import { useProductSearch, useProducts } from '@/hooks/useQueries';
import { useAppStore } from '@/store';
import { colors, radii, typography } from '@/theme/tokens';
import { ProductCard } from '@/components/home/ProductCard';
import { LoadingSpinner, EmptyState, ProductCardSkeleton } from '@/components/common';
import { ResponsiveContainer } from '@/components/common/ResponsiveContainer';
import { useBreakpoint } from '@/hooks/useResponsive';
import type { ProductCategory } from '@/types';

const CATEGORIES: Array<ProductCategory | 'All'> = [
  'All',
  'IT & Computers',
  'Networking',
  'Office Supplies',
  'Power',
  'Consumables',
  'Stationery',
];

export default function SearchScreen() {
  const insets = useSafeAreaInsets();
  const { isDesktop, isTablet } = useBreakpoint();
  const numColumns = isDesktop ? 4 : isTablet ? 3 : 1;
  const { mode } = useLocalSearchParams<{ mode?: string }>();
  const isWatchlistMode = mode === 'watchlist';
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');

  const recentSearches = useAppStore(s => s.recentSearches);
  const addRecentSearch = useAppStore(s => s.addRecentSearch);
  const clearRecentSearches = useAppStore(s => s.clearRecentSearches);
  const watchlistIds = useAppStore(s => s.watchlistIds);

  const { data: searchResults, isLoading: searchLoading } = useProductSearch(
    query,
    activeCategory === 'All' ? undefined : activeCategory
  );
  const { data: allProducts, isLoading: allLoading } = useProducts();

  const watchlistResults = allProducts?.filter(p => watchlistIds.has(p.id));
  const results = isWatchlistMode ? watchlistResults : searchResults;
  const isLoading = isWatchlistMode ? allLoading : searchLoading;

  const handleSearch = useCallback((text: string) => {
    setQuery(text);
  }, []);

  const handleCategoryPress = useCallback((cat: string) => {
    setActiveCategory(cat);
  }, []);

  const handleProductPress = useCallback((id: string, name: string) => {
    if (query.trim()) addRecentSearch(query.trim());
    router.push(`/product/${id}`);
  }, [query, addRecentSearch]);

  const handleRecentSearch = useCallback((q: string) => {
    setQuery(q);
  }, []);

  const showEmpty = !isWatchlistMode && query.length === 0 && activeCategory === 'All';

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <Head>
        <title>{isWatchlistMode ? 'Your Watchlist' : 'Search Prices'} — SokoPrice</title>
        <meta name="description" content={isWatchlistMode ? 'Products you are tracking for price drops.' : 'Search and compare product prices across Nairobi vendors.'} />
      </Head>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{isWatchlistMode ? 'Watchlist' : 'Find prices'}</Text>
        {!isWatchlistMode && (
        <View style={styles.searchWrap}>
          <MagnifyingGlassIcon size={16} color={colors.gray[400]} />
          <TextInput
            style={styles.input}
            placeholder="Search products or vendors…"
            placeholderTextColor={colors.gray[400]}
            value={query}
            onChangeText={handleSearch}
            autoCapitalize="none"
            returnKeyType="search"
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery('')}>
              <XCircleIcon size={18} color={colors.gray[400]} />
            </Pressable>
          )}
        </View>
        )}
      </View>

      {/* Category filter chips */}
      {!isWatchlistMode && (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chips}
        style={styles.chipsRow}
      >
        {CATEGORIES.map(cat => (
          <Pressable
            key={cat}
            onPress={() => handleCategoryPress(cat)}
            style={({ hovered, focused }) => [
              styles.chip,
              activeCategory === cat && styles.chipActive,
              (hovered || focused) && activeCategory !== cat && styles.chipHovered,
            ]}
          >
            <Text style={[styles.chipText, activeCategory === cat && styles.chipTextActive]}>
              {cat}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
      )}

      {/* Content */}
      {showEmpty ? (
        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Recent searches */}
          {recentSearches.length > 0 && (
            <View style={styles.recentSection}>
              <View style={styles.recentHeader}>
                <Text style={styles.recentTitle}>Recent searches</Text>
                <Pressable onPress={clearRecentSearches}>
                  <Text style={styles.clearText}>Clear</Text>
                </Pressable>
              </View>
              {recentSearches.map(q => (
                <Pressable
                  key={q}
                  onPress={() => handleRecentSearch(q)}
                  style={styles.recentRow}
                >
                  <ClockIcon size={16} color={colors.gray[400]} />
                  <Text style={styles.recentQuery}>{q}</Text>
                  <ArrowBendUpLeftIcon size={14} color={colors.gray[300]} />
                </Pressable>
              ))}
            </View>
          )}

          {/* Browse by category */}
          <View style={styles.browseSection}>
            <Text style={styles.browseTitle}>Browse by category</Text>
            <View style={styles.catGrid}>
              {CATEGORIES.filter(c => c !== 'All').map(cat => (
                <Pressable
                  key={cat}
                  onPress={() => handleCategoryPress(cat)}
                  style={styles.catCell}
                >
                  <Text style={styles.catCellText}>{cat}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        </ScrollView>
      ) : isLoading ? (
        <ResponsiveContainer>
          <View style={numColumns > 1 ? [styles.gridRow, { flexWrap: 'wrap', paddingTop: 8 }] : undefined}>
            {Array.from({ length: numColumns > 1 ? numColumns * 3 : 6 }).map((_, i) => (
              <View key={i} style={numColumns > 1 ? styles.gridItem : undefined}>
                <ProductCardSkeleton variant={numColumns > 1 ? 'vertical' : 'horizontal'} />
              </View>
            ))}
          </View>
        </ResponsiveContainer>
      ) : !results || results.length === 0 ? (
        isWatchlistMode ? (
          <EmptyState
            title="No watchlisted products yet"
            subtitle="Tap the heart icon on any product to add it to your watchlist."
          />
        ) : (
          <EmptyState
            title="No products found"
            subtitle={`No results for "${query}" in ${activeCategory}. Try a different search.`}
            actionLabel="Clear search"
            onAction={() => { setQuery(''); setActiveCategory('All'); }}
          />
        )
      ) : (
        <ResponsiveContainer>
          <FlatList
            key={numColumns}
            data={results}
            keyExtractor={item => item.id}
            numColumns={numColumns}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            columnWrapperStyle={numColumns > 1 ? styles.gridRow : undefined}
            ListHeaderComponent={
              <Text style={styles.resultCount}>
                {results.length} {results.length === 1 ? 'product' : 'products'}
                {activeCategory !== 'All' ? ` in ${activeCategory}` : ''}
              </Text>
            }
            renderItem={({ item, index }) => (
              <View style={numColumns > 1 ? styles.gridItem : styles.resultItem}>
                <ProductCard
                  product={item}
                  variant={numColumns > 1 ? 'vertical' : 'horizontal'}
                  style={numColumns > 1 ? styles.gridCard : undefined}
                  onPress={() => handleProductPress(item.id, item.name)}
                  index={index}
                />
              </View>
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
    backgroundColor: colors.white,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.gray[200],
  },
  title: {
    fontSize: typography.sizes.xl,
    fontFamily: typography.displayFont,
    color: colors.navy[800],
    marginBottom: 12,
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.gray[50],
    borderRadius: radii.lg,
    borderWidth: 0.5,
    borderColor: colors.gray[200],
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  input: {
    flex: 1,
    fontSize: typography.sizes.base,
    color: colors.navy[800],
  },
  chipsRow: {
    backgroundColor: colors.white,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.gray[200],
    flexGrow: 0,
    flexShrink: 0,
  },
  chips: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: radii.full,
    borderWidth: 0.5,
    borderColor: colors.gray[200],
    backgroundColor: colors.white,
  },
  chipActive: {
    backgroundColor: colors.navy[800],
    borderColor: colors.navy[800],
  },
  chipHovered: {
    borderColor: colors.amber[400],
    backgroundColor: colors.amber[50],
  },
  chipText: {
    fontSize: typography.sizes.sm,
    fontWeight: '500',
    color: colors.gray[500],
  },
  chipTextActive: {
    color: colors.white,
  },
  scroll: {
    flex: 1,
  },
  recentSection: {
    padding: 20,
  },
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  recentTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: '500',
    color: colors.navy[800],
  },
  clearText: {
    fontSize: typography.sizes.sm,
    color: colors.amber[600],
  },
  recentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.gray[100],
  },
  recentQuery: {
    flex: 1,
    fontSize: typography.sizes.base,
    color: colors.navy[800],
  },
  browseSection: {
    padding: 20,
  },
  browseTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: '500',
    color: colors.navy[800],
    marginBottom: 12,
  },
  catGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  catCell: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: radii.lg,
    backgroundColor: colors.white,
    borderWidth: 0.5,
    borderColor: colors.gray[200],
  },
  catCellText: {
    fontSize: typography.sizes.base,
    color: colors.navy[800],
    fontWeight: '500',
  },
  listContent: {
    paddingTop: 8,
    paddingBottom: 24,
  },
  resultCount: {
    fontSize: typography.sizes.sm,
    color: colors.gray[500],
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  resultItem: {
    marginHorizontal: 20,
    backgroundColor: colors.white,
    borderTopWidth: 0.5,
    borderTopColor: colors.gray[100],
  },
  gridRow: {
    gap: 16,
    paddingHorizontal: 20,
  },
  gridItem: {
    flex: 1,
    marginBottom: 16,
  },
  gridCard: {
    width: '100%',
  },
});
