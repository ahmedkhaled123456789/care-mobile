import { useNavigation } from '@react-navigation/native';
import { ArrowRight, Sparkles } from 'lucide-react-native';
import { blogPosts } from '../../data/blog';
import { useT } from '../../i18n';
import type { RootNavigation } from '../../navigation/types';
import { colors } from '../../theme';
import { AppText } from '../ui/AppText';
import { Button } from '../ui/Button';
import { BlogCard } from './BlogCard';
import { Band, Eyebrow } from './parts';

export function BlogSection() {
  const t = useT('Blog');
  const navigation = useNavigation<RootNavigation>();
  const featured = blogPosts.filter((p) => p.featured).slice(0, 3);
  return (
    <Band background="rgba(255,255,255,0.6)">
      <Eyebrow icon={<Sparkles size={14} color={colors.primary} />} label={t('eyebrow')} />
      <AppText variant="display">{t('title')}</AppText>
      <AppText color={colors.muted}>{t('description')}</AppText>
      {featured.map((post) => (
        <BlogCard key={post.id} post={post} />
      ))}
      <Button title={t('viewAll')} size="lg" icon={<ArrowRight size={18} color={colors.white} />} onPress={() => navigation.navigate('Blog')} />
    </Band>
  );
}
