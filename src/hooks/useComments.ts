
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Comment } from '@/types/issue';

export const useComments = (articleId: string) => {
  const queryClient = useQueryClient();

  const { data: comments = [], isLoading } = useQuery({
    queryKey: ['comments', articleId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          user:profiles(id, full_name, avatar_url)
        `)
        .eq('article_id', articleId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as unknown as Comment[];
    }
  });

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
    
    queryClient.invalidateQueries({ queryKey: ['comments', articleId] });
  };

  return { comments, isLoading, addComment };
};
