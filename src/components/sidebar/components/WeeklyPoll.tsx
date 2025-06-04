
import React from 'react';
import { BarChart3, CheckCircle2 } from 'lucide-react';
import { useSidebarStore } from '@/stores/sidebarStore';
import { usePollVoting } from '@/hooks/usePollVoting';
import { useAuth } from '@/contexts/AuthContext';

export const WeeklyPoll: React.FC = () => {
  const { user } = useAuth();
  const { poll, userVote, isLoadingPoll } = useSidebarStore();
  const { vote, isVoting } = usePollVoting();

  if (isLoadingPoll) {
    return (
      <div className="space-y-3">
        <div className="h-4 bg-gray-700 rounded w-32 animate-pulse" />
        <div className="space-y-2">
          <div className="h-4 bg-gray-700 rounded animate-pulse" />
          <div className="h-8 bg-gray-700 rounded animate-pulse" />
          <div className="h-8 bg-gray-700 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  if (!poll) {
    return null;
  }

  const totalVotes = poll.votes.reduce((sum, count) => sum + count, 0);
  const isExpired = new Date(poll.closes_at) < new Date();
  const hasVoted = userVote !== null;
  const canVote = user && !hasVoted && !isExpired;

  const handleVote = (optionIndex: number) => {
    if (!canVote || isVoting) return;
    vote(poll.id, optionIndex);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <BarChart3 className="w-4 h-4 text-purple-400" />
        <h3 className="text-xs font-medium text-gray-300 uppercase tracking-wide">Enquete da Semana</h3>
      </div>
      
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-white leading-tight">{poll.question}</h4>
        
        <div className="space-y-2">
          {poll.options.map((option, index) => {
            const voteCount = poll.votes[index] || 0;
            const percentage = totalVotes > 0 ? (voteCount / totalVotes) * 100 : 0;
            const isSelected = userVote === index;
            const showResults = hasVoted || isExpired;
            
            return (
              <div key={index} className="space-y-1">
                <button
                  onClick={() => handleVote(index)}
                  disabled={!canVote || isVoting}
                  className={`
                    w-full text-left p-3 rounded-lg transition-colors relative overflow-hidden
                    ${canVote ? 'hover:bg-gray-700 cursor-pointer' : 'cursor-not-allowed'}
                    ${isSelected ? 'bg-purple-900/30 border border-purple-500' : 'bg-gray-800 border border-gray-600'}
                    ${!canVote && !isSelected ? 'opacity-75' : ''}
                  `}
                >
                  {/* Progress bar background */}
                  {showResults && (
                    <div 
                      className="absolute inset-0 bg-purple-600/20 transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  )}
                  
                  <div className="relative flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-purple-400" />}
                      <span className="text-sm text-gray-200">{option}</span>
                    </div>
                    
                    {showResults && (
                      <div className="text-xs text-gray-400">
                        {percentage.toFixed(1)}% ({voteCount})
                      </div>
                    )}
                  </div>
                </button>
              </div>
            );
          })}
        </div>
        
        <div className="pt-2 border-t border-gray-700">
          <div className="text-xs text-gray-400 text-center">
            {isExpired ? 'Enquete encerrada' : `${totalVotes} votos • ${hasVoted ? 'Você já votou' : 'Clique para votar'}`}
          </div>
        </div>
      </div>
    </div>
  );
};
