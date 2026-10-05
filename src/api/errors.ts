import { clientMessage, localizeServerMessage } from '../i18n/serverMessages';

export type ApiErrorKind = 'network' | 'timeout' | 'validation' | 'unauthorized' | 'forbidden' | 'notFound' | 'rateLimited' | 'server' | 'client';

/** Normalized error thrown by every API call. `message` is always safe to show to users. */
export class ApiError extends Error {
  status: number;
  kind: ApiErrorKind;
  /** Field → message map built from express-validator `errors[]` (keyed by `path`). */
  fieldErrors: Record<string, string>;

  constructor(message: string, status: number, kind: ApiErrorKind, fieldErrors: Record<string, string> = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.kind = kind;
    this.fieldErrors = fieldErrors;
  }
}

export const isApiError = (e: unknown): e is ApiError => e instanceof ApiError;

const kindFor = (status: number): ApiErrorKind => {
  if (status === 401) return 'unauthorized';
  if (status === 403) return 'forbidden';
  if (status === 404) return 'notFound';
  if (status === 422) return 'validation';
  if (status === 429) return 'rateLimited';
  if (status >= 500) return 'server';
  return 'client';
};

/** Server messages worth showing. Internal 5xx details (stack traces, DB errors) are never shown. */
const SAFE_5XX = /^(There is an error in sending email|Card payments are not configured)$/;

/** Builds an ApiError from an HTTP status and the backend's JSON body. */
export function toApiError(status: number, payload: unknown): ApiError {
  const body = (payload && typeof payload === 'object' ? payload : {}) as {
    errors?: Array<{ msg?: string; path?: string; param?: string }>;
    message?: string;
  };

  // express-validator: `{ errors: [{ msg, path }] }` (400)
  if (Array.isArray(body.errors) && body.errors.length) {
    const fieldErrors: Record<string, string> = {};
    for (const err of body.errors) {
      const key = err.path || err.param;
      if (key && !fieldErrors[key] && err.msg) fieldErrors[key] = localizeServerMessage(err.msg);
    }
    return new ApiError(localizeServerMessage(body.errors[0].msg || '') || clientMessage(400), status, 'validation', fieldErrors);
  }

  const kind = kindFor(status);
  const fallback =
    status === 400 || status === 401 || status === 403 || status === 404 || status === 422 || status === 429
      ? clientMessage(status)
      : status >= 500
        ? clientMessage(500)
        : clientMessage('generic');
  const raw = typeof body.message === 'string' ? body.message.trim() : '';
  const showRaw = raw && (status < 500 || SAFE_5XX.test(raw));
  return new ApiError(showRaw ? localizeServerMessage(raw) : fallback, status, kind);
}

/** Human-friendly message for any thrown value. */
export function errorMessage(e: unknown, fallback = clientMessage('generic')): string {
  if (isApiError(e)) return e.message || fallback;
  if (e instanceof Error && e.message) return e.message;
  return fallback;
}

/** 4xx errors won't change on retry (except 429 / 408). */
export function isRetryable(e: unknown): boolean {
  if (!isApiError(e)) return true;
  return e.kind === 'network' || e.kind === 'timeout' || e.kind === 'server' || e.kind === 'rateLimited';
}
