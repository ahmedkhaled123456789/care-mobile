import { useCallback, useMemo, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { Search, SlidersHorizontal, X } from 'lucide-react-native';
import { productsApi } from '../api/catalog';
import { queryClient } from '../api/queryClient';
import type { Product } from '../api/types';
import { AppText } from '../components/ui/AppText';
import { BottomSheet } from '../components/ui/BottomSheet';
import { Button } from '../components/ui/Button';
import { Screen } from '../components/ui/Screen';
import { EmptyState, ErrorState, ListFooter } from '../components/ui/States';
import { TextField } from '../components/ui/TextField';
import { Chip } from '../components/ui/Widgets';
import { ProductCard, ProductCardSkeleton } from '../components/shop/ProductCard';
import { seedProducts, useBrands, useCategories } from '../hooks/useCatalog';
import { useDebounce } from '../hooks/useDebounce';
import { useInfiniteList } from '../hooks/useInfiniteList';
import { useLocale, useT } from '../i18n';
import type { ProductFilterParams } from '../navigation/types';
import { colors, spacing } from '../theme';
import { nameOf } from '../utils/localize';

const SORTS = [
  { key: '-sold', label: 'sortBest' },
  { key: '-createdAt', label: 'sortNewest' },
  { key: 'price', label: 'sortPriceLow' },
  { key: '-price', label: 'sortPriceHigh' },
  { key: '-ratingsAverage', label: 'sortRating' },
  { key: 'title', label: 'sortAz' }
] as const;

const RATINGS = [4, 3, 2];

interface Filters {
  category?: string;
  brand?: string;
  min: string;
  max: string;
  rating?: number;
}

const digits = (v: string) => v.replace(/[^\d]/g, '');

/** Used as the "Shop" tab and as a pushed screen with preset filters (category / brand / search). */
export function ProductsScreen() {
  const route = useRoute();
  const preset = (route.params ?? {}) as ProductFilterParams;
  const isTab = route.name === 'Shop';
  const t = useT('Listing');
  const tMobile = useT('Mobile');
  const locale = useLocale();

  const [search, setSearch] = useState(preset.keyword ?? '');
  const keyword = useDebounce(search.trim(), 400);
  const [sort, setSort] = useState<string>('-sold');
  const [filters, setFilters] = useState<Filters>({ category: preset.category, brand: preset.brand, min: '', max: '' });
  const [sheet, setSheet] = useState(false);
  const [draft, setDraft] = useState<Filters>(filters);

  const categories = useCategories();
  const brands = useBrands();

  const params = useMemo(
    () => ({
      keyword,
      sort,
      category: filters.category,
      brand: filters.brand,
      'price[gte]': filters.min,
      'price[lte]': filters.max,
      'ratingsAverage[gte]': filters.rating
    }),
    [keyword, sort, filters]
  );

  const { query, rows, total, refreshing, refresh, loadMore } = useInfiniteList(['public', 'products-list'], (p, signal) => productsApi.list(p, signal), params, {
    onPage: (list) => seedProducts(queryClient, list)
  });

  const activeCount = [filters.category, filters.brand, filters.min, filters.max, filters.rating].filter(Boolean).length;

  const openSheet = () => {
    setDraft(filters);
    setSheet(true);
  };
  const apply = () => {
    setFilters(draft);
    setSheet(false);
  };
  const clearAll = () => {
    const empty: Filters = { min: '', max: '' };
    setDraft(empty);
    setFilters(empty);
    setSheet(false);
  };

  const renderItem = useCallback(
    ({ item }: { item: Product }) => (
      <View style={styles.cell}>
        <ProductCard product={item} />
      </View>
    ),
    []
  );

  const header = (
    <View style={styles.header}>
      {isTab && (
        <AppText variant="title" style={styles.title}>
          {tMobile('tabShop')}
        </AppText>
      )}
      <View style={styles.searchRow}>
        <View style={styles.flex}>
          <TextField value={search} onChangeText={setSearch} placeholder={tMobile('search')} returnKeyType="search" icon={<Search size={18} color={colors.muted} />} />
        </View>
        <Button
          title={activeCount ? `${t('filters')} (${activeCount})` : t('filters')}
          variant={activeCount ? 'dark' : 'secondary'}
          icon={<SlidersHorizontal size={16} color={activeCount ? colors.white : colors.dark} />}
          onPress={openSheet}
        />
      </View>
      <FlatList
        horizontal
        data={SORTS}
        keyExtractor={(s) => s.key}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chips}
        renderItem={({ item }) => <Chip label={t(item.label)} selected={sort === item.key} onPress={() => setSort(item.key)} />}
      />
      {total != null && !query.isLoading && (
        <AppText variant="caption" style={styles.count}>
          {tMobile('results', { n: total })}
        </AppText>
      )}
    </View>
  );

  return (
    <Screen scroll={false} edges={isTab ? ['top'] : ['bottom']}>
      <FlatList
        data={rows}
        keyExtractor={(p) => p._id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        renderItem={renderItem}
        ListHeaderComponent={header}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        onRefresh={refresh}
        refreshing={refreshing}
        onEndReached={loadMore}
        onEndReachedThreshold={0.6}
        initialNumToRender={6}
        maxToRenderPerBatch={6}
        windowSize={7}
        removeClippedSubviews
        ListFooterComponent={<ListFooter loading={query.isFetchingNextPage} />}
        ListEmptyComponent={
          query.isLoading ? (
            <View style={styles.row}>
              <View style={styles.cell}>
                <ProductCardSkeleton />
              </View>
              <View style={styles.cell}>
                <ProductCardSkeleton />
              </View>
            </View>
          ) : query.isError ? (
            <ErrorState error={query.error} onRetry={() => query.refetch()} />
          ) : (
            <EmptyState
              icon={<X size={28} color={colors.secondary} />}
              title={t('noResults')}
              description={t('noResultsDesc')}
              action={
                activeCount || keyword ? (
                  <Button
                    title={t('clearAll')}
                    variant="secondary"
                    onPress={() => {
                      setSearch('');
                      clearAll();
                    }}
                  />
                ) : undefined
              }
            />
          )
        }
      />

      <BottomSheet
        visible={sheet}
        onClose={() => setSheet(false)}
        title={t('filters')}
        footer={
          <View style={styles.sheetFooter}>
            <View style={styles.flex}>
              <Button title={t('clearAll')} variant="secondary" onPress={clearAll} block />
            </View>
            <View style={styles.flex}>
              <Button title={t('showResults')} onPress={apply} block />
            </View>
          </View>
        }>
        <AppText variant="label">{t('category')}</AppText>
        <View style={styles.wrap}>
          {(categories.data ?? []).map((c) => (
            <Chip key={c._id} label={nameOf(c, locale)} selected={draft.category === c._id} onPress={() => setDraft((d) => ({ ...d, category: d.category === c._id ? undefined : c._id }))} />
          ))}
        </View>
        <AppText variant="label">{t('brand')}</AppText>
        <View style={styles.wrap}>
          {(brands.data ?? []).map((b) => (
            <Chip key={b._id} label={nameOf(b, locale)} selected={draft.brand === b._id} onPress={() => setDraft((d) => ({ ...d, brand: d.brand === b._id ? undefined : b._id }))} />
          ))}
        </View>
        <AppText variant="label">{t('price')}</AppText>
        <View style={styles.searchRow}>
          <View style={styles.flex}>
            <TextField value={draft.min} onChangeText={(v) => setDraft((d) => ({ ...d, min: digits(v) }))} placeholder={t('min')} keyboardType="number-pad" />
          </View>
          <View style={styles.flex}>
            <TextField value={draft.max} onChangeText={(v) => setDraft((d) => ({ ...d, max: digits(v) }))} placeholder={t('max')} keyboardType="number-pad" />
          </View>
        </View>
        <AppText variant="label">{t('rating')}</AppText>
        <View style={styles.wrap}>
          <Chip label={t('anyRating')} selected={!draft.rating} onPress={() => setDraft((d) => ({ ...d, rating: undefined }))} />
          {RATINGS.map((r) => (
            <Chip key={r} label={`${r}★ ${t('andUp')}`} selected={draft.rating === r} onPress={() => setDraft((d) => ({ ...d, rating: r }))} />
          ))}
        </View>
      </BottomSheet>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: { gap: spacing.md, paddingBottom: spacing.md },
  title: { paddingTop: spacing.sm },
  searchRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  chips: { gap: spacing.sm },
  count: { paddingHorizontal: 2 },
  list: { padding: spacing.lg, paddingBottom: spacing.xxl },
  row: { gap: spacing.md, marginBottom: spacing.md },
  cell: { flex: 1 },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md },
  sheetFooter: { flexDirection: 'row', gap: spacing.md }
});
