
// ABOUTME: Poll results display component
// Handles different result display modes and formatting

import React from 'react';
import { Progress } from '@/components/ui/progress';

interface PollOption {
  id: string;
  text: string;
  votes: number;
  color?: string;
}

interface PollResultsProps {
  options: PollOption[];
  votes: number[];
  totalVotes: number;
  showResults: boolean;
  hasVoted: boolean;
  showVoteCount: boolean;
  showPercentage: boolean;
  resultDisplay: string;
  textColor: string;
  borderColor: string;
}

export const PollResults: React.FC<PollResultsProps> = ({
  options,
  votes,
  totalVotes,
  showResults,
  hasVoted,
  showVoteCount,
  showPercentage,
  resultDisplay,
  textColor,
  borderColor
}) => {
  if (!showResults && !hasVoted) return null;

  const getVotePercentage = (optionVotes: number) => {
    return totalVotes > 0 ? Math.round((optionVotes / totalVotes) * 100) : 0;
  };

  return (
    <div className="space-y-3">
      {options.map((option, index) => {
        const optionVotes = votes[index] || 0;
        const percentage = getVotePercentage(optionVotes);
        
        if (resultDisplay === 'minimal') {
          return (
            <div key={option.id} className="flex items-center justify-between text-sm">
              <span style={{ color: textColor }}>{option.text}</span>
              <div className="flex items-center gap-2">
                {showVoteCount && (
                  <span style={{ color: textColor, opacity: 0.7 }}>{optionVotes}</span>
                )}
                {showPercentage && (
                  <span style={{ color: textColor, opacity: 0.7 }}>{percentage}%</span>
                )}
              </div>
            </div>
          );
        }

        return (
          <div key={option.id} className="space-y-2">
            <div className="flex items-center justify-between">
              <span style={{ color: textColor }}>{option.text}</span>
              <div className="flex items-center gap-2 text-sm">
                {showVoteCount && (
                  <span style={{ color: textColor, opacity: 0.7 }}>{optionVotes} votos</span>
                )}
                {showPercentage && (
                  <span style={{ color: textColor, opacity: 0.7 }}>{percentage}%</span>
                )}
              </div>
            </div>
            <Progress 
              value={percentage} 
              className="h-2"
              style={{ 
                backgroundColor: borderColor,
                ['--progress-background' as any]: option.color
              }}
            />
          </div>
        );
      })}
    </div>
  );
};
