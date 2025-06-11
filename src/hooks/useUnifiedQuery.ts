
// ABOUTME: Unified query system that replaces all useOptimized* hooks with intelligent caching
import { useQuery, UseQueryOptions, QueryKey } from '@tanstack/react-query';
import { useCallback, useRef } from 'react';

type QueryPriority = 'critical' | 'normal' | 'background';

interface UnifiedQueryOptions<TData = unknown> extends Omit<UseQueryOptions<TData>, 'queryKey' | 'queryFn'> {
  priority?: QueryPriority;
  dependencies?: QueryKey[];
  enableMonitoring?: boolean;
}

// Global request deduplication cache
const requestCache = new Map<string, { data: any; timestamp: number; promise?: Promise<any> }>();
const DEDUP_WINDOW = 30000; // 30 seconds

// Priority-based cache configurations
const CACHE_CONFIGS: Record<QueryPriority, { staleTime: number; gcTime: number; retry: number }> = {
  critical: {
    staleTime: 15 * 60 * 1000, // 15 minutes
    gcTime: 60 * 60 * 1000,    // 1 hour
    retry: 2,
  },
  normal: {
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000,    // 30 minutes
    retry: 1,
  },
  background: {
    staleTime: 5 * 60 * 1000,  // 5 minutes
    gcTime: 15 * 60 * 1000,    // 15 minutes
    retry: 1,
  },
};

// Performance tracking
let queryMetrics = {
  totalQueries: 0,
  cacheHits: 0,
  cacheMisses: 0,
};

export const useUnifiedQuery = <TData = unknown>(
  queryKey: QueryKey,
  queryFn: () => Promise<TData>,
  options: UnifiedQueryOptions<TData> = {}
) => {
  const {
    priority = 'normal',
    enableMonitoring = false,
    dependencies = [],
    ...restOptions
  } = options;

  const startTimeRef = useRef<number>();
  const cacheKey = JSON.stringify(queryKey);

  // Deduplicated query function
  const deduplicatedQueryFn = useCallback(async (): Promise<TData> => {
    const now = Date.now();
    startTimeRef.current = now;

    // Check deduplication cache
    const cached = requestCache.get(cacheKey);
    if (cached && (now - cached.timestamp) < DEDUP_WINDOW) {
      if (cached.promise) {
        queryMetrics.cacheHits++;
        return cached.promise;
      }
      if (cached.data) {
        queryMetrics.cacheHits++;
        return cached.data;
      }
    }

    queryMetrics.cacheMisses++;
    queryMetrics.totalQueries++;

    // Create and cache the promise
    const promise = queryFn().then(data => {
      requestCache.set(cacheKey, { data, timestamp: now });
      
      if (enableMonitoring && startTimeRef.current) {
        const duration = Date.now() - startTimeRef.current;
        if (duration > 1000) {
          console.warn(`🐌 Slow query detected: ${JSON.stringify(queryKey)} took ${duration}ms`);
        }
      }
      
      return data;
    }).catch(error => {
      // Remove from cache on error
      requestCache.delete(cacheKey);
      throw error;
    });

    // Cache the promise to prevent duplicate requests
    requestCache.set(cacheKey, { data: null, timestamp: now, promise });
    return promise;
  }, [queryFn, cacheKey, enableMonitoring]);

  // Auto-select cache config based on priority
  const cacheConfig = CACHE_CONFIGS[priority];

  return useQuery({
    queryKey,
    queryFn: deduplicatedQueryFn,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    ...cacheConfig,
    ...restOptions,
  });
};

// Utility to get query metrics
export const getQueryMetrics = () => ({
  ...queryMetrics,
  cacheHitRate: queryMetrics.totalQueries > 0 
    ? (queryMetrics.cacheHits / queryMetrics.totalQueries) * 100 
    : 0,
});

// Utility to clear cache
export const clearQueryCache = () => {
  requestCache.clear();
  queryMetrics = { totalQueries: 0, cacheHits: 0, cacheMisses: 0 };
};
