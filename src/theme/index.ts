import { Platform, StyleSheet } from 'react-native';

/** Brand palette — same tokens as the web app's tailwind `brand.*` colors. */
export const colors = {
  primary: '#70A426', // logo green (web: brand.gold)
  secondary: '#125697', // logo blue (web: brand.goldLight)
  dark: '#0A2E52', // headings, dark surfaces
  pink: '#E8F3D6',
  pinkDark: '#C5DC95',
  peach: '#D9E5F2',
  peachDark: '#95B4D8',
  cream: '#F4F8EC',
  beige: '#EEF3F8',
  white: '#FFFFFF',
  text: '#1F2937',
  muted: '#6B7280',
  subtle: '#9CA3AF',
  border: 'rgba(10,46,82,0.10)',
  danger: '#DC2626',
  dangerBg: '#FEF2F2',
  success: '#047857',
  successBg: '#ECFDF5',
  warning: '#B45309',
  warningBg: '#FFFBEB',
  info: '#1D4ED8',
  infoBg: '#EFF6FF',
  sale: '#F43F5E',
  star: '#FBBF24',
  overlay: 'rgba(10,46,82,0.45)'
} as const;

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;
export const radius = { sm: 8, md: 12, lg: 16, xl: 24, pill: 999 } as const;

/** Loaded in App.tsx — Playfair Display for headings and Inter for body text, as on the web. */
export const fonts = {
  serif: 'PlayfairDisplay_700Bold',
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold'
} as const;

export const shadow = StyleSheet.create({
  card: Platform.select({
    ios: { shadowColor: colors.dark, shadowOpacity: 0.06, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } },
    default: { elevation: 2 }
  })!
}).card;

/** Minimum touch target recommended by both platforms. */
export const HIT = 44;
