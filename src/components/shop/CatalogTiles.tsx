import { Pressable, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import type { Brand, Category } from '../../api/types';
import { useLocale } from '../../i18n';
import { colors, radius, shadow, spacing } from '../../theme';
import { nameOf } from '../../utils/localize';
import { AppText } from '../ui/AppText';

export function CategoryTile({ category, onPress, width }: { category: Category; onPress: () => void; width?: number }) {
  const locale = useLocale();
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={nameOf(category, locale)} style={({ pressed }) => [styles.category, width ? { width } : styles.flex, pressed && { opacity: 0.85 }]}>
      {category.image && <Image source={{ uri: category.image }} style={StyleSheet.absoluteFill} contentFit="cover" transition={150} />}
      <View style={styles.shade} />
      <AppText variant="heading" color={colors.white} style={styles.categoryName} numberOfLines={2}>
        {nameOf(category, locale)}
      </AppText>
    </Pressable>
  );
}

export function BrandTile({ brand, onPress, width }: { brand: Brand; onPress: () => void; width?: number }) {
  const locale = useLocale();
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={nameOf(brand, locale)} style={({ pressed }) => [styles.brand, width ? { width } : styles.flex, pressed && { opacity: 0.85 }]}>
      {brand.image ? (
        <Image source={{ uri: brand.image }} style={styles.brandImage} contentFit="contain" transition={150} />
      ) : (
        <AppText variant="heading" center>
          {nameOf(brand, locale)}
        </AppText>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  category: { aspectRatio: 4 / 5, borderRadius: radius.xl, overflow: 'hidden', backgroundColor: colors.pink, justifyContent: 'flex-end' },
  shade: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(10,46,82,0.35)' },
  categoryName: { padding: spacing.md, fontSize: 16 },
  brand: { height: 96, borderRadius: radius.lg, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center', padding: spacing.sm, ...shadow },
  brandImage: { width: '100%', height: '100%' }
});
