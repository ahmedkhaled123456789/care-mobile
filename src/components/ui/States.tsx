import { useEffect, useRef, type ReactNode } from 'react';
import { ActivityIndicator, Animated, StyleSheet, View, type DimensionValue, type StyleProp, type ViewStyle } from 'react-native';
import { CloudOff, ServerCrash } from 'lucide-react-native';
import { errorMessage, isApiError } from '../../api/errors';
import { useT } from '../../i18n';
import { colors, radius, spacing } from '../../theme';
import { AppText } from './AppText';
import { Button } from './Button';

export function LoadingView({ style }: { style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[styles.center, style]} accessibilityRole="progressbar">
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
}

export function EmptyState({ icon, title, description, action, style }: { icon?: ReactNode; title: string; description?: string; action?: ReactNode; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[styles.empty, style]}>
      {icon && <View style={styles.iconCircle}>{icon}</View>}
      <AppText variant="heading" center>
        {title}
      </AppText>
      {description && (
        <AppText variant="body" color={colors.muted} center>
          {description}
        </AppText>
      )}
      {action && <View style={styles.action}>{action}</View>}
    </View>
  );
}

/** User-friendly error with retry. Raw server errors are never shown (see `errors.ts`). */
export function ErrorState({ error, onRetry, style }: { error: unknown; onRetry?: () => void; style?: StyleProp<ViewStyle> }) {
  const t = useT();
  const offline = isApiError(error) && (error.kind === 'network' || error.kind === 'timeout');
  return (
    <EmptyState
      style={style}
      icon={offline ? <CloudOff size={28} color={colors.secondary} /> : <ServerCrash size={28} color={colors.danger} />}
      title={offline ? t('Mobile.unreachableTitle') : t('Ui.errorTitle')}
      description={errorMessage(error)}
      action={onRetry && <Button title={t('Ui.retry')} variant="secondary" onPress={onRetry} />}
    />
  );
}

/** Pulsing placeholder block. */
export function Skeleton({ width = '100%', height = 16, rounded = radius.md, style }: { width?: DimensionValue; height?: DimensionValue; rounded?: number; style?: StyleProp<ViewStyle> }) {
  const opacity = useRef(new Animated.Value(0.5)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }), Animated.timing(opacity, { toValue: 0.5, duration: 700, useNativeDriver: true })])
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);
  return <Animated.View accessibilityElementsHidden style={[{ width, height, borderRadius: rounded, backgroundColor: 'rgba(10,46,82,0.08)', opacity }, style]} />;
}

/** Footer spinner for infinite lists. */
export function ListFooter({ loading }: { loading: boolean }) {
  return <View style={styles.footer}>{loading && <ActivityIndicator color={colors.primary} />}</View>;
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  empty: { alignItems: 'center', justifyContent: 'center', padding: spacing.xl, gap: spacing.sm },
  iconCircle: { width: 64, height: 64, borderRadius: 32, backgroundColor: colors.pink, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.sm },
  action: { marginTop: spacing.md },
  footer: { height: 56, alignItems: 'center', justifyContent: 'center' }
});
