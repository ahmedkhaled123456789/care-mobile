import { Pressable, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { useNavigation } from '@react-navigation/native';
import { Trash2 } from 'lucide-react-native';
import { errorMessage } from '../../api/errors';
import type { CartItem } from '../../api/types';
import { useProductSummary } from '../../hooks/useCatalog';
import { useCart } from '../../hooks/useShop';
import { useLocale, useT } from '../../i18n';
import type { RootNavigation } from '../../navigation/types';
import { toast } from '../../store/toast';
import { colors, radius, spacing } from '../../theme';
import { formatPrice } from '../../utils/format';
import { productTitle } from '../../utils/localize';
import { AppText } from '../ui/AppText';
import { IconButton } from '../ui/Button';
import { Skeleton } from '../ui/States';
import { ColorDot, QuantityStepper } from '../ui/Widgets';

/** One cart row. Cart items only carry the product id, so details come from the product summary cache. */
export function CartLine({ item, readOnly = false }: { item: CartItem; readOnly?: boolean }) {
  const t = useT('Cart');
  const tUi = useT('Ui');
  const locale = useLocale();
  const navigation = useNavigation<RootNavigation>();
  const cart = useCart();
  const { data: product, isLoading, isError } = useProductSummary(item.product);
  const busy = (cart.update.isPending && cart.update.variables?.itemId === item._id) || (cart.remove.isPending && cart.remove.variables === item._id);
  const max = product ? Math.max(product.quantity, item.quantity) : undefined;

  const setQty = (quantity: number) => {
    if (product && quantity > product.quantity) return toast.info(t('maxStock', { n: product.quantity }));
    cart.update.mutate({ itemId: item._id, quantity }, { onError: (e) => toast.error(errorMessage(e)) });
  };
  const remove = () => cart.remove.mutate(item._id, { onSuccess: () => toast.success(t('removed')), onError: (e) => toast.error(errorMessage(e)) });
  const open = () => navigation.navigate('ProductDetails', { id: item.product });

  return (
    <View style={[styles.row, busy && { opacity: 0.6 }]}>
      <Pressable onPress={open} style={styles.thumb} accessibilityRole="imagebutton">
        {isLoading ? <Skeleton height="100%" /> : product && <Image source={{ uri: product.imageCover }} style={styles.image} contentFit="cover" />}
      </Pressable>
      <View style={styles.body}>
        <View style={styles.top}>
          <Pressable onPress={open} style={styles.flex}>
            {isLoading ? (
              <Skeleton width="80%" height={14} />
            ) : (
              <AppText variant="label" numberOfLines={2}>
                {isError || !product ? t('unavailable') : productTitle(product, locale)}
              </AppText>
            )}
          </Pressable>
          {!readOnly && <IconButton tone="plain" size={36} onPress={remove} disabled={busy} label={tUi('remove')} icon={<Trash2 size={18} color={colors.muted} />} />}
        </View>
        <View style={styles.meta}>
          {item.color && (
            <View style={styles.color}>
              <ColorDot color={item.color} size={12} />
              <AppText variant="caption">{item.color}</AppText>
            </View>
          )}
          <AppText variant="caption">
            {formatPrice(item.price, locale)} {t('each')}
          </AppText>
        </View>
        <View style={styles.bottom}>
          {readOnly ? (
            <AppText variant="caption">× {item.quantity}</AppText>
          ) : (
            <QuantityStepper value={item.quantity} onChange={setQty} max={max} disabled={busy} />
          )}
          <AppText weight="bold" color={colors.dark}>
            {formatPrice(item.price * item.quantity, locale)}
          </AppText>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: spacing.md, paddingVertical: spacing.md },
  thumb: { width: 84, height: 84, borderRadius: radius.lg, overflow: 'hidden', backgroundColor: colors.cream },
  image: { width: '100%', height: '100%' },
  body: { flex: 1, gap: 4 },
  top: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  flex: { flex: 1 },
  meta: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', columnGap: spacing.md },
  color: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  bottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }
});
