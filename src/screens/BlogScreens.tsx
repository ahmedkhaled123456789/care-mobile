import { useMemo, useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { Calendar, Clock, FileText, Search, Sparkles, User } from 'lucide-react-native';
import { AppText } from '../components/ui/AppText';
import { Button } from '../components/ui/Button';
import { Screen } from '../components/ui/Screen';
import { EmptyState } from '../components/ui/States';
import { TextField } from '../components/ui/TextField';
import { Chip } from '../components/ui/Widgets';
import { BlogCard } from '../components/home/BlogCard';
import { Eyebrow } from '../components/home/parts';
import { blogCategories, blogPosts, type BlogCategory } from '../data/blog';
import { useLocale, useT } from '../i18n';
import type { RootScreenProps } from '../navigation/types';
import { colors, fonts, radius, spacing } from '../theme';
import { formatDate } from '../utils/format';

const CATEGORY_KEY: Record<BlogCategory, string> = {
  All: 'catAll',
  Skincare: 'catSkincare',
  Haircare: 'catHaircare',
  Wellness: 'catWellness',
  Business: 'catBusiness'
};

export function BlogScreen() {
  const t = useT('BlogPage');
  const locale = useLocale();
  const [category, setCategory] = useState<BlogCategory>('All');
  const [query, setQuery] = useState('');

  const posts = useMemo(() => {
    const q = query.trim().toLowerCase();
    return blogPosts.filter((p) => (category === 'All' || p.category === category) && (!q || p.title[locale].toLowerCase().includes(q) || p.excerpt[locale].toLowerCase().includes(q)));
  }, [category, query, locale]);

  return (
    <Screen scroll={false}>
      <FlatList
        data={posts}
        keyExtractor={(p) => p.id}
        contentContainerStyle={styles.list}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <View style={styles.header}>
            <Eyebrow icon={<Sparkles size={14} color={colors.primary} />} label={t('eyebrow')} />
            <AppText variant="display">{t('title')}</AppText>
            <AppText color={colors.muted}>{t('description')}</AppText>
            <TextField value={query} onChangeText={setQuery} placeholder={t('searchPlaceholder')} icon={<Search size={18} color={colors.muted} />} />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
              {blogCategories.map((c) => (
                <Chip key={c} label={t(CATEGORY_KEY[c])} selected={category === c} onPress={() => setCategory(c)} />
              ))}
            </ScrollView>
          </View>
        }
        ListEmptyComponent={<EmptyState icon={<FileText size={28} color={colors.secondary} />} title={t('emptyState')} />}
        renderItem={({ item }) => <BlogCard post={item} categoryLabel={t(CATEGORY_KEY[item.category])} />}
      />
    </Screen>
  );
}

export function BlogPostScreen({ route, navigation }: RootScreenProps<'BlogPost'>) {
  const t = useT('BlogPost');
  const locale = useLocale();
  const post = blogPosts.find((p) => p.slug === route.params.slug);

  if (!post) {
    return (
      <Screen>
        <EmptyState
          icon={<FileText size={28} color={colors.secondary} />}
          title={t('notFoundTitle')}
          description={t('notFoundDesc')}
          action={<Button title={t('backToBlog')} onPress={() => navigation.navigate('Blog')} />}
        />
      </Screen>
    );
  }

  const related = blogPosts.filter((p) => p.id !== post.id && p.category === post.category).slice(0, 2);

  return (
    <Screen>
      <View style={styles.tag}>
        <AppText style={styles.tagText}>{post.category}</AppText>
      </View>
      <AppText variant="display">{post.title[locale]}</AppText>
      <View style={styles.meta}>
        <View style={styles.metaItem}>
          <User size={14} color={colors.muted} />
          <AppText variant="caption" color={colors.dark} weight="medium">
            {post.author.name[locale]}
          </AppText>
          <AppText variant="caption">• {post.author.role[locale]}</AppText>
        </View>
        <View style={styles.metaItem}>
          <Calendar size={14} color={colors.muted} />
          <AppText variant="caption">{formatDate(post.date, locale)}</AppText>
        </View>
        <View style={styles.metaItem}>
          <Clock size={14} color={colors.muted} />
          <AppText variant="caption">
            {post.readMinutes} {t('minRead')}
          </AppText>
        </View>
      </View>
      <Image source={post.image} style={styles.cover} contentFit="cover" accessibilityLabel={post.title[locale]} />
      {post.content.map((para, i) => (
        <AppText key={i} style={styles.paragraph}>
          {para[locale]}
        </AppText>
      ))}

      {related.length > 0 && (
        <View style={styles.related}>
          <AppText variant="title">{t('related')}</AppText>
          {related.map((r) => (
            <Pressable key={r.id} onPress={() => navigation.push('BlogPost', { slug: r.slug })} accessibilityRole="button" style={styles.relatedCard}>
              <Image source={r.image} style={styles.relatedImage} contentFit="cover" />
              <View style={styles.relatedText}>
                <AppText style={styles.relatedTitle} numberOfLines={2}>
                  {r.title[locale]}
                </AppText>
                <AppText variant="caption" numberOfLines={2}>
                  {r.excerpt[locale]}
                </AppText>
              </View>
            </Pressable>
          ))}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { padding: spacing.lg, gap: spacing.lg },
  header: { gap: spacing.md, marginBottom: spacing.sm },
  chips: { gap: spacing.sm, paddingVertical: 2 },
  tag: { alignSelf: 'flex-start', backgroundColor: colors.pink, borderRadius: radius.pill, paddingHorizontal: 12, paddingVertical: 4 },
  tagText: { fontFamily: fonts.semibold, fontSize: 11, letterSpacing: 0.8, color: colors.primary, textTransform: 'uppercase' },
  meta: { gap: spacing.sm },
  metaItem: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6 },
  cover: { width: '100%', aspectRatio: 16 / 9, borderRadius: radius.xl },
  paragraph: { fontSize: 16, lineHeight: 26 },
  related: { gap: spacing.md, marginTop: spacing.lg },
  relatedCard: { flexDirection: 'row', gap: spacing.md, backgroundColor: colors.white, borderRadius: radius.lg, overflow: 'hidden' },
  relatedImage: { width: 96, alignSelf: 'stretch', minHeight: 96 },
  relatedText: { flex: 1, paddingVertical: spacing.md, paddingEnd: spacing.md, gap: 4 },
  relatedTitle: { fontFamily: fonts.serif, fontSize: 16, lineHeight: 21, color: colors.dark }
});
