import { forwardRef, useState, type ReactNode } from 'react';
import { Pressable, StyleSheet, TextInput, View, type TextInputProps } from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import { useT } from '../../i18n';
import { colors, fonts, HIT, radius } from '../../theme';
import { AppText } from './AppText';

export interface TextFieldProps extends TextInputProps {
  label?: string;
  required?: boolean;
  optional?: boolean;
  error?: string;
  hint?: string;
  icon?: ReactNode;
  /** Adds a show/hide toggle and hides the value. */
  password?: boolean;
  /** Forces left-to-right content (emails, phones, codes) even in Arabic. */
  ltr?: boolean;
}

export const TextField = forwardRef<TextInput, TextFieldProps>(function TextField(
  { label, required, optional, error, hint, icon, password, ltr, multiline, style, ...props },
  ref
) {
  const tCommon = useT('Common');
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(true);
  return (
    <View style={styles.wrapper}>
      {label && (
        <AppText variant="label" style={styles.label}>
          {label}
          {required && <AppText color={colors.danger}> *</AppText>}
          {optional && <AppText variant="caption"> ({tCommon('optional')})</AppText>}
        </AppText>
      )}
      <View style={[styles.box, multiline && styles.multilineBox, focused && styles.focused, !!error && styles.errorBox]}>
        {icon && <View style={styles.icon}>{icon}</View>}
        <TextInput
          ref={ref}
          {...props}
          multiline={multiline}
          secureTextEntry={password ? hidden : props.secureTextEntry}
          placeholderTextColor={colors.subtle}
          onFocus={(e) => {
            setFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            props.onBlur?.(e);
          }}
          accessibilityLabel={label}
          accessibilityHint={error || hint}
          style={[styles.input, multiline && styles.multiline, ltr && { writingDirection: 'ltr', textAlign: 'left' }, style]}
        />
        {password && (
          <Pressable onPress={() => setHidden((h) => !h)} hitSlop={10} accessibilityRole="button" accessibilityLabel={hidden ? 'Show password' : 'Hide password'} style={styles.icon}>
            {hidden ? <Eye size={18} color={colors.muted} /> : <EyeOff size={18} color={colors.muted} />}
          </Pressable>
        )}
      </View>
      {error ? (
        <AppText variant="caption" color={colors.danger} accessibilityLiveRegion="polite">
          {error}
        </AppText>
      ) : hint ? (
        <AppText variant="caption">{hint}</AppText>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  wrapper: { gap: 6 },
  label: { marginBottom: 0 },
  box: {
    minHeight: HIT + 4,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(10,46,82,0.15)',
    borderRadius: radius.md,
    backgroundColor: colors.white,
    paddingHorizontal: 12,
    gap: 8
  },
  multilineBox: { alignItems: 'flex-start', paddingVertical: 8 },
  focused: { borderColor: colors.primary },
  errorBox: { borderColor: '#F87171' },
  icon: { minWidth: 20, alignItems: 'center', justifyContent: 'center' },
  input: { flex: 1, fontFamily: fonts.regular, fontSize: 15, color: colors.text, paddingVertical: 10 },
  multiline: { minHeight: 96, textAlignVertical: 'top' }
});
