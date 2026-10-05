import { StyleSheet, View } from 'react-native';
import { MapPin, Phone } from 'lucide-react-native';
import type { Address, Order, ShippingAddress } from '../../api/types';
import { useLocale, useT } from '../../i18n';
import { colors, spacing } from '../../theme';
import { formatPrice } from '../../utils/format';
import { AppText } from '../ui/AppText';
import { Divider, InfoRow } from '../ui/Card';
import { Badge } from '../ui/Widgets';

export function OrderBadges({ order }: { order: Pick<Order, 'isPaid' | 'isDelivered'> }) {
  const t = useT('Orders');
  return (
    <View style={styles.badges}>
      <Badge tone={order.isPaid ? 'green' : 'amber'}>{order.isPaid ? t('paid') : t('unpaid')}</Badge>
      <Badge tone={order.isDelivered ? 'green' : 'blue'}>{order.isDelivered ? t('delivered') : t('pending')}</Badge>
    </View>
  );
}

export function AddressSummary({ address }: { address: (Address | ShippingAddress) & { alias?: string } }) {
  return (
    <View style={styles.address}>
      {!!address.alias && <AppText variant="label">{address.alias}</AppText>}
      <View style={styles.line}>
        <MapPin size={16} color={colors.primary} />
        <AppText style={styles.flex} color={colors.muted}>
          {address.details}, {address.city}
          {address.postalCode ? ` ${address.postalCode}` : ''}
        </AppText>
      </View>
      <View style={styles.line}>
        <Phone size={16} color={colors.primary} />
        <AppText color={colors.muted} style={{ writingDirection: 'ltr' }}>
          {address.phone}
        </AppText>
      </View>
    </View>
  );
}

/** Items subtotal, coupon discount (derived), tax, shipping, total — same math as the web order pages. */
export function OrderTotals({ order }: { order: Order }) {
  const t = useT('Orders');
  const tCart = useT('Cart');
  const locale = useLocale();
  const itemsTotal = order.cartItems.reduce((n, i) => n + i.price * i.quantity, 0);
  const discount = Math.max(0, itemsTotal + order.taxPrice + order.shippingPrice - order.totalOrderPrice);
  return (
    <View style={{ gap: 6 }}>
      <InfoRow label={t('subtotal')} value={formatPrice(itemsTotal, locale)} />
      {discount > 0.009 && <InfoRow label={tCart('discount')} value={`−${formatPrice(discount, locale)}`} tone={colors.success} />}
      <InfoRow label={t('tax')} value={formatPrice(order.taxPrice, locale)} />
      <InfoRow label={t('shipping')} value={formatPrice(order.shippingPrice, locale)} />
      <Divider />
      <InfoRow label={t('total')} value={formatPrice(order.totalOrderPrice, locale)} strong />
    </View>
  );
}

const styles = StyleSheet.create({
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  address: { gap: 4 },
  line: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  flex: { flex: 1 }
});
