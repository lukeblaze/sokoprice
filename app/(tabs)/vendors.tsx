import React, { useState } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  FlatList,
  Pressable,
} from 'react-native';
import { Text } from '@/components/common/Text';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SlidersHorizontalIcon, MagnifyingGlassIcon, XCircleIcon } from 'phosphor-react-native';
import { useVendors, useVendorSearch } from '@/hooks/useQueries';
import { colors, radii, typography } from '@/theme/tokens';
import { VendorCard } from '@/components/vendors/VendorCard';
import { LoadingSpinner, EmptyState } from '@/components/common';

export default function VendorsScreen() {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');

  const { data: allVendors, isLoading } = useVendors();
  const { data: searchResults } = useVendorSearch(query);

  const vendors = query.trim() ? searchResults : allVendors;

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.subtitle}>Nairobi market</Text>
            <Text style={styles.title}>Vendors</Text>
          </View>
          <Pressable style={styles.filterBtn}>
            <SlidersHorizontalIcon size={18} color={colors.white} />
          </Pressable>
        </View>
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
      </View>

      {/* List */}
      {isLoading ? (
        <LoadingSpinner />
      ) : !vendors || vendors.length === 0 ? (
        <EmptyState
          title="No vendors found"
          subtitle="Try searching with different terms."
          actionLabel="Clear search"
          onAction={() => setQuery('')}
        />
      ) : (
        <FlatList
          data={vendors}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.list}
          ListHeaderComponent={
            <Text style={styles.count}>
              {vendors.length} {vendors.length === 1 ? 'vendor' : 'vendors'} in Nairobi
            </Text>
          }
          renderItem={({ item }) => (
            <VendorCard
              vendor={item}
              onPress={() => router.push(`/vendor/${item.id}`)}
            />
          )}
        />
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
});
