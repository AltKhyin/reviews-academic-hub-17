
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const useBookmarkData = (entityId: string, entityType: 'article' | 'issue' = 'issue') => {
  const queryClient = useQueryClient();
  
  const { data: isBookmarked = false, isLoading: isLoadingBookmark } = useQuery({
    queryKey: ['entity-bookmark', entityId, entityType],
    queryFn: async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return false;

        let query = supabase
          .from('user_bookmarks')
          .select('id')
          .eq('user_id', user.id);
        
        // Apply the correct filter based on entityType
        if (entityType === 'article') {
          query = query.eq('article_id', entityId).is('issue_id', null);
        } else {
          query = query.eq('issue_id', entityId).is('article_id', null);
        }
        
        const { data, error } = await query.maybeSingle();
        
        if (error) throw error;
        return !!data;
      } catch (err) {
        console.error('Error fetching bookmark status:', err);
        return false;
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1
  });

  const bookmarkMutation = useMutation({
    mutationFn: async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        if (isBookmarked) {
          // Remove bookmark
          let deleteQuery = supabase
            .from('user_bookmarks')
            .delete()
            .eq('user_id', user.id);
            
          if (entityType === 'article') {
            deleteQuery = deleteQuery.eq('article_id', entityId).is('issue_id', null);
          } else {
            deleteQuery = deleteQuery.eq('issue_id', entityId).is('article_id', null);
          }
          
          const { error } = await deleteQuery;
            
          if (error) throw error;
          return { added: false };
        } else {
          // Add bookmark
          const payload: any = { 
            user_id: user.id
          };
          
          if (entityType === 'article') {
            payload.article_id = entityId;
          } else {
            payload.issue_id = entityId;
          }
          
          console.log("Bookmark payload:", payload);
          const { error } = await supabase
            .from('user_bookmarks')
            .insert(payload);
            
          if (error) throw error;
          return { added: true };
        }
      } catch (err) {
        console.error('Error updating bookmark:', err);
        throw err;
      }
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['entity-bookmark', entityId, entityType] });
      toast({
        description: result.added ? "Artigo salvo nos favoritos" : "Artigo removido dos favoritos",
      });
    },
    onError: (error) => {
      console.error('Bookmark error:', error);
      toast({
        variant: "destructive",
        description: "Não foi possível atualizar os favoritos",
      });
    }
  });

  return { isBookmarked, isLoadingBookmark, bookmarkMutation };
};
