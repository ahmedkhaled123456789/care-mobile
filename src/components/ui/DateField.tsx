import { useState } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { CalendarDays } from 'lucide-react-native';
import { useLocale, useT } from '../../i18n';
import { colors, HIT, radius, spacing } from '../../theme';
import { formatDate } from '../../utils/format';
import { AppText } from './AppText';
import { BottomSheet } from './BottomSheet';
import { Button } from './Button';

/** Native date picker: Android dialog, iOS inline calendar in a bottom sheet. */
export function DateField({
  label,
  value,
  onChange,
  minimumDate,
  error,
  required
}: {
  label: string;
  value: Date | undefined;
  onChange: (d: Date) => void;
  minimumDate?: Date;
  error?: string;
  required?: boolean;
}) {
  const tMobile = useT('Mobile');
  const locale = useLocale();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Date>(value ?? new Date());

  const show = () => {
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: value ?? new Date(),
        mode: 'date',
        minimumDate,
        onChange: (event, date) => {
          if (event.type === 'set' && date) onChange(date);
        }
      });
    } else {
      setDraft(value ?? new Date());
      setOpen(true);
    }
  };

  return (
    <View style={styles.wrapper}>
      <AppText variant="label">
        {label}
        {required && <AppText color={colors.danger}> *</AppText>}
      </AppText>
      <Pressable onPress={show} accessibilityRole="button" accessibilityLabel={label} style={[styles.box, !!error && { borderColor: '#F87171' }]}>
        <CalendarDays size={18} color={colors.muted} />
        <AppText color={value ? colors.text : colors.subtle}>{value ? formatDate(value, locale) : tMobile('selectDate')}</AppText>
      </Pressable>
      {error && (
        <AppText variant="caption" color={colors.danger}>
          {error}
        </AppText>
      )}
      {Platform.OS === 'ios' && (
        <BottomSheet
          visible={open}
          onClose={() => setOpen(false)}
          title={label}
          footer={
            <Button
              title={tMobile('done')}
              block
              style={{ flex: 1 }}
              onPress={() => {
                onChange(draft);
                setOpen(false);
              }}
            />
          }>
          <DateTimePicker value={draft} mode="date" display="inline" minimumDate={minimumDate} locale={locale} accentColor={colors.primary} onChange={(_, d) => d && setDraft(d)} />
        </BottomSheet>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: 6 },
  box: {
    minHeight: HIT + 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(10,46,82,0.15)',
    borderRadius: radius.md,
    backgroundColor: colors.white,
    paddingHorizontal: 12
  }
});
