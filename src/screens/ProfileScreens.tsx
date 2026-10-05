import { useMemo, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { profileApi } from '../api/auth';
import { errorMessage } from '../api/errors';
import { authService } from '../auth/authService';
import { AppText } from '../components/ui/AppText';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { confirm } from '../components/ui/Feedback';
import { FormField } from '../components/ui/FormField';
import { Screen } from '../components/ui/Screen';
import { useAuth } from '../hooks/useAuth';
import { useT } from '../i18n';
import { useSession } from '../store/session';
import { toast } from '../store/toast';
import { colors } from '../theme';
import { cleanPhone, newPasswordSchema, profileSchema, type ProfileValues } from '../validation/schemas';
import { applyServerErrors } from './AuthScreens';

export function EditProfileScreen() {
  const t = useT('Account');
  const tCommon = useT('Common');
  const { user } = useAuth();
  const resolver = useMemo(() => zodResolver(profileSchema()), []);
  const { control, handleSubmit, setError, formState } = useForm<ProfileValues>({
    resolver,
    defaultValues: { name: user?.name ?? '', email: user?.email ?? '', phone: user?.phone ?? '' }
  });
  const [formError, setFormError] = useState<string | null>(null);

  const submit = handleSubmit(async (v) => {
    setFormError(null);
    try {
      const updated = await profileApi.updateMe({ name: v.name.trim(), email: v.email.trim().toLowerCase(), ...(v.phone ? { phone: cleanPhone(v.phone) } : {}) });
      await useSession.getState().updateUser(updated);
      toast.success(t('profileUpdated'));
    } catch (e) {
      setFormError(applyServerErrors(e, setError, ['name', 'email', 'phone']));
    }
  });

  const deactivate = async () => {
    if (!(await confirm({ title: t('deactivateConfirm'), message: t('deactivateDesc'), confirmLabel: t('deactivate') }))) return;
    try {
      await profileApi.deactivate();
      await authService.logout();
      toast.info(t('deactivated'));
    } catch (e) {
      toast.error(errorMessage(e));
    }
  };

  return (
    <Screen>
      <FormField control={control} name="name" label={t('name')} autoComplete="name" />
      <FormField control={control} name="email" label={t('email')} keyboardType="email-address" autoCapitalize="none" ltr />
      <FormField control={control} name="phone" label={t('phone')} hint={t('phoneHint')} optional keyboardType="phone-pad" ltr />
      {formError && <AppText color={colors.danger}>{formError}</AppText>}
      <Button title={tCommon('save')} onPress={submit} loading={formState.isSubmitting} block size="lg" />
      <Card>
        <AppText variant="heading" color={colors.danger}>
          {t('dangerZone')}
        </AppText>
        <AppText color={colors.muted}>{t('deactivateDesc')}</AppText>
        <Button title={t('deactivate')} variant="outlineDanger" onPress={deactivate} />
      </Card>
    </Screen>
  );
}

export function ChangePasswordScreen({ navigation }: { navigation: { goBack: () => void } }) {
  const t = useT('Account');
  const tCommon = useT('Common');
  const resolver = useMemo(() => zodResolver(newPasswordSchema()), []);
  const { control, handleSubmit, reset, formState } = useForm<{ password: string; confirm: string }>({ resolver, defaultValues: { password: '', confirm: '' } });
  const [formError, setFormError] = useState<string | null>(null);

  const submit = handleSubmit(async (v) => {
    setFormError(null);
    try {
      // The old token is invalidated by this call — keep the new one the server returns.
      const res = await profileApi.changeMyPassword(v.password);
      await useSession.getState().setSession(res.token, res.data);
      reset();
      toast.success(t('passwordUpdated'));
      navigation.goBack();
    } catch (e) {
      setFormError(errorMessage(e));
    }
  });

  return (
    <Screen>
      <FormField control={control} name="password" label={t('newPassword')} password autoCapitalize="none" />
      <FormField control={control} name="confirm" label={t('confirmPassword')} password autoCapitalize="none" />
      {formError && <AppText color={colors.danger}>{formError}</AppText>}
      <Button title={tCommon('save')} onPress={submit} loading={formState.isSubmitting} block size="lg" />
    </Screen>
  );
}
