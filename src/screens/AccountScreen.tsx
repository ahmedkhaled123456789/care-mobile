import { Alert, Linking, StyleSheet, View } from 'react-native';
import Constants from 'expo-constants';
import { useNavigation } from '@react-navigation/native';
import { Globe, Grid2x2, Heart, LogOut, Mail, MapPin, Package, Star, Store, Tag, UserRound, KeyRound } from 'lucide-react-native';
import { authService } from '../auth/authService';
import { AppText } from '../components/ui/AppText';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Screen } from '../components/ui/Screen';
import { Avatar, Badge, Chip, ListRow } from '../components/ui/Widgets';
import { BRAND_EMAIL } from '../config/env';
import { useAuth } from '../hooks/useAuth';
import { useT } from '../i18n';
import type { RootNavigation } from '../navigation/types';
import { usePreferences, type Locale } from '../store/preferences';
import { colors, spacing } from '../theme';
import { userImageUrl } from '../utils/format';

const icon = (Icon: typeof Tag) => <Icon size={18} color={colors.dark} />;

export function AccountScreen() {
  const t = useT('Account');
  const tNav = useT('Nav');
  const tMobile = useT('Mobile');
  const navigation = useNavigation<RootNavigation>();
  const { user, isShopper, isStaff } = useAuth();
  const locale = usePreferences((s) => s.locale);

  const changeLocale = async (next: Locale) => {
    if (next === locale) return;
    const needsRestart = await usePreferences.getState().setLocale(next);
    if (needsRestart) Alert.alert(tMobile('restartTitle'), tMobile('restartBody'));
  };

  const logout = () => void authService.logout();

  return (
    <Screen edges={['top']}>
      <AppText variant="title">{t('title')}</AppText>

      {user ? (
        <Card style={styles.profile}>
          <Avatar name={user.name} uri={userImageUrl(user)} size={56} />
          <View style={styles.flex}>
            <AppText variant="heading">{user.name}</AppText>
            <AppText variant="caption">{user.email}</AppText>
          </View>
          {isStaff && <Badge tone="navy">{tNav('staffBadge')}</Badge>}
        </Card>
      ) : (
        <Card>
          <AppText variant="heading">{tMobile('guestTitle')}</AppText>
          <AppText color={colors.muted}>{tMobile('guestDesc')}</AppText>
          <Button title={tNav('login')} onPress={() => navigation.navigate('Login')} block />
          <Button title={tNav('signup')} variant="secondary" onPress={() => navigation.navigate('Signup')} block />
        </Card>
      )}

      {user && (
        <Card padded={false}>
          <ListRow icon={icon(UserRound)} title={t('profile')} onPress={() => navigation.navigate('EditProfile')} />
          <ListRow icon={icon(KeyRound)} title={t('changePassword')} onPress={() => navigation.navigate('ChangePassword')} />
          {isShopper && (
            <>
              <ListRow icon={icon(Package)} title={t('orders')} onPress={() => navigation.navigate('Orders')} />
              <ListRow icon={icon(MapPin)} title={t('addresses')} onPress={() => navigation.navigate('Addresses')} />
              <ListRow icon={icon(Star)} title={t('reviews')} onPress={() => navigation.navigate('MyReviews')} />
              <ListRow icon={icon(Heart)} title={t('wishlist')} onPress={() => navigation.navigate('CustomerTabs', { screen: 'Wishlist' })} />
            </>
          )}
        </Card>
      )}

      <Card padded={false}>
        <ListRow icon={icon(Grid2x2)} title={tNav('categories')} onPress={() => navigation.navigate('Categories')} />
        <ListRow icon={icon(Tag)} title={tNav('brands')} onPress={() => navigation.navigate('Brands')} />
        <ListRow icon={icon(Store)} title={tNav('stores')} subtitle={tMobile('storesSubtitle')} onPress={() => navigation.navigate('Stores')} />
        <ListRow icon={icon(Mail)} title={tMobile('contactUs')} subtitle={BRAND_EMAIL} onPress={() => void Linking.openURL(`mailto:${BRAND_EMAIL}`)} />
      </Card>

      <Card>
        <View style={styles.langHeader}>
          <Globe size={18} color={colors.dark} />
          <AppText variant="label">{tMobile('language')}</AppText>
        </View>
        <View style={styles.langRow}>
          <Chip label={tMobile('english')} selected={locale === 'en'} onPress={() => void changeLocale('en')} />
          <Chip label={tMobile('arabic')} selected={locale === 'ar'} onPress={() => void changeLocale('ar')} />
        </View>
      </Card>

      {user && <Button title={tNav('logout')} variant="outlineDanger" icon={<LogOut size={16} color={colors.danger} />} onPress={logout} block />}
      <AppText variant="caption" center>
        {tMobile('version', { v: Constants.expoConfig?.version ?? '1.0.0' })}
      </AppText>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  profile: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  langHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  langRow: { flexDirection: 'row', gap: spacing.sm }
});
