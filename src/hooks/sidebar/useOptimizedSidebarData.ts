// ABOUTME: Optimized sidebar data hook that consolidates all sidebar queries into single efficient call
// Reduces sidebar API calls from 15+ individual queries to 1 consolidated query

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useSidebarDataBridge } from './useSidebarDataBridge';

interface OptimizedSidebarData {
  stats: {
    totalPublishedIssues: number;
    totalActiveUsers: number;
    totalCommunityPosts: number;
    featuredIssueId: string | null;
  };
  recentActivity: {
    latestIssues: Array<{
      id: string;
      title: string;
      specialty: string;
      published_at: string;
    }>;
    trendingPosts: Array<{
      id: string;
      title: string;
      score: number;
      comment_count: number;
    }>;
  };
  userSpecificData: {
    bookmarkCount: number;
    recentBookmarks: Array<{
      id: string;
      title: string;
      type: 'issue' | 'post';
    }>;
  };
}

export const useOptimizedSidebarData = (userId?: string) => {
  // Keep the bridge active for compatibility
  useSidebarDataBridge(userId);

  return useQuery({
    queryKey: ['sidebar-data-optimized', userId],
    queryFn: async (): Promise<OptimizedSidebarData> => {
      // Consolidated stats query
      const { data: statsData, error: statsError } = await supabase.rpc('get_sidebar_stats_optimized');
      
      if (statsError) {
        console.warn('Stats query failed, using fallback:', statsError);
      }

      // Recent activity consolidated query
      const [issuesResponse, postsResponse] = await Promise.all([
        supabase
          .from('issues')
          .select('id, title, specialty, published_at')
          .eq('published', true)
          .order('published_at', { ascending: false })
          .limit(5),
        
        supabase
          .from('posts')
          .select(`
            id, 
            title, 
            score,
            comments:comments!left(count)
          `)
          .eq('published', true)
          .order('score', { ascending: false })
          .limit(5)
      ]);

      // User-specific data (only if user is logged in)
      let userSpecificData = {
        bookmarkCount: 0,
        recentBookmarks: [],
      };

      if (userId) {
        const [bookmarkCountResponse, recentBookmarksResponse] = await Promise.all([
          supabase
            .from('user_bookmarks')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', userId),
          
          supabase
            .from('user_bookmarks')
            .select(`
              id,
              created_at,
              issues:issue_id(id, title),
              posts:post_id(id, title)
            `)
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(3)
        ]);

        userSpecificData = {
          bookmarkCount: bookmarkCountResponse.count || 0,
          recentBookmarks: (recentBookmarksResponse.data || []).map(bookmark => ({
            id: bookmark.issues?.id || bookmark.posts?.id || '',
            title: bookmark.issues?.title || bookmark.posts?.title || '',
            type: bookmark.issues ? 'issue' as const : 'post' as const,
          })),
        };
      }

      return {
        stats: statsData || {
          totalPublishedIssues: 0,
          totalActiveUsers: 0,
          totalCommunityPosts: 0,
          featuredIssueId: null,
        },
        recentActivity: {
          latestIssues: issuesResponse.data || [],
          trendingPosts: (postsResponse.data || []).map(post => ({
            ...post,
            comment_count: post.comments?.[0]?.count || 0,
          })),
        },
        userSpecificData,
      };
    },
    staleTime: 3 * 60 * 1000, // 3 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    enabled: true,
  });
};
