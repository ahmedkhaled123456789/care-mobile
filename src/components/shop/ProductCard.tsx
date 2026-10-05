import { memo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { useNavigation } from '@react-navigation/native';
import { ShoppingBag } from 'lucide-react-native';
import { errorMessage } from '../../api/errors';
import type { Product } from '../../api/types';
import { useRequireShopper } from '../../hooks/useAuth';
import { useCart } from '../../hooks/useShop';
import { useLocale, useT } from '../../i18n';
import type { RootNavigation } from '../../navigation/types';
import { toast } from '../../store/toast';
import { colors, fonts, radius, shadow, spacing } from '../../theme';
import { discountPercent } from '../../utils/format';
import { nameOf, productTitle } from '../../utils/localize';
import { AppText } from '../ui/AppText';
import { IconButton } from '../ui/Button';
import { Skeleton } from '../ui/States';
import { Stars } from '../ui/Widgets';
import { PriceTag, WishlistButton } from './ProductBits';

function ProductCardInner({ product, width }: { product: Product; width?: number }) {
  const t = useT('Product');
  const locale = useLocale();
  const navigation = useNavigation<RootNavigation>();
  const cart = useCart();
  const requireShopper = useRequireShopper();
  const out = product.quantity <= 0;
  const pct = discountPercent(product);
  const needsOptions = (product.colors?.length ?? 0) > 0;
  const open = () => navigation.navigate('ProductDetails', { id: product._id });

  const quickAdd = () => {
    if (needsOptions) return open(); // a color must be chosen first
    if (!requireShopper()) return;
    cart.add.mutate({ product }, { onSuccess: () => toast.success(t('added')), onError: (e) => toast.error(errorMessage(e)) });
  };

  return (
    <Pressable onPress={open} accessibilityRole="button" accessibilityLabel={productTitle(product, locale)} style={({ pressed }) => [styles.card, width ? { width } : styles.flex, pressed && { opacity: 0.9 }]}>
      <View style={styles.imageBox}>
        <Image source={{ uri: product.imageCover }} style={[styles.image, out && { opacity: 0.55 }]} contentFit="cover" transition={150} recyclingKey={product._id} />
        {out ? (
          <View style={[styles.flag, { backgroundColor: colors.dark }]}>
            <AppText style={styles.flagText}>{t('outOfStock')}</AppText>
          </View>
        ) : pct > 0 ? (
          <View style={[styles.flag, { backgroundColor: colors.sale }]}>
            <AppText style={styles.flagText}>{t('off', { n: pct })}</AppText>
          </View>
        ) : null}
        <View style={styles.heart}>
          <WishlistButton product={product} size={36} />
        </View>
      </View>
      {!!product.category?.name && (
        <AppText variant="overline" numberOfLines={1}>
          {nameOf(product.category, locale)}
        </AppText>
      )}
      <AppText style={styles.title} numberOfLines={2}>
        {productTitle(product, locale)}
      </AppText>
      <View style={styles.rating}>
        <Stars value={product.ratingsAverage ?? 0} size={12} />
        <AppText variant="caption">({product.ratingsQuantity ?? 0})</AppText>
      </View>
      <View style={styles.bottom}>
        <View style={styles.flex}>
          <PriceTag product={product} />
        </View>
        <IconButton
          tone="primary"
          size={38}
          onPress={quickAdd}
          disabled={out || cart.add.isPending}
          label={needsOptions ? t('chooseOptions') : t('addToCart')}
          icon={<ShoppingBag size={18} color={colors.white} />}
        />
      </View>
    </Pressable>
  );
}

export const ProductCard = memo(ProductCardInner);

export function ProductCardSkeleton({ width }: { width?: number }) {
  return (
    <View style={[styles.card, width ? { width } : styles.flex]}>
      <Skeleton height={undefined} style={{ aspectRatio: 1 }} rounded={radius.lg} />
      <Skeleton width="40%" height={10} />
      <Skeleton width="85%" height={14} />
      <Skeleton width="50%" height={16} />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  card: { backgroundColor: colors.white, borderRadius: radius.xl, padding: spacing.md, gap: 6, ...shadow },
  imageBox: { aspectRatio: 1, borderRadius: radius.lg, overflow: 'hidden', backgroundColor: colors.cream, marginBottom: 4 },
  image: { width: '100%', height: '100%' },
  flag: { position: 'absolute', top: 8, left: 8, paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.pill },
  flagText: { color: colors.white, fontSize: 10, fontFamily: fonts.semibold, textTransform: 'uppercase' },
  heart: { position: 'absolute', top: 6, right: 6 },
  title: { fontFamily: fonts.serif, fontSize: 15, lineHeight: 20, color: colors.dark, minHeight: 40 },
  rating: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  bottom: { flexDirection: 'row', alignItems: 'flex-end', gap: spacing.sm, marginTop: 2 }
});
