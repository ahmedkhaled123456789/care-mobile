import { FlatList, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Heart } from 'lucide-react-native';
import { AppText } from '../components/ui/AppText';
import { Button } from '../components/ui/Button';
import { Screen } from '../components/ui/Screen';
import { EmptyState, ErrorState, LoadingView } from '../components/ui/States';
import { ProductCard } from '../components/shop/ProductCard';
import { useAuth } from '../hooks/useAuth';
import { useWishlist } from '../hooks/useShop';
import { useT } from '../i18n';
import type { RootNavigation } from '../navigation/types';
import { colors, spacing } from '../theme';
import { GuestPrompt } from './GuestPrompt';

export function WishlistScreen() {
  const t = useT('Wishlist');
  const navigation = useNavigation<RootNavigation>();
  const { user, isShopper } = useAuth();
  const wishlist = useWishlist();

  if (!user || !isShopper) return <GuestPrompt title={t('title')} />;
  if (wishlist.query.isLoading) return <LoadingView />;
  if (wishlist.query.isError) return <ErrorState error={wishlist.query.error} onRetry={() => wishlist.query.refetch()} />;

  return (
    <Screen scroll={false} edges={['top']}>
      <FlatList
        data={wishlist.items}
        keyExtractor={(p) => p._id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.list}
        onRefresh={() => wishlist.query.refetch()}
        refreshing={wishlist.query.isRefetching}
        ListHeaderComponent={
          <View style={styles.header}>
            <AppText variant="title">{t('title')}</AppText>
            {wishlist.items.length > 0 && <AppText variant="caption">{t('count', { n: wishlist.items.length })}</AppText>}
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.cell}>
            <ProductCard product={item} />
          </View>
        )}
        ListEmptyComponent={
          <EmptyState
            icon={<Heart size={28} color={colors.sale} />}
            title={t('empty')}
            description={t('emptyDesc')}
            action={<Button title={t('browse')} onPress={() => navigation.navigate('CustomerTabs', { screen: 'Shop' })} />}
          />
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { padding: spacing.lg, paddingBottom: spacing.xxl },
  header: { paddingBottom: spacing.md, gap: 2 },
  row: { gap: spacing.md, marginBottom: spacing.md },
  cell: { flex: 1 }
});
