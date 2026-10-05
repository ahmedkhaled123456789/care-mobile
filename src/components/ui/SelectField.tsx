import { useState, type ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Check, ChevronDown } from 'lucide-react-native';
import { useT } from '../../i18n';
import { colors, HIT, radius, spacing } from '../../theme';
import { AppText } from './AppText';
import { BottomSheet } from './BottomSheet';

export interface Option {
  value: string;
  label: string;
  icon?: ReactNode;
}

/** Native-feeling select: a field that opens a bottom sheet with the options. */
export function SelectField({
  label,
  value,
  options,
  onChange,
  placeholder,
  error,
  hint,
  required
}: {
  label: string;
  value: string;
  options: Option[];
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  hint?: string;
  required?: boolean;
}) {
  const t = useT('Mobile');
  const [open, setOpen] = useState(false);
  const current = options.find((o) => o.value === value);
  return (
    <View style={styles.wrapper}>
      <AppText variant="label">
        {label}
        {required && <AppText color={colors.danger}> *</AppText>}
      </AppText>
      <Pressable
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${current?.label ?? placeholder ?? ''}`}
        style={[styles.box, !!error && styles.errorBox]}>
        <AppText style={styles.flex} color={current ? colors.text : colors.subtle} numberOfLines={1}>
          {current?.label ?? placeholder ?? t('choose')}
        </AppText>
        <ChevronDown size={18} color={colors.muted} />
      </Pressable>
      {error ? (
        <AppText variant="caption" color={colors.danger}>
          {error}
        </AppText>
      ) : hint ? (
        <AppText variant="caption">{hint}</AppText>
      ) : null}
      <BottomSheet visible={open} onClose={() => setOpen(false)} title={label}>
        <OptionList
          options={options}
          selected={value}
          onSelect={(v) => {
            onChange(v);
            setOpen(false);
          }}
        />
      </BottomSheet>
    </View>
  );
}

/** Radio-style option list, used inside sheets. */
export function OptionList({ options, selected, onSelect }: { options: Option[]; selected: string; onSelect: (v: string) => void }) {
  return (
    <View>
      {options.map((o) => {
        const on = o.value === selected;
        return (
          <Pressable
            key={o.value || '__all'}
            onPress={() => onSelect(o.value)}
            accessibilityRole="radio"
            accessibilityState={{ checked: on }}
            style={({ pressed }) => [styles.option, on && styles.optionOn, pressed && { opacity: 0.8 }]}>
            {o.icon}
            <AppText style={styles.flex} weight={on ? 'semibold' : 'regular'} color={colors.dark}>
              {o.label}
            </AppText>
            {on && <Check size={18} color={colors.primary} />}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: 6 },
  flex: { flex: 1 },
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
  },
  errorBox: { borderColor: '#F87171' },
  option: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, minHeight: 50, paddingHorizontal: spacing.md, borderRadius: radius.md },
  optionOn: { backgroundColor: colors.pink }
});
