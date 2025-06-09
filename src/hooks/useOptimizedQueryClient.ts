
// ABOUTME: Query client optimization utilities for cache management
import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';

interface CacheMetrics {
  hitRate: number;
  totalQueries: number;
  activeQueries: number;
  cacheSize: number;
}

interface OptimizedQueryClientOptions {
  enableBackgroundRefetch?: boolean;
  enableRetries?: boolean;
  maxCacheSize?: number;
  defaultStaleTime?: number;
}

export const useOptimizedQueryClient = (options: OptimizedQueryClientOptions = {}) => {
  const queryClient = useQueryClient();

  // Calculate cache metrics
  const cacheMetrics = useMemo((): CacheMetrics => {
    const cache = queryClient.getQueryCache();
    const queries = cache.getAll();
    
    const totalQueries = queries.length;
    const activeQueries = queries.filter(q => q.state.fetchStatus === 'fetching').length;
    const cachedQueries = queries.filter(q => q.state.data !== undefined).length;
    
    const hitRate = totalQueries > 0 ? (cachedQueries / totalQueries) * 100 : 0;
    
    // Estimate cache size (simplified calculation)
    const cacheSize = queries.reduce((size, query) => {
      if (query.state.data) {
        return size + JSON.stringify(query.state.data).length / 1024; // KB
      }
      return size;
    }, 0) / 1024; // Convert to MB

    return {
      hitRate,
      totalQueries,
      activeQueries,
      cacheSize,
    };
  }, [queryClient]);

  // Optimize cache by removing stale queries
  const optimizeCache = useCallback(() => {
    const cache = queryClient.getQueryCache();
    const queries = cache.getAll();
    
    // Remove queries that are older than 30 minutes and not actively used
    const cutoffTime = Date.now() - 30 * 60 * 1000;
    
    queries.forEach(query => {
      if (query.state.dataUpdatedAt < cutoffTime && !query.getObserversCount()) {
        queryClient.removeQueries({ queryKey: query.queryKey });
      }
    });
    
    console.log('Cache optimized - removed stale queries');
  }, [queryClient]);

  return {
    cacheMetrics,
    optimizeCache,
    queryClient,
  };
};
