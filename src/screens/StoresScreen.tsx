import { useMemo, useState } from 'react';
import { FlatList, Linking, Platform, StyleSheet, View } from 'react-native';
import { MapPin, Navigation, Phone, Search } from 'lucide-react-native';
import { AppText } from '../components/ui/AppText';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Screen } from '../components/ui/Screen';
import { EmptyState, ErrorState, LoadingView } from '../components/ui/States';
import { TextField } from '../components/ui/TextField';
import { Badge } from '../components/ui/Widgets';
import { useBranches } from '../hooks/useCatalog';
import { useLocale, useT } from '../i18n';
import { colors, spacing } from '../theme';
import { pick } from '../utils/localize';

export function StoresScreen() {
  const t = useT('Stores');
  const tMobile = useT('Mobile');
  const locale = useLocale();
  const { data, isLoading, isError, error, refetch } = useBranches();
  const [q, setQ] = useState('');

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return data ?? [];
    return (data ?? []).filter((b) => [b.name, b.nameAr, b.city, b.cityAr, b.address, b.addressAr].some((v) => v?.toLowerCase().includes(needle)));
  }, [data, q]);

  const directions = (lat: number, lng: number, label: string) => {
    const url = Platform.select({
      ios: `http://maps.apple.com/?daddr=${lat},${lng}&q=${encodeURIComponent(label)}`,
      default: `geo:${lat},${lng}?q=${lat},${lng}(${encodeURIComponent(label)})`
    })!;
    void Linking.openURL(url).catch(() => Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`));
  };

  return (
    <Screen scroll={false}>
      {isLoading ? (
        <LoadingView />
      ) : isError ? (
        <ErrorState error={error} onRetry={() => refetch()} />
      ) : (
        <FlatList
          data={rows}
          keyExtractor={(b) => b._id}
          contentContainerStyle={styles.list}
          keyboardShouldPersistTaps="handled"
          ListHeaderComponent={
            <View style={styles.header}>
              <AppText color={colors.muted}>{tMobile('storesSubtitle')}</AppText>
              <TextField value={q} onChangeText={setQ} placeholder={tMobile('search')} icon={<Search size={18} color={colors.muted} />} />
            </View>
          }
          ListEmptyComponent={<EmptyState icon={<MapPin size={28} color={colors.secondary} />} title={tMobile('none')} />}
          renderItem={({ item: b }) => (
            <Card>
              <View style={styles.titleRow}>
                <AppText variant="heading" style={styles.flex}>
                  {pick(b.name, b.nameAr, locale)}
                </AppText>
                {b.isMain && <Badge tone="green">{t('mainBranch')}</Badge>}
              </View>
              <AppText color={colors.muted}>
                {pick(b.address, b.addressAr, locale)}, {pick(b.city, b.cityAr, locale)}
              </AppText>
              {b.workingHours ? <AppText variant="caption">{b.workingHours}</AppText> : null}
              <View style={styles.actions}>
                {b.phone ? <Button title={t('call')} variant="secondary" size="sm" icon={<Phone size={14} color={colors.dark} />} onPress={() => void Linking.openURL(`tel:${b.phone!.replace(/\s/g, '')}`)} /> : null}
                {b.location ? (
                  <Button title={t('directions')} size="sm" icon={<Navigation size={14} color={colors.white} />} onPress={() => directions(b.location.lat, b.location.lng, pick(b.name, b.nameAr, locale))} />
                ) : null}
              </View>
            </Card>
          )}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  list: { padding: spacing.lg, gap: spacing.md },
  header: { gap: spacing.md, marginBottom: spacing.sm },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  actions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xs }
});
