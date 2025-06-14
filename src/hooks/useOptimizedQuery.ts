
// ABOUTME: Optimized query hook with consistent caching and error handling
import { useQuery, UseQueryOptions } from '@tanstack/react-query';

export const queryKeys = {
  sidebarStats: () => ['sidebar-stats'] as const,
  communityPosts: (limit?: number, offset?: number) => ['community-posts', limit, offset] as const,
  archiveSearch: (query?: string, specialty?: string) => ['archive-search', query, specialty] as const,
  comments: (entityId: string, entityType: string) => ['comments', entityId, entityType] as const,
  homepage: () => ['homepage-data'] as const,
} as const;

export const queryConfigs = {
  static: {
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 1,
  },
  dynamic: {
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    retry: 2,
  },
} as const;

export const useOptimizedQuery = <T>(
  queryKey: readonly unknown[],
  queryFn: () => Promise<T>,
  options?: Partial<UseQueryOptions<T, Error, T, readonly unknown[]>>
) => {
  return useQuery({
    queryKey,
    queryFn,
    ...options,
  });
};
