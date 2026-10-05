import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ShoppingBag } from 'lucide-react-native';
import { errorMessage } from '../api/errors';
import { AppText } from '../components/ui/AppText';
import { Button } from '../components/ui/Button';
import { Card, Divider, InfoRow, Section } from '../components/ui/Card';
import { confirm } from '../components/ui/Feedback';
import { Screen } from '../components/ui/Screen';
import { EmptyState, ErrorState, LoadingView } from '../components/ui/States';
import { TextField } from '../components/ui/TextField';
import { CartLine } from '../components/shop/CartLine';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../hooks/useShop';
import { useLocale, useT } from '../i18n';
import type { RootNavigation } from '../navigation/types';
import { toast } from '../store/toast';
import { colors, spacing } from '../theme';
import { formatPrice } from '../utils/format';
import { GuestPrompt } from './GuestPrompt';

export function CartScreen() {
  const t = useT('Cart');
  const locale = useLocale();
  const navigation = useNavigation<RootNavigation>();
  const { user, isShopper } = useAuth();
  const cart = useCart();
  const [code, setCode] = useState('');

  if (!user || !isShopper) return <GuestPrompt title={t('title')} />;
  if (cart.query.isLoading) return <LoadingView />;
  if (cart.query.isError) return <ErrorState error={cart.query.error} onRetry={() => cart.query.refetch()} />;

  if (cart.items.length === 0) {
    return (
      <Screen edges={['top']}>
        <EmptyState
          icon={<ShoppingBag size={28} color={colors.secondary} />}
          title={t('empty')}
          description={t('emptyDesc')}
          action={<Button title={t('continueShopping')} onPress={() => navigation.navigate('CustomerTabs', { screen: 'Shop' })} />}
        />
      </Screen>
    );
  }

  const apply = () => {
    if (!code.trim()) return;
    cart.applyCoupon.mutate(code.trim(), {
      onSuccess: () => {
        toast.success(t('couponApplied', { code: code.trim() }));
        setCode('');
      },
      onError: (e) => toast.error(errorMessage(e))
    });
  };

  const clear = async () => {
    if (await confirm({ title: t('clearConfirm'), confirmLabel: t('clearCart') })) cart.clear.mutate(undefined, { onSuccess: () => toast.success(t('cleared')) });
  };

  const discount = cart.totalAfterDiscount != null ? cart.subtotal - cart.totalAfterDiscount : 0;

  return (
    <Screen
      edges={['top']}
      refreshing={cart.query.isRefetching}
      onRefresh={() => cart.query.refetch()}
      footer={<Button title={`${t('checkout')} · ${formatPrice(cart.total, locale)}`} onPress={() => navigation.navigate('Checkout')} block size="lg" />}>
      <View style={styles.titleRow}>
        <View style={styles.flex}>
          <AppText variant="title">{t('title')}</AppText>
          <AppText variant="caption">{t('items', { n: cart.count })}</AppText>
        </View>
        <Button title={t('clearCart')} variant="ghost" size="sm" onPress={clear} />
      </View>

      <Card padded={false} style={styles.lines}>
        {cart.items.map((item, i) => (
          <View key={item._id}>
            {i > 0 && <Divider />}
            <CartLine item={item} />
          </View>
        ))}
      </Card>

      <Section title={t('coupon')}>
        {cart.appliedCoupon ? <AppText color={colors.success}>{t('couponApplied', { code: cart.appliedCoupon })}</AppText> : null}
        <View style={styles.couponRow}>
          <View style={styles.flex}>
            <TextField value={code} onChangeText={setCode} placeholder={t('couponPh')} autoCapitalize="characters" autoCorrect={false} />
          </View>
          <Button title={t('applyCoupon')} variant="dark" onPress={apply} loading={cart.applyCoupon.isPending} />
        </View>
        <AppText variant="caption">{t('couponResetNote')}</AppText>
      </Section>

      <Section title={t('summary')}>
        <InfoRow label={t('subtotal')} value={formatPrice(cart.subtotal, locale)} />
        {discount > 0 && <InfoRow label={t('discount')} value={`− ${formatPrice(discount, locale)}`} tone={colors.success} />}
        <Divider />
        <InfoRow label={t('total')} value={formatPrice(cart.total, locale)} strong />
        <AppText variant="caption">{t('shippingNote')}</AppText>
      </Section>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  lines: { paddingHorizontal: spacing.lg },
  couponRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm }
});
