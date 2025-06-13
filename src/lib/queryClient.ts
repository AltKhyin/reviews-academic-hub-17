
// ABOUTME: Enhanced query client with background optimization and cascade prevention
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      retry: (failureCount, error: any) => {
        // Don't retry if it's a 4xx error
        if (error?.response?.status >= 400 && error?.response?.status < 500) {
          return false;
        }
        return failureCount < 3;
      },
      refetchOnWindowFocus: false,
      refetchOnReconnect: 'always'
    },
    mutations: {
      retry: 1
    }
  }
});

export const initializeBackgroundOptimization = () => {
  console.log('🚀 Background optimization initialized');
  
  // Set up performance monitoring
  if (typeof window !== 'undefined') {
    // Monitor query cache size
    setInterval(() => {
      const cacheSize = queryClient.getQueryCache().getAll().length;
      if (cacheSize > 100) {
        console.warn(`⚠️ Query cache size: ${cacheSize} queries`);
      }
    }, 30000); // Check every 30 seconds
  }
};
