import { api, type QueryParams } from './client';
import { createCrudService } from './crud';
import type { Branch, Brand, Category, ListResponse, Product, SubCategory } from './types';

/** Multipart (`name`, `nameAr`, optional `image`) — the image can be left out on update. */
export const categoriesApi = createCrudService<Category, FormData>('/categories');

/** Multipart (`name`, `nameAr`, optional `image`). */
export const brandsApi = createCrudService<Brand, FormData>('/brands');

export interface SubcategoryInput {
  name: string;
  nameAr?: string;
  category: string;
}
export const subcategoriesApi = {
  ...createCrudService<SubCategory, SubcategoryInput, Partial<SubcategoryInput>>('/subcategories'),
  /** Note: the nested route is singular `subcategory`. */
  listByCategory: (categoryId: string, params?: QueryParams, signal?: AbortSignal) =>
    api.get<ListResponse<SubCategory>>(`/categories/${categoryId}/subcategory`, params, { signal })
};

/**
 * Multipart. `imageCover` (file) + `images` (files) are optional on update; the kept
 * gallery URLs are sent as a JSON `images` field. List fields are JSON strings.
 */
export const productsApi = createCrudService<Product, FormData>('/products');

/** Store locations. `all: true` (staff) includes hidden branches. */
export type BranchInput = Omit<Branch, '_id' | 'createdAt' | 'updatedAt'>;
export const branchesApi = createCrudService<Branch, BranchInput, Partial<BranchInput>>('/branches');

