
// ABOUTME: Optimized sidebar data hook with aggressive caching and minimal requests
import { useOptimizedQuery, queryKeys, queryConfigs } from './useOptimizedQuery';
import { supabase } from '@/integrations/supabase/client';
import { useMemo } from 'react';

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

const getDefaultStats = (): SidebarStats => ({
  totalUsers: 0,
  onlineUsers: 0,
  totalIssues: 0,
  totalPosts: 0,
  totalComments: 0,
});

const getDefaultComments = (): ReviewerComment[] => [];

const getDefaultThreads = (): TopThread[] => [];

export const useOptimizedSidebarData = (): OptimizedSidebarData => {
  // Fetch sidebar stats with extended caching
  const { 
    data: statsData, 
    isLoading: statsLoading, 
    error: statsError 
  } = useOptimizedQuery(
    queryKeys.sidebarStats(),
    async (): Promise<SidebarStats> => {
      try {
        const { data, error } = await supabase.rpc('get_sidebar_stats');
        
        if (error) throw error;
        
        // Type-safe conversion with validation
        if (data && typeof data === 'object' && !Array.isArray(data)) {
          const statsData = data as any;
          return {
            totalUsers: Number(statsData.totalUsers) || 0,
            onlineUsers: Number(statsData.onlineUsers) || 0,
            totalIssues: Number(statsData.totalIssues) || 0,
            totalPosts: Number(statsData.totalPosts) || 0,
            totalComments: Number(statsData.totalComments) || 0,
          };
        }
        
        // Fallback default stats
        return getDefaultStats();
      } catch (error) {
        console.warn('Sidebar stats error:', error);
        return getDefaultStats();
      }
    },
    {
      ...queryConfigs.static, // Use static config for very long cache
      staleTime: 15 * 60 * 1000, // 15 minutes
    }
  );

  // Fetch reviewer comments with extended caching
  const { 
    data: commentsData, 
    isLoading: commentsLoading, 
    error: commentsError 
  } = useOptimizedQuery(
    ['reviewer-comments'],
    async (): Promise<ReviewerComment[]> => {
      try {
        const { data, error } = await supabase
          .from('reviewer_comments')
          .select('id, reviewer_name, reviewer_avatar, comment, created_at')
          .order('created_at', { ascending: false })
          .limit(10);
        
        if (error) throw error;
        
        return data || getDefaultComments();
      } catch (error) {
        console.warn('Reviewer comments error:', error);
        return getDefaultComments();
      }
    },
    {
      ...queryConfigs.static,
      staleTime: 20 * 60 * 1000, // 20 minutes for comments
    }
  );

  // Fetch top threads with extended caching
  const { 
    data: threadsData, 
    isLoading: threadsLoading, 
    error: threadsError 
  } = useOptimizedQuery(
    ['top-threads'],
    async (): Promise<TopThread[]> => {
      try {
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
      } catch (error) {
        console.warn('Top threads error:', error);
        return getDefaultThreads();
      }
    },
    {
      ...queryConfigs.static,
      staleTime: 10 * 60 * 1000, // 10 minutes for threads
    }
  );

  // Memoize computed values
  const isLoading = useMemo(() => 
    statsLoading || commentsLoading || threadsLoading, 
    [statsLoading, commentsLoading, threadsLoading]
  );
  
  const hasError = useMemo(() => 
    Boolean(statsError || commentsError || threadsError),
    [statsError, commentsError, threadsError]
  );

  return useMemo(() => ({
    stats: {
      data: statsData || null,
      isLoading: statsLoading,
      error: statsError,
    },
    reviewerComments: {
      data: commentsData || getDefaultComments(),
      isLoading: commentsLoading,
      error: commentsError,
    },
    topThreads: {
      data: threadsData || getDefaultThreads(),
      isLoading: threadsLoading,
      error: threadsError,
    },
    hasError,
    isLoading,
  }), [
    statsData, statsLoading, statsError,
    commentsData, commentsLoading, commentsError,
    threadsData, threadsLoading, threadsError,
    hasError, isLoading
  ]);
};
