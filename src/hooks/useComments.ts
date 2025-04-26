
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

export const useComments = (articleId: string) => {
  const queryClient = useQueryClient();

  const addComment = async (content: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('comments')
      .insert({
        content,
        article_id: articleId,
        user_id: user.id
      });

    if (error) throw error;
    
    // Invalidate comments query to trigger a refresh
    queryClient.invalidateQueries({ queryKey: ['comments', articleId] });
  };

  return { addComment };
};
