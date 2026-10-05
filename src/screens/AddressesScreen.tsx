import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { MapPin, Plus } from 'lucide-react-native';
import { errorMessage } from '../api/errors';
import { AppText } from '../components/ui/AppText';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { confirm } from '../components/ui/Feedback';
import { FormField } from '../components/ui/FormField';
import { Screen } from '../components/ui/Screen';
import { EmptyState, ErrorState, LoadingView } from '../components/ui/States';
import { AddressSummary } from '../components/shop/OrderBits';
import { useAddresses } from '../hooks/useShop';
import { useT } from '../i18n';
import type { RootScreenProps } from '../navigation/types';
import { toast } from '../store/toast';
import { colors, spacing } from '../theme';
import { addressSchema, cleanPhone, type AddressValues } from '../validation/schemas';

export function AddressesScreen({ navigation }: RootScreenProps<'Addresses'>) {
  const t = useT('Account');
  const tCommon = useT('Common');
  const addresses = useAddresses();

  const remove = async (id: string) => {
    if (!(await confirm({ title: t('deleteAddress') }))) return;
    addresses.remove.mutate(id, { onSuccess: () => toast.success(t('addressDeleted')), onError: (e) => toast.error(errorMessage(e)) });
  };

  if (addresses.query.isLoading) return <LoadingView />;
  if (addresses.query.isError) return <ErrorState error={addresses.query.error} onRetry={() => addresses.query.refetch()} />;

  return (
    <Screen footer={<Button title={t('addAddress')} icon={<Plus size={18} color={colors.white} />} onPress={() => navigation.navigate('AddressForm')} block size="lg" />}>
      {addresses.list.length === 0 ? (
        <EmptyState icon={<MapPin size={28} color={colors.secondary} />} title={t('noAddresses')} description={t('noAddressesDesc')} />
      ) : (
        addresses.list.map((a) => (
          <Card key={a._id}>
            <AddressSummary address={a} />
            <View style={styles.actions}>
              <Button title={t('replace')} variant="secondary" size="sm" onPress={() => navigation.navigate('AddressForm', { addressId: a._id })} />
              <Button title={tCommon('delete')} variant="outlineDanger" size="sm" onPress={() => remove(a._id)} loading={addresses.remove.isPending && addresses.remove.variables === a._id} />
            </View>
          </Card>
        ))
      )}
    </Screen>
  );
}

/** No update endpoint exists: editing adds the new address and then removes the old one. */
export function AddressFormScreen({ route, navigation }: RootScreenProps<'AddressForm'>) {
  const t = useT('Account');
  const tCommon = useT('Common');
  const addressId = route.params?.addressId;
  const addresses = useAddresses();
  const existing = addresses.list.find((a) => a._id === addressId);
  const resolver = useMemo(() => zodResolver(addressSchema()), []);
  const { control, handleSubmit, formState } = useForm<AddressValues>({
    resolver,
    defaultValues: { alias: existing?.alias ?? '', details: existing?.details ?? '', city: existing?.city ?? '', postalCode: existing?.postalCode ?? '', phone: existing?.phone ?? '' }
  });
  const [formError, setFormError] = useState<string | null>(null);

  const submit = handleSubmit(async (v) => {
    setFormError(null);
    const address = { alias: v.alias || undefined, details: v.details.trim(), city: v.city.trim(), postalCode: v.postalCode || undefined, phone: cleanPhone(v.phone) };
    try {
      if (addressId) await addresses.replace.mutateAsync({ id: addressId, address });
      else await addresses.add.mutateAsync(address);
      toast.success(addressId ? t('addressReplaced') : t('addressAdded'));
      navigation.goBack();
    } catch (e) {
      setFormError(errorMessage(e));
    }
  });

  return (
    <Screen>
      {addressId && <AppText variant="caption">{t('replaceHint')}</AppText>}
      <FormField control={control} name="alias" label={t('alias')} placeholder={t('aliasPh')} optional />
      <FormField control={control} name="details" label={t('details')} required />
      <FormField control={control} name="city" label={t('city')} required />
      <FormField control={control} name="postalCode" label={t('postalCode')} optional />
      <FormField control={control} name="phone" label={t('phone')} hint={t('phoneHint')} required keyboardType="phone-pad" ltr />
      {formError && <AppText color={colors.danger}>{formError}</AppText>}
      <Button title={tCommon('save')} onPress={submit} loading={formState.isSubmitting} block size="lg" />
    </Screen>
  );
}

const styles = StyleSheet.create({
  actions: { flexDirection: 'row', gap: spacing.sm }
});
