import type { ReactNode } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { colors, fonts, HIT, radius } from '../../theme';
import { AppText } from './AppText';

type Variant = 'primary' | 'secondary' | 'dark' | 'ghost' | 'danger' | 'outlineDanger';
type Size = 'sm' | 'md' | 'lg';

const palette: Record<Variant, { bg: string; fg: string; border?: string }> = {
  primary: { bg: colors.primary, fg: colors.white },
  secondary: { bg: colors.white, fg: colors.dark, border: 'rgba(10,46,82,0.15)' },
  dark: { bg: colors.dark, fg: colors.white },
  ghost: { bg: 'transparent', fg: colors.dark },
  danger: { bg: colors.danger, fg: colors.white },
  outlineDanger: { bg: colors.white, fg: colors.danger, border: '#FCA5A5' }
};
const heights: Record<Size, number> = { sm: 38, md: HIT + 4, lg: 54 };

export interface ButtonProps {
  title: string;
  onPress?: () => void;
  variant?: Variant;
  size?: Size;
  icon?: ReactNode;
  loading?: boolean;
  disabled?: boolean;
  block?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}

export function Button({ title, onPress, variant = 'primary', size = 'md', icon, loading, disabled, block, style, accessibilityLabel }: ButtonProps) {
  const p = palette[variant];
  const inactive = disabled || loading;
  return (
    <Pressable
      onPress={onPress}
      disabled={inactive}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityState={{ disabled: !!inactive, busy: !!loading }}
      hitSlop={size === 'sm' ? 4 : 0}
      style={({ pressed }) => [
        styles.base,
        { minHeight: heights[size], backgroundColor: p.bg, borderColor: p.border ?? 'transparent', paddingHorizontal: size === 'sm' ? 14 : 20 },
        block && styles.block,
        inactive && styles.disabled,
        pressed && !inactive && styles.pressed,
        style
      ]}>
      {loading ? (
        <ActivityIndicator color={p.fg} />
      ) : (
        <View style={styles.row}>
          {icon}
          <AppText style={{ color: p.fg, fontFamily: fonts.semibold, fontSize: size === 'sm' ? 13 : 15 }} numberOfLines={1}>
            {title}
          </AppText>
        </View>
      )}
    </Pressable>
  );
}

/** Round icon-only button with a 44pt touch target. */
export function IconButton({
  icon,
  onPress,
  label,
  tone = 'light',
  size = HIT,
  disabled,
  style
}: {
  icon: ReactNode;
  onPress?: () => void;
  label: string;
  tone?: 'light' | 'primary' | 'plain';
  size?: number;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const bg = tone === 'primary' ? colors.primary : tone === 'light' ? colors.white : 'transparent';
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={Math.max(0, (HIT - size) / 2)}
      style={({ pressed }) => [{ width: size, height: size, borderRadius: size / 2, backgroundColor: bg, alignItems: 'center', justifyContent: 'center' }, disabled && styles.disabled, pressed && styles.pressed, style]}>
      {icon}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { borderRadius: radius.pill, borderWidth: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 10 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  block: { alignSelf: 'stretch' },
  disabled: { opacity: 0.45 },
  pressed: { opacity: 0.8, transform: [{ scale: 0.98 }] }
});
