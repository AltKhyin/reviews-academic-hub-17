
// ABOUTME: Optimized comments hook with proper type definitions and caching
import { useOptimizedQuery, queryKeys, queryConfigs } from '../useOptimizedQuery';
import { supabase } from '@/integrations/supabase/client';

interface Comment {
  id: string;
  content: string;
  user_id: string;
  score: number;
  created_at: string;
  parent_id?: string;
  author?: {
    full_name?: string;
    avatar_url?: string;
  };
}

interface UseOptimizedCommentsProps {
  entityId: string;
  entityType: 'issue' | 'post' | 'article';
  limit?: number;
  orderBy?: 'created_at' | 'score';
  ascending?: boolean;
}

export const useOptimizedComments = ({
  entityId,
  entityType,
  limit = 50,
  orderBy = 'created_at',
  ascending = false
}: UseOptimizedCommentsProps) => {
  const { data, isLoading, error } = useOptimizedQuery<Comment[]>(
    queryKeys.comments(entityId, entityType),
    async (): Promise<Comment[]> => {
      try {
        let query = supabase
          .from('comments')
          .select(`
            id,
            content,
            user_id,
            score,
            created_at,
            parent_id,
            profiles:user_id (
              full_name,
              avatar_url
            )
          `);

        // Add entity-specific filters
        if (entityType === 'issue') {
          query = query.eq('issue_id', entityId);
        } else if (entityType === 'post') {
          query = query.eq('post_id', entityId);
        } else if (entityType === 'article') {
          query = query.eq('article_id', entityId);
        }

        const { data: comments, error } = await query
          .order(orderBy, { ascending })
          .limit(limit);

        if (error) {
          console.warn('Comments fetch error:', error);
          return [];
        }

        // Transform the data to match our interface
        return (comments || []).map(comment => ({
          id: comment.id,
          content: comment.content,
          user_id: comment.user_id,
          score: comment.score,
          created_at: comment.created_at,
          parent_id: comment.parent_id,
          author: comment.profiles ? {
            full_name: comment.profiles.full_name,
            avatar_url: comment.profiles.avatar_url,
          } : undefined,
        }));
      } catch (error) {
        console.warn('Comments fetch error:', error);
        return [];
      }
    },
    {
      ...queryConfigs.realtime,
      enabled: Boolean(entityId && entityType),
    }
  );

  return {
    comments: data || [],
    isLoading,
    error,
    hasError: Boolean(error),
  };
};
