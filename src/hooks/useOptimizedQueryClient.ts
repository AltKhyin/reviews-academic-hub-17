
// ABOUTME: Advanced React Query client configuration with intelligent caching and performance optimization
import { QueryClient } from '@tanstack/react-query';
import { useState, useEffect, useCallback } from 'react';

interface QueryClientConfig {
  enableBackgroundRefetch?: boolean;
  enableRetries?: boolean;
  enablePersistence?: boolean;
  maxCacheSize?: number;
  defaultStaleTime?: number;
  defaultGcTime?: number;
}

interface CacheMetrics {
  totalQueries: number;
  activeQueries: number;
  staleQueries: number;
  cacheSize: number;
  hitRate: number;
  memoryUsage: number;
}

const defaultConfig: QueryClientConfig = {
  enableBackgroundRefetch: true,
  enableRetries: true,
  enablePersistence: false,
  maxCacheSize: 100, // Maximum number of cached queries
  defaultStaleTime: 5 * 60 * 1000, // 5 minutes
  defaultGcTime: 15 * 60 * 1000, // 15 minutes
};

export const useOptimizedQueryClient = (config: QueryClientConfig = {}) => {
  const finalConfig = { ...defaultConfig, ...config };
  const [cacheMetrics, setCacheMetrics] = useState<CacheMetrics>({
    totalQueries: 0,
    activeQueries: 0,
    staleQueries: 0,
    cacheSize: 0,
    hitRate: 0,
    memoryUsage: 0,
  });

  // Create optimized query client
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        // Optimized retry strategy
        retry: finalConfig.enableRetries ? (failureCount, error) => {
          // Don't retry on client errors (4xx)
          if (error && typeof error === 'object' && 'status' in error) {
            const status = (error as any).status;
            if (status >= 400 && status < 500) return false;
          }
          
          // Retry up to 2 times for server errors and network errors
          return failureCount < 2;
        } : false,
        
        // Intelligent stale time based on query type
        staleTime: finalConfig.defaultStaleTime,
        gcTime: finalConfig.defaultGcTime,
        
        // Background refetch configuration
        refetchOnWindowFocus: finalConfig.enableBackgroundRefetch,
        refetchOnMount: true,
        refetchOnReconnect: true,
        refetchInterval: false, // Disable automatic polling by default
        
        // Optimized retry delay with exponential backoff
        retryDelay: (attemptIndex) => {
          const baseDelay = Math.min(1000 * 2 ** attemptIndex, 30000);
          const jitter = Math.random() * 0.1 * baseDelay;
          return baseDelay + jitter;
        },
        
        // Network mode optimization
        networkMode: 'online',
      },
      mutations: {
        // Optimized mutation settings
        retry: (failureCount, error) => {
          if (error && typeof error === 'object' && 'status' in error) {
            const status = (error as any).status;
            if (status >= 400 && status < 500) return false;
          }
          return failureCount < 1;
        },
        retryDelay: 1500,
        networkMode: 'online',
      },
    },
  }));

  // Cache size management
  const manageCacheSize = useCallback(() => {
    const cache = queryClient.getQueryCache();
    const queries = cache.getAll();
    
    if (queries.length > finalConfig.maxCacheSize!) {
      // Sort queries by last access time and priority
      const sortedQueries = queries
        .filter(query => query.getObserversCount() === 0) // Only inactive queries
        .sort((a, b) => {
          // Prioritize by last data update time
          const aTime = a.state.dataUpdatedAt;
          const bTime = b.state.dataUpdatedAt;
          return aTime - bTime; // Oldest first
        });
      
      // Remove oldest queries that exceed the limit
      const queriesToRemove = sortedQueries.slice(0, queries.length - finalConfig.maxCacheSize!);
      queriesToRemove.forEach(query => {
        queryClient.removeQueries({ queryKey: query.queryKey });
      });
      
      console.log(`Cache cleanup: removed ${queriesToRemove.length} stale queries`);
    }
  }, [queryClient, finalConfig.maxCacheSize]);

  // Cache metrics calculation
  const updateCacheMetrics = useCallback(() => {
    const cache = queryClient.getQueryCache();
    const queries = cache.getAll();
    const now = Date.now();
    
    const totalQueries = queries.length;
    const activeQueries = queries.filter(q => q.getObserversCount() > 0).length;
    const staleQueries = queries.filter(q => {
      const staleTime = q.options.staleTime || finalConfig.defaultStaleTime!;
      return now - q.state.dataUpdatedAt > staleTime;
    }).length;
    
    // Estimate cache size (rough approximation)
    let estimatedSize = 0;
    queries.forEach(query => {
      if (query.state.data) {
        // Rough estimation of data size
        try {
          const dataStr = JSON.stringify(query.state.data);
          estimatedSize += dataStr.length;
        } catch {
          estimatedSize += 1000; // Fallback estimate
        }
      }
    });
    const cacheSizeMB = estimatedSize / (1024 * 1024);
    
    // Calculate hit rate (simplified)
    const queriesWithData = queries.filter(q => q.state.data).length;
    const hitRate = totalQueries > 0 ? (queriesWithData / totalQueries) * 100 : 0;
    
    // Memory usage estimation
    const memoryUsage = (performance as any).memory?.usedJSHeapSize / (1024 * 1024) || 0;
    
    setCacheMetrics({
      totalQueries,
      activeQueries,
      staleQueries,
      cacheSize: cacheSizeMB,
      hitRate,
      memoryUsage,
    });
  }, [queryClient, finalConfig.defaultStaleTime]);

  // Intelligent cache optimization
  const optimizeCache = useCallback(() => {
    const cache = queryClient.getQueryCache();
    const queries = cache.getAll();
    const now = Date.now();
    
    let optimizedCount = 0;
    
    queries.forEach(query => {
      const hasObservers = query.getObserversCount() > 0;
      const timeSinceUpdate = now - query.state.dataUpdatedAt;
      const gcTime = query.options.gcTime || finalConfig.defaultGcTime!;
      
      // Remove queries that are old and inactive
      if (!hasObservers && timeSinceUpdate > gcTime) {
        queryClient.removeQueries({ queryKey: query.queryKey });
        optimizedCount++;
      }
      
      // Refresh critical stale data that has observers
      else if (hasObservers && query.state.isStale && !query.state.isFetching) {
        const staleTime = query.options.staleTime || finalConfig.defaultStaleTime!;
        if (timeSinceUpdate > staleTime * 2) { // Only if very stale
          queryClient.invalidateQueries({ queryKey: query.queryKey });
        }
      }
    });
    
    if (optimizedCount > 0) {
      console.log(`Cache optimization: cleaned ${optimizedCount} stale queries`);
    }
    
    // Manage cache size
    manageCacheSize();
  }, [queryClient, finalConfig.defaultGcTime, finalConfig.defaultStaleTime, manageCacheSize]);

  // Prefetch critical data
  const prefetchCriticalData = useCallback(async () => {
    const criticalQueries = [
      { queryKey: ['parallel-issues'], staleTime: 20 * 60 * 1000 },
      { queryKey: ['sidebarStats'], staleTime: 15 * 60 * 1000 },
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
    console.log(`Prefetch completed: ${successful}/${criticalQueries.length} successful`);
  }, [queryClient]);

  // Setup automatic optimization
  useEffect(() => {
    // Update metrics every 10 seconds
    const metricsInterval = setInterval(updateCacheMetrics, 10000);
    
    // Optimize cache every 2 minutes
    const optimizeInterval = setInterval(optimizeCache, 2 * 60 * 1000);
    
    // Initial prefetch after a short delay
    setTimeout(prefetchCriticalData, 2000);
    
    return () => {
      clearInterval(metricsInterval);
      clearInterval(optimizeInterval);
    };
  }, [updateCacheMetrics, optimizeCache, prefetchCriticalData]);

  // Public API
  const invalidateAll = useCallback(() => {
    queryClient.invalidateQueries();
  }, [queryClient]);

  const clearCache = useCallback(() => {
    queryClient.clear();
  }, [queryClient]);

  const getQueryDetails = useCallback((queryKey: unknown[]) => {
    const query = queryClient.getQueryCache().find({ queryKey });
    return query ? {
      isStale: query.state.isStale,
      isFetching: query.state.isFetching,
      hasData: !!query.state.data,
      lastUpdated: query.state.dataUpdatedAt,
      observers: query.getObserversCount(),
    } : null;
  }, [queryClient]);

  return {
    queryClient,
    cacheMetrics,
    optimizeCache,
    prefetchCriticalData,
    invalidateAll,
    clearCache,
    getQueryDetails,
    isOptimized: true,
  };
};
