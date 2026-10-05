import { useCallback } from 'react';
import { currentLocale, usePreferences, type Locale } from '../store/preferences';
import { dashAr } from './messages/dash.ar';
import { dashEn } from './messages/dash.en';
import { homeAr, homeEn } from './messages/home';
import { mobileAr, mobileEn } from './messages/mobile';
import { shopAr } from './messages/shop.ar';
import { shopEn } from './messages/shop.en';

/** Same dictionaries as the web app (storefront + dashboard) plus mobile-only strings. */
const messages = {
  en: { ...shopEn, ...dashEn, ...homeEn, ...mobileEn },
  ar: { ...shopAr, ...dashAr, ...homeAr, ...mobileAr }
};

export type Messages = (typeof messages)['en'];
export type TranslateVars = Record<string, string | number>;

/** Dot-path lookup (`'Cart.title'`, `'Dash.orders.paid'`) with `{name}` placeholders. Falls back to the key. */
export function translate(locale: Locale, key: string, vars?: TranslateVars): string {
  let cur: unknown = messages[locale];
  for (const part of key.split('.')) {
    if (cur && typeof cur === 'object' && part in (cur as Record<string, unknown>)) cur = (cur as Record<string, unknown>)[part];
    else return key;
  }
  if (typeof cur !== 'string') return key;
  return vars ? cur.replace(/\{(\w+)\}/g, (m, k: string) => (k in vars ? String(vars[k]) : m)) : cur;
}

/** Translator outside React. */
export const t = (key: string, vars?: TranslateVars) => translate(currentLocale(), key, vars);

/** `const t = useT('Cart'); t('title')` — re-renders when the locale changes. */
export function useT(namespace?: string) {
  const locale = usePreferences((s) => s.locale);
  return useCallback((key: string, vars?: TranslateVars) => translate(locale, namespace ? `${namespace}.${key}` : key, vars), [locale, namespace]);
}

export function useLocale(): Locale {
  return usePreferences((s) => s.locale);
}

export type { Locale };
