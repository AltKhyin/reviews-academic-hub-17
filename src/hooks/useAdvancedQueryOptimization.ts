
// ABOUTME: Advanced query optimization strategies including request deduplication and background prefetching
import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

interface QueryOptimizationConfig {
  enableRequestDeduplication: boolean;
  enableBackgroundPrefetching: boolean;
  enableAdaptiveCaching: boolean;
  maxCacheSize: number;
}

export const useAdvancedQueryOptimization = (config: QueryOptimizationConfig) => {
  const queryClient = useQueryClient();
  const location = useLocation();
  const activeRequests = useRef(new Map<string, Promise<any>>());
  const prefetchQueue = useRef<Array<{ queryKey: any[], queryFn: () => Promise<any> }>>([]);

  // Request deduplication
  const deduplicateRequest = useCallback(async <T>(
    key: string,
    requestFn: () => Promise<T>
  ): Promise<T> => {
    if (!config.enableRequestDeduplication) {
      return requestFn();
    }

    // Check if request is already in progress
    if (activeRequests.current.has(key)) {
      return activeRequests.current.get(key) as Promise<T>;
    }

    // Start new request and track it
    const request = requestFn().finally(() => {
      activeRequests.current.delete(key);
    });

    activeRequests.current.set(key, request);
    return request;
  }, [config.enableRequestDeduplication]);

  // Intelligent background prefetching based on route
  const prefetchByRoute = useCallback(() => {
    if (!config.enableBackgroundPrefetching) return;

    const currentPath = location.pathname;
    
    // Route-specific prefetching strategies
    switch (currentPath) {
      case '/':
      case '/homepage':
        // Prefetch archive preview and featured content
        prefetchQueue.current.push(
          {
            queryKey: ['issues', { featured: true, limit: 3 }],
            queryFn: () => queryClient.ensureQueryData({
              queryKey: ['issues', { featured: true, limit: 3 }],
              queryFn: () => fetch('/api/featured-issues').then(r => r.json()),
              staleTime: 10 * 60 * 1000,
            })
          },
          {
            queryKey: ['archive-preview'],
            queryFn: () => queryClient.ensureQueryData({
              queryKey: ['archive-preview'],
              queryFn: () => fetch('/api/archive-preview').then(r => r.json()),
              staleTime: 5 * 60 * 1000,
            })
          }
        );
        break;
        
      case '/archive':
        // Prefetch next page of results
        const currentOffset = new URLSearchParams(location.search).get('offset') || '0';
        const nextOffset = parseInt(currentOffset) + 20;
        
        prefetchQueue.current.push({
          queryKey: ['archive-rpc', { offset: nextOffset }],
          queryFn: () => queryClient.ensureQueryData({
            queryKey: ['archive-rpc', { offset: nextOffset }],
            queryFn: () => fetch(`/api/archive?offset=${nextOffset}`).then(r => r.json()),
            staleTime: 8 * 60 * 1000,
          })
        });
        break;
        
      case '/community':
        // Prefetch trending posts and user interactions
        prefetchQueue.current.push({
          queryKey: ['posts', 'trending'],
          queryFn: () => queryClient.ensureQueryData({
            queryKey: ['posts', 'trending'],
            queryFn: () => fetch('/api/posts/trending').then(r => r.json()),
            staleTime: 3 * 60 * 1000,
          })
        });
        break;
    }
  }, [location, config.enableBackgroundPrefetching, queryClient]);

  // Process prefetch queue with throttling
  useEffect(() => {
    if (prefetchQueue.current.length === 0) return;

    const processPrefetch = async () => {
      const batch = prefetchQueue.current.splice(0, 3); // Process 3 at a time
      
      await Promise.allSettled(
        batch.map(({ queryKey, queryFn }) => queryFn())
      );
      
      // Continue processing if more items exist
      if (prefetchQueue.current.length > 0) {
        setTimeout(processPrefetch, 1000); // 1 second delay between batches
      }
    };

    const timeoutId = setTimeout(processPrefetch, 100); // Small initial delay
    return () => clearTimeout(timeoutId);
  }, [location.pathname]);

  // Adaptive cache management
  const optimizeCacheSize = useCallback(() => {
    if (!config.enableAdaptiveCaching) return;

    const cache = queryClient.getQueryCache();
    const queries = cache.getAll();
    
    if (queries.length > config.maxCacheSize) {
      // Remove oldest stale queries
      const staleQueries = queries
        .filter(q => q.isStale())
        .sort((a, b) => (a.state.dataUpdatedAt || 0) - (b.state.dataUpdatedAt || 0))
        .slice(0, queries.length - config.maxCacheSize);
      
      staleQueries.forEach(query => {
        queryClient.removeQueries({ queryKey: query.queryKey });
      });
      
      console.log(`🧹 Cache optimized: removed ${staleQueries.length} stale queries`);
    }
  }, [queryClient, config.enableAdaptiveCaching, config.maxCacheSize]);

  // Trigger route-based prefetching
  useEffect(() => {
    prefetchByRoute();
  }, [prefetchByRoute]);

  // Periodic cache optimization
  useEffect(() => {
    const interval = setInterval(optimizeCacheSize, 5 * 60 * 1000); // Every 5 minutes
    return () => clearInterval(interval);
  }, [optimizeCacheSize]);

  return {
    deduplicateRequest,
    prefetchByRoute,
    optimizeCacheSize,
    activeRequestsCount: activeRequests.current.size,
    pendingPrefetches: prefetchQueue.current.length,
  };
};
