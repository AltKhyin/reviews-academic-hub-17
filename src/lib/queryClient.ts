
// ABOUTME: Query client configuration with optimization settings
import { QueryClient } from '@tanstack/react-query';

// Global query client instance with optimized settings
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 30 * 60 * 1000, // 30 minutes
      retry: 2,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

// Background optimization functions
export const initializeBackgroundOptimization = () => {
  console.log('🚀 Background optimization initialized');
  
  // Set up periodic cache cleanup
  setInterval(() => {
    queryClient.getQueryCache().clear();
  }, 60 * 60 * 1000); // Every hour
};

export const cleanupBackgroundOptimization = () => {
  console.log('🧹 Background optimization cleaned up');
};

// Performance monitoring utilities
export const getQueryCacheStats = () => {
  const cache = queryClient.getQueryCache();
  const queries = cache.getAll();
  
  return {
    totalQueries: queries.length,
    activeQueries: queries.filter(q => q.state.fetchStatus === 'fetching').length,
    staleQueries: queries.filter(q => q.isStale()).length,
  };
};
