
// ABOUTME: Simplified query client configuration removing performance overhead
import { QueryClient } from '@tanstack/react-query';

// Simplified query client configuration (removing complex background optimization)
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 15 * 60 * 1000, // 15 minutes
      retry: 2,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    },
    mutations: {
      retry: 1,
    },
  },
});
