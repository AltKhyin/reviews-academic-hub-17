
// ABOUTME: Optimized query client configuration and initialization
import { QueryClient } from '@tanstack/react-query';

let queryClient: QueryClient | null = null;

export const getQueryClient = () => {
  if (!queryClient) {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 5 * 60 * 1000, // 5 minutes
          gcTime: 30 * 60 * 1000, // 30 minutes
          refetchOnWindowFocus: false,
          refetchOnMount: false,
          retry: 2,
        },
      },
    });
  }
  return queryClient;
};

export const initializeBackgroundOptimization = () => {
  console.log('Background optimization initialized');
};

export const cleanupBackgroundOptimization = () => {
  console.log('Background optimization cleaned up');
};
