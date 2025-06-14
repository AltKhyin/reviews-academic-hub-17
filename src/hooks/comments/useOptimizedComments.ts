
// ABOUTME: Optimized comments hook with consolidated queries and proper type safety
// Reduces comment-related API calls and improves performance

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type EntityType = 'post' | 'issue' | 'article';

export interface OptimizedComment {
  id: string;
  content: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  parent_id: string | null;
  score: number;
  // Enhanced fields
  author_name: string | null;
  author_avatar: string | null;
  user_vote: number | null;
  reply_count: number;
}

export const useOptimizedComments = (entityId: string, entityType: EntityType) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['optimized-comments', entityId, entityType, user?.id],
    queryFn: async (): Promise<OptimizedComment[]> => {
      if (!entityId) return [];

      try {
        // Build query based on entity type
        const columnMap = {
          post: 'post_id',
          issue: 'issue_id', 
          article: 'article_id'
        };

        const column = columnMap[entityType];
        if (!column) throw new Error(`Invalid entity type: ${entityType}`);

        const { data: comments, error } = await supabase
          .from('comments')
          .select(`
            *,
            profiles!comments_user_id_fkey(full_name, avatar_url),
            comment_votes!left(value, user_id)
          `)
          .eq(column, entityId)
          .order('created_at', { ascending: true });

        if (error) throw error;

        // Process comments with enhanced data
        const processedComments: OptimizedComment[] = (comments || []).map(comment => {
          const profile = Array.isArray(comment.profiles) ? comment.profiles[0] : comment.profiles;
          const votes = Array.isArray(comment.comment_votes) ? comment.comment_votes : [];
          
          return {
            ...comment,
            author_name: profile?.full_name || null,
            author_avatar: profile?.avatar_url || null,
            user_vote: votes.find((v: any) => v.user_id === user?.id)?.value || null,
            reply_count: 0, // Will be calculated if needed
          };
        });

        return processedComments;
      } catch (error) {
        console.error('Comments fetch error:', error);
        throw error;
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    enabled: !!entityId,
  });
};
