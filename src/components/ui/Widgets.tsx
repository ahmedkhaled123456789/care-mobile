import type { ReactNode } from 'react';
import { I18nManager, Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import { ChevronRight, Minus, Plus, Star } from 'lucide-react-native';
import { useT } from '../../i18n';
import { colors, fonts, HIT, radius, spacing } from '../../theme';
import { initials } from '../../utils/format';
import { AppText } from './AppText';

/* --------------------------------- Badge --------------------------------- */
export type BadgeTone = 'green' | 'amber' | 'blue' | 'red' | 'gray' | 'navy';
const badgeTones: Record<BadgeTone, [string, string]> = {
  green: [colors.successBg, colors.success],
  amber: [colors.warningBg, colors.warning],
  blue: [colors.infoBg, colors.info],
  red: [colors.dangerBg, colors.danger],
  gray: ['#F3F4F6', '#4B5563'],
  navy: [colors.peach, colors.dark]
};
export function Badge({ tone = 'gray', children }: { tone?: BadgeTone; children: string }) {
  const [bg, fg] = badgeTones[tone];
  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <AppText style={{ color: fg, fontFamily: fonts.semibold, fontSize: 11 }}>{children}</AppText>
    </View>
  );
}

/* --------------------------------- Stars --------------------------------- */
export function Stars({ value, size = 16 }: { value: number; size?: number }) {
  const rounded = Math.round(value);
  return (
    <View style={styles.row} accessible accessibilityLabel={`${value.toFixed(1)} / 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} size={size} color={colors.star} fill={i <= rounded ? colors.star : 'transparent'} />
      ))}
    </View>
  );
}

export function StarInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <View style={[styles.row, { gap: 6 }]} accessibilityRole="adjustable" accessibilityValue={{ min: 1, max: 5, now: value }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Pressable key={i} onPress={() => onChange(i)} hitSlop={6} accessibilityRole="button" accessibilityLabel={`${i}`} style={styles.starHit}>
          <Star size={32} color={colors.star} fill={i <= value ? colors.star : 'transparent'} />
        </Pressable>
      ))}
    </View>
  );
}

/* ---------------------------------- Chip --------------------------------- */
export function Chip({ label, selected, onPress, icon, style }: { label: string; selected?: boolean; onPress?: () => void; icon?: ReactNode; style?: StyleProp<ViewStyle> }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: !!selected }}
      style={({ pressed }) => [styles.chip, selected && styles.chipSelected, pressed && { opacity: 0.8 }, style]}>
      {icon}
      <AppText style={{ fontFamily: fonts.medium, fontSize: 13, color: selected ? colors.white : colors.dark }} numberOfLines={1}>
        {label}
      </AppText>
    </Pressable>
  );
}

/* --------------------------------- Avatar -------------------------------- */
export function Avatar({ name, uri, size = 44 }: { name?: string; uri?: string | null; size?: number }) {
  if (uri) return <Image source={{ uri }} style={{ width: size, height: size, borderRadius: size / 2 }} contentFit="cover" accessibilityIgnoresInvertColors />;
  return (
    <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]}>
      <AppText style={{ color: colors.white, fontFamily: fonts.bold, fontSize: size * 0.36 }}>{initials(name)}</AppText>
    </View>
  );
}

/* ------------------------------ Quantity --------------------------------- */
export function QuantityStepper({ value, onChange, min = 1, max, disabled }: { value: number; onChange: (v: number) => void; min?: number; max?: number; disabled?: boolean }) {
  const t = useT('Product');
  const canDec = !disabled && value > min;
  const canInc = !disabled && (max === undefined || value < max);
  return (
    <View style={styles.stepper}>
      <Pressable onPress={() => canDec && onChange(value - 1)} disabled={!canDec} accessibilityRole="button" accessibilityLabel={t('decrease')} style={[styles.stepBtn, !canDec && styles.dim]}>
        <Minus size={16} color={colors.dark} />
      </Pressable>
      <AppText weight="semibold" style={styles.stepValue} accessibilityLiveRegion="polite">
        {value}
      </AppText>
      <Pressable onPress={() => canInc && onChange(value + 1)} disabled={!canInc} accessibilityRole="button" accessibilityLabel={t('increase')} style={[styles.stepBtn, !canInc && styles.dim]}>
        <Plus size={16} color={colors.dark} />
      </Pressable>
    </View>
  );
}

/** `product.colors` holds color names or hex values. */
export function ColorDot({ color, size = 16 }: { color: string; size?: number }) {
  return <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: color, borderWidth: 1, borderColor: 'rgba(0,0,0,0.1)' }} />;
}

/** Chevron that points "forward" in both LTR and RTL. */
export function ForwardChevron({ color = colors.subtle, size = 20 }: { color?: string; size?: number }) {
  return <ChevronRight size={size} color={color} style={{ transform: [{ scaleX: I18nManager.isRTL ? -1 : 1 }] }} />;
}

/* -------------------------------- ListRow -------------------------------- */
export function ListRow({
  icon,
  title,
  subtitle,
  onPress,
  trailing,
  danger,
  style
}: {
  icon?: ReactNode;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  trailing?: ReactNode;
  danger?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <Pressable onPress={onPress} disabled={!onPress} accessibilityRole={onPress ? 'button' : undefined} style={({ pressed }) => [styles.listRow, pressed && { backgroundColor: colors.cream }, style]}>
      {icon && <View style={styles.listIcon}>{icon}</View>}
      <View style={styles.flex}>
        <AppText variant="label" color={danger ? colors.danger : colors.dark}>
          {title}
        </AppText>
        {subtitle && (
          <AppText variant="caption" numberOfLines={2}>
            {subtitle}
          </AppText>
        )}
      </View>
      {trailing ?? (onPress && !danger ? <ForwardChevron /> : null)}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  flex: { flex: 1 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.pill, alignSelf: 'flex-start' },
  starHit: { width: HIT, height: HIT, alignItems: 'center', justifyContent: 'center' },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minHeight: 36,
    paddingHorizontal: 14,
    borderRadius: radius.pill,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: 'rgba(10,46,82,0.12)'
  },
  chipSelected: { backgroundColor: colors.dark, borderColor: colors.dark },
  avatar: { backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  stepper: { flexDirection: 'row', alignItems: 'center', borderRadius: radius.pill, borderWidth: 1, borderColor: 'rgba(10,46,82,0.15)', backgroundColor: colors.white },
  stepBtn: { width: HIT, height: 40, alignItems: 'center', justifyContent: 'center' },
  stepValue: { minWidth: 28, textAlign: 'center' },
  dim: { opacity: 0.35 },
  listRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, minHeight: 56, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm },
  listIcon: { width: 36, height: 36, borderRadius: 12, backgroundColor: colors.cream, alignItems: 'center', justifyContent: 'center' }
});
