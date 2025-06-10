
// ABOUTME: Centralized query optimization with request deduplication and aggressive caching
import { useQuery, UseQueryOptions } from '@tanstack/react-query';

// Global request deduplication cache
const requestCache = new Map();
const pendingRequests = new Map();

// Centralized query key factory for consistency
export const queryKeys = {
  // Issues queries
  issues: (filters?: Record<string, any>) => ['issues', filters].filter(Boolean),
  issuesBatch: (ids: string[]) => ['issues', 'batch', ids],
  featuredIssue: () => ['issues', 'featured'],
  reviewWithBlocks: (id: string) => ['review', 'blocks', id],
  
  // Analytics and stats
  analytics: () => ['analytics'],
  sidebarStats: () => ['sidebar', 'stats'],
  queryPerformance: () => ['query', 'performance'],
  
  // Community
  topThreads: (minComments?: number) => ['threads', 'top', minComments],
  popularIssues: (period?: number, limit?: number) => ['issues', 'popular', period, limit],
  
  // Settings
  homeSettings: () => ['settings', 'home'],
  sidebarConfig: () => ['config', 'sidebar'],
  
  // User data
  userPermissions: (userId: string) => ['user', 'permissions', userId],
  userReactions: (userId: string) => ['user', 'reactions', userId],
};

// Optimized query configurations with aggressive caching
export const queryConfigs: Record<string, any> = {
  // Static/semi-static data - very long cache times
  static: {
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 60 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 1,
  },
  
  // Real-time data - moderate cache times with careful refresh
  realtime: {
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
    refetchOnWindowFocus: false,
    refetchInterval: false, // Disable auto-refresh
    retry: 1,
  },
  
  // User-specific data - long cache times
  user: {
    staleTime: 15 * 60 * 1000, // 15 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 1,
  },
  
  // Performance monitoring - minimal refresh
  performance: {
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 20 * 60 * 1000, // 20 minutes
    refetchOnWindowFocus: false,
    refetchInterval: false,
    retry: 1,
  }
};

// Generic optimized query hook with request deduplication
export const useOptimizedQuery = <TData = unknown>(
  queryKey: readonly unknown[],
  queryFn: () => Promise<TData>,
  options?: Partial<UseQueryOptions<TData>>
) => {
  // Create cache key for deduplication
  const cacheKey = JSON.stringify(queryKey);
  
  // Wrap query function with deduplication
  const deduplicatedQueryFn = async (): Promise<TData> => {
    // Check if request is already pending
    if (pendingRequests.has(cacheKey)) {
      return pendingRequests.get(cacheKey);
    }

    // Check cache first
    if (requestCache.has(cacheKey)) {
      const cached = requestCache.get(cacheKey);
      if (Date.now() - cached.timestamp < 30000) { // 30 second cache
        return cached.data;
      }
    }

    // Create and cache the promise
    const promise = queryFn().then(data => {
      // Cache the result
      requestCache.set(cacheKey, { data, timestamp: Date.now() });
      // Remove from pending
      pendingRequests.delete(cacheKey);
      return data;
    }).catch(error => {
      // Remove from pending on error
      pendingRequests.delete(cacheKey);
      throw error;
    });

    // Cache the promise to prevent duplicate requests
    pendingRequests.set(cacheKey, promise);
    return promise;
  };

  // Auto-select config based on query key pattern
  let config = queryConfigs.user; // default
  
  const keyString = JSON.stringify(queryKey);
  if (keyString.includes('stats') || keyString.includes('analytics')) {
    config = queryConfigs.performance;
  } else if (keyString.includes('settings') || keyString.includes('config')) {
    config = queryConfigs.static;
  } else if (keyString.includes('threads') || keyString.includes('comments')) {
    config = queryConfigs.realtime;
  }

  return useQuery({
    queryKey,
    queryFn: deduplicatedQueryFn,
    ...config,
    ...options,
  });
};
