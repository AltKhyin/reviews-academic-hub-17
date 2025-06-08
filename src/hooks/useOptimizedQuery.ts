
// ABOUTME: Optimized query hook with intelligent caching and deduplication
import { useQuery, UseQueryOptions, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';

// Global request deduplication map
const pendingRequests = new Map<string, Promise<any>>();

// Standardized query key factory
export const queryKeys = {
  // User-related queries
  profile: (userId?: string) => ['profile', userId] as const,
  userRole: (userId?: string) => ['userRole', userId] as const,
  userPermissions: (userId?: string) => ['userPermissions', userId] as const,
  
  // Issues and content
  issues: () => ['issues'] as const,
  issue: (id: string) => ['issue', id] as const,
  featuredIssue: () => ['featuredIssue'] as const,
  
  // Archive and search
  archiveData: (searchQuery?: string, tags?: string[]) => ['archiveData', searchQuery, tags] as const,
  
  // Community
  posts: (filters?: Record<string, any>) => ['posts', filters] as const,
  comments: (postId?: string, issueId?: string) => ['comments', postId, issueId] as const,
  
  // Admin/Editor data (combined since they're the same role)
  adminData: () => ['adminData'] as const,
  users: () => ['users'] as const,
  
  // Sidebar data (heavily optimized)
  sidebarConfig: () => ['sidebarConfig'] as const,
  sidebarStats: () => ['sidebarStats'] as const,
  onlineUsers: () => ['onlineUsers'] as const,
  
  // Reactions and bookmarks (user-specific with longer cache)
  userReactions: (userId: string) => ['userReactions', userId] as const,
  userBookmarks: (userId: string) => ['userBookmarks', userId] as const,
} as const;

// Optimized query defaults
const defaultQueryConfig = {
  staleTime: 5 * 60 * 1000, // 5 minutes default
  gcTime: 10 * 60 * 1000, // 10 minutes garbage collection
  retry: 1, // Reduced from default 3
  refetchOnWindowFocus: false, // Disabled to reduce unnecessary requests
  refetchOnMount: false, // Only refetch if data is stale
  refetchOnReconnect: 'always' as const,
} satisfies Partial<UseQueryOptions>;

// Specific optimizations for different data types
export const queryConfigs = {
  // Rarely changing data - cache aggressively
  static: {
    ...defaultQueryConfig,
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
  },
  
  // User profile data - moderate caching
  profile: {
    ...defaultQueryConfig,
    staleTime: 10 * 60 * 1000, // 10 minutes
  },
  
  // Real-time data - minimal caching but smart refresh
  realtime: {
    ...defaultQueryConfig,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 2 * 60 * 1000, // 2 minutes
  },
  
  // Admin data - longer cache since fewer changes
  admin: {
    ...defaultQueryConfig,
    staleTime: 15 * 60 * 1000, // 15 minutes
  },
} as const;

// Request deduplication wrapper
export function useOptimizedQuery<T>(
  queryKey: readonly unknown[],
  queryFn: () => Promise<T>,
  options?: Partial<UseQueryOptions<T>>
) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  // Generate unique key for deduplication
  const dedupeKey = JSON.stringify(queryKey);
  
  // Enhanced query function with deduplication
  const optimizedQueryFn = async (): Promise<T> => {
    // Check if same request is already pending
    if (pendingRequests.has(dedupeKey)) {
      return pendingRequests.get(dedupeKey);
    }
    
    // Check cache first
    const cachedData = queryClient.getQueryData<T>(queryKey);
    const queryState = queryClient.getQueryState(queryKey);
    
    // Return cached data if fresh enough
    if (cachedData && queryState && 
        (Date.now() - (queryState.dataUpdatedAt || 0)) < (options?.staleTime || defaultQueryConfig.staleTime!)) {
      return cachedData;
    }
    
    // Execute request and store promise for deduplication
    const requestPromise = queryFn();
    pendingRequests.set(dedupeKey, requestPromise);
    
    try {
      const result = await requestPromise;
      return result;
    } finally {
      // Clean up pending request
      pendingRequests.delete(dedupeKey);
    }
  };
  
  return useQuery({
    queryKey,
    queryFn: optimizedQueryFn,
    ...defaultQueryConfig,
    ...options,
    // Add user dependency for user-specific queries
    enabled: options?.enabled !== false && (
      queryKey.includes('user') ? !!user : true
    ),
  });
}

// Batch query utility for related requests
export function useBatchQueries<T extends Record<string, any>>(
  queries: T,
  options?: { enabled?: boolean }
): { [K in keyof T]: ReturnType<typeof useQuery> } {
  const results = {} as any;
  
  for (const [key, query] of Object.entries(queries)) {
    results[key] = useQuery({
      ...query,
      enabled: options?.enabled !== false && query.enabled !== false,
    });
  }
  
  return results;
}

