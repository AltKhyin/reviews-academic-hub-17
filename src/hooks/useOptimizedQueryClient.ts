
// ABOUTME: Enhanced query client optimization with cache metrics and intelligent cleanup
import { useQueryClient, QueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useState, useRef } from 'react';

interface CacheMetrics {
  hitRate: number;
  totalQueries: number;
  activeQueries: number;
  staleQueries: number;
  cacheSize: number;
  lastCleanup: Date;
}

interface OptimizationConfig {
  maxCacheSize: number;
  cleanupInterval: number;
  staleCacheThreshold: number;
}

const defaultConfig: OptimizationConfig = {
  maxCacheSize: 50, // Maximum number of cached queries
  cleanupInterval: 300000, // 5 minutes
  staleCacheThreshold: 600000, // 10 minutes
};

export const useOptimizedQueryClient = (config: Partial<OptimizationConfig> = {}) => {
  const queryClient = useQueryClient();
  const finalConfig = { ...defaultConfig, ...config };
  
  const [cacheMetrics, setCacheMetrics] = useState<CacheMetrics>({
    hitRate: 0,
    totalQueries: 0,
    activeQueries: 0,
    staleQueries: 0,
    cacheSize: 0,
    lastCleanup: new Date(),
  });

  const cleanupIntervalRef = useRef<NodeJS.Timeout>();
  const metricsIntervalRef = useRef<NodeJS.Timeout>();

  // Calculate cache metrics
  const calculateMetrics = useCallback(() => {
    const cache = queryClient.getQueryCache();
    const queries = cache.getAll();
    
    const activeQueries = queries.filter(q => q.state.fetchStatus === 'fetching').length;
    const staleQueries = queries.filter(q => q.isStale()).length;
    const totalQueries = queries.length;
    
    // Simple hit rate calculation based on cache vs network requests
    const cacheHits = queries.filter(q => q.state.dataUpdateCount > 0).length;
    const hitRate = totalQueries > 0 ? (cacheHits / totalQueries) * 100 : 0;

    setCacheMetrics(prev => ({
      ...prev,
      hitRate: Math.round(hitRate),
      totalQueries,
      activeQueries,
      staleQueries,
      cacheSize: totalQueries,
    }));
  }, [queryClient]);

  // Intelligent cache cleanup
  const optimizeCache = useCallback(() => {
    const cache = queryClient.getQueryCache();
    const queries = cache.getAll();

    // Remove queries that are stale and haven't been accessed recently
    const staleThreshold = Date.now() - finalConfig.staleCacheThreshold;
    
    queries.forEach(query => {
      const lastAccessed = query.state.dataUpdatedAt || 0;
      if (lastAccessed < staleThreshold && query.isStale()) {
        cache.remove(query);
      }
    });

    // If still over limit, remove oldest queries
    const remainingQueries = cache.getAll();
    if (remainingQueries.length > finalConfig.maxCacheSize) {
      const sortedQueries = remainingQueries
        .sort((a, b) => (a.state.dataUpdatedAt || 0) - (b.state.dataUpdatedAt || 0));
      
      const queriesToRemove = sortedQueries.slice(0, remainingQueries.length - finalConfig.maxCacheSize);
      queriesToRemove.forEach(query => cache.remove(query));
    }

    setCacheMetrics(prev => ({ ...prev, lastCleanup: new Date() }));
    console.log('🧹 Cache optimization completed');
  }, [queryClient, finalConfig]);

  // Prefetch critical queries
  const prefetchCriticalData = useCallback(async () => {
    try {
      // Prefetch sidebar stats if not already cached
      await queryClient.prefetchQuery({
        queryKey: ['sidebar', 'stats'],
        staleTime: 15 * 60 * 1000, // 15 minutes
      });

      // Prefetch featured issue
      await queryClient.prefetchQuery({
        queryKey: ['issues', 'featured'],
        staleTime: 15 * 60 * 1000,
      });

      console.log('🚀 Critical data prefetched');
    } catch (error) {
      console.warn('Prefetch failed:', error);
    }
  }, [queryClient]);

  // Set up automatic optimization
  useEffect(() => {
    // Calculate metrics every 30 seconds
    metricsIntervalRef.current = setInterval(calculateMetrics, 30000);
    
    // Run cleanup based on config interval
    cleanupIntervalRef.current = setInterval(optimizeCache, finalConfig.cleanupInterval);

    // Initial metrics calculation
    calculateMetrics();

    return () => {
      if (metricsIntervalRef.current) clearInterval(metricsIntervalRef.current);
      if (cleanupIntervalRef.current) clearInterval(cleanupIntervalRef.current);
    };
  }, [calculateMetrics, optimizeCache, finalConfig.cleanupInterval]);

  return {
    cacheMetrics,
    optimizeCache,
    prefetchCriticalData,
    calculateMetrics,
  };
};
