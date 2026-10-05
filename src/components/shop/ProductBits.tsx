import { StyleSheet, View } from 'react-native';
import { Heart } from 'lucide-react-native';
import { errorMessage } from '../../api/errors';
import type { Product } from '../../api/types';
import { useRequireShopper } from '../../hooks/useAuth';
import { useWishlist } from '../../hooks/useShop';
import { useLocale, useT } from '../../i18n';
import { toast } from '../../store/toast';
import { colors } from '../../theme';
import { discountPercent, effectivePrice, formatPrice } from '../../utils/format';
import { AppText } from '../ui/AppText';
import { IconButton } from '../ui/Button';

export function PriceTag({ product, size = 'md' }: { product: Pick<Product, 'price' | 'priceAfterDiscount'>; size?: 'md' | 'lg' }) {
  const locale = useLocale();
  const pct = discountPercent(product);
  return (
    <View style={styles.price}>
      <AppText weight="bold" color={colors.dark} style={{ fontSize: size === 'lg' ? 26 : 16 }}>
        {formatPrice(effectivePrice(product), locale)}
      </AppText>
      {pct > 0 && (
        <AppText color={colors.subtle} style={[styles.strike, { fontSize: size === 'lg' ? 16 : 12 }]}>
          {formatPrice(product.price, locale)}
        </AppText>
      )}
    </View>
  );
}

/** Heart toggle with optimistic update; guests go to login, staff get a notice. */
export function WishlistButton({ product, size = 40 }: { product: Product; size?: number }) {
  const t = useT('Product');
  const wishlist = useWishlist();
  const requireShopper = useRequireShopper();
  const inList = wishlist.has(product._id);
  const onPress = () => {
    if (!requireShopper()) return;
    wishlist.toggle.mutate(
      { product, inList },
      {
        onSuccess: () => toast.success(inList ? t('wishRemoved') : t('wishAdded')),
        onError: (e) => toast.error(errorMessage(e))
      }
    );
  };
  return (
    <IconButton
      size={size}
      onPress={onPress}
      label={inList ? t('removeFromWishlist') : t('addToWishlist')}
      icon={<Heart size={size * 0.48} color={inList ? colors.sale : colors.dark} fill={inList ? colors.sale : 'transparent'} />}
    />
  );
}

const styles = StyleSheet.create({
  price: { flexDirection: 'row', alignItems: 'baseline', flexWrap: 'wrap', columnGap: 6 },
  strike: { textDecorationLine: 'line-through' }
});
