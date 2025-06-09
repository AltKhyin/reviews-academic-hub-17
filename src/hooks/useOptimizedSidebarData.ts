// ABOUTME: Optimized sidebar data hooks using new RPC functions for better performance
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { queryKeys, queryConfigs } from './useOptimizedQuery';
import { useMaterializedViewData } from './useMaterializedViewsOptimization';

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

  // Try materialized view first, fallback to RPC
  const { data: mvStats } = useMaterializedViewData('mv_community_stats');

  return useQuery({
    queryKey: queryKeys.sidebarStats(),
    queryFn: async (): Promise<SidebarStats> => {
      // Use materialized view if available and properly structured
      if (mvStats && typeof mvStats === 'object' && mvStats !== null) {
        const stats = mvStats as Record<string, any>;
        // Check if all required properties exist
        if ('total_users' in stats && 'online_users' in stats && 'total_issues' in stats) {
          return {
            totalUsers: Number(stats.total_users) || 0,
            onlineUsers: Number(stats.online_users) || 0,
            totalIssues: Number(stats.total_issues) || 0,
            totalPosts: Number(stats.total_posts) || 0,
            totalComments: Number(stats.total_comments) || 0,
          };
        }
      }

      // Fallback to RPC function
      try {
        const { data, error } = await supabase.rpc('get_sidebar_stats');
        
        if (error) {
          console.error('Error fetching sidebar stats:', error);
          throw error;
        }

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
    ...queryConfigs.performance,
    refetchInterval: shouldFetch ? 10 * 60 * 1000 : false, // Only poll when needed, every 10 minutes
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
    ...queryConfigs.static,
    staleTime: 15 * 60 * 1000, // 15 minutes - comments are updated weekly
    refetchInterval: false, // No polling for comments
  });
};

// Optimized hook for top threads using RPC function
export const useOptimizedTopThreads = () => {
  const location = useLocation();
  const shouldFetch = ['/homepage', '/', '/community'].includes(location.pathname);

  return useQuery({
    queryKey: queryKeys.topThreads(2),
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
    ...queryConfigs.realtime,
    staleTime: 10 * 60 * 1000, // 10 minutes
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
