import { useState } from 'react';
import { Linking, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { useNavigation } from '@react-navigation/native';
import { Briefcase, Check, Mail, MapPin, Megaphone, Navigation, Package, Phone, Send, TrendingUp } from 'lucide-react-native';
import { banners } from '../../assets/banners';
import { useBranches } from '../../hooks/useCatalog';
import { useLocale, useT } from '../../i18n';
import type { RootNavigation } from '../../navigation/types';
import { colors, fonts, radius, shadow, spacing } from '../../theme';
import { BRAND_EMAIL, sendToEmail } from '../../utils/sendToEmail';
import { pick } from '../../utils/localize';
import { AppText } from '../ui/AppText';
import { BottomSheet } from '../ui/BottomSheet';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Skeleton } from '../ui/States';
import { TextField } from '../ui/TextField';
import { Badge } from '../ui/Widgets';
import { Band, Eyebrow, IconRow } from './parts';

/* ---------------------------- Agency request sheet ---------------------------- */
export function AgencyRequestSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const t = useT('AgencyModal');
  const [form, setForm] = useState({ name: '', email: '', phone: '', description: '' });
  const [submitted, setSubmitted] = useState(false);
  const set = (k: keyof typeof form) => (v: string) => setForm((f) => ({ ...f, [k]: v }));
  const valid = form.name.trim() && /\S+@\S+\.\S+/.test(form.email) && form.phone.trim() && form.description.trim();

  const close = () => {
    onClose();
    setTimeout(() => {
      setForm({ name: '', email: '', phone: '', description: '' });
      setSubmitted(false);
    }, 300);
  };
  const submit = async () => {
    await sendToEmail({ subject: `Agency Request from ${form.name}`, fields: { Name: form.name, Email: form.email, Phone: form.phone, Description: form.description } });
    setSubmitted(true);
  };

  return (
    <BottomSheet visible={visible} onClose={close} title={submitted ? undefined : t('title')}>
      {submitted ? (
        <View style={styles.success}>
          <View style={styles.successIcon}>
            <Check size={30} color={colors.white} />
          </View>
          <AppText variant="title" center>
            {t('successTitle')}
          </AppText>
          <AppText color={colors.muted} center>
            {t('successDesc')}
          </AppText>
          <Button title={t('done')} variant="dark" onPress={close} />
        </View>
      ) : (
        <>
          <Eyebrow label={t('eyebrow')} />
          <AppText color={colors.muted}>{t('description')}</AppText>
          <TextField label={t('name')} value={form.name} onChangeText={set('name')} placeholder={t('namePh')} autoComplete="name" />
          <TextField label={t('email')} value={form.email} onChangeText={set('email')} placeholder={t('emailPh')} keyboardType="email-address" autoCapitalize="none" autoComplete="email" ltr />
          <TextField label={t('phone')} value={form.phone} onChangeText={set('phone')} placeholder={t('phonePh')} keyboardType="phone-pad" autoComplete="tel" ltr />
          <TextField label={t('descriptionLabel')} value={form.description} onChangeText={set('description')} placeholder={t('descriptionPh')} multiline />
          <Button title={t('submit')} size="lg" disabled={!valid} icon={<Send size={16} color={colors.white} />} onPress={() => void submit()} />
        </>
      )}
    </BottomSheet>
  );
}

/* ----------------------------------- Agents ----------------------------------- */
export function AgentsSection({ onAgent }: { onAgent: () => void }) {
  const t = useT('Agents');
  const benefits = [
    { Icon: Briefcase, key: 'benefit1' },
    { Icon: Megaphone, key: 'benefit2' },
    { Icon: TrendingUp, key: 'benefit3' },
    { Icon: Package, key: 'benefit4' }
  ] as const;
  return (
    <Band background="rgba(244,248,236,0.9)">
      <View>
        <Image source={banners.b7} style={styles.agentImage} contentFit="cover" accessibilityLabel="Business partnership and boutique" />
        <View style={styles.agentBadge}>
          <AppText style={styles.agentBadge1}>{t('badge1')}</AppText>
          <AppText variant="caption">{t('badge2')}</AppText>
        </View>
      </View>
      <AppText variant="display" style={styles.agentTitle}>
        {t('title')}
      </AppText>
      <AppText color={colors.muted}>{t('description')}</AppText>
      {benefits.map(({ Icon, key }) => (
        <Card key={key} style={styles.benefit}>
          <IconRow icon={<Icon size={20} color={colors.dark} />} title={t(key)} tint={colors.pink} border="transparent" />
        </Card>
      ))}
      <Button title={t('cta')} size="lg" onPress={onAgent} />
    </Band>
  );
}

/* ------------------------------- Store locator -------------------------------- */
export function StoreLocatorSection() {
  const t = useT('Stores');
  const locale = useLocale();
  const navigation = useNavigation<RootNavigation>();
  const { data, isLoading } = useBranches();
  const branches = (data ?? []).slice(0, 3);

  const directions = (lat: number, lng: number) => void Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`);

  return (
    <Band>
      <Eyebrow icon={<MapPin size={14} color={colors.primary} />} label={t('eyebrow')} />
      <AppText variant="display">{t('title')}</AppText>
      <AppText color={colors.muted}>{t('description')}</AppText>
      {isLoading ? (
        <>
          <Skeleton height={120} rounded={radius.xl} />
          <Skeleton height={120} rounded={radius.xl} />
        </>
      ) : (
        branches.map((b) => (
          <Card key={b._id}>
            <View style={styles.row}>
              <AppText variant="heading" style={styles.flex}>
                {pick(b.name, b.nameAr, locale)}
              </AppText>
              {b.isMain && <Badge tone="green">{t('mainBranch')}</Badge>}
            </View>
            <AppText color={colors.muted}>
              {pick(b.address, b.addressAr, locale)}, {pick(b.city, b.cityAr, locale)}
            </AppText>
            {b.workingHours ? <AppText variant="caption">{b.workingHours}</AppText> : null}
            <View style={styles.row}>
              {b.phone ? <Button title={t('call')} variant="secondary" size="sm" icon={<Phone size={14} color={colors.dark} />} onPress={() => void Linking.openURL(`tel:${b.phone!.replace(/\s/g, '')}`)} /> : null}
              {b.location ? <Button title={t('directions')} size="sm" icon={<Navigation size={14} color={colors.white} />} onPress={() => directions(b.location.lat, b.location.lng)} /> : null}
            </View>
          </Card>
        ))
      )}
      <Button title={t('viewAll')} variant="secondary" size="lg" onPress={() => navigation.navigate('Stores')} />
    </Band>
  );
}

/* ----------------------------------- Contact ---------------------------------- */
const emptyContact = { fullName: '', company: '', email: '', phone: '', country: '', message: '' };

export function ContactSection() {
  const t = useT('Contact');
  const [form, setForm] = useState(emptyContact);
  const [submitted, setSubmitted] = useState(false);
  const set = (k: keyof typeof form) => (v: string) => setForm((f) => ({ ...f, [k]: v }));
  const valid = form.fullName.trim() && /\S+@\S+\.\S+/.test(form.email) && form.phone.trim() && form.message.trim();

  const submit = async () => {
    await sendToEmail({
      subject: `New Contact Request from ${form.fullName}`,
      fields: { Name: form.fullName, Company: form.company, Email: form.email, Phone: form.phone, Country: form.country, Message: form.message }
    });
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setForm(emptyContact);
    }, 6000);
  };

  return (
    <Band background={colors.white}>
      <AppText variant="display">{t('title')}</AppText>
      <AppText color={colors.muted}>{t('description')}</AppText>

      {submitted ? (
        <View style={styles.contactDone}>
          <View style={styles.successIcon}>
            <Check size={30} color={colors.white} />
          </View>
          <AppText variant="title" center>
            {t('successTitle')}
          </AppText>
          <AppText color={colors.muted} center>
            {t('successDesc')}
          </AppText>
        </View>
      ) : (
        <View style={styles.form}>
          <TextField label={t('fullName')} required value={form.fullName} onChangeText={set('fullName')} placeholder={t('fullNamePh')} autoComplete="name" />
          <TextField label={t('company')} value={form.company} onChangeText={set('company')} placeholder={t('companyPh')} />
          <TextField label={t('email')} required value={form.email} onChangeText={set('email')} placeholder={t('emailPh')} keyboardType="email-address" autoCapitalize="none" autoComplete="email" ltr />
          <TextField label={t('phone')} required value={form.phone} onChangeText={set('phone')} placeholder={t('phonePh')} keyboardType="phone-pad" autoComplete="tel" ltr />
          <TextField label={t('country')} value={form.country} onChangeText={set('country')} placeholder={t('countryPh')} />
          <TextField label={t('message')} required value={form.message} onChangeText={set('message')} placeholder={t('messagePh')} multiline />
          <Button title={t('submit')} size="lg" disabled={!valid} onPress={() => void submit()} />
        </View>
      )}

      <View style={styles.contactCard}>
        <Image source={banners.b8} style={StyleSheet.absoluteFill} contentFit="cover" />
        <View style={styles.contactShade} />
        <View style={styles.contactInfo}>
          <View style={styles.row}>
            <View style={[styles.contactIcon, { backgroundColor: colors.pink }]}>
              <MapPin size={18} color={colors.dark} />
            </View>
            <View style={styles.flex}>
              <AppText weight="semibold" color={colors.dark}>
                {t('hqLabel')}
              </AppText>
              <AppText variant="caption">{t('hqValue')}</AppText>
            </View>
          </View>
          <View style={styles.row}>
            <View style={[styles.contactIcon, { backgroundColor: colors.peach }]}>
              <Mail size={18} color={colors.dark} />
            </View>
            <View style={styles.flex}>
              <AppText weight="semibold" color={colors.dark}>
                {t('emailLabel')}
              </AppText>
              <AppText variant="caption" onPress={() => void Linking.openURL(`mailto:${BRAND_EMAIL}`)} style={{ writingDirection: 'ltr' }}>
                {BRAND_EMAIL}
              </AppText>
            </View>
          </View>
        </View>
      </View>
    </Band>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  success: { alignItems: 'center', gap: spacing.md, paddingVertical: spacing.lg },
  successIcon: { width: 60, height: 60, borderRadius: 30, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  agentImage: { width: '100%', aspectRatio: 4 / 3, borderRadius: radius.xl },
  agentBadge: { position: 'absolute', right: spacing.md, bottom: -spacing.lg, backgroundColor: colors.white, borderRadius: radius.lg, padding: spacing.md, maxWidth: 190, ...shadow },
  agentBadge1: { fontFamily: fonts.serif, fontSize: 22, color: colors.primary },
  agentTitle: { marginTop: spacing.lg },
  benefit: { padding: spacing.md },
  form: { gap: spacing.md },
  contactDone: { alignItems: 'center', gap: spacing.md, padding: spacing.xl, borderRadius: radius.xl, backgroundColor: colors.cream, borderWidth: 1, borderColor: colors.pinkDark },
  contactCard: { height: 260, borderRadius: radius.xl, overflow: 'hidden', justifyContent: 'flex-end' },
  contactShade: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(0,0,0,0.25)' },
  contactInfo: { margin: spacing.lg, padding: spacing.lg, gap: spacing.md, borderRadius: radius.lg, backgroundColor: 'rgba(255,255,255,0.93)' },
  contactIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' }
});
