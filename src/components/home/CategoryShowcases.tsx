import { StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { useNavigation } from '@react-navigation/native';
import { ArrowRight, CheckCircle2, Clock, Droplet, Droplets, Leaf, ShieldCheck, Shield, Sparkles, Sun } from 'lucide-react-native';
import { banners } from '../../assets/banners';
import { useCategoryProducts } from '../../hooks/useCatalog';
import { useLocale, useT } from '../../i18n';
import type { RootNavigation } from '../../navigation/types';
import { colors, fonts, radius, spacing } from '../../theme';
import { text } from '../../utils/localize';
import { AppText } from '../ui/AppText';
import { Button } from '../ui/Button';
import { Band, Eyebrow, Grid, GridCell, Heading, IconRow, ShowcaseCard, ShowcaseSkeleton } from './parts';

function useShopCategory(categoryId?: string) {
  const navigation = useNavigation<RootNavigation>();
  return () => (categoryId ? navigation.navigate('Category', { id: categoryId }) : navigation.navigate('Products'));
}

/* ------------------------------ Natural hair care ------------------------------ */
export function NaturalHairCareSection() {
  const t = useT('NaturalHairCare');
  const locale = useLocale();
  const { products, categoryId, isLoading } = useCategoryProducts('Hair Oils', { limit: 6 });
  const shop = useShopCategory(categoryId);
  const stats = [
    { Icon: Leaf, label: t('stat1') },
    { Icon: Sparkles, label: t('stat2') },
    { Icon: Droplet, label: t('stat3') }
  ];
  return (
    <Band background={colors.cream}>
      <Eyebrow icon={<Leaf size={14} color={colors.primary} />} label={t('eyebrow')} />
      <Heading line1={t('titleLine1')} line2={t('titleLine2')} />
      <AppText color={colors.muted}>{t('description')}</AppText>
      <View style={styles.stats}>
        {stats.map(({ Icon, label }) => (
          <View key={label} style={styles.stat}>
            <Icon size={16} color={colors.primary} />
            <AppText variant="label">{label}</AppText>
          </View>
        ))}
      </View>

      {isLoading ? (
        <ShowcaseSkeleton count={2} height={260} />
      ) : (
        <Grid>
          {products.map((p) => (
            <GridCell key={p._id}>
              <ShowcaseCard
                product={p}
                round
                extra={
                  <View style={styles.chips}>
                    {(p.ingredients ?? []).slice(0, 2).map((ing, i) => (
                      <View key={i} style={styles.chip}>
                        <AppText style={styles.chipText} numberOfLines={1}>
                          {text(ing, locale)}
                        </AppText>
                      </View>
                    ))}
                  </View>
                }
              />
            </GridCell>
          ))}
        </Grid>
      )}
      <Button title={t('cta')} onPress={shop} size="lg" icon={<ArrowRight size={18} color={colors.white} />} />
    </Band>
  );
}

/* --------------------------------- Anti acne ---------------------------------- */
const stepOf = (slug: string) => (slug.includes('face-wash') ? 1 : slug.includes('soap') ? 2 : slug.includes('gel') ? 3 : slug.includes('body-spray') ? 4 : 1);

export function AntiAcneSection() {
  const t = useT('AntiAcne');
  const { products, categoryId, isLoading } = useCategoryProducts('Anti Acne', { limit: 8 });
  const shop = useShopCategory(categoryId);
  const sorted = [...products].sort((a, b) => stepOf(a.slug) - stepOf(b.slug)).slice(0, 4);
  const hero = products.find((p) => p.slug.includes('face-wash')) ?? sorted[0];
  const steps = [
    { Icon: Droplets, title: t('step1Title'), desc: t('step1Desc') },
    { Icon: Shield, title: t('step2Title'), desc: t('step2Desc') },
    { Icon: Sparkles, title: t('step3Title'), desc: t('step3Desc') },
    { Icon: CheckCircle2, title: t('step4Title'), desc: t('step4Desc') }
  ];
  return (
    <Band background={colors.infoBg}>
      <Eyebrow icon={<Shield size={14} color={colors.secondary} />} label={t('eyebrow')} color={colors.secondary} />
      <Heading line1={t('titleLine1')} line2={t('titleLine2')} accent={colors.secondary} />
      <AppText color={colors.muted}>{t('description')}</AppText>
      <View style={styles.steps}>
        {steps.map(({ Icon, title, desc }) => (
          <IconRow key={title} icon={<Icon size={22} color={colors.secondary} />} title={title} desc={desc} border="rgba(18,86,151,0.15)" />
        ))}
      </View>

      {isLoading ? (
        <ShowcaseSkeleton count={2} height={260} />
      ) : (
        <>
          {hero ? <ShowcaseCard product={hero} badge={`${t('stepBadge')} 01`} tint={colors.white} /> : null}
          <Grid>
            {sorted.map((p) => (
              <GridCell key={p._id}>
                <ShowcaseCard product={p} badge={`${t('stepBadge')} 0${stepOf(p.slug)}`} tint={colors.white} />
              </GridCell>
            ))}
          </Grid>
        </>
      )}
      <Button title={t('cta')} onPress={shop} size="lg" style={{ backgroundColor: colors.secondary }} icon={<ArrowRight size={18} color={colors.white} />} />
    </Band>
  );
}

/* ------------------------------ Summer sun protection ------------------------------ */
export function SummerSunProtectionSection() {
  const t = useT('SunProtection');
  const navigation = useNavigation<RootNavigation>();
  const { products, categoryId, isLoading } = useCategoryProducts('Sun Protection', { limit: 8 });
  const sunscreen = products.find((p) => p.featured) ?? products[0];
  const explore = useShopCategory(categoryId);
  const tips = [
    { Icon: ShieldCheck, key: 'tip1' },
    { Icon: Clock, key: 'tip2' },
    { Icon: Droplets, key: 'tip3' },
    { Icon: Sparkles, key: 'tip4' }
  ] as const;
  return (
    <Band background="#FFF7ED">
      <View style={styles.sunPill}>
        <Sun size={14} color="#D97706" />
        <AppText variant="overline" color="#B45309">
          {t('eyebrow')}
        </AppText>
      </View>
      <Heading line1={t('titleLine1')} line2={t('titleLine2')} accent="#EA580C" />
      <AppText weight="medium" color={colors.text}>
        {t('subtitle')}
      </AppText>
      <AppText color={colors.muted}>{t('description')}</AppText>

      <View style={styles.steps}>
        {tips.map(({ Icon, key }) => (
          <IconRow key={key} icon={<Icon size={20} color="#D97706" />} title={t(`${key}Title`)} desc={t(`${key}Desc`)} tint="#FEF3C7" border="#FDE68A" />
        ))}
      </View>

      <View style={styles.sunImage}>
        <Image source={banners.b10} style={styles.fillImg} contentFit="cover" accessibilityLabel={t('imageAlt')} />
        <View style={styles.sunShade} />
        <View style={styles.spf}>
          <AppText style={styles.spfLabel}>{t('badgeLabel')}</AppText>
          <AppText style={styles.spfValue}>SPF 50+</AppText>
        </View>
        <View style={styles.sunCard}>
          <View style={styles.sunIcon}>
            <Sun size={22} color={colors.white} />
          </View>
          <View style={{ flex: 1 }}>
            <AppText style={styles.sunCardTitle}>{t('cardTitle')}</AppText>
            <AppText variant="caption">{t('cardDesc')}</AppText>
          </View>
        </View>
      </View>

      <View style={styles.sunActions}>
        <Button
          title={t('ctaShop')}
          size="lg"
          style={{ backgroundColor: '#F97316' }}
          icon={<ArrowRight size={18} color={colors.white} />}
          onPress={() => (sunscreen ? navigation.navigate('ProductDetails', { id: sunscreen._id }) : explore())}
        />
        <Button title={t('ctaExplore')} size="lg" variant="secondary" onPress={explore} />
      </View>

      {isLoading ? (
        <ShowcaseSkeleton count={2} height={200} />
      ) : products.length > 0 ? (
        <Grid>
          {products.slice(0, 4).map((p) => (
            <GridCell key={p._id}>
              <ShowcaseCard product={p} tint="#FFFBEB" />
            </GridCell>
          ))}
        </Grid>
      ) : null}
    </Band>
  );
}

const styles = StyleSheet.create({
  stats: { gap: spacing.sm },
  stat: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, justifyContent: 'center', marginTop: 2 },
  chip: { backgroundColor: colors.pink, borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 3, maxWidth: '100%' },
  chipText: { fontFamily: fonts.medium, fontSize: 11, color: colors.primary },
  steps: { gap: spacing.md },
  sunPill: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.8)', borderWidth: 1, borderColor: '#FDE68A', borderRadius: radius.pill, paddingHorizontal: 12, paddingVertical: 5 },
  sunImage: { aspectRatio: 4 / 5, borderRadius: radius.xl, overflow: 'hidden', backgroundColor: '#FEF3C7' },
  fillImg: { width: '100%', height: '100%' },
  sunShade: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(120,53,15,0.12)' },
  spf: { position: 'absolute', top: spacing.lg, left: spacing.lg, backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: radius.lg, paddingHorizontal: 14, paddingVertical: 10 },
  spfLabel: { fontFamily: fonts.semibold, fontSize: 10, letterSpacing: 1, color: '#D97706', textTransform: 'uppercase' },
  spfValue: { fontFamily: fonts.serif, fontSize: 22, color: colors.dark },
  sunCard: { position: 'absolute', left: spacing.lg, right: spacing.lg, bottom: spacing.lg, flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: 'rgba(255,255,255,0.92)', borderRadius: radius.lg, padding: spacing.md },
  sunIcon: { width: 44, height: 44, borderRadius: radius.md, backgroundColor: '#F59E0B', alignItems: 'center', justifyContent: 'center' },
  sunCardTitle: { fontFamily: fonts.serif, fontSize: 15, color: colors.dark },
  sunActions: { gap: spacing.sm }
});
