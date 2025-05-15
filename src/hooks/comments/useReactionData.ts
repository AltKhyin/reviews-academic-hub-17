import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const useReactionData = (entityId: string, entityType: 'article' | 'issue' = 'issue') => {
  const queryClient = useQueryClient();
  
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

  const reactionMutation = useMutation({
    mutationFn: async ({ type }: { type: string }) => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        const currentReactions = reactions || [];
        const hasReaction = currentReactions.includes(type);
        
        // First, remove any existing reactions (except want_more if bookmarking)
        if (!hasReaction) {
          // Remove existing reactions that are mutually exclusive with this one
          // Bookmarks are separate and handled elsewhere
          const reactionsToRemove = ['like', 'dislike', 'want_more'].filter(r => 
            // If the new reaction is 'want_more', don't delete existing 'want_more'
            // Otherwise delete all existing reactions
            r !== 'want_more' || type !== 'want_more'
          );
          
          for (const reactionToRemove of reactionsToRemove) {
            if (currentReactions.includes(reactionToRemove)) {
              let deleteQuery = supabase
                .from('user_article_reactions')
                .delete()
                .eq('user_id', user.id)
                .eq('reaction_type', reactionToRemove);
                
              if (entityType === 'article') {
                deleteQuery = deleteQuery.eq('article_id', entityId).is('issue_id', null);
              } else {
                deleteQuery = deleteQuery.eq('issue_id', entityId).is('article_id', null);
              }
              
              await deleteQuery;
            }
          }
        }
        
        if (hasReaction) {
          // Remove the reaction if it already exists
          let deleteQuery = supabase
            .from('user_article_reactions')
            .delete()
            .eq('user_id', user.id)
            .eq('reaction_type', type);
            
          if (entityType === 'article') {
            deleteQuery = deleteQuery.eq('article_id', entityId).is('issue_id', null);
          } else {
            deleteQuery = deleteQuery.eq('issue_id', entityId).is('article_id', null);
          }
          
          const { error } = await deleteQuery;
          
          if (error) throw error;
          return { added: false, type };
        } else {
          // Add the new reaction
          const payload: any = { 
            user_id: user.id,
            reaction_type: type
          };
          
          if (entityType === 'article') {
            payload.article_id = entityId;
          } else {
            payload.issue_id = entityId;
          }
          
          console.log("Reaction payload:", payload);
          const { error } = await supabase
            .from('user_article_reactions')
            .insert(payload);
          
          if (error) throw error;
          return { added: true, type };
        }
      } catch (err) {
        console.error('Error managing reaction:', err);
        throw err;
      }
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['entity-reactions', entityId, entityType] });
      toast({
        description: result.added 
          ? "Sua reação foi registrada" 
          : "Sua reação foi removida",
      });
    },
    onError: (error) => {
      console.error('Reaction error:', error);
      toast({
        variant: "destructive",
        description: "Não foi possível registrar sua reação",
      });
    }
  });

  return { reactions, isLoadingReactions, reactionMutation };
};
