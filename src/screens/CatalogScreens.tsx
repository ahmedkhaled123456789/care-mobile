import { FlatList, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Layers } from 'lucide-react-native';
import { AppText } from '../components/ui/AppText';
import { Button } from '../components/ui/Button';
import { Screen } from '../components/ui/Screen';
import { EmptyState, ErrorState, LoadingView } from '../components/ui/States';
import { ListRow } from '../components/ui/Widgets';
import { Card } from '../components/ui/Card';
import { BrandTile, CategoryTile } from '../components/shop/CatalogTiles';
import { useBrands, useCategories, useSubcategories } from '../hooks/useCatalog';
import { useLocale, useT } from '../i18n';
import type { RootNavigation, RootScreenProps } from '../navigation/types';
import { colors, spacing } from '../theme';
import { nameOf } from '../utils/localize';

export function CategoriesScreen() {
  const t = useT('Catalog');
  const navigation = useNavigation<RootNavigation>();
  const { data, isLoading, isError, error, refetch } = useCategories();
  return (
    <Screen scroll={false}>
      {isLoading ? (
        <LoadingView />
      ) : isError ? (
        <ErrorState error={error} onRetry={() => refetch()} />
      ) : (
        <FlatList
          data={data}
          keyExtractor={(c) => c._id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={styles.cell}>
              <CategoryTile category={item} onPress={() => navigation.navigate('Category', { id: item._id, name: item.name })} />
            </View>
          )}
          ListEmptyComponent={<EmptyState title={t('noCategories')} />}
        />
      )}
    </Screen>
  );
}

export function CategoryScreen({ route, navigation }: RootScreenProps<'Category'>) {
  const t = useT('Catalog');
  const locale = useLocale();
  const { id, name } = route.params;
  const subs = useSubcategories(id);
  return (
    <Screen>
      <Button title={t('shopAll', { name: name ?? '' })} onPress={() => navigation.navigate('Products', { category: id })} block />
      <AppText variant="heading">{t('subcategories')}</AppText>
      {subs.isLoading ? (
        <LoadingView />
      ) : subs.isError ? (
        <ErrorState error={subs.error} onRetry={() => subs.refetch()} />
      ) : (subs.data?.length ?? 0) === 0 ? (
        <EmptyState icon={<Layers size={28} color={colors.secondary} />} title={t('noCategories')} />
      ) : (
        <Card padded={false}>
          {subs.data!.map((s) => (
            <ListRow key={s._id} title={nameOf(s, locale)} onPress={() => navigation.navigate('Products', { category: id })} />
          ))}
        </Card>
      )}
    </Screen>
  );
}

export function BrandsScreen() {
  const t = useT('Catalog');
  const navigation = useNavigation<RootNavigation>();
  const { data, isLoading, isError, error, refetch } = useBrands();
  return (
    <Screen scroll={false}>
      {isLoading ? (
        <LoadingView />
      ) : isError ? (
        <ErrorState error={error} onRetry={() => refetch()} />
      ) : (
        <FlatList
          data={data}
          keyExtractor={(b) => b._id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={styles.cell}>
              <BrandTile brand={item} onPress={() => navigation.navigate('Products', { brand: item._id })} />
            </View>
          )}
          ListEmptyComponent={<EmptyState title={t('noBrands')} />}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { padding: spacing.lg, gap: spacing.md },
  row: { gap: spacing.md },
  cell: { flex: 1 }
});
