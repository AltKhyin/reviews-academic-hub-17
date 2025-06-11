
// ABOUTME: Poll voting functionality for sidebar weekly polls
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useSidebarStore } from '@/stores/sidebarStore';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from './use-toast';

export const usePollVoting = () => {
  const [isVoting, setIsVoting] = useState(false);
  const { user } = useAuth();
  const { setUserVote } = useSidebarStore();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const vote = async (pollId: string, optionIndex: number) => {
    if (!user?.id || isVoting) return;

    setIsVoting(true);
    
    try {
      // Delete any existing vote by this user for this poll
      await supabase
        .from('poll_user_votes')
        .delete()
        .eq('user_id', user.id)
        .eq('poll_id', pollId);

      // Insert new vote
      const { error } = await supabase
        .from('poll_user_votes')
        .insert({
          poll_id: pollId,
          user_id: user.id,
          option_index: optionIndex
        });

      if (error) throw error;

      // Update local state
      setUserVote(optionIndex);

      // Invalidate related queries to refresh vote counts
      queryClient.invalidateQueries({ queryKey: ['weeklyPoll'] });
      queryClient.invalidateQueries({ queryKey: ['userPollVote', user.id, pollId] });

      toast({
        title: "Voto registrado",
        description: "Seu voto foi registrado com sucesso!",
      });

    } catch (error) {
      console.error('Error voting:', error);
      toast({
        title: "Erro ao votar",
        description: "Não foi possível registrar seu voto. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsVoting(false);
    }
  };

  return {
    vote,
    isVoting
  };
};
