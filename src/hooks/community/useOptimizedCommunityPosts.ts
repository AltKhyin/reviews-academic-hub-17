
// ABOUTME: Optimized community posts hook that consolidates multiple API calls into efficient queries
// Reduces API cascade from 60+ requests to <5 requests per page load

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface OptimizedPost {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  flair_id: string | null;
  published: boolean;
  score: number;
  image_url: string | null;
  video_url: string | null;
  pinned: boolean;
  pinned_at: string | null;
  // Enhanced fields from JOINs
  author_name: string | null;
  author_avatar: string | null;
  flair_name: string | null;
  flair_color: string | null;
  user_vote: number | null;
  bookmark_date: string | null;
  comment_count: number;
}

interface OptimizedPostsResult {
  posts: OptimizedPost[];
  totalCount: number;
  hasMore: boolean;
  userInteractions: {
    bookmarkedPosts: Set<string>;
    votedPosts: Map<string, number>;
    adminPermissions: boolean;
  };
}

export const useOptimizedCommunityPosts = (
  tab: string = 'latest',
  searchTerm?: string,
  limit: number = 20
) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['community-posts-optimized', tab, searchTerm, limit, user?.id],
    queryFn: async (): Promise<OptimizedPostsResult> => {
      // Single consolidated query for all post data with corrected relationship names
      let query = supabase
        .from('posts')
        .select(`
          *,
          profiles:user_id(full_name, avatar_url),
          post_flairs(name, color),
          post_votes!left(value),
          post_bookmarks!left(created_at)
        `)
        .eq('published', true);

      // Apply tab-based filtering
      switch (tab) {
        case 'popular':
          query = query.order('score', { ascending: false });
          break;
        case 'oldest':
          query = query.order('created_at', { ascending: true });
          break;
        case 'my':
          if (user?.id) {
            query = query.eq('user_id', user.id);
          }
          break;
        default: // latest
          query = query.order('created_at', { ascending: false });
      }

      // Apply search filtering
      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,content.ilike.%${searchTerm}%`);
      }

      // Apply pagination
      query = query.range(0, limit - 1);

      const { data: rawPosts, error, count } = await query;

      if (error) {
        console.error('Posts query error:', error);
        throw error;
      }

      // Get comment counts separately to avoid complex joins
      const postIds = rawPosts?.map(p => p.id) || [];
      let commentCounts: Record<string, number> = {};
      
      if (postIds.length > 0) {
        const { data: comments } = await supabase
          .from('comments')
          .select('post_id')
          .in('post_id', postIds);
          
        if (comments) {
          commentCounts = comments.reduce((acc, comment) => {
            acc[comment.post_id] = (acc[comment.post_id] || 0) + 1;
            return acc;
          }, {} as Record<string, number>);
        }
      }

      // Process and normalize data safely
      const posts: OptimizedPost[] = (rawPosts || []).map(post => {
        const profiles = Array.isArray(post.profiles) ? post.profiles[0] : post.profiles;
        const flair = Array.isArray(post.post_flairs) ? post.post_flairs[0] : post.post_flairs;
        const votes = Array.isArray(post.post_votes) ? post.post_votes : [];
        const bookmarks = Array.isArray(post.post_bookmarks) ? post.post_bookmarks : [];

        return {
          ...post,
          author_name: profiles?.full_name || null,
          author_avatar: profiles?.avatar_url || null,
          flair_name: flair?.name || null,
          flair_color: flair?.color || null,
          user_vote: votes.find((v: any) => v.user_id === user?.id)?.value || null,
          bookmark_date: bookmarks.find((b: any) => b.user_id === user?.id)?.created_at || null,
          comment_count: commentCounts[post.id] || 0,
        };
      });

      // Extract user interactions for easy lookup
      const bookmarkedPosts = new Set(
        posts
          .filter(p => p.bookmark_date)
          .map(p => p.id)
      );

      const votedPosts = new Map(
        posts
          .filter(p => p.user_vote !== null)
          .map(p => [p.id, p.user_vote!])
      );

      // Check admin permissions (single query)
      let adminPermissions = false;
      if (user?.id) {
        const { data: adminData } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
        
        adminPermissions = adminData?.role === 'admin' || adminData?.role === 'moderator';
      }

      return {
        posts,
        totalCount: count || 0,
        hasMore: posts.length === limit,
        userInteractions: {
          bookmarkedPosts,
          votedPosts,
          adminPermissions,
        },
      };
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // Updated from cacheTime
    enabled: true,
  });
};
