import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, type FieldValues, type Path, type UseFormSetError } from 'react-hook-form';
import { useNavigation } from '@react-navigation/native';
import { Lock, Mail, User } from 'lucide-react-native';
import { authApi } from '../api/auth';
import { errorMessage, isApiError } from '../api/errors';
import { authService } from '../auth/authService';
import { AppText } from '../components/ui/AppText';
import { Button } from '../components/ui/Button';
import { FormField } from '../components/ui/FormField';
import { Screen } from '../components/ui/Screen';
import { useT } from '../i18n';
import type { RootNavigation } from '../navigation/types';
import { useSession } from '../store/session';
import { toast } from '../store/toast';
import { colors, spacing } from '../theme';
import { forgotEmailSchema, loginSchema, newPasswordSchema, resetCodeSchema, signupSchema, type LoginValues, type SignupValues } from '../validation/schemas';

/** Maps express-validator field errors onto the form; returns the generic message when none match. */
export function applyServerErrors<T extends FieldValues>(e: unknown, setError: UseFormSetError<T>, fields: string[]): string | null {
  if (isApiError(e) && e.kind === 'validation') {
    let matched = false;
    for (const [path, message] of Object.entries(e.fieldErrors)) {
      if (fields.includes(path)) {
        setError(path as Path<T>, { message });
        matched = true;
      }
    }
    if (matched) return null;
  }
  return errorMessage(e);
}

export function LoginScreen() {
  const t = useT('Auth');
  const navigation = useNavigation<RootNavigation>();
  const expired = useSession((s) => s.expiredReason);
  const resolver = useMemo(() => zodResolver(loginSchema()), []);
  const { control, handleSubmit, setError, formState } = useForm<LoginValues>({ resolver, defaultValues: { email: '', password: '' } });
  const [formError, setFormError] = useState<string | null>(null);

  const submit = handleSubmit(async (v) => {
    setFormError(null);
    try {
      const user = await authService.login(v.email, v.password);
      toast.success(t('welcome', { name: user.name }));
    } catch (e) {
      setFormError(applyServerErrors(e, setError, ['email', 'password']));
    }
  });

  return (
    <Screen>
      <AppText variant="title">{t('loginTitle')}</AppText>
      <AppText color={colors.muted}>{t('loginSubtitle')}</AppText>
      {expired && <AppText color={colors.warning}>{expired}</AppText>}
      <FormField control={control} name="email" label={t('email')} icon={<Mail size={18} color={colors.muted} />} keyboardType="email-address" autoCapitalize="none" autoComplete="email" ltr />
      <FormField control={control} name="password" label={t('password')} icon={<Lock size={18} color={colors.muted} />} password autoCapitalize="none" autoComplete="password" />
      {formError && <AppText color={colors.danger}>{formError}</AppText>}
      <Button title={t('loginBtn')} onPress={submit} loading={formState.isSubmitting} block size="lg" />
      <Button title={t('forgot')} variant="ghost" onPress={() => navigation.navigate('ForgotPassword')} />
      <View style={styles.footerRow}>
        <AppText color={colors.muted}>{t('noAccount')}</AppText>
        <Button title={t('createAccount')} variant="ghost" size="sm" onPress={() => navigation.replace('Signup')} />
      </View>
    </Screen>
  );
}

export function SignupScreen() {
  const t = useT('Auth');
  const navigation = useNavigation<RootNavigation>();
  const resolver = useMemo(() => zodResolver(signupSchema()), []);
  const { control, handleSubmit, setError, formState } = useForm<SignupValues>({ resolver, defaultValues: { name: '', email: '', password: '', passwordConfirm: '' } });
  const [formError, setFormError] = useState<string | null>(null);

  const submit = handleSubmit(async (v) => {
    setFormError(null);
    try {
      const user = await authService.signup(v);
      toast.success(t('welcome', { name: user.name }));
    } catch (e) {
      setFormError(applyServerErrors(e, setError, ['name', 'email', 'password', 'passwordConfirm']));
    }
  });

  return (
    <Screen>
      <AppText variant="title">{t('signupTitle')}</AppText>
      <AppText color={colors.muted}>{t('signupSubtitle')}</AppText>
      <FormField control={control} name="name" label={t('name')} icon={<User size={18} color={colors.muted} />} autoComplete="name" />
      <FormField control={control} name="email" label={t('email')} icon={<Mail size={18} color={colors.muted} />} keyboardType="email-address" autoCapitalize="none" autoComplete="email" ltr />
      <FormField control={control} name="password" label={t('password')} icon={<Lock size={18} color={colors.muted} />} password autoCapitalize="none" />
      <FormField control={control} name="passwordConfirm" label={t('confirmPassword')} icon={<Lock size={18} color={colors.muted} />} password autoCapitalize="none" />
      {formError && <AppText color={colors.danger}>{formError}</AppText>}
      <Button title={t('signupBtn')} onPress={submit} loading={formState.isSubmitting} block size="lg" />
      <View style={styles.footerRow}>
        <AppText color={colors.muted}>{t('haveAccount')}</AppText>
        <Button title={t('loginBtn')} variant="ghost" size="sm" onPress={() => navigation.replace('Login')} />
      </View>
    </Screen>
  );
}

/** Three steps: email → 6-digit code → new password (the email is kept for the last call). */
export function ForgotPasswordScreen() {
  const t = useT('Auth');
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const emailForm = useForm<{ email: string }>({ resolver: useMemo(() => zodResolver(forgotEmailSchema()), []), defaultValues: { email: '' } });
  const codeForm = useForm<{ code: string }>({ resolver: useMemo(() => zodResolver(resetCodeSchema()), []), defaultValues: { code: '' } });
  const passForm = useForm<{ password: string; confirm: string }>({ resolver: useMemo(() => zodResolver(newPasswordSchema()), []), defaultValues: { password: '', confirm: '' } });

  const sendCode = async (address: string) => {
    setFormError(null);
    try {
      await authApi.forgotPassword(address);
      setEmail(address);
      setStep(2);
      toast.success(t('codeSent'));
    } catch (e) {
      setFormError(errorMessage(e));
    }
  };

  const submitEmail = emailForm.handleSubmit((v) => sendCode(v.email.trim().toLowerCase()));

  const submitCode = codeForm.handleSubmit(async (v) => {
    setFormError(null);
    try {
      await authApi.verifyResetCode(v.code);
      setStep(3);
    } catch (e) {
      setFormError(errorMessage(e));
    }
  });

  const submitPassword = passForm.handleSubmit(async (v) => {
    setFormError(null);
    try {
      const res = await authApi.resetPassword(email, v.password);
      await authService.loginWithToken(res.token);
      toast.success(t('resetDone'));
    } catch (e) {
      setFormError(errorMessage(e));
    }
  });

  return (
    <Screen>
      <AppText variant="overline">{t('step', { n: step })}</AppText>
      {step === 1 && (
        <>
          <AppText variant="title">{t('forgotTitle')}</AppText>
          <AppText color={colors.muted}>{t('forgotDesc')}</AppText>
          <FormField control={emailForm.control} name="email" label={t('email')} icon={<Mail size={18} color={colors.muted} />} keyboardType="email-address" autoCapitalize="none" ltr />
          {formError && <AppText color={colors.danger}>{formError}</AppText>}
          <Button title={t('sendCode')} onPress={submitEmail} loading={emailForm.formState.isSubmitting} block size="lg" />
        </>
      )}
      {step === 2 && (
        <>
          <AppText variant="title">{t('verifyTitle')}</AppText>
          <AppText color={colors.muted}>{t('verifyDesc', { email })}</AppText>
          <FormField control={codeForm.control} name="code" label={t('code')} keyboardType="number-pad" maxLength={6} ltr />
          {formError && <AppText color={colors.danger}>{formError}</AppText>}
          <Button title={t('verify')} onPress={submitCode} loading={codeForm.formState.isSubmitting} block size="lg" />
          <Button title={t('resend')} variant="ghost" onPress={() => sendCode(email)} />
          <Button title={t('useDifferentEmail')} variant="ghost" onPress={() => setStep(1)} />
        </>
      )}
      {step === 3 && (
        <>
          <AppText variant="title">{t('resetTitle')}</AppText>
          <AppText color={colors.muted}>{t('resetDesc', { email })}</AppText>
          <FormField control={passForm.control} name="password" label={t('newPassword')} password autoCapitalize="none" />
          <FormField control={passForm.control} name="confirm" label={t('confirmPassword')} password autoCapitalize="none" />
          {formError && <AppText color={colors.danger}>{formError}</AppText>}
          <Button title={t('resetBtn')} onPress={submitPassword} loading={passForm.formState.isSubmitting} block size="lg" />
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  footerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.xs }
});
