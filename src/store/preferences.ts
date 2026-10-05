import AsyncStorage from '@react-native-async-storage/async-storage';
import { getLocales } from 'expo-localization';
import { I18nManager } from 'react-native';
import { create } from 'zustand';

export type Locale = 'en' | 'ar';
const LOCALE_KEY = 'rc.locale';

interface PreferencesState {
  locale: Locale;
  hydrated: boolean;
  hydrate: () => Promise<void>;
  /** Returns true when the layout direction changed and the app must be restarted to apply it. */
  setLocale: (locale: Locale) => Promise<boolean>;
}

const deviceLocale = (): Locale => {
  try {
    return getLocales()[0]?.languageCode === 'ar' ? 'ar' : 'en';
  } catch {
    return 'en';
  }
};

/** Aligns React Native's layout direction with the locale; returns whether it had to change. */
function applyDirection(locale: Locale): boolean {
  const rtl = locale === 'ar';
  I18nManager.allowRTL(rtl);
  if (I18nManager.isRTL === rtl) return false;
  I18nManager.forceRTL(rtl);
  return true;
}

/** Non-sensitive user preferences (AsyncStorage). Tokens never live here — see `session.ts`. */
export const usePreferences = create<PreferencesState>((set) => ({
  locale: 'en',
  hydrated: false,
  hydrate: async () => {
    let locale = deviceLocale();
    try {
      const stored = await AsyncStorage.getItem(LOCALE_KEY);
      if (stored === 'en' || stored === 'ar') locale = stored;
    } catch {
      /* storage unavailable — fall back to the device language */
    }
    applyDirection(locale);
    set({ locale, hydrated: true });
  },
  setLocale: async (locale) => {
    set({ locale });
    try {
      await AsyncStorage.setItem(LOCALE_KEY, locale);
    } catch {
      /* the choice still applies for this session */
    }
    return applyDirection(locale);
  }
}));

/** Read outside React (API client, server message translation). */
export const currentLocale = () => usePreferences.getState().locale;
