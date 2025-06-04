
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useSidebarStore } from '@/stores/sidebarStore';
import { toast } from '@/hooks/use-toast';

export const usePollVoting = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { poll, setPoll, setUserVote } = useSidebarStore();

  const voteMutation = useMutation({
    mutationFn: async ({ pollId, optionIndex }: { pollId: string; optionIndex: number }) => {
      if (!user) throw new Error('User not authenticated');
      
      const { error } = await supabase
        .from('poll_user_votes')
        .insert({
          poll_id: pollId,
          user_id: user.id,
          option_index: optionIndex
        });

      if (error) throw error;
      return { pollId, optionIndex };
    },
    onSuccess: ({ optionIndex }) => {
      if (!poll) return;

      // Update local state optimistically
      setUserVote(optionIndex);
      
      // Update poll votes count with normalization
      const normalizedVotes = poll.votes.map(v => v ?? 0);
      const newVotes = [...normalizedVotes];
      newVotes[optionIndex] = (newVotes[optionIndex] || 0) + 1;
      setPoll({ ...poll, votes: newVotes });

      // Invalidate and refetch poll data
      queryClient.invalidateQueries({ queryKey: ['sidebar-poll'] });
      queryClient.invalidateQueries({ queryKey: ['sidebar-poll-vote'] });

      toast({
        title: "Voto registrado!",
        description: "Obrigado por participar da nossa enquete semanal.",
      });
    },
    onError: (error) => {
      console.error('Error voting:', error);
      toast({
        title: "Erro ao votar",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive",
      });
    },
  });

  return {
    vote: voteMutation.mutate,
    isVoting: voteMutation.isPending,
  };
};
