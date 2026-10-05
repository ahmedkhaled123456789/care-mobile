import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useInfiniteQuery, useMutation, useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query';
import { MessageSquareText, Pencil, Trash2 } from 'lucide-react-native';
import { errorMessage } from '../../api/errors';
import { reviewsApi } from '../../api/reviews';
import type { Product, Review } from '../../api/types';
import { can } from '../../auth/permissions';
import { useRequireShopper } from '../../hooks/useAuth';
import { qk } from '../../hooks/useCatalog';
import { useLocale, useT } from '../../i18n';
import { useSession } from '../../store/session';
import { toast } from '../../store/toast';
import { colors, radius, spacing } from '../../theme';
import { formatDate } from '../../utils/format';
import { AppText } from '../ui/AppText';
import { BottomSheet } from '../ui/BottomSheet';
import { Button, IconButton } from '../ui/Button';
import { Card } from '../ui/Card';
import { confirm } from '../ui/Feedback';
import { Skeleton } from '../ui/States';
import { TextField } from '../ui/TextField';
import { Avatar, StarInput, Stars } from '../ui/Widgets';

const PAGE = 10;
export const reviewKeys = {
  product: (productId: string) => ['public', 'reviews', productId] as const,
  mine: (productId: string, userId: string) => ['reviews', 'mine', productId, userId] as const,
  byUser: (userId: string) => ['reviews', 'by-user', userId] as const
};

/** ratingsAverage / ratingsQuantity are recalculated server-side after the response — refetch now and shortly after. */
export function refreshProductRating(qc: QueryClient, productId: string) {
  const run = () => {
    void qc.invalidateQueries({ queryKey: qk.product(productId) });
    void qc.invalidateQueries({ queryKey: ['public', 'products'] });
  };
  run();
  setTimeout(run, 1200);
}

export function invalidateReviews(qc: QueryClient, productId: string, userId?: string) {
  void qc.invalidateQueries({ queryKey: reviewKeys.product(productId) });
  if (userId) {
    void qc.invalidateQueries({ queryKey: reviewKeys.mine(productId, userId) });
    void qc.invalidateQueries({ queryKey: reviewKeys.byUser(userId) });
  }
  refreshProductRating(qc, productId);
}

const reviewerName = (r: Review, fallback: string) => (typeof r.user === 'object' && r.user?.name) || fallback;
const reviewerId = (r: Review) => (typeof r.user === 'object' ? r.user?._id : r.user);

function ReviewSheet({ productId, existing, visible, onClose }: { productId: string; existing: Review | null; visible: boolean; onClose: () => void }) {
  const t = useT('Reviews');
  const tCommon = useT('Common');
  const qc = useQueryClient();
  const user = useSession((s) => s.user);
  const [ratings, setRatings] = useState(existing?.ratings ?? 0);
  const [title, setTitle] = useState(existing?.title ?? '');
  const [error, setError] = useState<string | null>(null);

  const save = useMutation({
    mutationFn: () => {
      const body = { ratings, ...(title.trim() ? { title: title.trim() } : {}) };
      return existing ? reviewsApi.update(existing._id, body) : reviewsApi.createForProduct(productId, body);
    },
    onSuccess: () => {
      toast.success(existing ? t('updated') : t('created'));
      invalidateReviews(qc, productId, user?._id);
      onClose();
    },
    onError: (e) => setError(errorMessage(e))
  });

  const submit = () => {
    setError(null);
    if (ratings < 1 || ratings > 5) return setError(t('ratingRequired'));
    save.mutate();
  };

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      dismissible={!save.isPending}
      title={existing ? t('update') : t('write')}
      footer={<Button title={existing ? t('update') : t('submit')} onPress={submit} loading={save.isPending} style={styles.flex} />}>
      <AppText variant="label">
        {t('ratingLabel')} <AppText color={colors.danger}>*</AppText>
      </AppText>
      <StarInput
        value={ratings}
        onChange={(v) => {
          setRatings(v);
          setError(null);
        }}
      />
      <TextField label={t('titleLabel')} optional value={title} onChangeText={setTitle} placeholder={t('titlePh')} multiline maxLength={500} />
      {error && <AppText color={colors.danger}>{error}</AppText>}
      {!existing && <AppText variant="caption">{tCommon('optional')}: {t('titleLabel')}</AppText>}
    </BottomSheet>
  );
}

export function ProductReviews({ product }: { product: Product }) {
  const t = useT('Reviews');
  const tUi = useT('Ui');
  const tCommon = useT('Common');
  const locale = useLocale();
  const qc = useQueryClient();
  const user = useSession((s) => s.user);
  const requireShopper = useRequireShopper();
  const [sheet, setSheet] = useState(false);
  const isShopper = can(user, 'shop');
  const isModerator = can(user, 'reviews:moderate');

  const list = useInfiniteQuery({
    queryKey: reviewKeys.product(product._id),
    queryFn: ({ pageParam, signal }) => reviewsApi.listForProduct(product._id, { page: pageParam, limit: PAGE, sort: '-createdAt' }, signal),
    initialPageParam: 1,
    getNextPageParam: (last) => last.pagination.next ?? undefined
  });

  // The user's own review — the generic `?user=` field filter works on list endpoints.
  const mine = useQuery({
    queryKey: reviewKeys.mine(product._id, user?._id ?? ''),
    queryFn: ({ signal }) => reviewsApi.listForProduct(product._id, { user: user!._id, limit: 1 }, signal).then((r) => r.data[0] ?? null),
    enabled: isShopper
  });

  const del = useMutation({
    mutationFn: (id: string) => reviewsApi.remove(id),
    onSuccess: () => {
      toast.success(t('deleted'));
      invalidateReviews(qc, product._id, user?._id);
    },
    onError: (e) => toast.error(errorMessage(e))
  });

  const askDelete = async (r: Review) => {
    if (await confirm({ title: t('deleteConfirm'), message: t('deleteDesc'), confirmLabel: tCommon('delete') })) del.mutate(r._id);
  };

  const reviews = list.data?.pages.flatMap((p) => p.data) ?? [];
  const myReview = mine.data ?? null;
  // When every review is loaded, compute the summary from them (the product's rating is updated asynchronously).
  const complete = list.isSuccess && !list.hasNextPage;
  const total = complete ? reviews.length : product.ratingsQuantity ?? reviews.length;
  const average = complete ? (reviews.length ? reviews.reduce((n, r) => n + r.ratings, 0) / reviews.length : 0) : product.ratingsAverage ?? 0;

  return (
    <View style={styles.section}>
      <AppText variant="title">{t('title')}</AppText>
      <Card style={styles.summary}>
        <AppText variant="display">{average.toFixed(1)}</AppText>
        <View style={{ gap: 4 }}>
          <Stars value={average} size={18} />
          <AppText variant="caption">{t('basedOn', { n: total })}</AppText>
        </View>
      </Card>

      {!user ? (
        <Button title={t('loginToReview')} variant="secondary" onPress={() => requireShopper()} />
      ) : !isShopper ? (
        <AppText variant="caption">{t('staffCannot')}</AppText>
      ) : mine.isLoading ? (
        <Skeleton height={48} rounded={radius.pill} />
      ) : myReview ? (
        <Card style={{ backgroundColor: colors.pink }}>
          <View style={styles.rowBetween}>
            <AppText variant="overline" color={colors.dark}>
              {t('yours')}
            </AppText>
            <View style={styles.row}>
              <IconButton tone="plain" size={36} label={tUi('editReview')} onPress={() => setSheet(true)} icon={<Pencil size={16} color={colors.dark} />} />
              <IconButton tone="plain" size={36} label={tUi('deleteReview')} onPress={() => askDelete(myReview)} icon={<Trash2 size={16} color={colors.danger} />} />
            </View>
          </View>
          <Stars value={myReview.ratings} />
          {!!myReview.title && <AppText>{myReview.title}</AppText>}
        </Card>
      ) : (
        <Button title={t('write')} variant="secondary" icon={<Pencil size={16} color={colors.dark} />} onPress={() => setSheet(true)} />
      )}

      {list.isLoading ? (
        [0, 1].map((i) => <Skeleton key={i} height={64} />)
      ) : list.isError ? (
        <Button title={tUi('retry')} variant="ghost" onPress={() => list.refetch()} />
      ) : reviews.length === 0 ? (
        <View style={styles.empty}>
          <MessageSquareText size={24} color={colors.subtle} />
          <AppText variant="label">{t('none')}</AppText>
          <AppText variant="caption" center>
            {t('noneDesc')}
          </AppText>
        </View>
      ) : (
        <Card padded={false}>
          {reviews.map((r, i) => {
            const own = !!user && reviewerId(r) === user._id;
            const name = reviewerName(r, t('anonymous'));
            return (
              <View key={r._id} style={[styles.review, i > 0 && styles.separator]}>
                <Avatar name={name} size={36} />
                <View style={styles.flex}>
                  <View style={styles.rowBetween}>
                    <AppText variant="label" style={styles.flex}>
                      {name}
                    </AppText>
                    {(own || isModerator) && (
                      <IconButton tone="plain" size={32} label={tUi('deleteReview')} onPress={() => askDelete(r)} icon={<Trash2 size={15} color={colors.muted} />} />
                    )}
                  </View>
                  <View style={styles.row}>
                    <Stars value={r.ratings} size={12} />
                    <AppText variant="caption"> {formatDate(r.createdAt, locale)}</AppText>
                  </View>
                  {!!r.title && <AppText style={{ marginTop: 4 }}>{r.title}</AppText>}
                </View>
              </View>
            );
          })}
        </Card>
      )}
      {list.hasNextPage && <Button title={t('loadMore')} variant="ghost" loading={list.isFetchingNextPage} onPress={() => list.fetchNextPage()} />}

      {sheet && <ReviewSheet productId={product._id} existing={myReview} visible={sheet} onClose={() => setSheet(false)} />}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: spacing.md },
  flex: { flex: 1 },
  summary: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  row: { flexDirection: 'row', alignItems: 'center' },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  empty: { alignItems: 'center', gap: 6, paddingVertical: spacing.lg },
  review: { flexDirection: 'row', gap: spacing.md, padding: spacing.lg },
  separator: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border }
});
