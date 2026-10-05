import { FlatList, StyleSheet, View } from 'react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { MessageSquareText, Trash2 } from 'lucide-react-native';
import { errorMessage } from '../api/errors';
import { reviewsApi } from '../api/reviews';
import type { Review } from '../api/types';
import { AppText } from '../components/ui/AppText';
import { IconButton } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { confirm } from '../components/ui/Feedback';
import { Screen } from '../components/ui/Screen';
import { EmptyState, ErrorState, ListFooter, LoadingView } from '../components/ui/States';
import { Stars } from '../components/ui/Widgets';
import { invalidateReviews, reviewKeys } from '../components/shop/ProductReviews';
import { useProductSummary } from '../hooks/useCatalog';
import { useInfiniteList } from '../hooks/useInfiniteList';
import { useLocale, useT } from '../i18n';
import type { RootNavigation } from '../navigation/types';
import { useSession } from '../store/session';
import { toast } from '../store/toast';
import { colors, spacing } from '../theme';
import { formatDate } from '../utils/format';
import { productTitle } from '../utils/localize';

function ReviewRow({ review, onDelete }: { review: Review; onDelete: () => void }) {
  const locale = useLocale();
  const navigation = useNavigation<RootNavigation>();
  const productId = typeof review.product === 'string' ? review.product : (review.product as { _id: string })._id;
  const { data: product } = useProductSummary(productId);
  return (
    <Card onPress={() => navigation.navigate('ProductDetails', { id: productId })}>
      <View style={styles.row}>
        <AppText variant="label" style={styles.flex} numberOfLines={2}>
          {productTitle(product, locale) || '—'}
        </AppText>
        <IconButton tone="plain" size={36} label="Delete" onPress={onDelete} icon={<Trash2 size={18} color={colors.muted} />} />
      </View>
      <Stars value={review.ratings} />
      {!!review.title && <AppText>{review.title}</AppText>}
      <AppText variant="caption">{formatDate(review.createdAt, locale)}</AppText>
    </Card>
  );
}

export function MyReviewsScreen() {
  const t = useT('Reviews');
  const tAccount = useT('Account');
  const qc = useQueryClient();
  const userId = useSession((s) => s.user?._id) ?? '';
  const { query, rows, refreshing, refresh, loadMore } = useInfiniteList(reviewKeys.byUser(userId), (p, signal) => reviewsApi.list(p, signal), { user: userId, sort: '-createdAt' }, { enabled: !!userId });

  const remove = useMutation({
    mutationFn: (r: Review) => reviewsApi.remove(r._id),
    onSuccess: (_d, r) => {
      toast.success(t('deleted'));
      invalidateReviews(qc, typeof r.product === 'string' ? r.product : (r.product as { _id: string })._id, userId);
    },
    onError: (e) => toast.error(errorMessage(e))
  });

  const ask = async (r: Review) => {
    if (await confirm({ title: t('deleteConfirm'), message: t('deleteDesc') })) remove.mutate(r);
  };

  if (query.isLoading) return <LoadingView />;
  if (query.isError) return <ErrorState error={query.error} onRetry={() => query.refetch()} />;

  return (
    <Screen scroll={false}>
      <FlatList
        data={rows}
        keyExtractor={(r) => r._id}
        contentContainerStyle={styles.list}
        onRefresh={refresh}
        refreshing={refreshing}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={<ListFooter loading={query.isFetchingNextPage} />}
        ListEmptyComponent={<EmptyState icon={<MessageSquareText size={28} color={colors.secondary} />} title={tAccount('noReviews')} />}
        renderItem={({ item }) => <ReviewRow review={item} onDelete={() => ask(item)} />}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  list: { padding: spacing.lg, gap: spacing.md },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm }
});
