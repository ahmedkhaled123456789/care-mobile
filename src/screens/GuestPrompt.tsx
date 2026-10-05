import { useNavigation } from '@react-navigation/native';
import { Lock } from 'lucide-react-native';
import { Button } from '../components/ui/Button';
import { Screen } from '../components/ui/Screen';
import { EmptyState } from '../components/ui/States';
import { useAuth } from '../hooks/useAuth';
import { useT } from '../i18n';
import type { RootNavigation } from '../navigation/types';
import { colors } from '../theme';

/** Shown on shopper-only tabs (cart, wishlist) to guests and staff accounts. */
export function GuestPrompt({ title }: { title: string }) {
  const t = useT('Mobile');
  const tNav = useT('Nav');
  const tProduct = useT('Product');
  const navigation = useNavigation<RootNavigation>();
  const { user } = useAuth();
  return (
    <Screen edges={['top']}>
      <EmptyState
        icon={<Lock size={28} color={colors.secondary} />}
        title={user ? title : t('guestTitle')}
        description={user ? tProduct('staffNotice') : t('guestDesc')}
        action={
          user ? undefined : (
            <>
              <Button title={tNav('login')} onPress={() => navigation.navigate('Login')} block />
              <Button title={tNav('signup')} variant="secondary" onPress={() => navigation.navigate('Signup')} block style={{ marginTop: 8 }} />
            </>
          )
        }
      />
    </Screen>
  );
}

