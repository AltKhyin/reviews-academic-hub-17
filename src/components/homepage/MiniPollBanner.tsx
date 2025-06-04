
// ABOUTME: Interactive mini poll banner with real-time voting and results
// Features animated progress bars and prevents multiple votes per user

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { BarChart3, Users, Clock } from 'lucide-react';

interface PollOption {
  id: string;
  text: string;
  votes: number;
}

interface Poll {
  id: string;
  question: string;
  options: PollOption[];
  totalVotes: number;
  closesAt: string;
  userHasVoted: boolean;
}

interface MiniPollBannerProps {
  poll: Poll | null;
  onVote?: (optionId: string) => void;
  isLoading?: boolean;
  className?: string;
}

export const MiniPollBanner: React.FC<MiniPollBannerProps> = ({ 
  poll, 
  onVote,
  isLoading = false, 
  className = '' 
}) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState(poll?.userHasVoted || false);

  if (isLoading) {
    return (
      <section className={`w-full py-6 ${className}`} aria-label="Carregando enquete">
        <div className="max-w-magazine mx-auto px-6">
          <div className="bg-emerald-900/20 border border-emerald-800/30 rounded-xl p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-6 bg-emerald-700/30 rounded w-3/4"></div>
              <div className="space-y-2">
                <div className="h-10 bg-emerald-700/20 rounded"></div>
                <div className="h-10 bg-emerald-700/20 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (!poll) return null;

  const formatTimeRemaining = (closesAt: string) => {
    try {
      const now = new Date().getTime();
      const closes = new Date(closesAt).getTime();
      const diff = closes - now;
      
      if (diff <= 0) return 'Encerrada';
      
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      
      if (days > 0) return `${days}d ${hours}h restantes`;
      if (hours > 0) return `${hours}h restantes`;
      return 'Menos de 1h';
    } catch {
      return 'Data inválida';
    }
  };

  const handleVote = () => {
    if (!selectedOption || hasVoted) return;
    
    setHasVoted(true);
    onVote?.(selectedOption);
  };

  const getOptionPercentage = (votes: number) => {
    return poll.totalVotes > 0 ? Math.round((votes / poll.totalVotes) * 100) : 0;
  };

  const leadingOption = poll.options.reduce((prev, current) => 
    prev.votes > current.votes ? prev : current
  );

  return (
    <section 
      className={`w-full py-6 ${className}`}
      aria-label="Enquete da comunidade"
    >
      <div className="max-w-magazine mx-auto px-6">
        <div className="bg-emerald-900/20 border border-emerald-800/30 rounded-xl p-6 transition-all duration-300 hover:bg-emerald-900/25">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="w-5 h-5 text-emerald-400" />
                <span className="text-emerald-400 text-sm font-medium">Enquete da Comunidade</span>
              </div>
              <h3 className="text-xl font-serif font-semibold text-foreground">
                {poll.question}
              </h3>
            </div>
            
            {/* Time indicator */}
            <div className="flex items-center gap-1 text-emerald-300/80 text-sm">
              <Clock className="w-4 h-4" />
              <span>{formatTimeRemaining(poll.closesAt)}</span>
            </div>
          </div>

          {/* Options */}
          <div className="space-y-3 mb-4">
            {poll.options.map((option) => {
              const percentage = getOptionPercentage(option.votes);
              const isSelected = selectedOption === option.id;
              const isLeading = option.id === leadingOption.id && poll.totalVotes > 0;
              
              return (
                <div key={option.id} className="relative">
                  <button
                    className={`w-full text-left p-3 rounded-lg border transition-all duration-200 ${
                      hasVoted
                        ? 'cursor-default'
                        : isSelected
                          ? 'border-emerald-500 bg-emerald-500/10'
                          : 'border-emerald-800/50 hover:border-emerald-600 hover:bg-emerald-900/10'
                    }`}
                    onClick={() => !hasVoted && setSelectedOption(option.id)}
                    disabled={hasVoted}
                    aria-pressed={isSelected}
                  >
                    <div className="flex items-center justify-between relative z-10">
                      <span className="font-medium">{option.text}</span>
                      
                      {hasVoted && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">
                            {option.votes} votos
                          </span>
                          <span className="font-semibold text-emerald-300">
                            {percentage}%
                          </span>
                          {isLeading && (
                            <span className="text-yellow-400 text-xs">👑</span>
                          )}
                        </div>
                      )}
                    </div>
                    
                    {/* Progress bar */}
                    {hasVoted && (
                      <div className="absolute inset-0 overflow-hidden rounded-lg">
                        <div 
                          className="h-full bg-emerald-500/20 transition-all duration-1000 ease-out"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    )}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-300/80 text-sm">
              <Users className="w-4 h-4" />
              <span>{poll.totalVotes} votos totais</span>
            </div>
            
            {!hasVoted && (
              <Button
                onClick={handleVote}
                disabled={!selectedOption}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                Votar
              </Button>
            )}
            
            {hasVoted && (
              <span className="text-emerald-400 text-sm font-medium">
                ✓ Voto registrado
              </span>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default MiniPollBanner;
