import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import { useNavigation } from '@react-navigation/native';
import type { Product } from '../../api/types';
import { useLocale } from '../../i18n';
import type { RootNavigation } from '../../navigation/types';
import { colors, fonts, radius, shadow, spacing } from '../../theme';
import { productTeaser, productTitle } from '../../utils/localize';
import { AppText } from '../ui/AppText';
import { Skeleton } from '../ui/States';
import { PriceTag } from '../shop/ProductBits';

/** Full-width landing block with its own background, like the web's `<section>` bands. */
export function Band({ children, background, style }: { children: ReactNode; background?: string; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.band, background ? { backgroundColor: background } : null, style]}>{children}</View>;
}

/** Small uppercase label with an icon, above a section title. */
export function Eyebrow({ icon, label, color = colors.primary }: { icon?: ReactNode; label: string; color?: string }) {
  return (
    <View style={styles.eyebrow}>
      {icon}
      <AppText variant="overline" color={color}>
        {label}
      </AppText>
    </View>
  );
}

/** Two-line heading — the second line is highlighted (web: `titleLine1` / `titleLine2`). */
export function Heading({ line1, line2, accent = colors.primary, center }: { line1: string; line2?: string; accent?: string; center?: boolean }) {
  return (
    <AppText variant="display" center={center}>
      {line1}
      {line2 ? (
        <>
          {'\n'}
          <AppText variant="display" color={accent}>
            {line2}
          </AppText>
        </>
      ) : null}
    </AppText>
  );
}

/** Product tile used by the category showcases; opens the product page. */
export function ShowcaseCard({
  product,
  width,
  badge,
  tint = colors.cream,
  round,
  extra
}: {
  product: Product;
  width?: number;
  badge?: string;
  tint?: string;
  round?: boolean;
  extra?: ReactNode;
}) {
  const locale = useLocale();
  const navigation = useNavigation<RootNavigation>();
  return (
    <Pressable
      onPress={() => navigation.navigate('ProductDetails', { id: product._id })}
      accessibilityRole="button"
      accessibilityLabel={productTitle(product, locale)}
      style={({ pressed }) => [styles.card, width ? { width } : styles.flex, pressed && { opacity: 0.9 }]}>
      {badge ? (
        <View style={styles.badge}>
          <AppText style={styles.badgeText}>{badge}</AppText>
        </View>
      ) : null}
      <View style={[styles.cardImage, { backgroundColor: tint }, round && styles.cardImageRound]}>
        <Image source={{ uri: product.imageCover }} style={styles.fill} contentFit="cover" transition={150} recyclingKey={product._id} />
      </View>
      <AppText style={styles.cardTitle} numberOfLines={2} center={round}>
        {productTitle(product, locale)}
      </AppText>
      <AppText variant="caption" numberOfLines={2} center={round}>
        {productTeaser(product, locale)}
      </AppText>
      <PriceTag product={product} />
      {extra}
    </Pressable>
  );
}

export function ShowcaseSkeleton({ count, height = 220 }: { count: number; height?: number }) {
  return (
    <View style={styles.grid}>
      {Array.from({ length: count }, (_, i) => (
        <View key={i} style={styles.gridCell}>
          <Skeleton height={height} rounded={radius.xl} />
        </View>
      ))}
    </View>
  );
}

/** Two-column grid for product tiles. */
export function Grid({ children }: { children: ReactNode }) {
  return <View style={styles.grid}>{children}</View>;
}

export function GridCell({ children }: { children: ReactNode }) {
  return <View style={styles.gridCell}>{children}</View>;
}

/** Icon in a soft rounded square next to a title/description (tips, steps, benefits). */
export function IconRow({ icon, title, desc, tint = colors.white, border = colors.border }: { icon: ReactNode; title: string; desc?: string; tint?: string; border?: string }) {
  return (
    <View style={styles.iconRow}>
      <View style={[styles.iconBox, { backgroundColor: tint, borderColor: border }]}>{icon}</View>
      <View style={styles.flex}>
        <AppText variant="heading">{title}</AppText>
        {desc ? <AppText variant="caption" style={styles.iconRowDesc}>{desc}</AppText> : null}
      </View>
    </View>
  );
}

export const styles = StyleSheet.create({
  flex: { flex: 1 },
  fill: { width: '100%', height: '100%' },
  band: { paddingVertical: spacing.xxl, paddingHorizontal: spacing.lg, gap: spacing.lg },
  eyebrow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  card: { backgroundColor: colors.white, borderRadius: radius.xl, padding: spacing.md, gap: 6, ...shadow },
  cardImage: { aspectRatio: 1, borderRadius: radius.lg, overflow: 'hidden', marginBottom: 4 },
  cardImageRound: { width: 112, height: 112, aspectRatio: undefined, borderRadius: 56, alignSelf: 'center', borderWidth: 3, borderColor: colors.white },
  cardTitle: { fontFamily: fonts.serif, fontSize: 15, lineHeight: 20, color: colors.dark },
  badge: { alignSelf: 'flex-start', backgroundColor: colors.peach, borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 3, marginBottom: 2 },
  badgeText: { fontFamily: fonts.bold, fontSize: 10, color: colors.secondary, letterSpacing: 0.5 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  gridCell: { width: '47.5%', flexGrow: 1 },
  iconRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  iconBox: { width: 44, height: 44, borderRadius: radius.md, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  iconRowDesc: { marginTop: 2 }
});
