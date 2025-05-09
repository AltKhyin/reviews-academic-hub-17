import { useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Comment, CommentVote, EntityType } from '@/types/commentTypes';
import { useToast } from '@/hooks/use-toast';
import { fetchCommentsData } from '@/utils/commentFetch';
import { organizeComments, getEntityIdField, buildCommentData } from '@/utils/commentHelpers';

export const useComments = (entityId: string, entityType: EntityType = 'article') => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: commentsData, isLoading } = useQuery({
    queryKey: ['comments', entityId, entityType],
    queryFn: async () => {
      console.log(`Fetching comments for ${entityType} with ID: ${entityId}`);
      return fetchCommentsData(entityId, entityType);
    },
    refetchOnWindowFocus: false,
    staleTime: 30000,
  });

  const organizedComments = useMemo(() => {
    return organizeComments(commentsData || { comments: [], userVotes: [] });
  }, [commentsData]);

  const addComment = useMutation({
    mutationFn: async (content: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const commentData: any = {
        content,
        user_id: user.id,
        score: 0,
      };

      if (entityType === 'article') {
        commentData.article_id = entityId;
      } else if (entityType === 'issue') {
        commentData.issue_id = entityId;
      } else if (entityType === 'post') {
        commentData.post_id = entityId;
      } else {
        throw new Error('Unknown entity type');
      }

      const { error: commentError, data: newComment } = await supabase
        .from('comments')
        .insert(commentData)
        .select()
        .single();

      if (commentError) throw commentError;

      await supabase.from('comment_votes').insert({
        user_id: user.id,
        comment_id: newComment.id,
        value: 1,
      });

      return newComment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', entityId, entityType] });
      toast({
        title: 'Comentário adicionado',
        description: 'Seu comentário foi publicado com sucesso.',
        duration: 3000,
      });
    },
    onError: (error: Error) => {
      console.error('Error in addComment mutation:', error);
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
        duration: 5000,
      });
    },
  });

  const replyToComment = useMutation({
    mutationFn: async ({ parentId, content }: { parentId: string; content: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const commentData: any = {
        content,
        parent_id: parentId,
        user_id: user.id,
        score: 0,
      };

      if (entityType === 'article') {
        commentData.article_id = entityId;
      } else if (entityType === 'issue') {
        commentData.issue_id = entityId;
      } else if (entityType === 'post') {
        commentData.post_id = entityId;
      }

      const { error: commentError, data: newComment } = await supabase
        .from('comments')
        .insert(commentData)
        .select()
        .single();

      if (commentError) throw commentError;

      await supabase.from('comment_votes').insert({
        user_id: user.id,
        comment_id: newComment.id,
        value: 1,
      });

      return newComment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', entityId, entityType] });
      toast({
        title: 'Resposta adicionada',
        description: 'Sua resposta foi publicada com sucesso.',
        duration: 3000,
      });
    },
    onError: (error: Error) => {
      console.error('Error in replyToComment mutation:', error);
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
        duration: 5000,
      });
    },
  });

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

  const voteComment = useMutation({
    mutationFn: async ({ commentId, value }: { commentId: string; value: 1 | -1 | 0 }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: existingVote, error: checkError } = await supabase
        .from('comment_votes')
        .select('*')
        .eq('user_id', user.id)
        .eq('comment_id', commentId)
        .maybeSingle();

      if (checkError) throw checkError;

      if (value === 0 && existingVote) {
        const { error: deleteError } = await supabase
          .from('comment_votes')
          .delete()
          .eq('user_id', user.id)
          .eq('comment_id', commentId);

        if (deleteError) throw deleteError;
        return { success: true };
      }

      if (value !== 0) {
        const { error: upsertError } = await supabase
          .from('comment_votes')
          .upsert(
            {
              user_id: user.id,
              comment_id: commentId,
              value,
            },
            {
              onConflict: 'user_id,comment_id',
              ignoreDuplicates: false,
            }
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

  return {
    comments: organizedComments,
    isLoading,
    addComment: (content: string) => addComment.mutateAsync(content),
    replyToComment: ({ parentId, content }: { parentId: string; content: string }) => {
      return replyToComment.mutateAsync({ parentId, content });
    },
    deleteComment: (commentId: string) => deleteComment.mutateAsync(commentId),
    voteComment: ({ commentId, value }: { commentId: string; value: 1 | -1 | 0 }) => {
      return voteComment.mutateAsync({ commentId, value });
    },
    isAddingComment: addComment.isPending,
    isDeletingComment: deleteComment.isPending,
    isVoting: voteComment.isPending,
    isReplying: replyToComment.isPending,
  };
};
