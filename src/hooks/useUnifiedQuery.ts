
// ABOUTME: Simplified unified query system replacing multiple overlapping systems
import { useQuery, UseQueryOptions, QueryKey } from '@tanstack/react-query';
import { useCallback, useRef } from 'react';

type QueryPriority = 'critical' | 'normal' | 'background';

interface UnifiedQueryOptions<TData = unknown> extends Omit<UseQueryOptions<TData>, 'queryKey' | 'queryFn'> {
  priority?: QueryPriority;
}

// Single lightweight cache for deduplication (removing complex overlapping systems)
const requestCache = new Map<string, { 
  data: any; 
  timestamp: number; 
  promise?: Promise<any>;
}>();

const DEDUP_WINDOW = 30000; // 30 seconds

// Simplified cache configurations (removing complex overlapping strategies)
const CACHE_CONFIGS: Record<QueryPriority, { 
  staleTime: number; 
  gcTime: number; 
  retry: number;
}> = {
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

// Simple cleanup function (removing complex memory management overhead)
const cleanupCache = () => {
  const now = Date.now();
  for (const [key, value] of requestCache.entries()) {
    if (now - value.timestamp > DEDUP_WINDOW) {
      requestCache.delete(key);
    }
  }
};

// Run cleanup every 5 minutes (simplified)
setInterval(cleanupCache, 5 * 60 * 1000);

export const useUnifiedQuery = <TData = unknown>(
  queryKey: QueryKey,
  queryFn: () => Promise<TData>,
  options: UnifiedQueryOptions<TData> = {}
) => {
  const {
    priority = 'normal',
    ...restOptions
  } = options;

  const cacheKey = JSON.stringify(queryKey);
  const config = CACHE_CONFIGS[priority];

  // Simplified deduplicated query function (removing complex rate limiting overhead)
  const deduplicatedQueryFn = useCallback(async (): Promise<TData> => {
    const now = Date.now();

    // Simple deduplication check
    const cached = requestCache.get(cacheKey);
    if (cached && (now - cached.timestamp) < DEDUP_WINDOW) {
      if (cached.promise) {
        return cached.promise;
      }
      if (cached.data) {
        return cached.data;
      }
    }

    // Create and cache the promise
    const promise = queryFn().then(data => {
      requestCache.set(cacheKey, { 
        data, 
        timestamp: now, 
      });
      return data;
    }).catch(error => {
      // Remove from cache on error
      requestCache.delete(cacheKey);
      throw error;
    });

    // Cache the promise to prevent duplicate requests
    requestCache.set(cacheKey, { 
      data: null, 
      timestamp: now, 
      promise,
    });
    
    return promise;
  }, [queryFn, cacheKey]);

  return useQuery({
    queryKey,
    queryFn: deduplicatedQueryFn,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    ...config,
    ...restOptions,
  });
};

// Simplified cache management (removing complex metrics overhead)
export const clearQueryCache = () => {
  requestCache.clear();
};
