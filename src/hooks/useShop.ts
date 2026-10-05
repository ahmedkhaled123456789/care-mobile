import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { isApiError } from '../api/errors';
import { addressApi, cartApi, wishlistApi, type AddressInput } from '../api/shop';
import type { Address, CartResponse, Product } from '../api/types';
import { can } from '../auth/permissions';
import { useSession } from '../store/session';
import { seedProducts } from './useCatalog';

export const CART_KEY = ['cart'] as const;
export const WISHLIST_KEY = ['wishlist'] as const;
export const ADDRESS_KEY = ['addresses'] as const;

const useShopperEnabled = () => can(useSession((s) => s.user), 'shop');

/** Cart state + mutations. An empty cart comes back without an `_id`. */
export function useCart() {
  const qc = useQueryClient();
  const enabled = useShopperEnabled();
  const setCart = (res: CartResponse | null) => qc.setQueryData(CART_KEY, res);

  const query = useQuery({
    queryKey: CART_KEY,
    queryFn: async ({ signal }) => {
      try {
        return await cartApi.get(signal);
      } catch (e) {
        if (isApiError(e) && e.status === 404) return null; // older backends answered 404 for "no cart"
        throw e;
      }
    },
    enabled,
    staleTime: 30 * 1000
  });

  const add = useMutation({
    mutationFn: async ({ product, color, quantity = 1 }: { product: Product; color?: string; quantity?: number }) => {
      seedProducts(qc, [product]);
      const sameLine = (i: { product: string; color?: string }) => i.product === product._id && (i.color || undefined) === (color || undefined);
      const before = qc.getQueryData<CartResponse | null>(CART_KEY);
      const prevQty = before?.data.cartItems.find(sameLine)?.quantity ?? 0;
      let res = await cartApi.add(product._id, color);
      // POST adds one unit — set the exact quantity when more were requested.
      if (quantity > 1) {
        const item = res.data.cartItems.find(sameLine);
        if (item) res = await cartApi.updateQuantity(item._id, prevQty + quantity);
      }
      return res;
    },
    onSuccess: setCart
  });

  const update = useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: string; quantity: number }) => cartApi.updateQuantity(itemId, quantity),
    onMutate: async ({ itemId, quantity }) => {
      await qc.cancelQueries({ queryKey: CART_KEY });
      const prev = qc.getQueryData<CartResponse | null>(CART_KEY);
      if (prev) setCart({ ...prev, data: { ...prev.data, cartItems: prev.data.cartItems.map((i) => (i._id === itemId ? { ...i, quantity } : i)) } });
      return { prev };
    },
    onError: (_e, _v, ctx) => ctx && setCart(ctx.prev ?? null),
    onSuccess: setCart
  });

  const remove = useMutation({ mutationFn: (itemId: string) => cartApi.removeItem(itemId), onSuccess: setCart });
  const clear = useMutation({ mutationFn: () => cartApi.clear(), onSuccess: () => setCart(null) });
  const applyCoupon = useMutation({ mutationFn: (code: string) => cartApi.applyCoupon(code), onSuccess: setCart });

  const cart = query.data?.data ?? null;
  const discounted = cart?.totalPriceAfterDiscount != null && cart.totalPriceAfterDiscount !== '' ? Number(cart.totalPriceAfterDiscount) : null;

  return {
    enabled,
    query,
    cart,
    cartId: cart?._id ?? null,
    items: cart?.cartItems ?? [],
    count: query.data?.numOfCartItems ?? 0,
    subtotal: cart?.totalCartPrice ?? 0,
    totalAfterDiscount: discounted,
    total: discounted ?? cart?.totalCartPrice ?? 0,
    appliedCoupon: discounted != null ? cart?.coupon ?? '' : '',
    add,
    update,
    remove,
    clear,
    applyCoupon
  };
}

export function useWishlist() {
  const qc = useQueryClient();
  const enabled = useShopperEnabled();

  const query = useQuery({
    queryKey: WISHLIST_KEY,
    queryFn: async ({ signal }) => {
      const list = await wishlistApi.get(signal);
      seedProducts(qc, list);
      return list;
    },
    enabled,
    staleTime: 60 * 1000
  });

  /** POST/DELETE return only ids — reconcile the optimistic list with them. */
  const reconcile = (ids: string[]) => {
    const list = qc.getQueryData<Product[]>(WISHLIST_KEY) ?? [];
    const idSet = new Set(ids.map(String));
    const next = list.filter((p) => idSet.has(p._id));
    qc.setQueryData(WISHLIST_KEY, next);
    if (next.length !== idSet.size) void qc.invalidateQueries({ queryKey: WISHLIST_KEY });
  };

  const toggle = useMutation({
    mutationFn: ({ product, inList }: { product: Product; inList: boolean }) => (inList ? wishlistApi.remove(product._id) : wishlistApi.add(product._id)),
    onMutate: async ({ product, inList }) => {
      await qc.cancelQueries({ queryKey: WISHLIST_KEY });
      const prev = qc.getQueryData<Product[]>(WISHLIST_KEY);
      const list = prev ?? [];
      qc.setQueryData(WISHLIST_KEY, inList ? list.filter((p) => p._id !== product._id) : [product, ...list]);
      return { prev };
    },
    onError: (_e, _v, ctx) => qc.setQueryData(WISHLIST_KEY, ctx?.prev),
    onSuccess: reconcile
  });

  const items = query.data ?? [];
  const ids = new Set(items.map((p) => p._id));
  return { enabled, query, items, has: (id: string) => ids.has(id), toggle };
}

export function useAddresses() {
  const qc = useQueryClient();
  const enabled = useShopperEnabled();
  const set = (list: Address[]) => qc.setQueryData(ADDRESS_KEY, list);
  const query = useQuery({ queryKey: ADDRESS_KEY, queryFn: ({ signal }) => addressApi.list(signal), enabled });
  const add = useMutation({ mutationFn: (a: AddressInput) => addressApi.add(a), onSuccess: set });
  const remove = useMutation({ mutationFn: (id: string) => addressApi.remove(id), onSuccess: set });
  /** No update endpoint: create the new address first (nothing is lost if it fails), then delete the old one. */
  const replace = useMutation({
    mutationFn: async ({ id, address }: { id: string; address: AddressInput }) => {
      await addressApi.add(address);
      return addressApi.remove(id);
    },
    onSuccess: set,
    onError: () => qc.invalidateQueries({ queryKey: ADDRESS_KEY })
  });
  return { query, list: query.data ?? [], add, remove, replace };
}
