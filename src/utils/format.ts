import type { Product, User } from '../api/types';
import { API_ORIGIN, CURRENCY } from '../config/env';
import type { Locale } from '../store/preferences';

export function formatPrice(value: number | string | undefined | null, locale: Locale = 'en'): string {
  const n = Number(value ?? 0);
  const safe = Number.isFinite(n) ? n : 0;
  try {
    return new Intl.NumberFormat(locale === 'ar' ? 'ar-AE' : 'en-AE', { style: 'currency', currency: CURRENCY, maximumFractionDigits: 2 }).format(safe);
  } catch {
    return `${safe.toFixed(2)} ${CURRENCY}`;
  }
}

export function formatDate(value: string | number | Date | null | undefined, locale: Locale = 'en', withTime = false): string {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  try {
    return new Intl.DateTimeFormat(locale === 'ar' ? 'ar-EG' : 'en-GB', { dateStyle: 'medium', ...(withTime ? { timeStyle: 'short' } : {}) }).format(d);
  } catch {
    return d.toLocaleDateString();
  }
}

/** The price a customer actually pays (same rule as the backend's cart `unitPrice`). */
export function effectivePrice(p: Pick<Product, 'price' | 'priceAfterDiscount'>): number {
  return p.priceAfterDiscount && p.priceAfterDiscount < p.price ? p.priceAfterDiscount : p.price;
}

export function discountPercent(p: Pick<Product, 'price' | 'priceAfterDiscount'>): number {
  if (!p.priceAfterDiscount || p.priceAfterDiscount >= p.price) return 0;
  return Math.round((1 - p.priceAfterDiscount / p.price) * 100);
}

/** `profileImg` is stored as a bare file name served from `${ORIGIN}/users/<file>`. */
export function userImageUrl(user?: Pick<User, 'profileImg'> | null): string | null {
  const img = user?.profileImg;
  if (!img) return null;
  return /^https?:\/\//.test(img) ? img : `${API_ORIGIN}/users/${img}`;
}

export function initials(name?: string): string {
  if (!name) return '?';
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]!.toUpperCase())
    .join('');
}

export const shortId = (id: string) => `#${id.slice(-6).toUpperCase()}`;

/** Compact number for chart axes / stat tiles. */
export const compact = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k` : String(Math.round(n)));
