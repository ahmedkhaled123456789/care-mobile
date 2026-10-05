import { FlatList, StyleSheet, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { Image } from 'expo-image';
import { Package } from 'lucide-react-native';
import { ordersApi } from '../api/orders';
import type { Order } from '../api/types';
import { AppText } from '../components/ui/AppText';
import { Card, Section } from '../components/ui/Card';
import { Screen } from '../components/ui/Screen';
import { EmptyState, ErrorState, ListFooter, LoadingView } from '../components/ui/States';
import { AddressSummary, OrderBadges, OrderTotals } from '../components/shop/OrderBits';
import { useInfiniteList } from '../hooks/useInfiniteList';
import { useLocale, useT } from '../i18n';
import type { RootNavigation, RootScreenProps } from '../navigation/types';
import { colors, radius, spacing } from '../theme';
import { formatDate, formatPrice, shortId } from '../utils/format';
import { productTitle } from '../utils/localize';

export function OrdersScreen() {
  const t = useT('Orders');
  const locale = useLocale();
  const navigation = useNavigation<RootNavigation>();
  const { query, rows, refreshing, refresh, loadMore } = useInfiniteList(['orders'], (p, signal) => ordersApi.list({ ...p, sort: '-createdAt' }, signal), {});

  if (query.isLoading) return <LoadingView />;
  if (query.isError) return <ErrorState error={query.error} onRetry={() => query.refetch()} />;

  return (
    <Screen scroll={false}>
      <FlatList
        data={rows}
        keyExtractor={(o: Order) => o._id}
        contentContainerStyle={styles.list}
        onRefresh={refresh}
        refreshing={refreshing}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={<ListFooter loading={query.isFetchingNextPage} />}
        ListEmptyComponent={<EmptyState icon={<Package size={28} color={colors.secondary} />} title={t('empty')} description={t('emptyDesc')} />}
        renderItem={({ item }) => (
          <Card onPress={() => navigation.navigate('OrderDetails', { id: item._id })}>
            <View style={styles.row}>
              <AppText variant="heading" style={styles.flex}>
                {t('order')} {shortId(item._id)}
              </AppText>
              <AppText weight="bold">{formatPrice(item.totalOrderPrice, locale)}</AppText>
            </View>
            <AppText variant="caption">{formatDate(item.createdAt, locale)}</AppText>
            <OrderBadges order={item} />
          </Card>
        )}
      />
    </Screen>
  );
}

export function OrderDetailsScreen({ route }: RootScreenProps<'OrderDetails'>) {
  const t = useT('Orders');
  const locale = useLocale();
  const { id, placed } = route.params;
  const { data: order, isLoading, isError, error, refetch } = useQuery({ queryKey: ['orders', 'detail', id], queryFn: ({ signal }) => ordersApi.get(id, signal) });

  if (isLoading) return <LoadingView />;
  if (isError || !order) return <ErrorState error={error} onRetry={() => refetch()} />;

  return (
    <Screen>
      {placed && (
        <Card style={styles.success}>
          <AppText color={colors.success} weight="semibold">
            {t('success')}
          </AppText>
        </Card>
      )}
      <Card>
        <View style={styles.row}>
          <AppText variant="title" style={styles.flex}>
            {shortId(order._id)}
          </AppText>
          <OrderBadges order={order} />
        </View>
        <AppText variant="caption">{t('placedOn', { date: formatDate(order.createdAt, locale, true) })}</AppText>
        {order.paidAt ? <AppText variant="caption">{t('paidOn', { date: formatDate(order.paidAt, locale) })}</AppText> : null}
        {order.deliveredAt ? <AppText variant="caption">{t('deliveredOn', { date: formatDate(order.deliveredAt, locale) })}</AppText> : null}
        <AppText variant="caption">
          {t('method')}: {order.paymentMethodType === 'card' ? t('card') : t('cash')}
        </AppText>
      </Card>

      <Section title={t('items')}>
        {order.cartItems.map((item, i) => (
          <View key={item._id ?? i} style={styles.item}>
            {item.product?.imageCover ? <Image source={{ uri: item.product.imageCover }} style={styles.thumb} contentFit="cover" /> : <View style={styles.thumb} />}
            <View style={styles.flex}>
              <AppText variant="label" numberOfLines={2}>
                {productTitle(item.product, locale) || t('order')}
              </AppText>
              <AppText variant="caption">
                {t('qty')}: {item.quantity}
                {item.color ? ` · ${item.color}` : ''}
              </AppText>
            </View>
            <AppText weight="semibold">{formatPrice(item.price * item.quantity, locale)}</AppText>
          </View>
        ))}
      </Section>

      {order.shippingAddress && (
        <Section title={t('shippingAddress')}>
          <AddressSummary address={order.shippingAddress} />
        </Section>
      )}

      <Section title={t('summary')}>
        <OrderTotals order={order} />
      </Section>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  list: { padding: spacing.lg, gap: spacing.md },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  success: { backgroundColor: colors.successBg },
  item: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  thumb: { width: 56, height: 56, borderRadius: radius.md, backgroundColor: colors.cream }
});
