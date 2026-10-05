import { api } from './client';
import type { Address, CartResponse, Product } from './types';

/** Shopper-only (`role: user`) endpoints. */
export const wishlistApi = {
  get: (signal?: AbortSignal) => api.get<{ data: Product[] }>('/wishlist', undefined, { signal }).then((r) => r.data),
  /** POST/DELETE answer with the id list, not the products. */
  add: (productId: string) => api.post<{ data: string[] }>('/wishlist', { productId }).then((r) => r.data),
  remove: (productId: string) => api.delete<{ data: string[] }>(`/wishlist/${productId}`).then((r) => r!.data)
};

export type AddressInput = Omit<Address, '_id'>;

/** No update endpoint exists — editing is "add new, then delete old" (same as the web app). */
export const addressApi = {
  list: (signal?: AbortSignal) => api.get<{ data: Address[] }>('/address', undefined, { signal }).then((r) => r.data),
  add: (body: AddressInput) => api.post<{ data: Address[] }>('/address', body).then((r) => r.data),
  remove: (addressId: string) => api.delete<{ data: Address[] }>(`/address/${addressId}`).then((r) => r!.data)
};

export const cartApi = {
  get: (signal?: AbortSignal) => api.get<CartResponse>('/cart', undefined, { signal }),
  /** Adds ONE unit (merged with an existing line of the same product + color). */
  add: (productId: string, color?: string) => api.post<CartResponse>('/cart', color ? { productId, color } : { productId }),
  updateQuantity: (itemId: string, quantity: number) => api.put<CartResponse>(`/cart/${itemId}`, { quantity }),
  removeItem: (itemId: string) => api.delete<CartResponse>(`/cart/${itemId}`),
  clear: () => api.delete('/cart'),
  applyCoupon: (coupon: string) => api.put<CartResponse>('/cart/applyCoupon', { coupon })
};
