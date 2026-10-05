import { useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query';
import { brandsApi, branchesApi, categoriesApi, productsApi, subcategoriesApi } from '../api/catalog';
import type { QueryParams } from '../api/client';
import { isApiError } from '../api/errors';
import type { Product } from '../api/types';

const FIVE_MIN = 5 * 60 * 1000;

/** Public (non-user) keys start with 'public' so they survive logout. */
export const qk = {
  products: (params: QueryParams) => ['public', 'products', params] as const,
  product: (id: string) => ['public', 'product', id] as const,
  productSummary: (id: string) => ['public', 'product-summary', id] as const,
  categories: () => ['public', 'categories', 'all'] as const,
  category: (id: string) => ['public', 'category', id] as const,
  brands: () => ['public', 'brands', 'all'] as const,
  brand: (id: string) => ['public', 'brand', id] as const,
  subcategories: (categoryId?: string) => ['public', 'subcategories', categoryId ?? 'all'] as const,
  branches: (params?: QueryParams) => ['public', 'branches', params ?? {}] as const
};

/** Seeds per-product summaries so cart / wishlist / review rows don't refetch products we already have. */
export function seedProducts(qc: QueryClient, products: Product[]) {
  for (const p of products) if (!qc.getQueryData(qk.productSummary(p._id))) qc.setQueryData(qk.productSummary(p._id), p);
}

export function useProducts(params: QueryParams, enabled = true) {
  const qc = useQueryClient();
  return useQuery({
    queryKey: qk.products(params),
    queryFn: async ({ signal }) => {
      const res = await productsApi.list(params, signal);
      seedProducts(qc, res.data);
      return res;
    },
    staleTime: 60 * 1000,
    enabled
  });
}

export function useProduct(id: string | undefined) {
  const qc = useQueryClient();
  return useQuery<Product>({
    queryKey: qk.product(id ?? ''),
    queryFn: async ({ signal }) => {
      const p = await productsApi.get(id!, signal);
      qc.setQueryData(qk.productSummary(p._id), p);
      return p;
    },
    enabled: !!id,
    // Show the summary from a list/card instantly while the full product loads.
    placeholderData: () => (id ? qc.getQueryData<Product>(qk.productSummary(id)) : undefined)
  });
}

/** Lightweight product info (image / title / price) — served from cache when possible. */
export function useProductSummary(id: string | undefined) {
  return useQuery({
    queryKey: qk.productSummary(id ?? ''),
    queryFn: ({ signal }) => productsApi.get(id!, signal),
    enabled: !!id,
    staleTime: FIVE_MIN,
    retry: (count, err) => !(isApiError(err) && (err.status === 404 || err.status === 400)) && count < 2
  });
}

/** All categories (small collection) — shared by home, filters and forms. */
export function useCategories() {
  return useQuery({
    queryKey: qk.categories(),
    queryFn: ({ signal }) => categoriesApi.list({ limit: 200, sort: 'name' }, signal).then((r) => r.data),
    staleTime: FIVE_MIN
  });
}

export function useBrands() {
  return useQuery({
    queryKey: qk.brands(),
    queryFn: ({ signal }) => brandsApi.list({ limit: 200, sort: 'name' }, signal).then((r) => r.data),
    staleTime: FIVE_MIN
  });
}

/** `Product.brand` is an id — resolve it from the brand list cache, or fetch it. */
export function useBrand(id: string | null | undefined) {
  const brands = useBrands();
  const cached = brands.data?.find((b) => b._id === id);
  const single = useQuery({
    queryKey: qk.brand(id ?? ''),
    queryFn: ({ signal }) => brandsApi.get(id!, signal),
    enabled: !!id && brands.isFetched && !cached,
    staleTime: FIVE_MIN
  });
  return cached ?? single.data ?? null;
}

export function useSubcategories(categoryId?: string) {
  return useQuery({
    queryKey: qk.subcategories(categoryId),
    queryFn: ({ signal }) =>
      (categoryId ? subcategoriesApi.listByCategory(categoryId, { limit: 200 }, signal) : subcategoriesApi.list({ limit: 200 }, signal)).then((r) => r.data),
    staleTime: FIVE_MIN
  });
}

/** Products of a category looked up by its English name (landing sections). */
export function useCategoryProducts(categoryName: string, params: QueryParams = {}) {
  const categories = useCategories();
  const categoryId = categories.data?.find((c) => c.name === categoryName)?._id;
  const query = useProducts({ category: categoryId, limit: 12, sort: '-sold', ...params }, !!categoryId);
  return {
    categoryId,
    products: query.data?.data ?? [],
    isLoading: categories.isLoading || (!!categoryId && query.isLoading)
  };
}

/** Active store branches (main branch first). */
export function useBranches() {
  return useQuery({
    queryKey: qk.branches(),
    queryFn: ({ signal }) => branchesApi.list({ limit: 200, sort: '-isMain,name' }, signal).then((r) => r.data),
    staleTime: FIVE_MIN
  });
}
