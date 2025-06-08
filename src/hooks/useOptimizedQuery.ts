
// ABOUTME: Optimized React Query wrapper with standardized keys and intelligent caching
import { useQuery, UseQueryOptions } from '@tanstack/react-query';

// Standardized query key factory
export const queryKeys = {
  // User-related queries
  profile: (userId: string) => ['profile', userId] as const,
  userReactions: (userId: string) => ['userReactions', userId] as const,
  userBookmarks: (userId: string) => ['userBookmarks', userId] as const,
  userPermissions: (userId: string) => ['userPermissions', userId] as const,
  
  // Issues and content
  issues: (filters?: any) => ['issues', filters] as const,
  issue: (id: string) => ['issue', id] as const,
  featuredIssue: () => ['featuredIssue'] as const,
  
  // Archive and search
  archiveData: (filters?: any) => ['archiveData', filters] as const,
  
  // Sidebar data
  sidebarStats: () => ['sidebarStats'] as const,
  sidebarConfig: () => ['sidebarConfig'] as const,
  onlineUsers: () => ['onlineUsers'] as const,
  
  // Community
  posts: (filters?: any) => ['posts', filters] as const,
  comments: (filters?: any) => ['comments', filters] as const,
  
  // Analytics
  analytics: () => ['analytics'] as const,
  userEngagement: () => ['analytics', 'userEngagement'] as const,
  contentMetrics: () => ['analytics', 'contentMetrics'] as const,
  communityActivity: () => ['analytics', 'communityActivity'] as const,
  performance: () => ['analytics', 'performance'] as const,
  systemHealth: () => ['analytics', 'systemHealth'] as const,
} as const;

// Query configuration presets
export const queryConfigs = {
  // For static data that rarely changes
  static: {
    staleTime: 15 * 60 * 1000, // 15 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  },
  
  // For dynamic data that changes frequently
  realtime: {
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  },
  
  // For user-specific data
  user: {
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: 'always' as const,
  },
  
  // For analytics data
  analytics: {
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  },
} as const;

// Request deduplication map
const activeRequests = new Map<string, Promise<any>>();

// Optimized query hook with deduplication and intelligent caching
export const useOptimizedQuery = <TData = unknown, TError = Error>(
  queryKey: readonly unknown[],
  queryFn: () => Promise<TData>,
  options?: Omit<UseQueryOptions<TData, TError>, 'queryKey' | 'queryFn'>
) => {
  // Create a unique key for request deduplication
  const requestKey = JSON.stringify(queryKey);
  
  const enhancedQueryFn = async (): Promise<TData> => {
    // Check if this request is already in flight
    if (activeRequests.has(requestKey)) {
      return activeRequests.get(requestKey);
    }
    
    // Start new request and store promise
    const promise = queryFn();
    activeRequests.set(requestKey, promise);
    
    try {
      const result = await promise;
      activeRequests.delete(requestKey);
      return result;
    } catch (error) {
      activeRequests.delete(requestKey);
      throw error;
    }
  };

  return useQuery({
    queryKey,
    queryFn: enhancedQueryFn,
    ...options,
  });
};
