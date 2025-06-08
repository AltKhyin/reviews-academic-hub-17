
// ABOUTME: Optimized sidebar data hooks using new database functions for better performance
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'react-router-dom';
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
  const location = useLocation();
  
  // Only fetch stats on specific routes where sidebar is visible
  const shouldFetch = ['/homepage', '/', '/community', '/archive', '/acervo'].includes(location.pathname);

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

        // Type assertion since we know the structure from our database function
        const stats = data as any;

        return {
          totalUsers: stats?.totalUsers || 0,
          onlineUsers: stats?.onlineUsers || 0,
          totalIssues: stats?.totalIssues || 0,
          totalPosts: stats?.totalPosts || 0,
          totalComments: stats?.totalComments || 0,
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
    enabled: shouldFetch,
    staleTime: 5 * 60 * 1000, // 5 minutes - stats don't change rapidly
    gcTime: 15 * 60 * 1000, // 15 minutes cache
    refetchInterval: shouldFetch ? 10 * 60 * 1000 : false, // Only poll when needed, every 10 minutes
    refetchOnWindowFocus: false,
  });
};

// Optimized hook for reviewer comments with better caching
export const useOptimizedReviewerComments = () => {
  const location = useLocation();
  const shouldFetch = location.pathname === '/homepage' || location.pathname === '/';

  return useQuery({
    queryKey: ['parallel-reviewer-comments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reviewer_comments')
        .select('id, reviewer_name, reviewer_avatar, comment, created_at')
        .order('created_at', { ascending: false })
        .limit(3); // Reduced limit for sidebar

      if (error) {
        console.error('Error fetching reviewer comments:', error);
        throw error;
      }

      return data || [];
    },
    enabled: shouldFetch,
    staleTime: 15 * 60 * 1000, // 15 minutes - comments are updated weekly
    gcTime: 30 * 60 * 1000, // 30 minutes cache
    refetchOnWindowFocus: false,
    refetchInterval: false, // No polling for comments
  });
};

// Optimized hook for top threads with reduced data transfer
export const useOptimizedTopThreads = () => {
  const location = useLocation();
  const shouldFetch = ['/homepage', '/', '/community'].includes(location.pathname);

  return useQuery({
    queryKey: ['top-threads'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase.rpc('get_top_threads', { min_comments: 2 });
        
        if (error) {
          console.error('Error fetching top threads:', error);
          throw error;
        }

        return data || [];
      } catch (error) {
        console.error('Top threads fetch error:', error);
        // Fallback to regular posts query with limit
        const { data: fallbackData } = await supabase
          .from('posts')
          .select('id, title, score, created_at')
          .eq('published', true)
          .order('score', { ascending: false })
          .limit(3);
        
        return (fallbackData || []).map(post => ({
          id: post.id,
          title: post.title,
          votes: post.score,
          created_at: post.created_at,
          comments: 0,
          thread_type: 'post'
        }));
      }
    },
    enabled: shouldFetch,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 20 * 60 * 1000, // 20 minutes cache
    refetchOnWindowFocus: false,
    refetchInterval: false, // No polling
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
    hasError: Boolean(stats.error || reviewerComments.error || topThreads.error),
  };
};
