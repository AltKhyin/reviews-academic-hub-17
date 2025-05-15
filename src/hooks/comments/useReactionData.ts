
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useReactionData = (articleId: string) => {
  const { data: reactions = [], isLoading: isLoadingReactions } = useQuery({
    queryKey: ['issue-reactions', articleId],
    queryFn: async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return [];

        const { data, error } = await supabase
          .from('user_article_reactions')
          .select('reaction_type')
          .eq('issue_id', articleId)
          .eq('user_id', user.id);
        
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
