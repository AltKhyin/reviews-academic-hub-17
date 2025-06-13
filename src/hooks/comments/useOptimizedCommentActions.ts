
// ABOUTME: Optimized comment actions with intelligent cache management
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { Comment, EntityType } from '@/types/commentTypes';
import { buildCommentData } from '@/utils/commentHelpers';
import { toast } from '@/hooks/use-toast';

export const useOptimizedCommentActions = (
  entityId: string, 
  entityType: EntityType,
  refetchComments: () => Promise<void>
) => {
  const [isAddingComment, setIsAddingComment] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [isDeletingComment, setIsDeletingComment] = useState(false);
  const queryClient = useQueryClient();

  // Optimistic update helper
  const updateCommentsOptimistically = useCallback((updater: (oldData: Comment[]) => Comment[]) => {
    const queryKey = ['comments', entityType, entityId];
    queryClient.setQueryData(queryKey, updater);
  }, [queryClient, entityType, entityId]);

  const addComment = useCallback(async (content: string, userId: string) => {
    if (!content.trim() || !userId) return;

    setIsAddingComment(true);
    
    try {
      const commentData = buildCommentData(content, userId, entityType, entityId);
      
      // Create temporary comment for optimistic update
      const tempComment: Comment = {
        id: `temp-${Date.now()}`,
        ...commentData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        score: 0,
        userVote: 0,
        profiles: {
          full_name: 'You',
          avatar_url: null
        },
        replies: []
      };

      // Add optimistic update
      updateCommentsOptimistically((oldComments) => [tempComment, ...(oldComments || [])]);

      const { data, error } = await supabase
        .from('comments')
        .insert([commentData])
        .select(`
          *,
          profiles:user_id (
            full_name, avatar_url
          )
        `)
        .single();

      if (error) throw error;

      // Replace temp comment with real one
      updateCommentsOptimistically((oldComments) => 
        oldComments.map(comment => 
          comment.id === tempComment.id 
            ? { ...data, profiles: data.profiles, replies: [], userVote: 0 as 0 }
            : comment
        )
      );

      toast({
        title: "Comentário adicionado",
        description: "Seu comentário foi publicado com sucesso.",
      });

    } catch (error) {
      console.error('Error adding comment:', error);
      
      // Remove optimistic comment on error
      updateCommentsOptimistically((oldComments) => 
        oldComments.filter(comment => !comment.id.startsWith('temp-'))
      );
      
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o comentário.",
        variant: "destructive",
      });
    } finally {
      setIsAddingComment(false);
    }
  }, [entityType, entityId, updateCommentsOptimistically]);

  const replyToComment = useCallback(async (content: string, userId: string, parentId: string) => {
    if (!content.trim() || !userId || !parentId) return;

    setIsReplying(true);
    
    try {
      const commentData = buildCommentData(content, userId, entityType, entityId, parentId);
      
      const { data, error } = await supabase
        .from('comments')
        .insert([commentData])
        .select(`
          *,
          profiles:user_id (
            full_name, avatar_url
          )
        `)
        .single();

      if (error) throw error;

      // Optimistically add reply to parent comment
      updateCommentsOptimistically((oldComments) => 
        oldComments.map(comment => {
          if (comment.id === parentId) {
            return {
              ...comment,
              replies: [...comment.replies, { 
                ...data, 
                profiles: data.profiles, 
                replies: [], 
                userVote: 0 as 0 
              }]
            };
          }
          return comment;
        })
      );

      toast({
        title: "Resposta adicionada",
        description: "Sua resposta foi publicada com sucesso.",
      });

    } catch (error) {
      console.error('Error replying to comment:', error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar a resposta.",
        variant: "destructive",
      });
    } finally {
      setIsReplying(false);
    }
  }, [entityType, entityId, updateCommentsOptimistically]);

  const deleteComment = useCallback(async (commentId: string) => {
    setIsDeletingComment(true);
    
    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;

      // Optimistically remove comment
      updateCommentsOptimistically((oldComments) => 
        oldComments.filter(comment => comment.id !== commentId)
      );

      toast({
        title: "Comentário removido",
        description: "O comentário foi removido com sucesso.",
      });

    } catch (error) {
      console.error('Error deleting comment:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover o comentário.",
        variant: "destructive",
      });
    } finally {
      setIsDeletingComment(false);
    }
  }, [updateCommentsOptimistically]);

  return {
    addComment,
    replyToComment,
    deleteComment,
    isAddingComment,
    isReplying,
    isDeletingComment
  };
};
