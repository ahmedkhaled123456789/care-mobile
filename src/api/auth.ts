import { api } from './client';
import type { AuthResponse, ItemResponse, User } from './types';

export interface SignupInput {
  name: string;
  email: string;
  password: string;
  passwordConfirm: string;
}

/** `/api/v1/auth` — public. */
export const authApi = {
  login: (body: { email: string; password: string }) => api.post<AuthResponse>('/auth/login', body),
  signup: (body: SignupInput) => api.post<AuthResponse>('/auth/signup', body),
  forgotPassword: (email: string) => api.post<{ status: string; message: string }>('/auth/forgotPassword', { email }),
  verifyResetCode: (resetCode: string) => api.post<{ status: string }>('/auth/verifyResetCode', { resetCode }),
  /** Returns only a token — the profile is loaded with `getMe` afterwards. */
  resetPassword: (email: string, newPassword: string) => api.put<{ token: string }>('/auth/resetPassword', { email, newPassword })
};

/** `/api/v1/users/*Me` — the logged-in user (any role). */
export const profileApi = {
  getMe: (signal?: AbortSignal) => api.get<ItemResponse<User>>('/users/getMe', undefined, { signal }).then((r) => r.data),
  updateMe: (body: { name?: string; phone?: string; email?: string }) => api.put<ItemResponse<User>>('/users/updateMe', body).then((r) => r.data),
  /** Invalidates the old token — the response carries a new one. */
  changeMyPassword: (password: string) => api.put<AuthResponse>('/users/changeMyPassword', { password }),
  deactivate: () => api.delete('/users/deleteMe')
};
