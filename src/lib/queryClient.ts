// ABOUTME: Optimized React Query client configuration with intelligent defaults
import { QueryClient } from '@tanstack/react-query';

// Global query client with optimized defaults
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Reduced retry attempts to prevent excessive requests
      retry: 1,
      
      // Longer stale time to reduce unnecessary refetches
      staleTime: 5 * 60 * 1000, // 5 minutes
      
      // Longer garbage collection time
      gcTime: 10 * 60 * 1000, // 10 minutes
      
      // Disable automatic refetching on window focus
      refetchOnWindowFocus: false,
      
      // Only refetch on mount if data is stale
      refetchOnMount: 'stale',
      
      // Refetch on reconnect for critical data only
      refetchOnReconnect: 'always',
      
      // Disable automatic refetching on interval by default
      refetchInterval: false,
      
      // Network error retry configuration
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      // Reduce mutation retries
      retry: 1,
      
      // Faster timeout for mutations
      retryDelay: 1000,
    },
  },
});

// Query invalidation helpers for common patterns
export const invalidationHelpers = {
  // Invalidate all user-specific data
  invalidateUserData: (userId: string) => {
    queryClient.invalidateQueries({ 
      predicate: (query) => 
        query.queryKey.includes(userId) || 
        query.queryKey.includes('user') ||
        query.queryKey.includes('profile')
    });
  },
  
  // Invalidate all issues data
  invalidateIssues: () => {
    queryClient.invalidateQueries({ queryKey: ['issues'] });
    queryClient.invalidateQueries({ queryKey: ['issue'] });
    queryClient.invalidateQueries({ queryKey: ['featuredIssue'] });
    queryClient.invalidateQueries({ queryKey: ['archiveData'] });
  },
  
  // Invalidate sidebar data selectively
  invalidateSidebarData: (selective?: string[]) => {
    if (selective) {
      selective.forEach(key => {
        queryClient.invalidateQueries({ queryKey: [`sidebar-${key}`] });
      });
    } else {
      queryClient.invalidateQueries({ 
        predicate: (query) => query.queryKey[0]?.toString().startsWith('sidebar')
      });
    }
  },
  
  // Smart cache cleanup - remove old unused queries
  cleanupCache: () => {
    queryClient.getQueryCache().clear();
    // Only keep essential cached data
    const essentialQueries = ['sidebarConfig', 'userPermissions', 'issues'];
    queryClient.getQueryCache().getAll().forEach(query => {
      const isEssential = essentialQueries.some(key => 
        query.queryKey.includes(key)
      );
      if (!isEssential && query.state.dataUpdatedAt < Date.now() - 30 * 60 * 1000) {
        queryClient.removeQueries({ queryKey: query.queryKey });
      }
    });
  }
};

// Background sync helper for critical data
export const backgroundSync = {
  // Prefetch critical data in background
  prefetchCriticalData: async () => {
    await Promise.all([
      queryClient.prefetchQuery({
        queryKey: ['sidebarConfig'],
        staleTime: 30 * 60 * 1000,
      }),
      queryClient.prefetchQuery({
        queryKey: ['issues'],
        staleTime: 15 * 60 * 1000,
      }),
    ]);
  },
  
  // Periodic cache optimization
  optimizeCache: () => {
    setInterval(() => {
      invalidationHelpers.cleanupCache();
    }, 15 * 60 * 1000); // Every 15 minutes
  }
};
