
// ABOUTME: Post voting component with race condition and state mutation fixes
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PostVotingIntegratedProps {
  postId: string;
  initialScore: number;
  initialUserVote: number;
  onVoteChange: () => void;
}

export const PostVotingIntegrated: React.FC<PostVotingIntegratedProps> = ({
  postId,
  initialScore,
  initialUserVote,
  onVoteChange
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [score, setScore] = useState(initialScore);
  const [userVote, setUserVote] = useState(initialUserVote);
  const [isVoting, setIsVoting] = useState(false);
  
  // Fix: Add ref to track ongoing operations and prevent race conditions
  const votingInProgress = useRef(false);
  const lastVoteOperation = useRef<number>(0);

  useEffect(() => {
    // Fix: Properly sync props without causing render loops
    if (!votingInProgress.current) {
      setScore(initialScore);
      setUserVote(initialUserVote);
    }
  }, [initialScore, initialUserVote]);

  const handleVote = async (value: 1 | -1) => {
    if (!user) {
      toast({
        title: "Autenticação necessária",
        description: "Faça login para votar.",
        variant: "destructive",
      });
      return;
    }

    // Fix: Prevent multiple simultaneous voting operations
    if (isVoting || votingInProgress.current) {
      console.log('Voting already in progress, ignoring click');
      return;
    }

    const operationId = Date.now();
    lastVoteOperation.current = operationId;
    
    setIsVoting(true);
    votingInProgress.current = true;
    
    try {
      const newVoteValue = userVote === value ? 0 : value;
      
      // Fix: Calculate score delta based on previous state, not optimistic updates
      const previousVote = userVote;
      const scoreDelta = newVoteValue - previousVote;
      
      // Fix: Apply optimistic update using functional setState to avoid stale closures
      setUserVote(newVoteValue);
      setScore(prevScore => prevScore + scoreDelta);
      
      console.log(`Voting operation ${operationId}: ${previousVote} -> ${newVoteValue}, delta: ${scoreDelta}`);
      
      // Perform database operation
      if (newVoteValue === 0) {
        // Remove vote
        const { error } = await supabase
          .from('post_votes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);
          
        if (error) throw error;
      } else {
        // Upsert vote
        const { error } = await supabase
          .from('post_votes')
          .upsert({
            post_id: postId,
            user_id: user.id,
            value: newVoteValue
          });
          
        if (error) throw error;
      }

      // Fix: Only trigger parent refresh if this is still the latest operation
      if (lastVoteOperation.current === operationId) {
        // Delay parent refresh to allow database triggers to complete
        setTimeout(() => {
          if (lastVoteOperation.current === operationId) {
            onVoteChange();
          }
        }, 300);
      }
    } catch (error) {
      console.error('Error voting:', error);
      
      // Fix: Revert optimistic updates on error using the original values
      setScore(initialScore);
      setUserVote(initialUserVote);
      
      toast({
        title: "Erro ao votar",
        description: "Não foi possível registrar seu voto.",
        variant: "destructive",
      });
    } finally {
      setIsVoting(false);
      votingInProgress.current = false;
    }
  };

  return (
    <div className="flex items-center">
      <Button 
        variant="ghost"
        size="sm"
        className={`h-8 w-8 p-0 ${
          userVote === 1 ? 'text-orange-500 bg-orange-500/10' : 'text-gray-400 hover:text-orange-500'
        }`}
        onClick={() => handleVote(1)}
        disabled={isVoting}
        title="Votar positivo"
      >
        <ArrowUp className="h-5 w-5" />
      </Button>
      
      <span className={`px-2 py-1 text-sm font-medium min-w-[24px] text-center ${
        score > 0 ? 'text-orange-500' : 
        score < 0 ? 'text-blue-500' : 'text-gray-400'
      }`}>
        {score}
      </span>
      
      <Button 
        variant="ghost"
        size="sm"
        className={`h-8 w-8 p-0 ${
          userVote === -1 ? 'text-blue-500 bg-blue-500/10' : 'text-gray-400 hover:text-blue-500'
        }`}
        onClick={() => handleVote(-1)}
        disabled={isVoting}
        title="Votar negativo"
      >
        <ArrowDown className="h-5 w-5" />
      </Button>
    </div>
  );
};
