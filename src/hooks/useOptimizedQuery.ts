
// ABOUTME: Centralized query optimization utilities for consistent caching and key management
import { useQuery, UseQueryOptions } from '@tanstack/react-query';

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
} as const;

// Optimized query configurations by data type
export const queryConfigs = {
  // Static/semi-static data - longer cache times
  static: {
    staleTime: 15 * 60 * 1000, // 15 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  },
  
  // Real-time data - shorter cache times
  realtime: {
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: true,
    refetchInterval: 5 * 60 * 1000, // 5 minutes
  },
  
  // User-specific data - medium cache times
  user: {
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
    refetchOnWindowFocus: false,
  },
  
  // Performance monitoring - adaptive intervals
  performance: {
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 2 * 60 * 1000, // 2 minutes
  }
} as const;

// Generic optimized query hook with automatic config selection
export const useOptimizedQuery = <TData = unknown>(
  queryKey: readonly unknown[],
  queryFn: () => Promise<TData>,
  options?: Partial<UseQueryOptions<TData>>
) => {
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
    queryFn,
    ...config,
    ...options,
  });
};
