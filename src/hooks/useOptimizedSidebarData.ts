
// ABOUTME: Optimized sidebar data hooks using new database functions for better performance
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { queryKeys, queryConfigs } from './useOptimizedQuery';

interface SidebarStats {
  totalUsers: number;
  onlineUsers: number;
  totalIssues: number;
  totalPosts: number;
  totalComments: number;
}

export const useOptimizedSidebarStats = () => {
  return useQuery({
    queryKey: queryKeys.sidebarStats(),
    queryFn: async (): Promise<SidebarStats> => {
      try {
        // Use our optimized database function
        const { data, error } = await supabase.rpc('get_sidebar_stats');
        
        if (error) {
          console.error('Error fetching sidebar stats:', error);
          throw error;
        }

        return {
          totalUsers: data?.totalUsers || 0,
          onlineUsers: data?.onlineUsers || 0,
          totalIssues: data?.totalIssues || 0,
          totalPosts: data?.totalPosts || 0,
          totalComments: data?.totalComments || 0,
        };
      } catch (error) {
        console.error('Sidebar stats fetch error:', error);
        // Return default values on error
        return {
          totalUsers: 0,
          onlineUsers: 0,
          totalIssues: 0,
          totalPosts: 0,
          totalComments: 0,
        };
      }
    },
    ...queryConfigs.realtime,
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
};

// Optimized hook for reviewer comments with better caching
export const useOptimizedReviewerComments = () => {
  return useQuery({
    queryKey: ['parallel-reviewer-comments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reviewer_comments')
        .select('id, reviewer_name, reviewer_avatar, comment, created_at')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error fetching reviewer comments:', error);
        throw error;
      }

      return data || [];
    },
    ...queryConfigs.static,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Optimized hook for top threads with reduced data transfer
export const useOptimizedTopThreads = () => {
  return useQuery({
    queryKey: ['top-threads'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase.rpc('get_top_threads', { min_comments: 3 });
        
        if (error) {
          console.error('Error fetching top threads:', error);
          throw error;
        }

        return data || [];
      } catch (error) {
        console.error('Top threads fetch error:', error);
        // Fallback to regular posts query
        const { data: fallbackData } = await supabase
          .from('posts')
          .select('id, title, score as votes, created_at')
          .eq('published', true)
          .order('score', { ascending: false })
          .limit(3);
        
        return fallbackData?.map(post => ({
          ...post,
          comments: 0,
          thread_type: 'post'
        })) || [];
      }
    },
    ...queryConfigs.static,
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
};

// Consolidated sidebar data hook for efficient loading
export const useOptimizedSidebarData = () => {
  const stats = useOptimizedSidebarStats();
  const reviewerComments = useOptimizedReviewerComments();
  const topThreads = useOptimizedTopThreads();

  return {
    stats: {
      data: stats.data,
      isLoading: stats.isLoading,
      error: stats.error,
    },
    reviewerComments: {
      data: reviewerComments.data,
      isLoading: reviewerComments.isLoading,
      error: reviewerComments.error,
    },
    topThreads: {
      data: topThreads.data,
      isLoading: topThreads.isLoading,
      error: topThreads.error,
    },
    // Overall loading state
    isLoading: stats.isLoading || reviewerComments.isLoading || topThreads.isLoading,
    // Check if any critical data failed to load
    hasError: stats.error || reviewerComments.error || topThreads.error,
  };
};
