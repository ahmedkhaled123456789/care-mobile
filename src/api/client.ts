import axios, { AxiosError, type AxiosRequestConfig } from 'axios';
import { API_BASE_URL, REQUEST_TIMEOUT_MS } from '../config/env';
import { clientMessage } from '../i18n/serverMessages';
import { getToken } from '../store/session';
import { ApiError, toApiError } from './errors';

export type QueryValue = string | number | boolean | null | undefined;
export type QueryParams = Record<string, QueryValue | QueryValue[]>;

/**
 * Called when an authenticated request is rejected (expired/invalid token,
 * deactivated account, password changed elsewhere). Registered in `auth/session.ts`.
 */
let onUnauthorized: ((message: string) => void) | null = null;
export function setUnauthorizedHandler(fn: ((message: string) => void) | null) {
  onUnauthorized = fn;
}

/**
 * Backend quirk (also handled by the web app): a re-saved populated document can
 * persist an already-prefixed image URL, producing `http://host/x/http://host/x/a.jpeg`.
 * Keep the last real URL.
 */
const NESTED_URL = /^https?:\/\/.+https?:\/\//;
function fixNestedUrls(value: unknown): unknown {
  if (typeof value === 'string') return NESTED_URL.test(value) ? value.slice(value.lastIndexOf('http')) : value;
  if (Array.isArray(value)) return value.map(fixNestedUrls);
  if (value && typeof value === 'object') {
    for (const [k, v] of Object.entries(value)) (value as Record<string, unknown>)[k] = fixNestedUrls(v);
  }
  return value;
}

/** Drops empty values so `?keyword=` etc. are never sent; arrays repeat the key; bracket keys pass through. */
function serializeParams(params: QueryParams): string {
  const parts: string[] = [];
  for (const [key, raw] of Object.entries(params)) {
    for (const v of Array.isArray(raw) ? raw : [raw]) {
      if (v === undefined || v === null || v === '') continue;
      parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(v))}`);
    }
  }
  return parts.join('&');
}

export const http = axios.create({
  baseURL: API_BASE_URL,
  timeout: REQUEST_TIMEOUT_MS,
  headers: { Accept: 'application/json' },
  paramsSerializer: { serialize: (p) => serializeParams(p as QueryParams) }
});

http.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  if (config.data instanceof FormData) {
    // React Native's networking layer adds the multipart boundary itself.
    config.headers['Content-Type'] = 'multipart/form-data';
    config.transformRequest = (data) => data;
  }
  return config;
});

http.interceptors.response.use(
  (res) => {
    res.data = fixNestedUrls(res.data);
    return res;
  },
  (error: AxiosError) => {
    if (axios.isCancel(error)) return Promise.reject(error);
    if (!error.response) {
      const timeout = error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT';
      return Promise.reject(new ApiError(clientMessage(timeout ? 'timeout' : 'network'), 0, timeout ? 'timeout' : 'network'));
    }
    const { status, data } = error.response;
    const apiError = toApiError(status, data);
    const sentToken = !!(error.config?.headers as Record<string, unknown> | undefined)?.Authorization;
    // In NODE_ENV=development the backend returns JWT failures as 500 — match the jsonwebtoken messages too.
    const rawMessage = (data as { message?: unknown } | undefined)?.message;
    const jwtFailure = status === 500 && typeof rawMessage === 'string' && /jwt|invalid signature|invalid token/i.test(rawMessage);
    // A failed login also answers 401 but carries no token — only a rejected token means "session expired".
    if ((status === 401 || jwtFailure) && sentToken && onUnauthorized) onUnauthorized(apiError.message);
    return Promise.reject(apiError);
  }
);

/** Thin typed helpers — every API module goes through these. */
export const api = {
  get: <T>(url: string, params?: QueryParams, config?: AxiosRequestConfig) => http.get<T>(url, { ...config, params }).then((r) => r.data),
  post: <T>(url: string, body?: unknown) => http.post<T>(url, body).then((r) => r.data),
  put: <T>(url: string, body?: unknown) => http.put<T>(url, body).then((r) => r.data),
  delete: <T = null>(url: string) => http.delete<T>(url).then((r) => r.data)
};
