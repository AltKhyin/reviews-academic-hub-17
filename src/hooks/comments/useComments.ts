
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Comment } from '@/types/commentTypes';

export const useComments = (entityId: string, entityType: 'article' | 'issue' = 'issue') => {
  const queryKey = ['comments', entityId, entityType];

  const { data: comments = [], isLoading, error, refetch } = useQuery({
    queryKey,
    queryFn: async () => {
      try {
        let query = supabase
          .from('comments')
          .select(`
            id,
            content,
            created_at,
            updated_at,
            user_id,
            parent_id,
            score,
            profiles:user_id (
              id,
              full_name,
              avatar_url
            )
          `)
          .order('score', { ascending: false })
          .order('created_at', { ascending: false });

        // Apply the correct filter based on entityType
        if (entityType === 'article') {
          query = query.eq('article_id', entityId).is('issue_id', null);
        } else {
          query = query.eq('issue_id', entityId).is('article_id', null);
        }

        const { data, error } = await query;
        
        if (error) throw error;
        
        return data as Comment[];
      } catch (err) {
        console.error('Error fetching comments:', err);
        return [];
      }
    },
    staleTime: 1000 * 60 * 5 // 5 minutes
  });

  return { comments, isLoading, error, refetch };
};
