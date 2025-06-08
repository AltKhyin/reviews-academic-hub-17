
// ABOUTME: Optimized React Query wrapper with standardized keys and intelligent caching
import { useQuery, UseQueryOptions } from '@tanstack/react-query';

// Standardized query key factory with better organization
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
  
  // Sidebar data - optimized keys
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

// Optimized query configuration presets
export const queryConfigs = {
  // For static data that rarely changes
  static: {
    staleTime: 15 * 60 * 1000, // 15 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchInterval: false, // Disable automatic polling for static data
  },
  
  // For dynamic data that changes frequently
  realtime: {
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false, // Prevent excessive refetching
    refetchOnMount: 'always' as const,
    refetchInterval: 5 * 60 * 1000, // 5 minutes polling
  },
  
  // For user-specific data
  user: {
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: 'always' as const,
    refetchInterval: false, // No polling for user data
  },
  
  // For analytics data
  analytics: {
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchInterval: false, // Analytics don't need real-time updates
  },
} as const;

// Enhanced request deduplication with cleanup
const activeRequests = new Map<string, Promise<any>>();

// Cleanup function to prevent memory leaks
const cleanupStaleRequests = () => {
  const now = Date.now();
  const CLEANUP_THRESHOLD = 5 * 60 * 1000; // 5 minutes
  
  // Store request timestamps
  if (!cleanupStaleRequests.lastCleanup) {
    cleanupStaleRequests.lastCleanup = now;
  }
  
  // Only cleanup every 5 minutes
  if (now - cleanupStaleRequests.lastCleanup > CLEANUP_THRESHOLD) {
    activeRequests.clear();
    cleanupStaleRequests.lastCleanup = now;
  }
};

// Optimized query hook with deduplication and intelligent caching
export const useOptimizedQuery = <TData = unknown, TError = Error>(
  queryKey: readonly unknown[],
  queryFn: () => Promise<TData>,
  options?: Omit<UseQueryOptions<TData, TError>, 'queryKey' | 'queryFn'>
) => {
  // Cleanup stale requests periodically
  cleanupStaleRequests();
  
  // Create a unique key for request deduplication
  const requestKey = JSON.stringify(queryKey);
  
  const enhancedQueryFn = async (): Promise<TData> => {
    // Check if this request is already in flight
    if (activeRequests.has(requestKey)) {
      return activeRequests.get(requestKey);
    }
    
    // Start new request and store promise
    const promise = queryFn().finally(() => {
      // Clean up completed request
      activeRequests.delete(requestKey);
    });
    
    activeRequests.set(requestKey, promise);
    return promise;
  };

  return useQuery({
    queryKey,
    queryFn: enhancedQueryFn,
    ...options,
  });
};

// Add static property for cleanup tracking
declare global {
  interface Function {
    lastCleanup?: number;
  }
}
