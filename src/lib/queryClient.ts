
// ABOUTME: Optimized query client configuration with intelligent defaults and performance monitoring
import { QueryClient } from '@tanstack/react-query';

// Performance monitoring for query optimization
const queryPerformanceMonitor = {
  slowQueries: new Map<string, number>(),
  
  trackQuery: (queryKey: string, duration: number) => {
    if (duration > 1000) { // Track queries taking more than 1 second
      queryPerformanceMonitor.slowQueries.set(queryKey, duration);
      console.warn(`Slow query detected: ${queryKey} took ${duration}ms`);
    }
  },
  
  getSlowQueries: () => Array.from(queryPerformanceMonitor.slowQueries.entries()),
  
  reset: () => queryPerformanceMonitor.slowQueries.clear(),
};

// Global query client with highly optimized defaults
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Optimized retry strategy
      retry: (failureCount, error) => {
        // Don't retry on authentication errors
        if (error && typeof error === 'object' && 'status' in error) {
          const status = (error as any).status;
          if (status === 401 || status === 403) return false;
        }
        
        // Retry up to 2 times for other errors
        return failureCount < 2;
      },
      
      // Aggressive stale times for better performance
      staleTime: 10 * 60 * 1000, // 10 minutes default
      
      // Longer garbage collection time
      gcTime: 30 * 60 * 1000, // 30 minutes
      
      // Smart refetch behavior
      refetchOnWindowFocus: false,
      refetchOnMount: 'always',
      refetchOnReconnect: 'always',
      
      // Disable automatic refetching on interval by default
      refetchInterval: false,
      
      // Optimized retry delay with exponential backoff
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      
      // Performance monitoring
      onSettled: (data, error, variables, context) => {
        // Track query performance
        const endTime = Date.now();
        const startTime = (context as any)?.startTime || endTime;
        const duration = endTime - startTime;
        
        if (variables && typeof variables === 'object' && 'queryKey' in variables) {
          const queryKey = JSON.stringify((variables as any).queryKey);
          queryPerformanceMonitor.trackQuery(queryKey, duration);
        }
      },
    },
    mutations: {
      // Optimized mutation settings
      retry: 1,
      retryDelay: 1000,
      
      // Global error handling for mutations
      onError: (error) => {
        console.error('Mutation error:', error);
        // Could integrate with error reporting service here
      },
    },
  },
});

// Enhanced invalidation helpers with performance optimization
export const invalidationHelpers = {
  // Intelligent user data invalidation
  invalidateUserData: (userId: string) => {
    queryClient.invalidateQueries({ 
      predicate: (query) => {
        const keyStr = JSON.stringify(query.queryKey);
        return keyStr.includes(userId) || 
               keyStr.includes('user') ||
               keyStr.includes('profile') ||
               keyStr.includes('userReactions') ||
               keyStr.includes('userBookmarks');
      }
    });
  },
  
  // Smart issues data invalidation
  invalidateIssues: () => {
    const issueTables = ['issues', 'issue', 'featuredIssue', 'archiveData'];
    issueTables.forEach(table => {
      queryClient.invalidateQueries({ queryKey: [table] });
    });
  },
  
  // Selective sidebar data invalidation
  invalidateSidebarData: (selective?: string[]) => {
    if (selective) {
      selective.forEach(key => {
        queryClient.invalidateQueries({ queryKey: [`sidebar-${key}`] });
      });
    } else {
      queryClient.invalidateQueries({ 
        predicate: (query) => {
          const keyStr = JSON.stringify(query.queryKey);
          return keyStr.includes('sidebar') || 
                 keyStr.includes('sidebarStats') ||
                 keyStr.includes('onlineUsers') ||
                 keyStr.includes('posts') ||
                 keyStr.includes('comments');
        }
      });
    }
  },
  
  // Intelligent cache cleanup with preservation of critical data
  cleanupCache: () => {
    const cache = queryClient.getQueryCache();
    const now = Date.now();
    const criticalDataThreshold = 60 * 60 * 1000; // 1 hour
    const regularDataThreshold = 30 * 60 * 1000; // 30 minutes
    
    cache.getAll().forEach(query => {
      const queryKeyStr = JSON.stringify(query.queryKey);
      const isCritical = ['issues', 'profile', 'sidebarConfig'].some(key => 
        queryKeyStr.includes(key)
      );
      
      const threshold = isCritical ? criticalDataThreshold : regularDataThreshold;
      const isOld = query.state.dataUpdatedAt < now - threshold;
      const hasNoObservers = query.getObserversCount() === 0;
      
      if (isOld && hasNoObservers) {
        queryClient.removeQueries({ queryKey: query.queryKey });
      }
    });
    
    console.log('Cache cleanup completed');
  },
  
  // Smart cache warming for critical paths
  warmCriticalCache: async () => {
    const criticalQueries = [
      ['issues'],
      ['sidebarStats'],
      ['sidebarConfig'],
    ];
    
    await Promise.allSettled(
      criticalQueries.map(queryKey =>
        queryClient.prefetchQuery({
          queryKey,
          staleTime: 15 * 60 * 1000, // 15 minutes
        })
      )
    );
    
    console.log('Critical cache warmed');
  }
};

// Background sync and optimization utilities
export const backgroundSync = {
  // Prefetch critical data with intelligent timing
  prefetchCriticalData: async () => {
    await Promise.allSettled([
      queryClient.prefetchQuery({
        queryKey: ['sidebarConfig'],
        staleTime: 60 * 60 * 1000, // 1 hour
      }),
      queryClient.prefetchQuery({
        queryKey: ['issues'],
        staleTime: 30 * 60 * 1000, // 30 minutes
      }),
      queryClient.prefetchQuery({
        queryKey: ['sidebarStats'],
        staleTime: 10 * 60 * 1000, // 10 minutes
      }),
    ]);
    
    console.log('Critical data prefetched');
  },
  
  // Periodic cache optimization with adaptive timing
  optimizeCache: () => {
    let optimizationInterval: NodeJS.Timeout;
    
    const runOptimization = () => {
      const cacheSize = queryClient.getQueryCache().getAll().length;
      
      // Adjust optimization frequency based on cache size
      let interval = 15 * 60 * 1000; // 15 minutes default
      if (cacheSize > 100) interval = 10 * 60 * 1000; // 10 minutes for large cache
      if (cacheSize > 200) interval = 5 * 60 * 1000; // 5 minutes for very large cache
      
      invalidationHelpers.cleanupCache();
      
      // Schedule next optimization
      clearInterval(optimizationInterval);
      optimizationInterval = setInterval(runOptimization, interval);
    };
    
    // Initial optimization
    runOptimization();
    
    return () => clearInterval(optimizationInterval);
  },
  
  // Performance monitoring and reporting
  getPerformanceReport: () => ({
    cacheSize: queryClient.getQueryCache().getAll().length,
    slowQueries: queryPerformanceMonitor.getSlowQueries(),
    mutationCache: queryClient.getMutationCache().getAll().length,
  }),
  
  // Reset performance monitoring
  resetPerformanceMonitoring: () => {
    queryPerformanceMonitor.reset();
  }
};

// Initialize background optimization
let backgroundOptimization: (() => void) | null = null;

export const initializeBackgroundOptimization = () => {
  if (backgroundOptimization) return;
  
  backgroundOptimization = backgroundSync.optimizeCache();
  
  // Prefetch critical data on initialization
  backgroundSync.prefetchCriticalData();
  
  console.log('Background optimization initialized');
};

export const cleanupBackgroundOptimization = () => {
  if (backgroundOptimization) {
    backgroundOptimization();
    backgroundOptimization = null;
  }
};

// Export performance monitoring for debugging
export { queryPerformanceMonitor };
