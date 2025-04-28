import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Comment } from '@/types/issue';
import { toast } from '@/hooks/use-toast';

export const useComments = (entityId: string, entityType: 'article' | 'issue' = 'article') => {
  const queryClient = useQueryClient();

  const { data: comments = [], isLoading } = useQuery({
    queryKey: ['comments', entityId, entityType],
    queryFn: async () => {
      let entityIdField = entityType === 'article' ? 'article_id' : 'issue_id';
      
      // First, verify if the entity exists
      if (entityType === 'article') {
        const { data: entityExists, error: entityError } = await supabase
          .from('articles')
          .select('id')
          .eq('id', entityId)
          .maybeSingle();
        
        if (entityError) throw entityError;
        
        if (!entityExists) {
          console.error(`Article with ID ${entityId} not found`);
          return [];
        }
      } else {
        const { data: entityExists, error: entityError } = await supabase
          .from('issues')
          .select('id')
          .eq('id', entityId)
          .maybeSingle();
        
        if (entityError) throw entityError;
        
        if (!entityExists) {
          console.error(`Issue with ID ${entityId} not found`);
          return [];
        }
      }
      
      // Fixed the deep recursion issue by using a more precise type casting
      const { data, error } = await supabase
        .from('comments')
        .select(`
          id,
          content,
          created_at,
          user_id,
          article_id,
          issue_id,
          profiles(id, full_name, avatar_url)
        `)
        .eq(entityIdField, entityId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as Comment[];
    }
  });

  const addComment = useMutation({
    mutationFn: async (content: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      
      let entityIdField = entityType === 'article' ? 'article_id' : 'issue_id';
      
      // Verify entity exists before inserting
      if (entityType === 'article') {
        const { data: entityExists, error: entityError } = await supabase
          .from('articles')
          .select('id')
          .eq('id', entityId)
          .maybeSingle();
          
        if (entityError) throw entityError;
        if (!entityExists) throw new Error(`Article with ID ${entityId} not found`);
      } else {
        const { data: entityExists, error: entityError } = await supabase
          .from('issues')
          .select('id')
          .eq('id', entityId)
          .maybeSingle();
          
        if (entityError) throw entityError;
        if (!entityExists) throw new Error(`Issue with ID ${entityId} not found`);
      }
      
      // Create the comment object with the right field set
      const commentData: any = {
        content,
        user_id: user.id
      };
      
      // Set either article_id or issue_id based on entityType
      commentData[entityIdField] = entityId;
      
      const { error } = await supabase
        .from('comments')
        .insert(commentData);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', entityId, entityType] });
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
      queryClient.invalidateQueries({ queryKey: ['comments', entityId, entityType] });
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
