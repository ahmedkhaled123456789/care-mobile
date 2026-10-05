import { StyleSheet, Text, type TextProps } from 'react-native';
import { colors, fonts } from '../../theme';

type Variant = 'display' | 'title' | 'heading' | 'body' | 'label' | 'caption' | 'overline';

const variants = StyleSheet.create({
  display: { fontFamily: fonts.serif, fontSize: 30, lineHeight: 38, color: colors.dark },
  title: { fontFamily: fonts.serif, fontSize: 24, lineHeight: 31, color: colors.dark },
  heading: { fontFamily: fonts.semibold, fontSize: 17, lineHeight: 24, color: colors.dark },
  body: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 22, color: colors.text },
  label: { fontFamily: fonts.medium, fontSize: 14, lineHeight: 20, color: colors.dark },
  caption: { fontFamily: fonts.regular, fontSize: 12, lineHeight: 17, color: colors.muted },
  overline: { fontFamily: fonts.semibold, fontSize: 11, lineHeight: 15, letterSpacing: 1, textTransform: 'uppercase', color: colors.primary }
});

export interface AppTextProps extends TextProps {
  variant?: Variant;
  color?: string;
  weight?: keyof typeof fonts;
  center?: boolean;
}

/** All text goes through here so fonts, colors and RTL alignment stay consistent. */
export function AppText({ variant = 'body', color, weight, center, style, ...props }: AppTextProps) {
  return (
    <Text
      {...props}
      maxFontSizeMultiplier={1.6}
      style={[variants[variant], { textAlign: center ? 'center' : 'left' }, color ? { color } : null, weight ? { fontFamily: fonts[weight] } : null, style]}
    />
  );
}
