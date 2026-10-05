import { useNavigation } from '@react-navigation/native';
import { can, isStaff } from '../auth/permissions';
import { t } from '../i18n';
import type { RootNavigation } from '../navigation/types';
import { useSession } from '../store/session';
import { toast } from '../store/toast';

export function useAuth() {
  const user = useSession((s) => s.user);
  const status = useSession((s) => s.status);
  return { user, status, isAuthenticated: status === 'authenticated', isShopper: can(user, 'shop'), isStaff: isStaff(user) };
}

/**
 * Gate for shopping actions (cart, wishlist, reviews): guests are sent to the login
 * modal — when it closes after login they're back on the same screen — and staff get a notice.
 */
export function useRequireShopper() {
  const user = useSession((s) => s.user);
  const navigation = useNavigation<RootNavigation>();
  return (): boolean => {
    if (!user) {
      navigation.navigate('Login');
      return false;
    }
    if (!can(user, 'shop')) {
      toast.info(t('Product.staffNotice'));
      return false;
    }
    return true;
  };
}
