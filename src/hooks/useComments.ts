
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Comment } from '@/types/issue';
import { toast } from '@/hooks/use-toast';

export const useComments = (articleId: string) => {
  const queryClient = useQueryClient();

  const { data: comments = [], isLoading } = useQuery({
    queryKey: ['comments', articleId],
    queryFn: async () => {
      // First, verify if the article exists
      const { data: articleExists, error: articleError } = await supabase
        .from('articles')
        .select('id')
        .eq('id', articleId)
        .maybeSingle();
      
      if (articleError) throw articleError;
      
      if (!articleExists) {
        console.error(`Article with ID ${articleId} not found`);
        return [];
      }
      
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          user:profiles(id, full_name, avatar_url)
        `)
        .eq('article_id', articleId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Comment[];
    }
  });

  const addComment = useMutation({
    mutationFn: async (content: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      
      // Verify article exists before inserting
      const { data: articleExists, error: articleError } = await supabase
        .from('articles')
        .select('id')
        .eq('id', articleId)
        .maybeSingle();
        
      if (articleError) throw articleError;
      if (!articleExists) throw new Error(`Article with ID ${articleId} not found`);
      
      const { error } = await supabase
        .from('comments')
        .insert({
          content,
          article_id: articleId,
          user_id: user.id
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', articleId] });
      toast({
        title: "Success",
        description: "Your comment has been added.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const deleteComment = useMutation({
    mutationFn: async (commentId: string) => {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', articleId] });
      toast({
        title: "Success",
        description: "Comment deleted successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  return {
    comments,
    isLoading,
    addComment: addComment.mutate,
    deleteComment: deleteComment.mutate,
    isAddingComment: addComment.isPending,
    isDeletingComment: deleteComment.isPending
  };
};
