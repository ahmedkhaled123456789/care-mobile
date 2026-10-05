import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X } from 'lucide-react-native';
import { useT } from '../../i18n';
import { colors, radius, spacing } from '../../theme';
import { AppText } from './AppText';
import { IconButton } from './Button';

/**
 * Slide-up sheet (filters, sort, pickers, short forms). Built on the core Modal so it
 * needs no extra native dependency; tapping the backdrop or Android back closes it.
 */
export function BottomSheet({
  visible,
  onClose,
  title,
  children,
  footer,
  dismissible = true
}: {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
  dismissible?: boolean;
}) {
  const insets = useSafeAreaInsets();
  const t = useT('Common');
  const close = () => dismissible && onClose();
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={close} statusBarTranslucent>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Pressable style={styles.backdrop} onPress={close} accessibilityLabel={t('close')} accessibilityRole="button" />
        <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, spacing.lg) }]} accessibilityViewIsModal>
          <View style={styles.handle} />
          {title && (
            <View style={styles.header}>
              <AppText variant="title" style={styles.flex}>
                {title}
              </AppText>
              {dismissible && <IconButton icon={<X size={18} color={colors.dark} />} label={t('close')} onPress={onClose} tone="plain" style={styles.closeBtn} />}
            </View>
          )}
          <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent} keyboardShouldPersistTaps="handled">
            {children}
          </ScrollView>
          {footer && <View style={styles.footer}>{footer}</View>}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  backdrop: { ...StyleSheet.absoluteFill, backgroundColor: colors.overlay },
  sheet: { position: 'absolute', left: 0, right: 0, bottom: 0, maxHeight: '88%', backgroundColor: colors.white, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl },
  handle: { alignSelf: 'center', width: 40, height: 5, borderRadius: 3, backgroundColor: 'rgba(10,46,82,0.15)', marginTop: 8 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.sm },
  closeBtn: { backgroundColor: colors.cream },
  body: { flexGrow: 0 },
  bodyContent: { paddingHorizontal: spacing.lg, paddingBottom: spacing.lg, gap: spacing.md },
  footer: { flexDirection: 'row', gap: spacing.md, paddingHorizontal: spacing.lg, paddingTop: spacing.md, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border }
});
