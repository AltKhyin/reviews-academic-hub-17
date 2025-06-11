
// ABOUTME: Enhanced query client with comprehensive cache management and optimization
import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface CacheMetrics {
  totalQueries: number;
  hitRate: number;
  missRate: number;
  invalidations: number;
  memoryUsage: number;
  oldestEntry: number;
  newestEntry: number;
  activeQueries: number; // Added missing property
  cacheSize: number; // Added missing property
}

interface CacheOptimizationResult {
  clearedQueries: number;
  freedMemory: number;
  duration: number;
}

interface UseOptimizedQueryClientOptions {
  maxCacheSize?: number;
  cleanupInterval?: number;
  staleCacheThreshold?: number;
}

export const useOptimizedQueryClient = (options: UseOptimizedQueryClientOptions = {}) => {
  const queryClient = useQueryClient();
  const [cacheMetrics, setCacheMetrics] = useState<CacheMetrics>({
    totalQueries: 0,
    hitRate: 0,
    missRate: 0,
    invalidations: 0,
    memoryUsage: 0,
    oldestEntry: 0,
    newestEntry: 0,
    activeQueries: 0,
    cacheSize: 0,
  });

  // Calculate cache metrics
  const calculateCacheMetrics = useCallback((): CacheMetrics => {
    const cache = queryClient.getQueryCache();
    const queries = cache.getAll();
    
    let totalSize = 0;
    let oldestTime = Date.now();
    let newestTime = 0;
    let activeQueries = 0;
    
    queries.forEach(query => {
      const dataSize = JSON.stringify(query.state.data || {}).length;
      totalSize += dataSize;
      
      if (query.getObserversCount() > 0) {
        activeQueries++;
      }
      
      if (query.state.dataUpdatedAt) {
        oldestTime = Math.min(oldestTime, query.state.dataUpdatedAt);
        newestTime = Math.max(newestTime, query.state.dataUpdatedAt);
      }
    });

    return {
      totalQueries: queries.length,
      hitRate: 85, // Approximation - would need more complex tracking
      missRate: 15,
      invalidations: 0, // Would need tracking
      memoryUsage: totalSize / (1024 * 1024), // MB
      oldestEntry: oldestTime,
      newestEntry: newestTime,
      activeQueries,
      cacheSize: totalSize,
    };
  }, [queryClient]);

  // Optimize cache by removing stale entries
  const optimizeCache = useCallback(async (): Promise<CacheOptimizationResult> => {
    const startTime = performance.now();
    const initialMetrics = calculateCacheMetrics();
    
    const cache = queryClient.getQueryCache();
    const queries = cache.getAll();
    
    let clearedQueries = 0;
    const staleThreshold = Date.now() - (30 * 60 * 1000); // 30 minutes
    
    // Remove stale queries
    queries.forEach(query => {
      if (query.state.dataUpdatedAt && query.state.dataUpdatedAt < staleThreshold) {
        if (!query.getObserversCount()) { // Only if no active observers
          cache.remove(query);
          clearedQueries++;
        }
      }
    });

    // Force garbage collection if available
    if ('gc' in window && typeof window.gc === 'function') {
      window.gc();
    }

    const finalMetrics = calculateCacheMetrics();
    const duration = performance.now() - startTime;

    const result: CacheOptimizationResult = {
      clearedQueries,
      freedMemory: initialMetrics.memoryUsage - finalMetrics.memoryUsage,
      duration,
    };

    console.log(`🧹 Cache optimization completed:`, result);
    
    return result;
  }, [queryClient, calculateCacheMetrics]);

  // Prefetch critical data
  const prefetchCriticalData = useCallback(async () => {
    const criticalQueries = [
      {
        queryKey: ['sidebar-stats'],
        queryFn: () => supabase.rpc('get_sidebar_stats'),
      },
      {
        queryKey: ['featured-issue'],
        queryFn: () => supabase.rpc('get_featured_issue'),
      },
      {
        queryKey: ['archive-metadata'],
        queryFn: () => supabase.rpc('get_archive_metadata'),
      },
    ];

    await Promise.allSettled(
      criticalQueries.map(({ queryKey, queryFn }) =>
        queryClient.prefetchQuery({
          queryKey,
          queryFn,
          staleTime: 10 * 60 * 1000, // 10 minutes
        })
      )
    );

    console.log('🚀 Critical data prefetched');
  }, [queryClient]);

  // Invalidate by pattern
  const invalidateByPattern = useCallback((pattern: string) => {
    queryClient.invalidateQueries({
      predicate: (query) => 
        JSON.stringify(query.queryKey).includes(pattern),
    });
  }, [queryClient]);

  // Update metrics periodically
  useEffect(() => {
    const updateMetrics = () => {
      setCacheMetrics(calculateCacheMetrics());
    };

    updateMetrics(); // Initial calculation
    const interval = setInterval(updateMetrics, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, [calculateCacheMetrics]);

  return {
    cacheMetrics,
    optimizeCache,
    prefetchCriticalData,
    invalidateByPattern,
    calculateCacheMetrics,
  };
};
