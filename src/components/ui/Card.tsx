import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { colors, radius, shadow, spacing } from '../../theme';
import { AppText } from './AppText';

export function Card({ children, style, onPress, padded = true }: { children: ReactNode; style?: StyleProp<ViewStyle>; onPress?: () => void; padded?: boolean }) {
  const content = [styles.card, padded && styles.padded, style];
  if (!onPress) return <View style={content}>{children}</View>;
  return (
    <Pressable onPress={onPress} accessibilityRole="button" style={({ pressed }) => [content, pressed && { opacity: 0.85 }]}>
      {children}
    </Pressable>
  );
}

/** Card with a heading row and an optional trailing action. */
export function Section({ title, action, children, style }: { title: string; action?: ReactNode; children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return (
    <Card style={style}>
      <View style={styles.header}>
        <AppText variant="heading" style={styles.flex}>
          {title}
        </AppText>
        {action}
      </View>
      {children}
    </Card>
  );
}

/** Label / value row used in summaries (totals, order info). */
export function InfoRow({ label, value, strong, tone }: { label: string; value: ReactNode; strong?: boolean; tone?: string }) {
  return (
    <View style={styles.row}>
      <AppText variant={strong ? 'heading' : 'body'} color={tone ?? (strong ? colors.dark : colors.muted)} style={styles.flex}>
        {label}
      </AppText>
      {typeof value === 'string' ? (
        <AppText variant={strong ? 'heading' : 'body'} color={tone ?? colors.dark} weight={strong ? 'bold' : 'semibold'}>
          {value}
        </AppText>
      ) : (
        value
      )}
    </View>
  );
}

export const Divider = () => <View style={styles.divider} />;

const styles = StyleSheet.create({
  card: { backgroundColor: colors.white, borderRadius: radius.xl, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.border, ...shadow },
  padded: { padding: spacing.lg, gap: spacing.md },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  flex: { flex: 1 },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: 2 },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: colors.border, marginVertical: spacing.xs }
});
