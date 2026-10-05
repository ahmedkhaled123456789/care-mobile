import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Search } from 'lucide-react-native';
import { productsApi } from '../api/catalog';
import { queryClient } from '../api/queryClient';
import type { Product } from '../api/types';
import { useQuery } from '@tanstack/react-query';
import { AppText } from '../components/ui/AppText';
import { Button } from '../components/ui/Button';
import { Screen } from '../components/ui/Screen';
import { Skeleton } from '../components/ui/States';
import { ProductCard } from '../components/shop/ProductCard';
import { BrandTile, CategoryTile } from '../components/shop/CatalogTiles';
import { AntiAcneSection, NaturalHairCareSection, SummerSunProtectionSection } from '../components/home/CategoryShowcases';
import { AboutUsSection, BannerSection, FeaturesSection, HeroSection, WhyChooseUsSection } from '../components/home/InfoSections';
import { BlogSection } from '../components/home/BlogSection';
import { AgencyRequestSheet, AgentsSection, ContactSection, StoreLocatorSection } from '../components/home/PartnerSections';
import { seedProducts, useBrands, useCategories } from '../hooks/useCatalog';
import { useManualRefresh } from '../hooks/useInfiniteList';
import { useAuth } from '../hooks/useAuth';
import { useT } from '../i18n';
import type { RootNavigation } from '../navigation/types';
import { colors, radius, spacing } from '../theme';

const CARD_W = 168;
const TILE_W = 128;

function useHomeProducts(key: string, params: Record<string, string | number | boolean>) {
  return useQuery({
    queryKey: ['public', 'home', key],
    queryFn: async ({ signal }) => {
      const res = await productsApi.list({ ...params, limit: 8 }, signal);
      seedProducts(queryClient, res.data);
      return res.data;
    },
    staleTime: 60 * 1000
  });
}

function Rail<T>({ data, render, height }: { data: T[] | undefined; render: (item: T) => React.ReactElement; height: number }) {
  if (!data) {
    return (
      <View style={styles.railSkeleton}>
        <Skeleton width={CARD_W} height={height} rounded={radius.xl} />
        <Skeleton width={CARD_W} height={height} rounded={radius.xl} />
      </View>
    );
  }
  return (
    <FlatList
      horizontal
      data={data}
      keyExtractor={(item, i) => String((item as { _id?: string })._id ?? i)}
      renderItem={({ item }) => render(item)}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.rail}
      initialNumToRender={3}
      windowSize={5}
    />
  );
}

function SectionHeader({ title, onSeeAll }: { title: string; onSeeAll?: () => void }) {
  const t = useT('Mobile');
  return (
    <View style={styles.sectionHeader}>
      <AppText variant="title" style={styles.flex}>
        {title}
      </AppText>
      {onSeeAll && <Button title={t('seeAll')} variant="ghost" size="sm" onPress={onSeeAll} />}
    </View>
  );
}

export function HomeScreen() {
  const t = useT('Home');
  const tMobile = useT('Mobile');
  const navigation = useNavigation<RootNavigation>();
  const { user } = useAuth();
  const [agencyOpen, setAgencyOpen] = useState(false);
  const openAgency = () => setAgencyOpen(true);

  const best = useHomeProducts('best', { sort: '-sold' });
  const featured = useHomeProducts('featured', { featured: true });
  const categories = useCategories();
  const brands = useBrands();

  const { refreshing, onRefresh } = useManualRefresh(() => Promise.all([best.refetch(), featured.refetch(), categories.refetch(), brands.refetch()]));

  const renderProduct = (p: Product) => (
    <View style={{ width: CARD_W }}>
      <ProductCard product={p} width={CARD_W} />
    </View>
  );

  return (
    <Screen edges={['top']} refreshing={refreshing} onRefresh={onRefresh} contentStyle={styles.content}>
      <View style={styles.hero}>
        <AppText variant="caption" color={colors.primary} weight="semibold">
          {user ? tMobile('hello', { name: user.name.split(' ')[0] ?? user.name }) : 'Royal Care'}
        </AppText>
        <Pressable
          accessibilityRole="search"
          onPress={() => navigation.navigate('CustomerTabs', { screen: 'Shop' })}
          style={styles.search}>
          <Search size={18} color={colors.muted} />
          <AppText color={colors.subtle}>{tMobile('search')}</AppText>
        </Pressable>
      </View>

      <HeroSection onAgent={openAgency} />

      <View style={styles.catalog}>
      <SectionHeader title={t('catTitle')} onSeeAll={() => navigation.navigate('Categories')} />
      <Rail
        data={categories.data}
        height={160}
        render={(c) => (
          <View style={{ width: TILE_W }}>
            <CategoryTile category={c} width={TILE_W} onPress={() => navigation.navigate('Category', { id: c._id, name: c.name })} />
          </View>
        )}
      />

      <SectionHeader title={t('bestTitle')} onSeeAll={() => navigation.navigate('Products')} />
      <Rail data={best.data} render={renderProduct} height={260} />

      {(featured.data?.length ?? 0) > 0 && (
        <>
          <SectionHeader title={tMobile('featured')} />
          <Rail data={featured.data} render={renderProduct} height={260} />
        </>
      )}

      <View style={styles.promo}>
        <AppText variant="title" color={colors.white}>
          {t('promoTitle')}
        </AppText>
        <AppText color="rgba(255,255,255,0.85)">{t('promoDesc')}</AppText>
        <Button title={t('promoCta')} variant="secondary" onPress={() => navigation.navigate('CustomerTabs', { screen: 'Shop' })} />
      </View>
      </View>

      <NaturalHairCareSection />
      <AntiAcneSection />
      <SummerSunProtectionSection />

      {(brands.data?.length ?? 0) > 0 && (
        <View style={styles.catalog}>
          <SectionHeader title={t('brandsTitle')} onSeeAll={() => navigation.navigate('Brands')} />
          <Rail data={brands.data} height={96} render={(b) => <BrandTile brand={b} width={TILE_W} onPress={() => navigation.navigate('Products', { brand: b._id })} />} />
        </View>
      )}

      <WhyChooseUsSection />
      <AboutUsSection />
      <BannerSection onAgent={openAgency} />
      <FeaturesSection />
      <BlogSection />
      <AgentsSection onAgent={openAgency} />
      <StoreLocatorSection />
      <ContactSection />

      <AgencyRequestSheet visible={agencyOpen} onClose={() => setAgencyOpen(false)} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { paddingHorizontal: 0, paddingTop: spacing.lg, paddingBottom: 0, gap: 0 },
  catalog: { gap: spacing.md, paddingBottom: spacing.xl },
  hero: { paddingHorizontal: spacing.lg, gap: spacing.sm },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: 48,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: spacing.sm
  },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.lg, marginTop: spacing.sm },
  rail: { paddingHorizontal: spacing.lg, gap: spacing.md },
  railSkeleton: { flexDirection: 'row', gap: spacing.md, paddingHorizontal: spacing.lg },
  promo: { marginHorizontal: spacing.lg, padding: spacing.xl, borderRadius: radius.xl, backgroundColor: colors.dark, gap: spacing.md, alignItems: 'flex-start' }
});
