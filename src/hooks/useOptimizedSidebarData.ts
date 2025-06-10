
// ABOUTME: Optimized sidebar data hook with reduced queries and intelligent caching
import { useOptimizedQuery, queryKeys, queryConfigs } from './useOptimizedQuery';
import { supabase } from '@/integrations/supabase/client';

interface SidebarStats {
  totalUsers: number;
  onlineUsers: number;
  totalIssues: number;
  totalPosts: number;
  totalComments: number;
}

interface ReviewerComment {
  id: string;
  reviewer_name: string;
  reviewer_avatar: string | null;
  comment: string;
  created_at: string;
}

interface TopThread {
  id: string;
  title: string;
  comments: number;
  votes: number;
  created_at: string;
  thread_type: string;
}

export interface OptimizedSidebarData {
  stats: {
    data: SidebarStats | null;
    isLoading: boolean;
    error: any;
  };
  reviewerComments: {
    data: ReviewerComment[];
    isLoading: boolean;
    error: any;
  };
  topThreads: {
    data: TopThread[];
    isLoading: boolean;
    error: any;
  };
  hasError: boolean;
  isLoading: boolean;
}

export const useOptimizedSidebarData = (): OptimizedSidebarData => {
  // Fetch sidebar stats using RPC function
  const { 
    data: statsData, 
    isLoading: statsLoading, 
    error: statsError 
  } = useOptimizedQuery(
    queryKeys.sidebarStats(),
    async (): Promise<SidebarStats> => {
      const { data, error } = await supabase.rpc('get_sidebar_stats');
      
      if (error) throw error;
      
      // Type-safe conversion with proper validation
      if (data && typeof data === 'object' && !Array.isArray(data)) {
        const statsData = data as Record<string, any>;
        return {
          totalUsers: Number(statsData.totalUsers) || 0,
          onlineUsers: Number(statsData.onlineUsers) || 0,
          totalIssues: Number(statsData.totalIssues) || 0,
          totalPosts: Number(statsData.totalPosts) || 0,
          totalComments: Number(statsData.totalComments) || 0,
        };
      }
      
      // Fallback default stats
      return {
        totalUsers: 0,
        onlineUsers: 0,
        totalIssues: 0,
        totalPosts: 0,
        totalComments: 0,
      };
    },
    {
      ...queryConfigs.realtime,
      staleTime: 2 * 60 * 1000, // 2 minutes for sidebar stats
    }
  );

  // Fetch reviewer comments
  const { 
    data: commentsData = [], 
    isLoading: commentsLoading, 
    error: commentsError 
  } = useOptimizedQuery(
    ['reviewer-comments'],
    async (): Promise<ReviewerComment[]> => {
      const { data, error } = await supabase
        .from('reviewer_comments')
        .select('id, reviewer_name, reviewer_avatar, comment, created_at')
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      
      return data || [];
    },
    {
      ...queryConfigs.static,
      staleTime: 10 * 60 * 1000, // 10 minutes for reviewer comments
    }
  );

  // Fetch top threads
  const { 
    data: threadsData = [], 
    isLoading: threadsLoading, 
    error: threadsError 
  } = useOptimizedQuery(
    ['top-threads'],
    async (): Promise<TopThread[]> => {
      const { data, error } = await supabase
        .from('threads_top')
        .select('id, title, comments, votes, created_at, thread_type')
        .order('votes', { ascending: false })
        .limit(5);
      
      if (error) throw error;
      
      return (data || []).map(thread => ({
        id: thread.id || '',
        title: thread.title || '',
        comments: Number(thread.comments) || 0,
        votes: thread.votes || 0,
        created_at: thread.created_at || '',
        thread_type: thread.thread_type || 'discussion',
      }));
    },
    {
      ...queryConfigs.static,
      staleTime: 5 * 60 * 1000, // 5 minutes for top threads
    }
  );

  const isLoading = statsLoading || commentsLoading || threadsLoading;
  const hasError = Boolean(statsError || commentsError || threadsError);

  return {
    stats: {
      data: statsData || null,
      isLoading: statsLoading,
      error: statsError,
    },
    reviewerComments: {
      data: commentsData,
      isLoading: commentsLoading,
      error: commentsError,
    },
    topThreads: {
      data: threadsData,
      isLoading: threadsLoading,
      error: threadsError,
    },
    hasError,
    isLoading,
  };
};
