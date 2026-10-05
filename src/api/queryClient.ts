import NetInfo from '@react-native-community/netinfo';
import { focusManager, onlineManager, QueryClient } from '@tanstack/react-query';
import { AppState, Platform } from 'react-native';
import { isApiError, isRetryable } from './errors';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000,
      gcTime: 30 * 60 * 1000,
      // Client errors (400/401/403/404) won't change on retry; network, 5xx and 429 may.
      retry: (count, err) => isRetryable(err) && count < 2,
      retryDelay: (attempt, err) => (isApiError(err) && err.kind === 'rateLimited' ? 5000 : Math.min(1000 * 2 ** attempt, 8000))
    },
    mutations: { retry: false }
  }
});

/** Query keys that start with 'public' hold non-user data and survive logout. */
export function clearPrivateQueries() {
  queryClient.removeQueries({ predicate: (q) => q.queryKey[0] !== 'public' });
}

/** Wires React Query to device connectivity and app foreground state. Call once at startup. */
export function setupQueryEnvironment() {
  onlineManager.setEventListener((setOnline) =>
    NetInfo.addEventListener((state) => setOnline(state.isConnected !== false && state.isInternetReachable !== false))
  );
  const sub = AppState.addEventListener('change', (status) => {
    if (Platform.OS !== 'web') focusManager.setFocused(status === 'active');
  });
  return () => sub.remove();
}
