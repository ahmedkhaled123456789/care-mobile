import { StyleSheet, View } from 'react-native';
import { Beaker, BookOpen, Check, Package } from 'lucide-react-native';
import type { Product } from '../../api/types';
import { useLocale, useT } from '../../i18n';
import { colors, radius, spacing } from '../../theme';
import { text } from '../../utils/localize';
import { AppText } from '../ui/AppText';
import { Card } from '../ui/Card';

/** Benefits / ingredients / directions / sizes stored on the product (bilingual). */
export function ProductFacts({ product }: { product: Product }) {
  const t = useT('ProductModal');
  const locale = useLocale();
  const benefits = (product.benefits ?? []).map((b) => text(b, locale)).filter(Boolean);
  const ingredients = (product.ingredients ?? []).map((i) => text(i, locale)).filter(Boolean);
  const sizes = (product.sizes ?? []).map((s) => text(s, locale)).filter(Boolean);
  const directions = text(product.directions, locale);
  if (!benefits.length && !ingredients.length && !sizes.length && !directions) return null;

  return (
    <View style={{ gap: spacing.md }}>
      {benefits.length > 0 && (
        <Card>
          <Heading icon={<Check size={16} color={colors.primary} />} label={t('benefits')} />
          {benefits.map((b) => (
            <View key={b} style={styles.bullet}>
              <View style={styles.dot} />
              <AppText style={styles.flex}>{b}</AppText>
            </View>
          ))}
        </Card>
      )}
      {ingredients.length > 0 && (
        <Card>
          <Heading icon={<Beaker size={16} color={colors.primary} />} label={t('ingredients')} />
          <Pills items={ingredients} />
        </Card>
      )}
      {!!directions && (
        <Card>
          <Heading icon={<BookOpen size={16} color={colors.primary} />} label={t('directions')} />
          <AppText>{directions}</AppText>
        </Card>
      )}
      {sizes.length > 0 && (
        <Card>
          <Heading icon={<Package size={16} color={colors.primary} />} label={t('sizes')} />
          <Pills items={sizes} />
        </Card>
      )}
    </View>
  );
}

function Heading({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <View style={styles.heading}>
      {icon}
      <AppText variant="overline" color={colors.dark}>
        {label}
      </AppText>
    </View>
  );
}

function Pills({ items }: { items: string[] }) {
  return (
    <View style={styles.pills}>
      {items.map((i) => (
        <View key={i} style={styles.pill}>
          <AppText variant="caption" color={colors.dark}>
            {i}
          </AppText>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  heading: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  bullet: { flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start' },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.primary, marginTop: 9 },
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  pill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.pinkDark, backgroundColor: colors.white }
});
