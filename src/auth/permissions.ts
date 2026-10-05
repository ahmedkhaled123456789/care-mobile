import type { Role, User } from '../api/types';
import { t } from '../i18n';

type WithRole = Pick<User, 'role'> | null | undefined;

/** Mirrors `authService.allowedTo(...)` on each backend route (same rules as the web app). */
export type Action =
  | 'dashboard:access'
  | 'catalog:write' // products, categories, subcategories, brands, branches
  | 'coupons:write'
  | 'users:write'
  | 'orders:manage' // mark paid / delivered
  | 'reviews:moderate' // delete any review
  | 'resource:delete' // delete products, categories, subcategories, brands, branches, users, coupons
  | 'shop'; // cart, wishlist, addresses, orders, writing reviews

const rules: Record<Action, Role[]> = {
  'dashboard:access': ['admin', 'manager'],
  'catalog:write': ['admin', 'manager'],
  'coupons:write': ['admin', 'manager'],
  'users:write': ['admin', 'manager'],
  'orders:manage': ['admin', 'manager'],
  'reviews:moderate': ['admin', 'manager'],
  'resource:delete': ['admin'],
  shop: ['user']
};

export const can = (user: WithRole, action: Action) => !!user && rules[action].includes(user.role);
export const isStaff = (user: WithRole) => can(user, 'dashboard:access');

/** Throws unless allowed — called inside mutations, not only used to hide buttons. */
export function assertCan(user: WithRole, action: Action) {
  if (!can(user, action)) throw new Error(t('Dash.common.notAllowedRole'));
}

/** Managers manage customers and managers but can't grant or modify admin accounts (web rule). */
export function roleRules(me: WithRole) {
  const isAdmin = me?.role === 'admin';
  return {
    assignable: (isAdmin ? ['user', 'manager', 'admin'] : ['user', 'manager']) as Role[],
    canModify: (target: Pick<User, 'role'>) => isAdmin || target.role !== 'admin'
  };
}
