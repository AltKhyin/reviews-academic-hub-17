
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
      
      // The trigger we created will handle removing previous votes
      await supabase
        .from('poll_votes')
        .insert({ 
          option_id: optionId, 
          user_id: user.id 
        });
      
      onVoteChange();
      
    } catch (error) {
      console.error('Error voting in poll:', error);
      toast({
        title: "Erro ao votar",
        description: "Não foi possível registrar seu voto na enquete.",
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
        {poll.options.map((option) => {
          const percentage = poll.total_votes > 0 
            ? Math.round((option.votes / poll.total_votes) * 100) 
            : 0;
          
          const isSelected = option.id === poll.user_vote;
          
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
          {poll.total_votes} {poll.total_votes === 1 ? 'voto' : 'votos'} total
        </div>
      </div>
    </div>
  );
};
