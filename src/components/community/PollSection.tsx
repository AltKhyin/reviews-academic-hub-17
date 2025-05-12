import React from 'react';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Poll } from '@/types/community';

interface PollSectionProps {
  poll: Poll;
  onVoteChange: () => void;
}

export const PollSection: React.FC<PollSectionProps> = ({ poll, onVoteChange }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isVoting, setIsVoting] = React.useState(false);
  const [localPoll, setLocalPoll] = React.useState<Poll>(poll);

  // Effect to keep local poll state in sync with prop changes
  React.useEffect(() => {
    setLocalPoll(poll);
  }, [poll]);

  const handlePollVote = async (optionId: string) => {
    if (!user) {
      toast({
        title: "Autenticação necessária",
        description: "Faça login para votar em enquetes.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsVoting(true);
      
      const prevUserVote = localPoll.user_vote;
      const prevOptionVotes = {...localPoll.options.reduce((acc, opt) => ({
        ...acc, 
        [opt.id]: opt.votes
      }), {})};
      
      // Optimistically update UI first for better user experience
      const updatedOptions = localPoll.options.map(option => ({
        ...option,
        votes: option.id === optionId 
          ? option.votes + 1 
          : prevUserVote && option.id === prevUserVote 
            ? Math.max(0, option.votes - 1) 
            : option.votes
      }));
      
      const newTotalVotes = prevUserVote 
        ? localPoll.total_votes 
        : localPoll.total_votes + 1;
        
      setLocalPoll({
        ...localPoll,
        options: updatedOptions,
        user_vote: optionId,
        total_votes: newTotalVotes
      });
      
      // First check if user already voted for any option in this poll
      const { data: existingVotes } = await supabase
        .from('poll_votes')
        .select('id, option_id')
        .eq('user_id', user.id)
        .in('option_id', poll.options.map(o => o.id));
      
      let voteResult;
      
      if (existingVotes && existingVotes.length > 0) {
        // User has already voted, so update their vote
        voteResult = await supabase
          .from('poll_votes')
          .update({ option_id: optionId })
          .eq('id', existingVotes[0].id);
      } else {
        // New vote
        voteResult = await supabase
          .from('poll_votes')
          .insert({ 
            option_id: optionId, 
            user_id: user.id 
          });
      }
          
      if (voteResult.error) {
        console.error('Error voting in poll:', voteResult.error);
        
        // Revert optimistic updates on error
        setLocalPoll({
          ...localPoll,
          options: localPoll.options.map(opt => ({
            ...opt,
            votes: prevOptionVotes[opt.id] || opt.votes
          })),
          user_vote: prevUserVote,
          total_votes: poll.total_votes
        });
        
        throw voteResult.error;
      }
      
      toast({
        title: "Voto registrado",
        description: "Seu voto foi registrado com sucesso.",
      });
      
      // Tell parent component to refresh data
      onVoteChange();
      
    } catch (error: any) {
      console.error('Error voting in poll:', error);
      toast({
        title: "Erro ao votar",
        description: error?.message || "Não foi possível registrar seu voto na enquete.",
        variant: "destructive",
      });
    } finally {
      setIsVoting(false);
    }
  };
  
  return (
    <div className="mt-4 bg-gray-800/20 p-4 rounded-lg border border-gray-700/30">
      <h4 className="font-medium mb-3">Enquete</h4>
      <div className="space-y-3">
        {localPoll.options.map((option) => {
          const percentage = localPoll.total_votes > 0 
            ? Math.round((option.votes / localPoll.total_votes) * 100) 
            : 0;
          
          const isSelected = option.id === localPoll.user_vote;
          
          return (
            <div key={option.id} className="space-y-1">
              <div className="flex justify-between items-center">
                <button
                  onClick={() => handlePollVote(option.id)}
                  disabled={isVoting || !user}
                  className={`text-left w-full ${isSelected ? 'font-bold' : 'font-normal'} ${user ? 'hover:text-blue-400' : ''}`}
                >
                  {option.text}
                </button>
                <span className="text-sm text-gray-400">
                  {option.votes} ({percentage}%)
                </span>
              </div>
              <Progress 
                value={percentage} 
                className={`h-2 ${isSelected ? 'bg-blue-900/30' : 'bg-gray-700/30'}`} 
                indicatorClassName={isSelected ? 'bg-blue-500' : 'bg-gray-500'} 
              />
            </div>
          );
        })}
        
        <div className="text-sm text-gray-400 pt-2">
          {localPoll.total_votes} {localPoll.total_votes === 1 ? 'voto' : 'votos'} total
        </div>
      </div>
    </div>
  );
};
