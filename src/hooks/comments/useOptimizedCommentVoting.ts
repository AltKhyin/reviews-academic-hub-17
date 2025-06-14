// ABOUTME: Optimized comment voting with local state management and minimal refetches
import { useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Comment, EntityType } from '@/types/commentTypes';
import { toast } from '@/hooks/use-toast';

// Swapped arguments for consistency with other hooks (entityType, entityId).
export const useOptimizedCommentVoting = (entityType: EntityType, entityId: string) => {
  const [isVoting, setIsVoting] = useState(false);
  const queryClient = useQueryClient();

  const voteComment = useCallback(async (commentId: string, value: 1 | -1 | 0) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: "Login necessário",
        description: "Você precisa estar logado para votar.",
        variant: "destructive",
      });
      return;
    }

    setIsVoting(true);
    
    try {
      // Optimistic update
      // The query key uses the parameters in the correct semantic order.
      const queryKey = ['comments', entityType, entityId];
      queryClient.setQueryData(queryKey, (oldData: any) => {
        const oldComments = oldData?.pages?.flatMap((page: any) => page.comments) ?? oldData ?? [];
        if (!oldComments) return oldData;
        
        const updateCommentVote = (comment: Comment) => {
          if (comment.id === commentId) {
            const currentVote = comment.userVote || 0;
            // Use set-state logic instead of toggle
            const newVote = value; 
            const scoreDiff = newVote - currentVote;
            
            return {
              ...comment,
              userVote: newVote,
              score: comment.score + scoreDiff
            };
          }
          if (comment.replies) {
            return {
              ...comment,
              replies: comment.replies.map(updateCommentVote)
            };
          }
          return comment;
        };
        
        const newComments = oldComments.map(updateCommentVote);

        if (oldData?.pages) {
            return {
                ...oldData,
                pages: oldData.pages.map((page: any) => ({
                    ...page,
                    comments: page.comments.map(updateCommentVote)
                }))
            }
        }
        
        return newComments;
      });

      // Check if vote exists
      const { data: existingVote } = await supabase
        .from('comment_votes')
        .select('value')
        .eq('comment_id', commentId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (existingVote) {
        if (value === 0) {
          // Remove vote if value is 0
          const { error } = await supabase
            .from('comment_votes')
            .delete()
            .eq('comment_id', commentId)
            .eq('user_id', user.id);
          
          if (error) throw error;
        } else if (existingVote.value !== value) {
          // Update vote if value has changed
          const { error } = await supabase
            .from('comment_votes')
            .update({ value })
            .eq('comment_id', commentId)
            .eq('user_id', user.id);
          
          if (error) throw error;
        }
        // If vote is the same, do nothing
      } else if (value !== 0) {
        // Create new vote if one doesn't exist and value is not 0
        const { error } = await supabase
          .from('comment_votes')
          .insert([{
            comment_id: commentId,
            user_id: user.id,
            value
          }]);
        
        if (error) throw error;
      }

    } catch (error) {
      console.error('Error voting on comment:', error);
      
      // Revert optimistic update on error
      queryClient.invalidateQueries({ queryKey: ['comments', entityType, entityId] });
      
      toast({
        title: "Erro",
        description: "Não foi possível registrar o voto.",
        variant: "destructive",
      });
    } finally {
      setIsVoting(false);
    }
  }, [entityType, entityId, queryClient]);

  return { voteComment, isVoting };
};
