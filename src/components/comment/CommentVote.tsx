
import React from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CommentVoteProps {
  score: number;
  userVote: 1 | -1 | 0;
  onVote: (value: 1 | -1 | 0) => Promise<void>;
  isVoting: boolean;
}

export const CommentVote: React.FC<CommentVoteProps> = ({ 
  score, 
  userVote, 
  onVote, 
  isVoting 
}) => {
  const handleVote = async (value: 1 | -1) => {
    // If clicking the same vote again, toggle it off
    if (value === userVote) {
      await onVote(0);
    } else {
      await onVote(value);
    }
  };

  return (
    <div className="flex flex-col items-center mr-2 sm:mr-4">
      <Button 
        variant="ghost" 
        size="sm"
        onClick={() => handleVote(1)} 
        disabled={isVoting}
        className={`p-0 h-auto ${userVote === 1 ? 'text-green-500' : 'hover:text-green-400'}`}
      >
        <ArrowUp className="h-4 w-4" />
      </Button>
      
      <span className="text-xs font-medium my-1">
        {score}
      </span>
      
      <Button 
        variant="ghost" 
        size="sm"
        onClick={() => handleVote(-1)} 
        disabled={isVoting}
        className={`p-0 h-auto ${userVote === -1 ? 'text-red-500' : 'hover:text-red-400'}`}
      >
        <ArrowDown className="h-4 w-4" />
      </Button>
    </div>
  );
};
