import { useState } from 'react';
import { FlatList, StyleSheet, useWindowDimensions, View } from 'react-native';
import { Image } from 'expo-image';
import { PackageX, ShoppingBag } from 'lucide-react-native';
import { errorMessage } from '../api/errors';
import { AppText } from '../components/ui/AppText';
import { Badge, Chip, ColorDot, QuantityStepper, Stars } from '../components/ui/Widgets';
import { Button } from '../components/ui/Button';
import { EmptyState, ErrorState, LoadingView } from '../components/ui/States';
import { Screen } from '../components/ui/Screen';
import { PriceTag, WishlistButton } from '../components/shop/ProductBits';
import { ProductFacts } from '../components/shop/ProductFacts';
import { ProductReviews } from '../components/shop/ProductReviews';
import { isApiError } from '../api/errors';
import { useRequireShopper } from '../hooks/useAuth';
import { useBrand, useProduct } from '../hooks/useCatalog';
import { useCart } from '../hooks/useShop';
import { useLocale, useT } from '../i18n';
import type { RootScreenProps } from '../navigation/types';
import { toast } from '../store/toast';
import { colors, radius, spacing } from '../theme';
import { discountPercent } from '../utils/format';
import { nameOf, productDescription, productTitle } from '../utils/localize';

export function ProductDetailsScreen({ route, navigation }: RootScreenProps<'ProductDetails'>) {
  const t = useT('Product');
  const locale = useLocale();
  const { width } = useWindowDimensions();
  const { data: product, isLoading, isError, error, refetch } = useProduct(route.params.id);
  const brand = useBrand(product?.brand);
  const cart = useCart();
  const requireShopper = useRequireShopper();
  const [color, setColor] = useState<string | undefined>();
  const [qty, setQty] = useState(1);
  const [page, setPage] = useState(0);

  if (isLoading && !product) return <LoadingView />;
  if (isError || !product) {
    if (isApiError(error) && (error.status === 404 || error.status === 400)) {
      return (
        <EmptyState
          icon={<PackageX size={28} color={colors.secondary} />}
          title={t('notFound')}
          description={t('notFoundDesc')}
          action={<Button title={t('backToProducts')} onPress={() => navigation.navigate('Products')} />}
        />
      );
    }
    return <ErrorState error={error} onRetry={() => refetch()} />;
  }

  const out = product.quantity <= 0;
  const pct = discountPercent(product);
  const images = [product.imageCover, ...(product.images ?? [])].filter(Boolean);
  const needsColor = (product.colors?.length ?? 0) > 0;

  const addToCart = () => {
    if (!requireShopper()) return;
    if (needsColor && !color) return toast.info(t('chooseColor'));
    cart.add.mutate({ product, color, quantity: qty }, { onSuccess: () => toast.success(t('added')), onError: (e) => toast.error(errorMessage(e)) });
  };

  return (
    <Screen
      contentStyle={styles.content}
      footer={
        <View style={styles.footer}>
          <QuantityStepper value={qty} onChange={setQty} max={product.quantity} disabled={out} />
          <View style={styles.flex}>
            <Button title={out ? t('outOfStock') : t('addToCart')} icon={<ShoppingBag size={18} color={colors.white} />} disabled={out} loading={cart.add.isPending} onPress={addToCart} block />
          </View>
        </View>
      }>
      <View>
        <FlatList
          horizontal
          pagingEnabled
          data={images}
          keyExtractor={(uri, i) => `${i}-${uri}`}
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(e) => setPage(Math.round(e.nativeEvent.contentOffset.x / width))}
          renderItem={({ item }) => <Image source={{ uri: item }} style={{ width, height: width }} contentFit="cover" transition={150} />}
        />
        {images.length > 1 && (
          <View style={styles.dots}>
            {images.map((_, i) => (
              <View key={i} style={[styles.pageDot, i === page && styles.pageDotActive]} />
            ))}
          </View>
        )}
        <View style={styles.heart}>
          <WishlistButton product={product} />
        </View>
      </View>

      <View style={styles.body}>
        <View style={styles.badges}>
          {product.category?.name && <Badge tone="blue">{nameOf(product.category, locale)}</Badge>}
          {pct > 0 && <Badge tone="red">{t('off', { n: pct })}</Badge>}
          {out ? <Badge tone="gray">{t('outOfStock')}</Badge> : product.quantity <= 5 ? <Badge tone="amber">{t('onlyLeft', { n: product.quantity })}</Badge> : <Badge tone="green">{t('inStock')}</Badge>}
        </View>

        <AppText variant="title">{productTitle(product, locale)}</AppText>
        {brand && (
          <AppText color={colors.muted}>
            {t('brand')}: {nameOf(brand, locale)}
          </AppText>
        )}
        <View style={styles.ratingRow}>
          <Stars value={product.ratingsAverage ?? 0} />
          <AppText variant="caption">{t('reviewsCount', { n: product.ratingsQuantity ?? 0 })}</AppText>
          {product.sold > 0 && <AppText variant="caption">· {t('sold', { n: product.sold })}</AppText>}
        </View>
        <PriceTag product={product} size="lg" />

        {needsColor && (
          <View style={styles.gap}>
            <AppText variant="label">{t('color')}</AppText>
            <View style={styles.wrap}>
              {product.colors.map((c) => (
                <Chip key={c} label={c} icon={<ColorDot color={c} size={14} />} selected={color === c} onPress={() => setColor(c)} />
              ))}
            </View>
          </View>
        )}

        <View style={styles.gap}>
          <AppText variant="label">{t('description')}</AppText>
          <AppText>{productDescription(product, locale)}</AppText>
        </View>

        <ProductFacts product={product} />
        <ProductReviews product={product} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: 0, gap: 0 },
  body: { padding: spacing.lg, gap: spacing.md },
  footer: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  dots: { position: 'absolute', bottom: spacing.md, alignSelf: 'center', flexDirection: 'row', gap: 6 },
  pageDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.6)' },
  pageDotActive: { backgroundColor: colors.primary, width: 18 },
  heart: { position: 'absolute', top: spacing.md, right: spacing.md },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  gap: { gap: spacing.sm },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  radius: { borderRadius: radius.lg }
});
