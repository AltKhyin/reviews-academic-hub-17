
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useSidebarStore } from '@/stores/sidebarStore';
import { toast } from '@/hooks/use-toast';

export const usePollVoting = () => {
  const [isVoting, setIsVoting] = useState(false);
  const { user } = useAuth();
  const { setUserVote, setPoll } = useSidebarStore();

  const vote = async (pollId: string, optionIndex: number) => {
    if (!user || isVoting) return;

    setIsVoting(true);
    
    try {
      // First, record the user's vote
      const { error: voteError } = await supabase
        .from('poll_user_votes')
        .upsert({
          poll_id: pollId,
          user_id: user.id,
          option_index: optionIndex
        });

      if (voteError) throw voteError;

      // Update local state
      setUserVote(optionIndex);

      // Fetch updated poll data to get new vote counts
      const { data: updatedPoll, error: pollError } = await supabase
        .from('polls')
        .select('*')
        .eq('id', pollId)
        .single();

      if (pollError) throw pollError;

      if (updatedPoll) {
        const poll = {
          ...updatedPoll,
          votes: (updatedPoll.votes as number[]).map(v => v ?? 0)
        };
        setPoll(poll);
      }

      toast({
        title: 'Voto registrado',
        description: 'Seu voto foi registrado com sucesso!',
      });

    } catch (error) {
      console.error('Error voting:', error);
      toast({
        title: 'Erro ao votar',
        description: 'Não foi possível registrar seu voto. Tente novamente.',
        variant: 'destructive',
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
