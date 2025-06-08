
// ABOUTME: Enhanced query client with intelligent cache management and performance monitoring
import { QueryClient } from '@tanstack/react-query';

// Enhanced performance monitoring for query optimization
const queryPerformanceMonitor = {
  slowQueries: new Map<string, { count: number; averageTime: number; lastSeen: number }>(),
  
  trackQuery: (queryKey: string, duration: number) => {
    const now = Date.now();
    const existing = queryPerformanceMonitor.slowQueries.get(queryKey);
    
    if (duration > 1000) { // Track queries taking more than 1 second
      if (existing) {
        existing.count++;
        existing.averageTime = (existing.averageTime + duration) / 2;
        existing.lastSeen = now;
      } else {
        queryPerformanceMonitor.slowQueries.set(queryKey, {
          count: 1,
          averageTime: duration,
          lastSeen: now
        });
      }
      console.warn(`Slow query detected: ${queryKey} took ${duration}ms (avg: ${existing?.averageTime || duration}ms, count: ${existing?.count || 1})`);
    }
  },
  
  getSlowQueries: () => Array.from(queryPerformanceMonitor.slowQueries.entries()),
  
  reset: () => queryPerformanceMonitor.slowQueries.clear(),
  
  cleanup: () => {
    const now = Date.now();
    const staleThreshold = 30 * 60 * 1000; // 30 minutes
    
    for (const [key, data] of queryPerformanceMonitor.slowQueries) {
      if (now - data.lastSeen > staleThreshold) {
        queryPerformanceMonitor.slowQueries.delete(key);
      }
    }
  }
};

// Global query client with highly optimized defaults
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Optimized retry strategy with circuit breaker pattern
      retry: (failureCount, error) => {
        // Don't retry on authentication/permission errors
        if (error && typeof error === 'object' && 'status' in error) {
          const status = (error as any).status;
          if (status === 401 || status === 403 || status === 422) return false;
        }
        
        // Don't retry on client errors (4xx except 401, 403, 422)
        if (error && typeof error === 'object' && 'status' in error) {
          const status = (error as any).status;
          if (status >= 400 && status < 500) return false;
        }
        
        // Retry up to 2 times for server errors and network errors
        return failureCount < 2;
      },
      
      // More aggressive stale times for better performance
      staleTime: 15 * 60 * 1000, // 15 minutes default - increased from 10
      
      // Longer garbage collection time
      gcTime: 45 * 60 * 1000, // 45 minutes - increased from 30
      
      // Smart refetch behavior
      refetchOnWindowFocus: false, // Disabled for better performance
      refetchOnMount: true, // Changed from 'always' to boolean for performance
      refetchOnReconnect: true, // Keep for offline recovery
      
      // Disable automatic refetching on interval by default
      refetchInterval: false,
      
      // Optimized retry delay with exponential backoff and jitter
      retryDelay: (attemptIndex) => {
        const baseDelay = Math.min(1000 * 2 ** attemptIndex, 30000);
        const jitter = Math.random() * 0.1 * baseDelay; // Add 10% jitter
        return baseDelay + jitter;
      },
      
      // Network mode for better offline handling
      networkMode: 'online',
    },
    mutations: {
      // Optimized mutation settings
      retry: (failureCount, error) => {
        // Don't retry on client errors
        if (error && typeof error === 'object' && 'status' in error) {
          const status = (error as any).status;
          if (status >= 400 && status < 500) return false;
        }
        return failureCount < 1; // Single retry for mutations
      },
      retryDelay: 1500, // Slightly longer delay for mutations
      
      // Global error handling for mutations
      onError: (error) => {
        console.error('Mutation error:', error);
        // Could integrate with error reporting service here
      },
      
      // Network mode for mutations
      networkMode: 'online',
    },
  },
});

// Enhanced invalidation helpers with intelligent targeting
export const invalidationHelpers = {
  // More intelligent user data invalidation
  invalidateUserData: (userId: string) => {
    const userQueries = [
      ['profile', userId],
      ['userReactions', userId],
      ['userBookmarks', userId],
      ['userPermissions', userId],
      ['userPollVote', userId],
    ];
    
    userQueries.forEach(queryKey => {
      queryClient.invalidateQueries({ queryKey });
    });
    
    console.log(`Invalidated user data for ${userId}`);
  },
  
  // Selective issues data invalidation
  invalidateIssues: (selective?: { issueId?: string; includeArchive?: boolean }) => {
    if (selective?.issueId) {
      // Invalidate specific issue
      queryClient.invalidateQueries({ queryKey: ['issue', selective.issueId] });
      queryClient.invalidateQueries({ queryKey: ['optimized-issue', selective.issueId] });
    } else {
      // Invalidate all issues
      const issueTables = ['issues', 'issue', 'featuredIssue', 'parallel-issues', 'optimized-issues'];
      issueTables.forEach(table => {
        queryClient.invalidateQueries({ queryKey: [table] });
      });
    }
    
    if (selective?.includeArchive) {
      queryClient.invalidateQueries({ queryKey: ['archive-issues'] });
      queryClient.invalidateQueries({ queryKey: ['archive-metadata'] });
    }
    
    console.log('Invalidated issues data', selective);
  },
  
  // Granular sidebar data invalidation
  invalidateSidebarData: (selective?: string[]) => {
    const sidebarQueries = selective || [
      'sidebarStats',
      'onlineUsers', 
      'posts',
      'comments'
    ];
    
    sidebarQueries.forEach(queryType => {
      queryClient.invalidateQueries({ 
        predicate: (query) => {
          const keyStr = JSON.stringify(query.queryKey);
          return keyStr.includes(queryType);
        }
      });
    });
    
    console.log('Invalidated sidebar data:', sidebarQueries);
  },
  
  // Enhanced cache cleanup with priority-based retention
  cleanupCache: () => {
    const cache = queryClient.getQueryCache();
    const now = Date.now();
    
    // Define cache priorities and thresholds
    const cacheConfig = {
      critical: { keywords: ['profile', 'auth', 'permissions'], threshold: 2 * 60 * 60 * 1000 }, // 2 hours
      important: { keywords: ['issues', 'featured'], threshold: 60 * 60 * 1000 }, // 1 hour
      normal: { keywords: ['sidebar', 'posts', 'comments'], threshold: 30 * 60 * 1000 }, // 30 minutes
      lowPriority: { keywords: ['archive', 'analytics'], threshold: 15 * 60 * 1000 }, // 15 minutes
    };
    
    let removedCount = 0;
    
    cache.getAll().forEach(query => {
      const queryKeyStr = JSON.stringify(query.queryKey);
      const hasObservers = query.getObserversCount() > 0;
      
      // Never remove queries with active observers
      if (hasObservers) return;
      
      // Determine cache priority
      let threshold = 10 * 60 * 1000; // Default 10 minutes
      
      for (const [priority, config] of Object.entries(cacheConfig)) {
        if (config.keywords.some(keyword => queryKeyStr.includes(keyword))) {
          threshold = config.threshold;
          break;
        }
      }
      
      const isStale = query.state.dataUpdatedAt < now - threshold;
      
      if (isStale) {
        queryClient.removeQueries({ queryKey: query.queryKey });
        removedCount++;
      }
    });
    
    // Cleanup performance monitoring
    queryPerformanceMonitor.cleanup();
    
    console.log(`Cache cleanup completed: removed ${removedCount} stale queries`);
  },
  
  // Intelligent cache warming for critical paths
  warmCriticalCache: async () => {
    const criticalQueries = [
      { queryKey: ['parallel-issues'], staleTime: 20 * 60 * 1000 },
      { queryKey: ['sidebarStats'], staleTime: 15 * 60 * 1000 },
      { queryKey: ['archive-issues'], staleTime: 25 * 60 * 1000 },
    ];
    
    const results = await Promise.allSettled(
      criticalQueries.map(({ queryKey, staleTime }) =>
        queryClient.prefetchQuery({
          queryKey,
          staleTime,
        })
      )
    );
    
    const successful = results.filter(r => r.status === 'fulfilled').length;
    console.log(`Critical cache warmed: ${successful}/${criticalQueries.length} successful`);
  }
};

// Enhanced background sync and optimization utilities
export const backgroundSync = {
  // Intelligent prefetch with network condition awareness
  prefetchCriticalData: async () => {
    // Check network conditions
    const connection = (navigator as any).connection;
    const isSlowConnection = connection && (
      connection.effectiveType === 'slow-2g' || 
      connection.effectiveType === '2g' ||
      connection.saveData
    );
    
    if (isSlowConnection) {
      console.log('Skipping prefetch on slow connection');
      return;
    }
    
    try {
      await Promise.allSettled([
        queryClient.prefetchQuery({
          queryKey: ['parallel-issues'],
          staleTime: 20 * 60 * 1000,
        }),
        queryClient.prefetchQuery({
          queryKey: ['sidebarStats'],
          staleTime: 15 * 60 * 1000,
        }),
      ]);
      
      console.log('Critical data prefetched successfully');
    } catch (error) {
      console.error('Prefetch failed:', error);
    }
  },
  
  // Adaptive cache optimization based on usage patterns
  optimizeCache: () => {
    let optimizationInterval: NodeJS.Timeout;
    
    const runOptimization = () => {
      const cacheSize = queryClient.getQueryCache().getAll().length;
      const performance = queryPerformanceMonitor.getSlowQueries();
      
      // Adjust optimization frequency based on cache size and performance
      let interval = 20 * 60 * 1000; // 20 minutes default
      
      if (cacheSize > 150) interval = 15 * 60 * 1000; // 15 minutes for large cache
      if (cacheSize > 250) interval = 10 * 60 * 1000; // 10 minutes for very large cache
      if (performance.length > 5) interval = 8 * 60 * 1000; // 8 minutes if many slow queries
      
      invalidationHelpers.cleanupCache();
      
      // Log optimization stats
      console.log(`Cache optimization: ${cacheSize} queries, ${performance.length} slow queries`);
      
      // Schedule next optimization
      clearInterval(optimizationInterval);
      optimizationInterval = setInterval(runOptimization, interval);
    };
    
    // Initial optimization after a short delay
    setTimeout(runOptimization, 5000);
    
    return () => clearInterval(optimizationInterval);
  },
  
  // Enhanced performance monitoring and reporting
  getPerformanceReport: () => ({
    cacheSize: queryClient.getQueryCache().getAll().length,
    slowQueries: queryPerformanceMonitor.getSlowQueries(),
    mutationCache: queryClient.getMutationCache().getAll().length,
    queriesWithObservers: queryClient.getQueryCache().getAll().filter(q => q.getObserversCount() > 0).length,
    timestamp: new Date().toISOString(),
  }),
  
  // Reset all performance monitoring
  resetPerformanceMonitoring: () => {
    queryPerformanceMonitor.reset();
    console.log('Performance monitoring reset');
  }
};

// Initialize background optimization with enhanced monitoring
let backgroundOptimization: (() => void) | null = null;

export const initializeBackgroundOptimization = () => {
  if (backgroundOptimization) return;
  
  backgroundOptimization = backgroundSync.optimizeCache();
  
  // Prefetch critical data after initialization
  setTimeout(() => {
    backgroundSync.prefetchCriticalData();
  }, 2000);
  
  // Log performance reports in development
  if (process.env.NODE_ENV === 'development') {
    setInterval(() => {
      const report = backgroundSync.getPerformanceReport();
      console.group('🔍 Query Performance Report');
      console.log('Cache size:', report.cacheSize);
      console.log('Active queries:', report.queriesWithObservers);
      console.log('Slow queries:', report.slowQueries.length);
      if (report.slowQueries.length > 0) {
        console.table(report.slowQueries);
      }
      console.groupEnd();
    }, 5 * 60 * 1000); // Every 5 minutes in development
  }
  
  console.log('Enhanced background optimization initialized');
};

export const cleanupBackgroundOptimization = () => {
  if (backgroundOptimization) {
    backgroundOptimization();
    backgroundOptimization = null;
    console.log('Background optimization cleaned up');
  }
};

// Export performance monitoring for debugging
export { queryPerformanceMonitor };
