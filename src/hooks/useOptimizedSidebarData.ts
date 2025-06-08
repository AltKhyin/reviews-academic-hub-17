
// ABOUTME: Optimized sidebar data hook with reduced polling and intelligent caching
import { useOptimizedQuery, queryKeys, queryConfigs } from './useOptimizedQuery';
import { supabase } from '@/integrations/supabase/client';
import { useOptimizedAuth } from './useOptimizedAuth';

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

// Optimized stats fetching with single query
const fetchSidebarStats = async (): Promise<SidebarStats> => {
  try {
    // Use existing database functions for efficiency
    const [totalUsersResult, onlineUsersResult, issuesStatsResult] = await Promise.all([
      supabase.rpc('get_total_users'),
      supabase.rpc('get_online_users_count'),
      supabase
        .from('issues')
        .select('id, featured, published')
        .eq('published', true)
    ]);

    const totalUsers = totalUsersResult.data || 0;
    const onlineUsers = onlineUsersResult.data || 0;
    const issues = issuesStatsResult.data || [];
    const totalIssues = issues.length;
    const featuredIssues = issues.filter(issue => issue.featured).length;

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

// Optimized online users fetching with limit
const fetchOnlineUsers = async (): Promise<OnlineUser[]> => {
  try {
    const { data, error } = await supabase
      .from('online_users')
      .select(`
        id,
        profiles!inner(
          full_name,
          avatar_url
        ),
        last_seen
      `)
      .order('last_seen', { ascending: false })
      .limit(12); // Reduced from 20 to 12 for better performance

    if (error) throw error;

    return (data || []).map(user => ({
      id: user.id,
      full_name: user.profiles?.full_name || null,
      avatar_url: user.profiles?.avatar_url || null,
      last_seen: user.last_seen,
    }));
  } catch (error) {
    console.error('Error fetching online users:', error);
    return [];
  }
};

// Optimized top threads using existing function
const fetchTopThreads = async (): Promise<TopThread[]> => {
  try {
    const { data, error } = await supabase.rpc('get_top_threads', { min_comments: 3 });
    
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Error fetching top threads:', error);
    return [];
  }
};

// Optimized recent comments with fewer results
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
        profiles(
          full_name,
          avatar_url
        )
      `)
      .order('created_at', { ascending: false })
      .limit(8); // Reduced from default to 8

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Error fetching recent comments:', error);
    return [];
  }
};

export const useOptimizedSidebarData = (): SidebarData => {
  const { user } = useOptimizedAuth();

  // Fetch stats with longer cache time (5 minutes)
  const { data: stats, isLoading: statsLoading, error: statsError } = useOptimizedQuery(
    queryKeys.sidebarStats(),
    fetchSidebarStats,
    {
      ...queryConfigs.static,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
    }
  );

  // Fetch online users with medium cache time (2 minutes)
  const { data: onlineUsers, isLoading: onlineLoading, error: onlineError } = useOptimizedQuery(
    queryKeys.onlineUsers(),
    fetchOnlineUsers,
    {
      ...queryConfigs.realtime,
      staleTime: 2 * 60 * 1000, // 2 minutes - reduced from 30 seconds
      gcTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  // Fetch top threads with longer cache time (10 minutes)
  const { data: topThreads, isLoading: threadsLoading, error: threadsError } = useOptimizedQuery(
    queryKeys.posts({ top: true }),
    fetchTopThreads,
    {
      ...queryConfigs.static,
      staleTime: 10 * 60 * 1000, // 10 minutes - increased from 3 minutes
      gcTime: 20 * 60 * 1000, // 20 minutes
    }
  );

  // Fetch recent comments with longer cache time (15 minutes)
  const { data: recentComments, isLoading: commentsLoading, error: commentsError } = useOptimizedQuery(
    queryKeys.comments(),
    fetchRecentComments,
    {
      ...queryConfigs.static,
      staleTime: 15 * 60 * 1000, // 15 minutes - increased from 5 minutes
      gcTime: 30 * 60 * 1000, // 30 minutes
    }
  );

  const isLoading = statsLoading || onlineLoading || threadsLoading || commentsLoading;
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
