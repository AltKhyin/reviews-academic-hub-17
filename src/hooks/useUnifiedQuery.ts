
// ABOUTME: Enhanced unified query system with rate limiting and comprehensive error handling
import { useQuery, UseQueryOptions, QueryKey } from '@tanstack/react-query';
import { useCallback, useRef } from 'react';
import { useAPIRateLimit, RateLimitConfig } from './useAPIRateLimit';

type QueryPriority = 'critical' | 'normal' | 'background';

interface UnifiedQueryOptions<TData = unknown> extends Omit<UseQueryOptions<TData>, 'queryKey' | 'queryFn'> {
  priority?: QueryPriority;
  dependencies?: QueryKey[];
  enableMonitoring?: boolean;
  rateLimit?: {
    endpoint: string;
    maxRequests?: number;
    windowMs?: number;
  };
}

// Global request deduplication cache with TTL
const requestCache = new Map<string, { 
  data: any; 
  timestamp: number; 
  promise?: Promise<any>;
  ttl: number;
}>();

const DEDUP_WINDOW = 30000; // 30 seconds

// Enhanced priority-based cache configurations
const CACHE_CONFIGS: Record<QueryPriority, { 
  staleTime: number; 
  gcTime: number; 
  retry: number;
  ttl: number;
}> = {
  critical: {
    staleTime: 15 * 60 * 1000, // 15 minutes
    gcTime: 60 * 60 * 1000,    // 1 hour
    retry: 2,
    ttl: 30 * 60 * 1000,       // 30 minutes
  },
  normal: {
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000,    // 30 minutes
    retry: 1,
    ttl: 20 * 60 * 1000,       // 20 minutes
  },
  background: {
    staleTime: 5 * 60 * 1000,  // 5 minutes
    gcTime: 15 * 60 * 1000,    // 15 minutes
    retry: 1,
    ttl: 10 * 60 * 1000,       // 10 minutes
  },
};

// Enhanced performance tracking
let queryMetrics = {
  totalQueries: 0,
  cacheHits: 0,
  cacheMisses: 0,
  rateLimitBlocks: 0,
  errors: 0,
  lastReset: Date.now(),
};

// Cleanup function for cache management
const cleanupCache = () => {
  const now = Date.now();
  for (const [key, value] of requestCache.entries()) {
    if (now - value.timestamp > value.ttl) {
      requestCache.delete(key);
    }
  }
};

// Run cleanup every 5 minutes
setInterval(cleanupCache, 5 * 60 * 1000);

export const useUnifiedQuery = <TData = unknown>(
  queryKey: QueryKey,
  queryFn: () => Promise<TData>,
  options: UnifiedQueryOptions<TData> = {}
) => {
  const {
    priority = 'normal',
    enableMonitoring = false,
    dependencies = [],
    rateLimit,
    ...restOptions
  } = options;

  const startTimeRef = useRef<number>();
  const cacheKey = JSON.stringify(queryKey);
  const config = CACHE_CONFIGS[priority];

  // Rate limiting setup
  const rateLimitHook = useAPIRateLimit();

  // Enhanced deduplicated query function with rate limiting
  const deduplicatedQueryFn = useCallback(async (): Promise<TData> => {
    const now = Date.now();
    startTimeRef.current = now;

    // Rate limiting check
    if (rateLimit && !rateLimitHook.checkRateLimit(rateLimit)) {
      queryMetrics.rateLimitBlocks++;
      throw new Error(`Rate limit exceeded for ${rateLimit.endpoint}`);
    }

    // Check deduplication cache with TTL
    const cached = requestCache.get(cacheKey);
    if (cached && (now - cached.timestamp) < DEDUP_WINDOW && (now - cached.timestamp) < cached.ttl) {
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
      requestCache.set(cacheKey, { 
        data, 
        timestamp: now, 
        ttl: config.ttl,
      });
      
      if (enableMonitoring && startTimeRef.current) {
        const duration = Date.now() - startTimeRef.current;
        if (duration > 1000) {
          console.warn(`🐌 Slow query detected: ${JSON.stringify(queryKey)} took ${duration}ms`);
        } else if (duration > 2000) {
          console.error(`🚨 Very slow query: ${JSON.stringify(queryKey)} took ${duration}ms`);
        }
      }
      
      return data;
    }).catch(error => {
      queryMetrics.errors++;
      // Remove from cache on error
      requestCache.delete(cacheKey);
      
      // Enhanced error logging
      console.error(`Query failed for ${JSON.stringify(queryKey)}:`, {
        error: error.message,
        rateLimited: error.message.includes('Rate limit'),
        duration: startTimeRef.current ? Date.now() - startTimeRef.current : 0,
      });
      
      throw error;
    });

    // Cache the promise to prevent duplicate requests
    requestCache.set(cacheKey, { 
      data: null, 
      timestamp: now, 
      promise,
      ttl: config.ttl,
    });
    
    return promise;
  }, [queryFn, cacheKey, enableMonitoring, config, rateLimit, rateLimitHook]);

  return useQuery({
    queryKey,
    queryFn: deduplicatedQueryFn,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    ...config,
    ...restOptions,
  });
};

// Enhanced utility to get query metrics with rate limiting info
export const getQueryMetrics = () => {
  const uptime = Date.now() - queryMetrics.lastReset;
  return {
    ...queryMetrics,
    cacheHitRate: queryMetrics.totalQueries > 0 
      ? (queryMetrics.cacheHits / queryMetrics.totalQueries) * 100 
      : 0,
    errorRate: queryMetrics.totalQueries > 0
      ? (queryMetrics.errors / queryMetrics.totalQueries) * 100
      : 0,
    rateLimitRate: queryMetrics.totalQueries > 0
      ? (queryMetrics.rateLimitBlocks / queryMetrics.totalQueries) * 100
      : 0,
    requestsPerMinute: uptime > 0 ? (queryMetrics.totalQueries / (uptime / 60000)) : 0,
    uptime,
  };
};

// Enhanced utility to clear cache with optional selective clearing
export const clearQueryCache = (pattern?: string) => {
  if (pattern) {
    for (const [key] of requestCache.entries()) {
      if (key.includes(pattern)) {
        requestCache.delete(key);
      }
    }
  } else {
    requestCache.clear();
  }
  
  queryMetrics = { 
    totalQueries: 0, 
    cacheHits: 0, 
    cacheMisses: 0,
    rateLimitBlocks: 0,
    errors: 0,
    lastReset: Date.now(),
  };
};

// Utility to get cache statistics
export const getCacheStats = () => ({
  size: requestCache.size,
  memory: JSON.stringify([...requestCache.entries()]).length,
  oldestEntry: Math.min(...[...requestCache.values()].map(v => v.timestamp)),
  newestEntry: Math.max(...[...requestCache.values()].map(v => v.timestamp)),
});
