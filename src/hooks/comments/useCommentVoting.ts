
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

/**
 * Hook specifically for comment voting functionality
 */
export function useCommentVoting(fetchComments?: () => Promise<void>) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isVoting, setIsVoting] = useState(false);

  const voteComment = async ({ commentId, value }: { commentId: string; value: 1 | -1 | 0 }): Promise<void> => {
    if (!user) {
      toast({
        title: "Autenticação necessária",
        description: "Faça login para votar em comentários.",
        variant: "destructive",
      });
      return;
    }

    setIsVoting(true);
    try {
      // Check if user already voted on this comment
      const { data: existingVote, error: checkError } = await supabase
        .from('comment_votes')
        .select('*')
        .eq('comment_id', commentId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (checkError) throw checkError;

      if (existingVote) {
        if (value === 0) {
          // Remove vote
          const { error: deleteError } = await supabase
            .from('comment_votes')
            .delete()
            .eq('comment_id', commentId)
            .eq('user_id', user.id);

          if (deleteError) throw deleteError;
        } else if (existingVote.value !== value) {
          // Update vote
          const { error: updateError } = await supabase
            .from('comment_votes')
            .update({ value })
            .eq('comment_id', commentId)
            .eq('user_id', user.id);

          if (updateError) throw updateError;
        }
        // If the vote is the same, do nothing
      } else if (value !== 0) {
        // Insert new vote
        const { error: insertError } = await supabase
          .from('comment_votes')
          .insert({
            comment_id: commentId,
            user_id: user.id,
            value // This will be 1 or -1
          });

        if (insertError) throw insertError;
      }

      // Allow a brief moment for the trigger to update the score
      setTimeout(() => {
        // Refresh comments to get updated scores
        if (fetchComments) fetchComments();
      }, 300);
    } catch (error) {
      console.error('Error voting on comment:', error);
      toast({
        title: "Erro ao votar",
        description: "Não foi possível registrar seu voto no comentário.",
        variant: "destructive",
      });
    } finally {
      setIsVoting(false);
    }
  };

  return {
    voteComment,
    isVoting
  };
}
