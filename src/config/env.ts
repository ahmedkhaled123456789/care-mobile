/**
 * Runtime configuration from `EXPO_PUBLIC_*` variables (see `.env.example`).
 * Expo inlines these at build time, so they must be read with static property access.
 */
const rawOrigin = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';

/** Backend server origin (no trailing slash, without `/api/v1`). Uploaded files are served from here. */
export const API_ORIGIN = rawOrigin.replace(/\/+$/, '');
export const API_BASE_URL = `${API_ORIGIN}/api/v1`;
export const CURRENCY = process.env.EXPO_PUBLIC_CURRENCY || 'AED';
/** Card (Stripe Checkout) payments — off until the backend has STRIPE_SECRET configured. */
export const STRIPE_ENABLED = process.env.EXPO_PUBLIC_ENABLE_STRIPE === 'true';
export const BRAND_EMAIL = 'royalcareuae@hotmail.com';
export const REQUEST_TIMEOUT_MS = 20000;
