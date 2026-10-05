import { api, type QueryParams } from './client';
import { createCrudService } from './crud';
import type { ItemResponse, ListResponse, Review } from './types';

export interface ReviewInput {
  title?: string;
  ratings: number;
}

/** `/reviews` and the nested `/products/:id/reviews`. Create/update: shoppers; delete: owner, manager, admin. */
export const reviewsApi = {
  ...createCrudService<Review, never, Partial<ReviewInput>>('/reviews'),
  listForProduct: (productId: string, params?: QueryParams, signal?: AbortSignal) =>
    api.get<ListResponse<Review>>(`/products/${productId}/reviews`, params, { signal }),
  createForProduct: (productId: string, body: ReviewInput) => api.post<ItemResponse<Review>>(`/products/${productId}/reviews`, body).then((r) => r.data)
};
