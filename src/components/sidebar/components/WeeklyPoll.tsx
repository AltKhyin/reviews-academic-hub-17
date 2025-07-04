
import React from 'react';
import { BarChart3 } from 'lucide-react';
import { useSidebarStore } from '@/stores/sidebarStore';
import { usePollVoting } from '@/hooks/usePollVoting';

export const WeeklyPoll: React.FC = () => {
  const { poll, userVote, isLoadingPoll } = useSidebarStore();
  const { vote, isVoting } = usePollVoting();

  if (isLoadingPoll) {
    return (
      <div className="space-y-3">
        <div className="h-4 bg-muted/30 rounded w-24 animate-pulse" />
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-1">
              <div className="h-3 bg-muted/30 rounded animate-pulse" />
              <div className="h-2 bg-muted/30 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!poll) {
    return null;
  }

  const totalVotes = poll.votes.reduce((sum, count) => sum + count, 0);

  const handleVote = async (optionIndex: number) => {
    if (userVote === optionIndex) return;
    await vote(poll.id, optionIndex);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center space-x-2">
        <BarChart3 className="w-4 h-4 text-muted-foreground/80" />
        <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Enquete da Semana</h3>
      </div>
      
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-foreground/80 leading-tight">{poll.question}</h4>
        
        <div className="space-y-2">
          {poll.options.map((option, index) => {
            const votes = poll.votes[index] || 0;
            const percentage = totalVotes > 0 ? (votes / totalVotes) * 100 : 0;
            const isSelected = userVote === index;
            
            return (
              <button
                key={index}
                onClick={() => handleVote(index)}
                disabled={isVoting}
                className={`
                  w-full text-left p-2 rounded transition-colors group
                  ${isSelected 
                    ? 'bg-muted/30 text-foreground/90' 
                    : 'hover:bg-muted/20 text-muted-foreground'
                  }
                `}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium">{option}</span>
                  <span className="text-xs text-muted-foreground/70">{percentage.toFixed(1)}%</span>
                </div>
                
                <div className="w-full bg-muted/20 rounded-full h-1.5">
                  <div 
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      isSelected ? 'bg-muted-foreground/50' : 'bg-muted-foreground/30'
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                
                <div className="text-xs text-muted-foreground/60 mt-1">
                  {votes} {votes === 1 ? 'voto' : 'votos'}
                </div>
              </button>
            );
          })}
        </div>
        
        {totalVotes > 0 && (
          <p className="text-xs text-muted-foreground/60 text-center">
            {totalVotes} {totalVotes === 1 ? 'voto total' : 'votos totais'}
          </p>
        )}
      </div>
    </div>
  );
};
