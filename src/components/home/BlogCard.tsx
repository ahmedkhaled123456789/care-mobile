import { Pressable, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { useNavigation } from '@react-navigation/native';
import { ArrowRight, Calendar, Clock } from 'lucide-react-native';
import type { BlogPost } from '../../data/blog';
import { useLocale, useT } from '../../i18n';
import type { RootNavigation } from '../../navigation/types';
import { colors, fonts, radius, shadow, spacing } from '../../theme';
import { formatDate } from '../../utils/format';
import { AppText } from '../ui/AppText';

export function BlogCard({ post, categoryLabel }: { post: BlogPost; categoryLabel?: string }) {
  const t = useT('Blog');
  const locale = useLocale();
  const navigation = useNavigation<RootNavigation>();
  const open = () => navigation.navigate('BlogPost', { slug: post.slug });
  return (
    <Pressable onPress={open} accessibilityRole="button" accessibilityLabel={post.title[locale]} style={({ pressed }) => [styles.card, pressed && { opacity: 0.9 }]}>
      <View style={styles.imageBox}>
        <Image source={post.image} style={styles.image} contentFit="cover" transition={150} />
        <View style={styles.tag}>
          <AppText style={styles.tagText}>{categoryLabel ?? post.category}</AppText>
        </View>
      </View>
      <View style={styles.body}>
        <View style={styles.meta}>
          <View style={styles.metaItem}>
            <Calendar size={13} color={colors.muted} />
            <AppText variant="caption">{formatDate(post.date, locale)}</AppText>
          </View>
          <View style={styles.metaItem}>
            <Clock size={13} color={colors.muted} />
            <AppText variant="caption">
              {post.readMinutes} {t('minRead')}
            </AppText>
          </View>
        </View>
        <AppText style={styles.title} numberOfLines={2}>
          {post.title[locale]}
        </AppText>
        <AppText color={colors.muted} numberOfLines={3}>
          {post.excerpt[locale]}
        </AppText>
        <View style={styles.more}>
          <AppText weight="semibold" color={colors.primary}>
            {t('readMore')}
          </AppText>
          <ArrowRight size={16} color={colors.primary} style={{ transform: [{ scaleX: locale === 'ar' ? -1 : 1 }] }} />
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.white, borderRadius: radius.xl, overflow: 'hidden', ...shadow },
  imageBox: { aspectRatio: 14 / 10, backgroundColor: colors.cream },
  image: { width: '100%', height: '100%' },
  tag: { position: 'absolute', top: spacing.md, left: spacing.md, backgroundColor: 'rgba(255,255,255,0.92)', borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 3 },
  tagText: { fontFamily: fonts.semibold, fontSize: 10, letterSpacing: 0.8, color: colors.dark, textTransform: 'uppercase' },
  body: { padding: spacing.lg, gap: spacing.sm },
  meta: { flexDirection: 'row', flexWrap: 'wrap', columnGap: spacing.lg, rowGap: 4 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  title: { fontFamily: fonts.serif, fontSize: 19, lineHeight: 25, color: colors.dark },
  more: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 }
});
