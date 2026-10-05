import { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AlertCircle, CheckCircle2, Info, WifiOff } from 'lucide-react-native';
import { t, useT } from '../../i18n';
import { useToastStore, type ToastTone } from '../../store/toast';
import { colors, fonts, radius, spacing } from '../../theme';
import { AppText } from './AppText';

const toneStyle: Record<ToastTone, { bg: string; Icon: typeof Info }> = {
  success: { bg: colors.success, Icon: CheckCircle2 },
  error: { bg: colors.danger, Icon: AlertCircle },
  info: { bg: colors.dark, Icon: Info }
};

/** Renders queued toasts above the tab bar. Mounted once at the root. */
export function ToastHost() {
  const items = useToastStore((s) => s.items);
  const dismiss = useToastStore((s) => s.dismiss);
  const insets = useSafeAreaInsets();
  if (!items.length) return null;
  return (
    <View pointerEvents="box-none" style={[styles.host, { bottom: insets.bottom + 72 }]}>
      {items.map((item) => {
        const { bg, Icon } = toneStyle[item.tone];
        return (
          <Pressable key={item.id} onPress={() => dismiss(item.id)} accessibilityLiveRegion="polite" accessibilityRole="alert" style={[styles.toast, { backgroundColor: bg }]}>
            <Icon size={18} color={colors.white} />
            <AppText style={styles.toastText}>{item.message}</AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

/** Thin banner while the device has no connection; cached queries keep rendering underneath. */
export function OfflineBanner() {
  const tMobile = useT('Mobile');
  const insets = useSafeAreaInsets();
  const [offline, setOffline] = useState(false);
  useEffect(() => NetInfo.addEventListener((s) => setOffline(s.isConnected === false || s.isInternetReachable === false)), []);
  if (!offline) return null;
  return (
    <View pointerEvents="none" style={[styles.offline, { top: insets.top }]} accessibilityRole="alert">
      <WifiOff size={14} color={colors.white} />
      <AppText style={styles.offlineText}>{tMobile('offline')}</AppText>
    </View>
  );
}

/** Native confirmation dialog. Resolves true when the user confirms. */
export function confirm({ title, message, confirmLabel, destructive = true }: { title: string; message?: string; confirmLabel?: string; destructive?: boolean }) {
  return new Promise<boolean>((resolve) => {
    Alert.alert(
      title,
      message,
      [
        { text: t('Common.cancel'), style: 'cancel', onPress: () => resolve(false) },
        { text: confirmLabel ?? t('Common.confirm'), style: destructive ? 'destructive' : 'default', onPress: () => resolve(true) }
      ],
      { cancelable: true, onDismiss: () => resolve(false) }
    );
  });
}

const styles = StyleSheet.create({
  host: { position: 'absolute', left: spacing.lg, right: spacing.lg, gap: spacing.sm, zIndex: 1000 },
  toast: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingHorizontal: spacing.lg, paddingVertical: 14, borderRadius: radius.lg, elevation: 6 },
  toastText: { flex: 1, color: colors.white, fontFamily: fonts.medium, fontSize: 14 },
  offline: { position: 'absolute', left: 0, right: 0, zIndex: 999, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 6, backgroundColor: colors.dark },
  offlineText: { color: colors.white, fontSize: 12, fontFamily: fonts.medium }
});
