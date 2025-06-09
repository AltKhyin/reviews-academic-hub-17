
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

interface OptimizedSidebarData {
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
  hasError: boolean;
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
      
      return data as SidebarStats;
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
    hasError: Boolean(statsError || commentsError),
  };
};
