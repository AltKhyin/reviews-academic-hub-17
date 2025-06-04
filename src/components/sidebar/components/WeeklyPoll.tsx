
import React from 'react';
import { Clock, Users } from 'lucide-react';
import { useSidebarStore } from '@/stores/sidebarStore';
import { usePollVoting } from '@/hooks/usePollVoting';
import { useAuth } from '@/contexts/AuthContext';

export const WeeklyPoll: React.FC = () => {
  const { user } = useAuth();
  const { poll, userVote, isLoadingPoll } = useSidebarStore();
  const { vote, isVoting } = usePollVoting();

  if (isLoadingPoll) {
    return (
      <div className="space-y-2">
        <div className="h-4 bg-gray-700 rounded w-32 animate-pulse" />
        <div className="h-20 bg-gray-700 rounded animate-pulse" />
      </div>
    );
  }

  if (!poll) {
    return null;
  }

  const totalVotes = poll.votes.reduce((sum, count) => sum + count, 0);
  const hasVoted = userVote !== null;
  const isExpired = new Date(poll.closes_at) < new Date();

  const handleVote = async (optionIndex: number) => {
    if (!user || hasVoted || isExpired || isVoting) return;
    
    try {
      await vote(poll.id, optionIndex);
    } catch (error) {
      console.error('Error voting:', error);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center space-x-2">
        <Clock className="w-4 h-4 text-purple-400" />
        <h3 className="text-sm font-medium text-gray-300">Enquete da Semana</h3>
      </div>
      
      <div className="p-3 bg-gray-800 rounded-lg space-y-3">
        <h4 className="text-sm font-medium text-white">{poll.question}</h4>
        
        <div className="space-y-2">
          {poll.options.map((option, index) => {
            const votes = poll.votes[index] || 0;
            const percentage = totalVotes > 0 ? (votes / totalVotes) * 100 : 0;
            const isSelected = userVote === index;
            
            return (
              <div key={index} className="space-y-1">
                <button
                  onClick={() => handleVote(index)}
                  disabled={hasVoted || isExpired || !user || isVoting}
                  className={`w-full text-left p-2 rounded text-sm transition-colors relative overflow-hidden ${
                    hasVoted || isExpired
                      ? isSelected
                        ? 'bg-purple-600/30 text-purple-300 cursor-default'
                        : 'bg-gray-700 text-gray-300 cursor-default'
                      : user
                      ? 'bg-gray-700 hover:bg-gray-600 text-gray-200 cursor-pointer'
                      : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {(hasVoted || isExpired) && (
                    <div 
                      className="absolute left-0 top-0 h-full bg-purple-500/20 transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  )}
                  
                  <div className="relative flex items-center justify-between">
                    <span>{option}</span>
                    {(hasVoted || isExpired) && (
                      <span className="text-xs font-medium">
                        {votes} ({Math.round(percentage)}%)
                      </span>
                    )}
                  </div>
                </button>
              </div>
            );
          })}
        </div>
        
        <div className="flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center space-x-1">
            <Users className="w-3 h-3" />
            <span>{totalVotes} votos</span>
          </div>
          
          <div>
            {isExpired ? (
              <span className="text-red-400">Encerrada</span>
            ) : (
              <span>
                Encerra {new Date(poll.closes_at).toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: 'short'
                })}
              </span>
            )}
          </div>
        </div>
        
        {!user && (
          <p className="text-xs text-gray-500 text-center">
            Faça login para votar
          </p>
        )}
      </div>
    </div>
  );
};
