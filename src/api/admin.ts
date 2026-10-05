import { api } from './client';
import { createCrudService } from './crud';
import type { Coupon, ItemResponse, User } from './types';

/** `/users` (admin, manager). Create/update are multipart (optional `profileImg`). Delete: admin. */
export const usersApi = {
  ...createCrudService<User, FormData>('/users'),
  /** The backend requires the target user's current password for this operation. */
  changePassword: (id: string, body: { currentPassword: string; password: string; passwordConfirm: string }) =>
    api.put<ItemResponse<User>>(`/users/changeMyPassword/${id}`, body).then((r) => r.data)
};

export interface CouponInput {
  name: string;
  /** ISO 8601 date. */
  expire: string;
  discount: number;
}
/** `/coupon` (singular) — admin, manager. Delete: admin. */
export const couponsApi = createCrudService<Coupon, CouponInput, Partial<CouponInput>>('/coupon');
