
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const useCommentActions = (entityId: string, entityType: 'article' | 'issue' = 'article') => {
  const queryClient = useQueryClient();
  const entityIdField = entityType === 'article' ? 'article_id' : 'issue_id';

  // Add a new comment
  const addComment = useMutation({
    mutationFn: async (content: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      
      // Create the comment object with the right fields
      const commentData: any = {
        content,
        user_id: user.id,
        score: 0 // Initialize with 0, will be updated by trigger after upvote
      };
      
      // Set either article_id or issue_id based on entityType
      commentData[entityIdField] = entityId;
      
      // Insert the comment
      const { error: commentError, data: newComment } = await supabase
        .from('comments')
        .insert(commentData)
        .select()
        .single();

      if (commentError) throw commentError;
      
      // Add the author's upvote
      if (newComment) {
        const { error: voteError } = await supabase
          .from('comment_votes')
          .insert({
            user_id: user.id,
            comment_id: newComment.id,
            value: 1
          });
        
        if (voteError) console.error('Error adding auto-upvote:', voteError);
      }
      
      return newComment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', entityId, entityType] });
      toast({
        title: "Sucesso",
        description: "Seu comentário foi adicionado.",
        duration: 3000, // Auto-dismiss after 3 seconds
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
        duration: 5000, // Auto-dismiss after 5 seconds
      });
    }
  });

  // Reply to a comment
  const replyToComment = useMutation({
    mutationFn: async ({ parentId, content }: { parentId: string, content: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      
      // Create the reply comment object
      const commentData: any = {
        content,
        user_id: user.id,
        parent_id: parentId,
        score: 0 // Initialize with 0, will be updated by trigger after upvote
      };
      
      // Set either article_id or issue_id based on entityType
      commentData[entityIdField] = entityId;
      
      // Insert the comment
      const { error: commentError, data: newComment } = await supabase
        .from('comments')
        .insert(commentData)
        .select()
        .single();

      if (commentError) throw commentError;
      
      // Add the author's upvote
      if (newComment) {
        const { error: voteError } = await supabase
          .from('comment_votes')
          .insert({
            user_id: user.id,
            comment_id: newComment.id,
            value: 1
          });
        
        if (voteError) console.error('Error adding auto-upvote:', voteError);
      }
      
      return newComment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', entityId, entityType] });
      toast({
        title: "Resposta adicionada",
        description: "Sua resposta foi publicada com sucesso.",
        duration: 3000, // Auto-dismiss after 3 seconds
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
        duration: 5000, // Auto-dismiss after 5 seconds
      });
    }
  });

  // Delete a comment
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
        title: "Sucesso",
        description: "Comentário excluído com sucesso.",
        duration: 3000, // Auto-dismiss after 3 seconds
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
        duration: 5000, // Auto-dismiss after 5 seconds
      });
    }
  });

  // Vote on a comment
  const voteComment = useMutation({
    mutationFn: async ({ commentId, value }: { commentId: string; value: 1 | -1 | 0 }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      
      // Check if the user has already voted on this comment
      const { data: existingVote, error: checkError } = await supabase
        .from('comment_votes')
        .select('*')
        .eq('user_id', user.id)
        .eq('comment_id', commentId)
        .maybeSingle();
        
      if (checkError) throw checkError;
      
      // If value is 0, delete the vote if it exists
      if (value === 0 && existingVote) {
        const { error: deleteError } = await supabase
          .from('comment_votes')
          .delete()
          .eq('user_id', user.id)
          .eq('comment_id', commentId);
          
        if (deleteError) throw deleteError;
        return { success: true };
      }
      
      // If value is not 0, upsert the vote
      if (value !== 0) {
        const { error: upsertError } = await supabase
          .from('comment_votes')
          .upsert({
            user_id: user.id,
            comment_id: commentId,
            value
          }, { 
            onConflict: 'user_id,comment_id', 
            ignoreDuplicates: false 
          });
          
        if (upsertError) throw upsertError;
      }
      
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', entityId, entityType] });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao votar",
        description: error.message,
        variant: "destructive",
        duration: 5000, // Auto-dismiss after 5 seconds
      });
    }
  });

  return {
    addComment: (content: string) => addComment.mutate(content),
    replyToComment: (parentId: string, content: string) => 
      replyToComment.mutate({ parentId, content }),
    deleteComment: (commentId: string) => deleteComment.mutate(commentId),
    voteComment: async (commentId: string, value: 1 | -1 | 0) => {
      return voteComment.mutate({ commentId, value });
    },
    isAddingComment: addComment.isPending,
    isDeletingComment: deleteComment.isPending,
    isVoting: voteComment.isPending,
    isReplying: replyToComment.isPending
  };
};
