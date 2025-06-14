
// ABOUTME: Optimized comment voting with local state management and minimal refetches
import { useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Comment, EntityType } from '@/types/commentTypes';
import { toast } from '@/hooks/use-toast';

export const useOptimizedCommentVoting = (entityType: EntityType, entityId: string) => {
  const [isVoting, setIsVoting] = useState(false);
  const queryClient = useQueryClient();

  const voteComment = useCallback(async (commentId: string, value: 1 | -1) => {
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
      const queryKey = ['comments', entityType, entityId];
      queryClient.setQueryData(queryKey, (oldComments: Comment[]) => {
        if (!oldComments) return oldComments;
        
        return oldComments.map(comment => {
          if (comment.id === commentId) {
            const currentVote = comment.userVote || 0;
            const newVote = currentVote === value ? 0 : value;
            const scoreDiff = newVote - currentVote;
            
            return {
              ...comment,
              userVote: newVote as 1 | -1 | 0,
              score: comment.score + scoreDiff
            };
          }
          
          // Also check replies
          return {
            ...comment,
            replies: comment.replies.map(reply => {
              if (reply.id === commentId) {
                const currentVote = reply.userVote || 0;
                const newVote = currentVote === value ? 0 : value;
                const scoreDiff = newVote - currentVote;
                
                return {
                  ...reply,
                  userVote: newVote as 1 | -1 | 0,
                  score: reply.score + scoreDiff
                };
              }
              return reply;
            })
          };
        });
      });

      // Check if vote exists
      const { data: existingVote } = await supabase
        .from('comment_votes')
        .select('value')
        .eq('comment_id', commentId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (existingVote) {
        if (existingVote.value === value) {
          // Remove vote
          const { error } = await supabase
            .from('comment_votes')
            .delete()
            .eq('comment_id', commentId)
            .eq('user_id', user.id);
          
          if (error) throw error;
        } else {
          // Update vote
          const { error } = await supabase
            .from('comment_votes')
            .update({ value })
            .eq('comment_id', commentId)
            .eq('user_id', user.id);
          
          if (error) throw error;
        }
      } else {
        // Create new vote
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
