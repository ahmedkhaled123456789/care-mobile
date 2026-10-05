import type { LocalizedText, Product } from '../api/types';
import type { Locale } from '../store/preferences';

/** Picks the Arabic value in Arabic mode, falling back to English (and vice versa). */
export function pick(en: string | undefined | null, ar: string | undefined | null, locale: Locale): string {
  return (locale === 'ar' ? ar || en : en || ar) ?? '';
}

export const text = (value: LocalizedText | null | undefined, locale: Locale) => (value ? pick(value.en, value.ar, locale) : '');

/** Localized name for categories, brands, subcategories, branches. */
export const nameOf = (entity: { name?: string; nameAr?: string } | null | undefined, locale: Locale) =>
  entity ? pick(entity.name, entity.nameAr, locale) : '';

export const productTitle = (p: Pick<Product, 'title' | 'titleAr'> | null | undefined, locale: Locale) => (p ? pick(p.title, p.titleAr, locale) : '');

export const productDescription = (p: Pick<Product, 'description' | 'descriptionAr'>, locale: Locale) => pick(p.description, p.descriptionAr, locale);

/** First sentence of the description — used on teasers. */
export function productTeaser(p: Pick<Product, 'description' | 'descriptionAr'>, locale: Locale): string {
  const d = productDescription(p, locale);
  const m = d.match(/^.+?[.!؟?](\s|$)/);
  return (m ? m[0] : d).trim();
}

/** `[{en, ar}]` ⇄ one "English | عربي" pair per line (product form, same format as the web dashboard). */
export const toLines = (list?: LocalizedText[]) => (list ?? []).map((x) => [x.en, x.ar].filter(Boolean).join(' | ')).join('\n');
export const fromLines = (value: string): LocalizedText[] =>
  value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [en, ...rest] = line.split('|');
      const ar = rest.join('|').trim();
      return { en: en.trim(), ...(ar ? { ar } : {}) };
    });
