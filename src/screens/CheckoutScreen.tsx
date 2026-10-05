import { useState } from 'react';
import { Linking, Pressable, StyleSheet, View } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import { Banknote, CreditCard, Plus } from 'lucide-react-native';
import { errorMessage } from '../api/errors';
import { ordersApi } from '../api/orders';
import type { Address, ShippingAddress } from '../api/types';
import { AppText } from '../components/ui/AppText';
import { Button } from '../components/ui/Button';
import { Divider, InfoRow, Section } from '../components/ui/Card';
import { Screen } from '../components/ui/Screen';
import { EmptyState, ErrorState, LoadingView } from '../components/ui/States';
import { AddressSummary } from '../components/shop/OrderBits';
import { STRIPE_ENABLED } from '../config/env';
import { CART_KEY, useAddresses, useCart } from '../hooks/useShop';
import { useLocale, useT } from '../i18n';
import type { RootScreenProps } from '../navigation/types';
import { toast } from '../store/toast';
import { colors, radius, spacing } from '../theme';
import { formatPrice } from '../utils/format';

type Method = 'cash' | 'card';

function Option({ selected, onPress, title, desc, icon }: { selected: boolean; onPress: () => void; title: string; desc: string; icon: React.ReactNode }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="radio" accessibilityState={{ selected }} style={[styles.option, selected && styles.optionSelected]}>
      {icon}
      <View style={styles.flex}>
        <AppText variant="label">{title}</AppText>
        <AppText variant="caption">{desc}</AppText>
      </View>
      <View style={[styles.radio, selected && styles.radioOn]} />
    </Pressable>
  );
}

export function CheckoutScreen({ navigation }: RootScreenProps<'Checkout'>) {
  const t = useT('Checkout');
  const tCart = useT('Cart');
  const locale = useLocale();
  const qc = useQueryClient();
  const cart = useCart();
  const addresses = useAddresses();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [method, setMethod] = useState<Method>('cash');
  const [busy, setBusy] = useState(false);

  if (cart.query.isLoading || addresses.query.isLoading) return <LoadingView />;
  if (cart.query.isError) return <ErrorState error={cart.query.error} onRetry={() => cart.query.refetch()} />;
  if (!cart.cartId || cart.items.length === 0) {
    return <EmptyState title={t('emptyCart')} action={<Button title={t('backToCart')} onPress={() => navigation.goBack()} />} />;
  }

  const selected: Address | undefined = addresses.list.find((a) => a._id === selectedId) ?? addresses.list[0];

  const place = async () => {
    if (!selected || !cart.cartId) return;
    const shippingAddress: ShippingAddress = { details: selected.details, phone: selected.phone, city: selected.city, ...(selected.postalCode ? { postalCode: selected.postalCode } : {}) };
    setBusy(true);
    try {
      if (method === 'card') {
        const session = await ordersApi.checkoutSession(cart.cartId, shippingAddress);
        if (!session.url) throw new Error('missing url');
        toast.info(t('redirecting'));
        await Linking.openURL(session.url);
        navigation.popToTop();
        return;
      }
      const res = await ordersApi.createCash(cart.cartId, shippingAddress);
      qc.setQueryData(CART_KEY, null);
      void qc.invalidateQueries({ queryKey: ['orders'] });
      toast.success(t('orderPlaced'));
      navigation.replace('OrderDetails', { id: res._id, placed: true });
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen
      footer={
        <Button
          title={`${method === 'card' ? t('payWithCard') : t('placeOrder')} · ${formatPrice(cart.total, locale)}`}
          onPress={place}
          loading={busy}
          disabled={!selected}
          block
          size="lg"
        />
      }>
      <Section title={t('selectAddress')}>
        {addresses.list.length === 0 ? (
          <AppText color={colors.muted}>{t('noAddresses')}</AppText>
        ) : (
          addresses.list.map((a) => {
            const on = a._id === selected?._id;
            return (
              <Pressable key={a._id} onPress={() => setSelectedId(a._id)} accessibilityRole="radio" accessibilityState={{ selected: on }} style={[styles.option, on && styles.optionSelected]}>
                <View style={styles.flex}>
                  <AddressSummary address={a} />
                </View>
                <View style={[styles.radio, on && styles.radioOn]} />
              </Pressable>
            );
          })
        )}
        <Button title={t('addNew')} variant="secondary" icon={<Plus size={16} color={colors.dark} />} onPress={() => navigation.navigate('AddressForm')} />
      </Section>

      <Section title={t('paymentMethod')}>
        <Option selected={method === 'cash'} onPress={() => setMethod('cash')} title={t('cash')} desc={t('cashDesc')} icon={<Banknote size={22} color={colors.primary} />} />
        <Option
          selected={method === 'card'}
          onPress={() => (STRIPE_ENABLED ? setMethod('card') : toast.info(t('cardUnavailable')))}
          title={t('card')}
          desc={STRIPE_ENABLED ? t('cardDesc') : t('cardUnavailable')}
          icon={<CreditCard size={22} color={STRIPE_ENABLED ? colors.primary : colors.subtle} />}
        />
      </Section>

      <Section title={tCart('summary')}>
        <InfoRow label={tCart('subtotal')} value={formatPrice(cart.subtotal, locale)} />
        {cart.totalAfterDiscount != null && <InfoRow label={tCart('discount')} value={`− ${formatPrice(cart.subtotal - cart.totalAfterDiscount, locale)}`} tone={colors.success} />}
        <Divider />
        <InfoRow label={tCart('total')} value={formatPrice(cart.total, locale)} strong />
      </Section>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  option: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.white },
  optionSelected: { borderColor: colors.primary, backgroundColor: colors.cream },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: colors.subtle },
  radioOn: { borderColor: colors.primary, backgroundColor: colors.primary }
});
