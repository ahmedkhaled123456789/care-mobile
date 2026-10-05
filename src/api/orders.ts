import { api, type QueryParams } from './client';
import type { ItemResponse, ListResponse, Order, ShippingAddress } from './types';

interface CheckoutSessionResponse {
  status: string;
  session: { url?: string; id?: string };
}

/** Shoppers see only their own orders (filtered server-side); staff see all. */
export const ordersApi = {
  list: (params?: QueryParams, signal?: AbortSignal) => api.get<ListResponse<Order>>('/orders', params, { signal }),
  get: (id: string, signal?: AbortSignal) => api.get<ItemResponse<Order>>(`/orders/${id}`, undefined, { signal }).then((r) => r.data),
  /** Creates a cash order; the server clears the cart and updates stock. */
  createCash: (cartId: string, shippingAddress: ShippingAddress) =>
    api.post<{ status: string; data: Order }>(`/orders/${cartId}`, { shippingAddress }).then((r) => r.data),
  /** Stripe Checkout session; the order itself is created by the backend webhook after payment. */
  checkoutSession: (cartId: string, shippingAddress: ShippingAddress) =>
    api.post<CheckoutSessionResponse>(`/orders/checkout-session/${cartId}`, { shippingAddress }).then((r) => r.session),
  markPaid: (id: string) => api.put<{ data: Order }>(`/orders/${id}/pay`).then((r) => r.data),
  markDelivered: (id: string) => api.put<{ data: Order }>(`/orders/${id}/deliver`).then((r) => r.data)
};
