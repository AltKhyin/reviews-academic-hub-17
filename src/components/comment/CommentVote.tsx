
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
        className={`p-1 h-8 w-8 rounded-full ${userVote === 1 ? 'bg-green-500/20 text-green-500' : 'hover:bg-green-500/10 hover:text-green-400'}`}
      >
        <ArrowUp className="h-5 w-5" strokeWidth={2.5} />
      </Button>
      
      <span className="text-xs font-medium my-1">
        {score}
      </span>
      
      <Button 
        variant="ghost" 
        size="sm"
        onClick={() => handleVote(-1)} 
        disabled={isVoting}
        className={`p-1 h-8 w-8 rounded-full ${userVote === -1 ? 'bg-red-500/20 text-red-500' : 'hover:bg-red-500/10 hover:text-red-400'}`}
      >
        <ArrowDown className="h-5 w-5" strokeWidth={2.5} />
      </Button>
    </div>
  );
};
