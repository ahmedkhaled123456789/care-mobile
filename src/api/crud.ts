import { api, type QueryParams } from './client';
import type { ItemResponse, ListResponse } from './types';

/** Reusable CRUD service for a REST collection built on the backend's `handlersFactory`. */
export function createCrudService<T, TCreate = unknown, TUpdate = TCreate>(path: string) {
  return {
    list: (params?: QueryParams, signal?: AbortSignal) => api.get<ListResponse<T>>(path, params, { signal }),
    get: (id: string, signal?: AbortSignal) => api.get<ItemResponse<T>>(`${path}/${id}`, undefined, { signal }).then((r) => r.data),
    create: (body: TCreate) => api.post<ItemResponse<T>>(path, body).then((r) => r.data),
    update: (id: string, body: TUpdate) => api.put<ItemResponse<T>>(`${path}/${id}`, body).then((r) => r.data),
    remove: (id: string) => api.delete(`${path}/${id}`)
  };
}
