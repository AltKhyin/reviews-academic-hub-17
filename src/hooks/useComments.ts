
import { useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Comment, EntityType } from '@/types/commentTypes';
import { useToast } from '@/hooks/use-toast';
import { fetchCommentsData } from '@/utils/commentFetch';
import { organizeComments, getEntityIdField, buildCommentData } from '@/utils/commentHelpers';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Custom hook for managing comments for different entity types
 */
export const useComments = (entityId: string, entityType: EntityType = 'article') => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();
  const entityIdField = getEntityIdField(entityType);

  // Validate entity information early in the hook
  if (!entityId) {
    console.error(`useComments hook called without entityId: ${entityId}, entityType: ${entityType}`);
  }

  // Query for fetching comments
  const commentQuery = useQuery({
    queryKey: ['comments', entityId, entityType],
    queryFn: async () => {
      console.log(`Fetching comments for ${entityType} with ID: ${entityId}`);
      return fetchCommentsData(entityId, entityType);
    },
    refetchOnWindowFocus: false,
    staleTime: 30000,
    enabled: !!entityId // Only enable query if entityId exists
  });

  // Organize comments into a tree structure
  const organizedComments = useMemo(() => {
    return organizeComments(commentQuery.data || { comments: [], userVotes: [] });
  }, [commentQuery.data]);

  // Add comment mutation
  const addCommentMutation = useMutation({
    mutationFn: async (content: string) => {
      // Validate required data
      if (!entityId || !entityType) {
        console.error(`Cannot add comment: Missing entity info. entityId: ${entityId}, entityType: ${entityType}`);
        throw new Error("Falha ao adicionar comentário: Informações da entidade ausentes.");
      }
      
      if (!user) throw new Error('Not authenticated');

      // Use the buildCommentData utility to create a properly structured comment
      const commentData = buildCommentData(content, user.id, entityType, entityId);
      console.log('Comment data being sent to Supabase:', commentData);

      const { error: commentError, data: newComment } = await supabase
        .from('comments')
        .insert(commentData)
        .select()
        .single();

      if (commentError) {
        console.error('Error creating comment:', commentError);
        throw commentError;
      }

      // Auto-upvote the user's own comment
      if (newComment) {
        await supabase.from('comment_votes').insert({
          user_id: user.id,
          comment_id: newComment.id,
          value: 1,
        });
      }

      return newComment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', entityId, entityType] });
      toast({
        title: "Comentário adicionado",
        description: "Seu comentário foi publicado com sucesso.",
        duration: 3000,
      });
    },
    onError: (error: Error) => {
      console.error('Error in addComment mutation:', error);
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
        duration: 5000,
      });
    }
  });

  // Reply to comment mutation
  const replyToCommentMutation = useMutation({
    mutationFn: async ({ parentId, content }: { parentId: string, content: string }) => {
      if (!entityId || !entityType) {
        console.error(`Cannot add reply: Missing entity info. entityId: ${entityId}, entityType: ${entityType}`);
        throw new Error("Falha ao adicionar resposta: Informações da entidade ausentes.");
      }
      
      if (!user) throw new Error('Not authenticated');

      // Use the buildCommentData utility with parentId
      const commentData = buildCommentData(content, user.id, entityType, entityId, parentId);
      console.log('Reply data being sent to Supabase:', commentData);

      const { error: commentError, data: newComment } = await supabase
        .from('comments')
        .insert(commentData)
        .select()
        .single();

      if (commentError) {
        console.error('Error creating reply:', commentError);
        throw commentError;
      }

      // Auto-upvote the user's own reply
      if (newComment) {
        await supabase
          .from('comment_votes')
          .insert({
            user_id: user.id,
            comment_id: newComment.id,
            value: 1
          });
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
    onError: (error: Error) => {
      console.error('Error in replyToComment mutation:', error);
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
        duration: 5000,
      });
    }
  });

  // Delete comment mutation
  const deleteCommentMutation = useMutation({
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
        title: 'Sucesso',
        description: 'Comentário excluído com sucesso.',
        duration: 3000,
      });
    },
    onError: (error: Error) => {
      console.error('Error in deleteComment mutation:', error);
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
        duration: 5000,
      });
    },
  });

  // Vote on comment mutation
  const voteCommentMutation = useMutation({
    mutationFn: async ({ commentId, value }: { commentId: string; value: 1 | -1 | 0 }) => {
      if (!user) throw new Error('Not authenticated');

      const { data: existingVote, error: checkError } = await supabase
        .from('comment_votes')
        .select('*')
        .eq('user_id', user.id)
        .eq('comment_id', commentId)
        .maybeSingle();

      if (checkError) throw checkError;

      // If removing vote (value=0), delete the vote record
      if (value === 0 && existingVote) {
        const { error: deleteError } = await supabase
          .from('comment_votes')
          .delete()
          .eq('user_id', user.id)
          .eq('comment_id', commentId);

        if (deleteError) throw deleteError;
        return { success: true };
      }

      // If voting (up/down), upsert the vote
      if (value !== 0) {
        const { error: upsertError } = await supabase
          .from('comment_votes')
          .upsert(
            {
              user_id: user.id,
              comment_id: commentId,
              value,
            },
            { onConflict: 'user_id,comment_id', ignoreDuplicates: false }
          );

        if (upsertError) throw upsertError;
      }

      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', entityId, entityType] });
    },
    onError: (error: Error) => {
      console.error('Error in voteComment mutation:', error);
      toast({
        title: 'Erro ao votar',
        description: error.message,
        variant: 'destructive',
        duration: 5000,
      });
    },
  });

  // Return data and functions for components to use
  return {
    comments: organizedComments,
    isLoading: commentQuery.isLoading,
    addComment: (content: string) => addCommentMutation.mutateAsync(content),
    replyToComment: ({ parentId, content }: { parentId: string, content: string }) => {
      return replyToCommentMutation.mutateAsync({ parentId, content });
    },
    deleteComment: (commentId: string) => deleteCommentMutation.mutateAsync(commentId),
    voteComment: ({ commentId, value }: { commentId: string; value: 1 | -1 | 0 }) => {
      return voteCommentMutation.mutateAsync({ commentId, value });
    },
    isAddingComment: addCommentMutation.isPending,
    isDeletingComment: deleteCommentMutation.isPending,
    isVoting: voteCommentMutation.isPending,
    isReplying: replyToCommentMutation.isPending
  };
};
