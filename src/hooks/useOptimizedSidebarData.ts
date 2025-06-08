
// ABOUTME: Updated optimized sidebar data hook with field-specific queries and error recovery
import { useOptimizedQuery, queryKeys, queryConfigs } from './useOptimizedQuery';
import { supabase } from '@/integrations/supabase/client';
import { useStableAuth } from './useStableAuth';

interface SidebarStats {
  totalUsers: number;
  onlineUsers: number;
  totalIssues: number;
  featuredIssues: number;
}

interface OnlineUser {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  last_seen: string;
}

interface TopThread {
  id: string;
  title: string;
  comments: number;
  votes: number;
  created_at: string;
  thread_type: string;
}

interface RecentComment {
  id: string;
  content: string;
  created_at: string;
  profiles?: {
    full_name: string | null;
    avatar_url: string | null;
  } | null;
  issue_id?: string;
  post_id?: string;
}

interface SidebarData {
  stats: SidebarStats;
  onlineUsers: OnlineUser[];
  topThreads: TopThread[];
  recentComments: RecentComment[];
  isLoading: boolean;
  error: any;
}

// Optimized stats fetching with single query and fallbacks
const fetchSidebarStats = async (): Promise<SidebarStats> => {
  try {
    // Use parallel queries instead of sequential RPC calls
    const [totalUsersResult, onlineUsersResult, issuesStatsResult] = await Promise.allSettled([
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
      supabase.from('online_users').select('id', { count: 'exact', head: true }),
      supabase
        .from('issues')
        .select('id, featured, published')
        .eq('published', true)
    ]);

    let totalUsers = 0;
    let onlineUsers = 0;
    let totalIssues = 0;
    let featuredIssues = 0;

    // Handle totalUsers result
    if (totalUsersResult.status === 'fulfilled' && totalUsersResult.value.count !== null) {
      totalUsers = totalUsersResult.value.count;
    } else {
      // Fallback to RPC if direct count fails
      try {
        const { data } = await supabase.rpc('get_total_users');
        totalUsers = data || 0;
      } catch (error) {
        console.warn('Failed to get total users, using fallback:', error);
        totalUsers = 0;
      }
    }

    // Handle onlineUsers result
    if (onlineUsersResult.status === 'fulfilled' && onlineUsersResult.value.count !== null) {
      onlineUsers = onlineUsersResult.value.count;
    } else {
      // Fallback to RPC
      try {
        const { data } = await supabase.rpc('get_online_users_count');
        onlineUsers = data || 0;
      } catch (error) {
        console.warn('Failed to get online users count, using fallback:', error);
        onlineUsers = 0;
      }
    }

    // Handle issues result
    if (issuesStatsResult.status === 'fulfilled' && issuesStatsResult.value.data) {
      const issues = issuesStatsResult.value.data;
      totalIssues = issues.length;
      featuredIssues = issues.filter(issue => issue.featured).length;
    }

    return {
      totalUsers,
      onlineUsers,
      totalIssues,
      featuredIssues,
    };
  } catch (error) {
    console.error('Error fetching sidebar stats:', error);
    return {
      totalUsers: 0,
      onlineUsers: 0,
      totalIssues: 0,
      featuredIssues: 0,
    };
  }
};

// Optimized online users fetching with error handling
const fetchOnlineUsers = async (): Promise<OnlineUser[]> => {
  try {
    const { data, error } = await supabase
      .from('online_users')
      .select(`
        id,
        full_name,
        avatar_url,
        last_active
      `)
      .order('last_active', { ascending: false })
      .limit(8); // Reduced for better performance

    if (error) throw error;

    return (data || []).map(user => ({
      id: user.id,
      full_name: user.full_name || null,
      avatar_url: user.avatar_url || null,
      last_seen: user.last_active,
    }));
  } catch (error) {
    console.error('Error fetching online users:', error);
    return [];
  }
};

// Optimized top threads with fallback
const fetchTopThreads = async (): Promise<TopThread[]> => {
  try {
    const { data, error } = await supabase.rpc('get_top_threads', { min_comments: 2 });
    
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Error fetching top threads:', error);
    
    // Fallback to manual query if RPC fails
    try {
      const { data: fallbackData } = await supabase
        .from('posts')
        .select(`
          id,
          title,
          score,
          created_at
        `)
        .eq('published', true)
        .order('score', { ascending: false })
        .limit(3);
      
      return (fallbackData || []).map(post => ({
        id: post.id,
        title: post.title,
        comments: 0, // Cannot easily get comment count in fallback
        votes: post.score || 0,
        created_at: post.created_at,
        thread_type: 'post'
      }));
    } catch (fallbackError) {
      console.error('Fallback query also failed:', fallbackError);
      return [];
    }
  }
};

// Optimized recent comments with minimal data
const fetchRecentComments = async (): Promise<RecentComment[]> => {
  try {
    const { data, error } = await supabase
      .from('comments')
      .select(`
        id,
        content,
        created_at,
        issue_id,
        post_id,
        profiles!inner(
          full_name,
          avatar_url
        )
      `)
      .order('created_at', { ascending: false })
      .limit(6); // Reduced for better performance

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Error fetching recent comments:', error);
    return [];
  }
};

export const useOptimizedSidebarData = (): SidebarData => {
  const { user } = useStableAuth();

  // Fetch stats with longer cache time and error recovery
  const { data: stats, isLoading: statsLoading, error: statsError } = useOptimizedQuery(
    queryKeys.sidebarStats(),
    fetchSidebarStats,
    {
      ...queryConfigs.static,
      staleTime: 8 * 60 * 1000, // 8 minutes - increased from 5
      gcTime: 15 * 60 * 1000, // 15 minutes
      retry: (failureCount, error) => {
        // Only retry on network errors, not on auth/permission errors
        return failureCount < 2 && !error?.message?.includes('permission');
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
    }
  );

  // Fetch online users with moderate cache time
  const { data: onlineUsers, isLoading: onlineLoading, error: onlineError } = useOptimizedQuery(
    queryKeys.onlineUsers(),
    fetchOnlineUsers,
    {
      ...queryConfigs.realtime,
      staleTime: 3 * 60 * 1000, // 3 minutes - balanced between freshness and performance
      gcTime: 8 * 60 * 1000, // 8 minutes
      retry: 1, // Less critical data, single retry
    }
  );

  // Fetch top threads with longer cache time
  const { data: topThreads, isLoading: threadsLoading, error: threadsError } = useOptimizedQuery(
    queryKeys.posts({ top: true }),
    fetchTopThreads,
    {
      ...queryConfigs.static,
      staleTime: 12 * 60 * 1000, // 12 minutes - increased from 10
      gcTime: 25 * 60 * 1000, // 25 minutes
      retry: 1,
    }
  );

  // Fetch recent comments with moderate cache time
  const { data: recentComments, isLoading: commentsLoading, error: commentsError } = useOptimizedQuery(
    queryKeys.comments(),
    fetchRecentComments,
    {
      ...queryConfigs.static,
      staleTime: 10 * 60 * 1000, // 10 minutes
      gcTime: 20 * 60 * 1000, // 20 minutes
      retry: 1,
    }
  );

  // Only show loading when we have no cached data
  const isLoading = (statsLoading && !stats) || 
                   (onlineLoading && !onlineUsers) || 
                   (threadsLoading && !topThreads) || 
                   (commentsLoading && !recentComments);

  const error = statsError || onlineError || threadsError || commentsError;

  return {
    stats: stats || { totalUsers: 0, onlineUsers: 0, totalIssues: 0, featuredIssues: 0 },
    onlineUsers: onlineUsers || [],
    topThreads: topThreads || [],
    recentComments: recentComments || [],
    isLoading,
    error,
  };
};
