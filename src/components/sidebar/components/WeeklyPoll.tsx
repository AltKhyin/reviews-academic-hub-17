
import React from 'react';
import { Vote, BarChart3 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useSidebarStore } from '@/stores/sidebarStore';
import { toast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

export const WeeklyPoll: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { poll, userVote, setPoll, setUserVote, isLoadingPoll } = useSidebarStore();
  const [isVoting, setIsVoting] = React.useState(false);

  const handleVote = async (optionIndex: number) => {
    if (!user || !poll || userVote !== null || isVoting) return;

    setIsVoting(true);
    
    try {
      const { error } = await supabase
        .from('poll_user_votes')
        .insert({
          poll_id: poll.id,
          user_id: user.id,
          option_index: optionIndex
        });

      if (error) throw error;

      // Update local state optimistically
      setUserVote(optionIndex);
      
      // Update poll votes count with normalization
      const newVotes = [...poll.votes.map(v => v ?? 0)];
      newVotes[optionIndex] = (newVotes[optionIndex] || 0) + 1;
      setPoll({ ...poll, votes: newVotes });

      // Invalidate queries to refetch fresh data
      queryClient.invalidateQueries({ queryKey: ['sidebar-poll'] });
      queryClient.invalidateQueries({ queryKey: ['sidebar-poll-vote'] });

      toast({
        title: "Voto registrado!",
        description: "Obrigado por participar da nossa enquete semanal.",
      });
    } catch (error) {
      console.error('Error voting:', error);
      toast({
        title: "Erro ao votar",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive",
      });
    } finally {
      setIsVoting(false);
    }
  };

  if (isLoadingPoll) {
    return (
      <div className="space-y-2">
        <div className="h-4 bg-gray-700 rounded w-24 animate-pulse" />
        <div className="p-3 bg-gray-800 rounded-lg space-y-3">
          <div className="h-4 bg-gray-700 rounded animate-pulse" />
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-8 bg-gray-700 rounded animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!poll) {
    return null;
  }

  // Normalize votes to handle null values
  const normalizedVotes = poll.votes.map(v => v ?? 0);
  const totalVotes = normalizedVotes.reduce((sum, count) => sum + count, 0);
  const isExpired = new Date(poll.closes_at) < new Date();
  const canVote = user && userVote === null && !isExpired && !isVoting;

  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-2">
        <Vote className="w-4 h-4 text-purple-400" />
        <h3 className="text-sm font-medium text-gray-300">Enquete Semanal</h3>
      </div>
      
      <div className="p-3 bg-gray-800 rounded-lg space-y-3">
        <p className="text-sm font-medium text-white">{poll.question}</p>
        
        <div className="space-y-2">
          {poll.options.map((option, index) => {
            const voteCount = normalizedVotes[index] || 0;
            const percentage = totalVotes > 0 ? (voteCount / totalVotes) * 100 : 0;
            const isUserChoice = userVote === index;
            const isSelected = userVote !== null || isExpired;

            return (
              <div key={index} className="relative">
                <button
                  onClick={() => handleVote(index)}
                  disabled={!canVote}
                  className={`
                    w-full text-left p-2 rounded-lg text-sm transition-all relative overflow-hidden
                    ${canVote 
                      ? 'hover:bg-gray-700 cursor-pointer' 
                      : 'cursor-default'
                    }
                    ${isUserChoice 
                      ? 'bg-purple-600/20 border border-purple-500/30' 
                      : 'bg-gray-700/50'
                    }
                  `}
                >
                  {isSelected && (
                    <div 
                      className="absolute inset-0 bg-purple-500/10 transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  )}
                  
                  <div className="relative flex items-center justify-between">
                    <span className={isUserChoice ? 'text-purple-200 font-medium' : 'text-gray-200'}>
                      {option}
                    </span>
                    
                    {isSelected && (
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-400">
                          {percentage.toFixed(0)}%
                        </span>
                        {isUserChoice && (
                          <div className="w-2 h-2 bg-purple-400 rounded-full" />
                        )}
                      </div>
                    )}
                  </div>
                </button>
              </div>
            );
          })}
        </div>
        
        <div className="flex items-center justify-between text-xs text-gray-400 pt-2 border-t border-gray-700">
          <div className="flex items-center space-x-1">
            <BarChart3 className="w-3 h-3" />
            <span>{totalVotes} votos</span>
          </div>
          
          {isExpired ? (
            <span>Enquete encerrada</span>
          ) : (
            <span>
              {userVote !== null ? 'Voto registrado' : 'Clique para votar'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
