import { StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { useNavigation } from '@react-navigation/native';
import { CheckCircle2, Droplets, Heart, Leaf, ShieldCheck, Sparkles, Star } from 'lucide-react-native';
import { banners } from '../../assets/banners';
import { useT } from '../../i18n';
import type { RootNavigation } from '../../navigation/types';
import { colors, radius, spacing } from '../../theme';
import { AppText } from '../ui/AppText';
import { Button } from '../ui/Button';
import { Band, Eyebrow, Heading } from './parts';

/* ----------------------------------- Hero ------------------------------------ */
export function HeroSection({ onAgent }: { onAgent: () => void }) {
  const t = useT('Hero');
  const navigation = useNavigation<RootNavigation>();
  const stats = [
    { Icon: Star, bg: colors.pink, value: t('stat1Value'), label: t('stat1Label') },
    { Icon: ShieldCheck, bg: colors.peach, value: t('stat2Value'), label: t('stat2Label') },
    { Icon: Sparkles, bg: '#EDE9FE', value: t('stat3Value'), label: t('stat3Label') }
  ];
  return (
    <Band style={styles.heroBand}>
      <View style={styles.pill}>
        <Sparkles size={14} color={colors.primary} />
        <AppText variant="overline" color={colors.dark}>
          {t('eyebrow')}
        </AppText>
      </View>
      <Heading line1={t('titleLine1')} line2={t('titleLine2')} />
      <AppText weight="medium" color={colors.muted}>
        {t('subtitle')}
      </AppText>
      <AppText variant="caption">{t('description')}</AppText>

      <View style={styles.collage}>
        <Image source={banners.b4} style={styles.collageMain} contentFit="cover" />
        <Image source={banners.b3} style={styles.collageSmall} contentFit="cover" />
        <Image source={banners.b2} style={styles.collageTiny} contentFit="cover" />
      </View>

      <View style={styles.actions}>
        <Button title={t('ctaExplore')} size="lg" onPress={() => navigation.navigate('CustomerTabs', { screen: 'Shop' })} />
        <Button title={t('ctaAgent')} size="lg" variant="secondary" onPress={onAgent} />
      </View>

      <View style={styles.statsRow}>
        {stats.map(({ Icon, bg, value, label }) => (
          <View key={label} style={styles.statItem}>
            <View style={[styles.statIcon, { backgroundColor: bg }]}>
              <Icon size={18} color={colors.dark} />
            </View>
            <AppText weight="bold" color={colors.dark} style={styles.statValue}>
              {value}
            </AppText>
            <AppText variant="caption">{label}</AppText>
          </View>
        ))}
      </View>
    </Band>
  );
}

/* -------------------------------- Why choose us -------------------------------- */
export function WhyChooseUsSection() {
  const t = useT('WhyChooseUs');
  const cards = [
    { Icon: Droplets, key: 'card1', bg: colors.pink, color: colors.primary },
    { Icon: Leaf, key: 'card2', bg: colors.peach, color: colors.secondary },
    { Icon: Heart, key: 'card3', bg: '#EDE9FE', color: colors.primary }
  ] as const;
  return (
    <Band background="rgba(255,255,255,0.6)">
      <AppText variant="display" center>
        {t('title')}
      </AppText>
      <AppText color={colors.muted} center>
        {t('description')}
      </AppText>
      {cards.map(({ Icon, key, bg, color }) => (
        <View key={key} style={[styles.whyCard, { backgroundColor: bg }]}>
          <View style={styles.whyIcon}>
            <Icon size={26} color={color} />
          </View>
          <AppText variant="title">{t(`${key}Title`)}</AppText>
          <AppText color={colors.muted}>{t(`${key}Desc`)}</AppText>
        </View>
      ))}
    </Band>
  );
}

/* ----------------------------------- About us ---------------------------------- */
export function AboutUsSection() {
  const t = useT('AboutUs');
  const features = ['feature1', 'feature2', 'feature3', 'feature4'] as const;
  return (
    <Band>
      <View style={styles.aboutImages}>
        <Image source={banners.b2} style={styles.aboutMain} contentFit="cover" accessibilityLabel="Cosmetics laboratory and product showcase" />
        <Image source={banners.b5} style={styles.aboutSecond} contentFit="cover" accessibilityLabel="Beauty products flat lay" />
      </View>
      <Eyebrow label={t('eyebrow')} />
      <AppText variant="display">{t('title')}</AppText>
      <AppText color={colors.muted}>{t('p1')}</AppText>
      <AppText color={colors.muted}>{t('p2')}</AppText>
      <AppText color={colors.muted}>{t('p3')}</AppText>
      <View style={styles.checks}>
        {features.map((k) => (
          <View key={k} style={styles.check}>
            <CheckCircle2 size={18} color={colors.primary} />
            <AppText variant="label" style={styles.flex}>
              {t(k)}
            </AppText>
          </View>
        ))}
      </View>
    </Band>
  );
}

/* ------------------------------------ Banner ----------------------------------- */
export function BannerSection({ onAgent }: { onAgent: () => void }) {
  const t = useT('Banner');
  const navigation = useNavigation<RootNavigation>();
  return (
    <View style={styles.banner}>
      <Image
        source={{ uri: 'https://images.unsplash.com/photo-1615397323783-943388c69fdd?auto=format&fit=crop&q=80&w=1000' }}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
      />
      <View style={styles.bannerShade} />
      <View style={styles.bannerContent}>
        <AppText variant="display" center>
          {t('title')}
        </AppText>
        <AppText weight="medium" color="rgba(10,46,82,0.8)" center>
          {t('description')}
        </AppText>
        <View style={styles.actions}>
          <Button title={t('ctaExplore')} variant="dark" size="lg" onPress={() => navigation.navigate('CustomerTabs', { screen: 'Shop' })} />
          <Button title={t('ctaAgent')} variant="secondary" size="lg" onPress={onAgent} />
        </View>
      </View>
    </View>
  );
}

/* ----------------------------------- Features ---------------------------------- */
export function FeaturesSection() {
  const t = useT('Features');
  const cards = [
    { key: 'card1', image: banners.b13 },
    { key: 'card2', image: banners.b15 }
  ] as const;
  return (
    <Band background="#F3F4F6">
      <AppText variant="display" center>
        {t('title')}
      </AppText>
      {cards.map(({ key, image }) => (
        <View key={key} style={styles.featureCard}>
          <Image source={image} style={StyleSheet.absoluteFill} contentFit="cover" accessibilityLabel={t(`${key}Title`)} />
          <View style={styles.featureShade} />
          <View style={styles.featureText}>
            <AppText variant="title" color={colors.white}>
              {t(`${key}Title`)}
            </AppText>
            <AppText color="rgba(255,255,255,0.9)">{t(`${key}Desc`)}</AppText>
          </View>
        </View>
      ))}
    </Band>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  heroBand: { paddingTop: spacing.lg },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.7)', borderWidth: 1, borderColor: colors.pinkDark, borderRadius: radius.pill, paddingHorizontal: 12, paddingVertical: 5 },
  collage: { height: 300 },
  collageMain: { position: 'absolute', top: 24, right: 0, width: '72%', height: '82%', borderRadius: radius.xl, borderWidth: 3, borderColor: colors.white },
  collageSmall: { position: 'absolute', bottom: 0, left: 0, width: '50%', height: '48%', borderRadius: radius.xl, borderWidth: 3, borderColor: colors.white },
  collageTiny: { position: 'absolute', top: 0, left: 12, width: '34%', height: '34%', borderRadius: radius.xl, borderWidth: 3, borderColor: colors.white },
  actions: { gap: spacing.sm, alignSelf: 'stretch' },
  statsRow: { flexDirection: 'row', gap: spacing.md, borderTopWidth: 1, borderTopColor: colors.pinkDark, paddingTop: spacing.lg },
  statItem: { flex: 1, alignItems: 'center', gap: 2 },
  statIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  statValue: { fontSize: 14, textAlign: 'center' },
  whyCard: { borderRadius: radius.xl, padding: spacing.xl, gap: spacing.sm },
  whyIcon: { width: 52, height: 52, borderRadius: radius.lg, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.sm },
  aboutImages: { height: 340, marginBottom: spacing.md },
  aboutMain: { width: '78%', height: '86%', borderRadius: radius.xl },
  aboutSecond: { position: 'absolute', right: 0, bottom: 0, width: '58%', aspectRatio: 1, borderRadius: radius.xl, borderWidth: 6, borderColor: colors.cream },
  checks: { gap: spacing.md, marginTop: spacing.sm },
  check: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  banner: { overflow: 'hidden' },
  bannerShade: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(232,243,214,0.9)' },
  bannerContent: { paddingVertical: spacing.xxl * 1.5, paddingHorizontal: spacing.lg, gap: spacing.lg, alignItems: 'center' },
  featureCard: { height: 340, borderRadius: radius.xl, overflow: 'hidden', backgroundColor: '#000', justifyContent: 'flex-end' },
  featureShade: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(0,0,0,0.45)' },
  featureText: { padding: spacing.xl, gap: spacing.sm }
});
