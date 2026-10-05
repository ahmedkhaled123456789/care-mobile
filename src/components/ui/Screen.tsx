import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, RefreshControl, ScrollView, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';
import { colors, spacing } from '../../theme';

interface ScreenProps {
  children: ReactNode;
  /** Wrap in a ScrollView (forms, details). Lists should pass `scroll={false}` and use FlatList. */
  scroll?: boolean;
  /** Safe-area edges to pad. Stack screens with a native header only need the bottom. */
  edges?: Edge[];
  /** Pull-to-refresh for scrolling screens. */
  refreshing?: boolean;
  onRefresh?: () => void;
  contentStyle?: StyleProp<ViewStyle>;
  /** Sticky content below the scroll area (checkout buttons, add-to-cart bar). */
  footer?: ReactNode;
  background?: string;
}

/** Safe-area aware, keyboard-aware screen container. */
export function Screen({ children, scroll = true, edges = ['bottom'], refreshing, onRefresh, contentStyle, footer, background = colors.cream }: ScreenProps) {
  const body = scroll ? (
    <ScrollView
      contentContainerStyle={[styles.content, contentStyle]}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="interactive"
      showsVerticalScrollIndicator={false}
      refreshControl={onRefresh ? <RefreshControl refreshing={!!refreshing} onRefresh={onRefresh} tintColor={colors.primary} colors={[colors.primary]} /> : undefined}>
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.flex, contentStyle]}>{children}</View>
  );

  return (
    <SafeAreaView edges={edges} style={[styles.flex, { backgroundColor: background }]}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}>
        {body}
        {footer && <View style={styles.footer}>{footer}</View>}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: spacing.lg, gap: spacing.lg, paddingBottom: spacing.xxl },
  footer: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.md, backgroundColor: colors.white, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border }
});
