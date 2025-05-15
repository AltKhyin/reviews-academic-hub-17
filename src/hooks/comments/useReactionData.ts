
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useReactionData = (entityId: string, entityType: 'article' | 'issue' = 'issue') => {
  const { data: reactions = [], isLoading: isLoadingReactions } = useQuery({
    queryKey: ['entity-reactions', entityId, entityType],
    queryFn: async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return [];

        let query = supabase
          .from('user_article_reactions')
          .select('reaction_type')
          .eq('user_id', user.id);
        
        // Apply the correct filter based on entityType
        if (entityType === 'article') {
          query = query.eq('article_id', entityId).is('issue_id', null);
        } else {
          query = query.eq('issue_id', entityId).is('article_id', null);
        }
        
        const { data, error } = await query;
        
        if (error) throw error;
        return data?.map(r => r.reaction_type) || [];
      } catch (err) {
        console.error('Error fetching reactions:', err);
        return [];
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1
  });

  return { reactions, isLoadingReactions };
};
