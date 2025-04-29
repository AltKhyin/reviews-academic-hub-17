
import { useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Comment, CommentVote, EntityType } from '@/types/comment';
import { toast } from '@/hooks/use-toast';
import { fetchCommentsData, getEntityIdField, organizeComments } from '@/utils/commentUtils';

export const useComments = (entityId: string, entityType: EntityType = 'article') => {
  const queryClient = useQueryClient();
  const entityIdField = getEntityIdField(entityType);

  // Fetch comments for the entity with votes for current user
  const { data: commentsData, isLoading } = useQuery({
    queryKey: ['comments', entityId, entityType],
    queryFn: async () => {
      return fetchCommentsData(entityId, entityType);
    },
    refetchOnWindowFocus: false,
    staleTime: 30000
  });

  // Organize comments into a hierarchical structure
  const organizedComments = useMemo(() => {
    return organizeComments(commentsData || { comments: [], userVotes: [] });
  }, [commentsData]);

  // Add a new comment
  const addComment = useMutation({
    mutationFn: async (content: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      
      // Create the comment object with the right fields
      const commentData: {
        content: string;
        user_id: string;
        score: number;
        [key: string]: any;
      } = {
        content,
        user_id: user.id,
        score: 0 // Initialize with 0, will be updated by trigger after upvote
      };
      
      // Set either article_id, issue_id, or post_id based on entityType
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
        duration: 3000,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao adicionar comentário",
        variant: "destructive",
        duration: 5000,
      });
    }
  });

  // Reply to a comment
  const replyToComment = useMutation({
    mutationFn: async ({ parentId, content }: { parentId: string, content: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      
      // Create the reply comment object
      const commentData = {
        content,
        user_id: user.id,
        parent_id: parentId,
        score: 0,
        [entityIdField]: entityId
      };
      
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
        duration: 3000,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao adicionar resposta",
        variant: "destructive",
        duration: 5000,
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
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', entityId, entityType] });
      toast({
        title: "Sucesso",
        description: "Comentário excluído com sucesso.",
        duration: 3000,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao excluir comentário",
        variant: "destructive",
        duration: 5000,
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
    onError: (error: any) => {
      toast({
        title: "Erro ao votar",
        description: error.message || "Erro ao registrar voto",
        variant: "destructive",
        duration: 5000,
      });
    }
  });

  return {
    comments: organizedComments,
    isLoading,
    addComment: addComment.mutateAsync,
    replyToComment: replyToComment.mutateAsync,
    deleteComment: deleteComment.mutateAsync,
    voteComment: voteComment.mutateAsync,
    isAddingComment: addComment.isPending,
    isDeletingComment: deleteComment.isPending,
    isVoting: voteComment.isPending,
    isReplying: replyToComment.isPending
  };
};
