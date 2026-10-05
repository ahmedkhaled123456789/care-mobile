import { useCallback, useMemo, useState } from 'react';
import { useInfiniteQuery, type QueryKey } from '@tanstack/react-query';
import type { QueryParams } from '../api/client';
import type { ListResponse } from '../api/types';

/**
 * Infinite scrolling over the backend's paginated lists (`pagination.next`).
 * Returns flattened rows plus the props a FlatList needs (pull-to-refresh, onEndReached).
 */
export function useInfiniteList<T>(
  key: QueryKey,
  fetchPage: (params: QueryParams, signal: AbortSignal) => Promise<ListResponse<T>>,
  params: QueryParams,
  opts: { limit?: number; enabled?: boolean; onPage?: (rows: T[]) => void } = {}
) {
  const limit = opts.limit ?? 20;
  const query = useInfiniteQuery({
    queryKey: [...key, params],
    queryFn: async ({ pageParam, signal }) => {
      const res = await fetchPage({ ...params, page: pageParam, limit }, signal);
      opts.onPage?.(res.data);
      return res;
    },
    initialPageParam: 1,
    getNextPageParam: (last) => last.pagination?.next ?? undefined,
    enabled: opts.enabled ?? true
  });

  const rows = useMemo(() => query.data?.pages.flatMap((p) => p.data) ?? [], [query.data]);
  const total = query.data?.pages[0]?.pagination?.totalResults;

  // Only show the pull-to-refresh spinner for user-initiated refreshes, not background refetches.
  const [refreshing, setRefreshing] = useState(false);
  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await query.refetch();
    } finally {
      setRefreshing(false);
    }
  }, [query]);

  const loadMore = useCallback(() => {
    if (query.hasNextPage && !query.isFetchingNextPage) void query.fetchNextPage();
  }, [query]);

  return { query, rows, total, refreshing, refresh, loadMore };
}

/** Same manual-refresh pattern for a single query. */
export function useManualRefresh(refetch: () => Promise<unknown>) {
  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);
  return { refreshing, onRefresh };
}
