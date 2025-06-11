
// ABOUTME: Post voting component with fixed race conditions and optimistic updates
import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  
  // Use ref to prevent race conditions and track ongoing operations
  const votingInProgress = useRef(false);
  const lastVoteOperation = useRef<number>(0);
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  // Sync external state changes only when not actively voting
  useEffect(() => {
    if (!votingInProgress.current) {
      setScore(initialScore);
      setUserVote(initialUserVote);
    }
  }, [initialScore, initialUserVote]);

  // Debounced parent refresh to prevent excessive API calls
  const debouncedParentRefresh = useCallback(() => {
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }
    debounceTimeout.current = setTimeout(() => {
      onVoteChange();
    }, 500); // 500ms debounce to allow database triggers to complete
  }, [onVoteChange]);

  const handleVote = async (value: 1 | -1) => {
    if (!user) {
      toast({
        title: "Autenticação necessária",
        description: "Faça login para votar.",
        variant: "destructive",
      });
      return;
    }

    // Prevent multiple simultaneous voting operations
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
      
      // Calculate score delta based on current state, not optimistic predictions
      const previousVote = userVote;
      const scoreDelta = newVoteValue - previousVote;
      
      // Apply optimistic update using functional setState to prevent stale closures
      const originalScore = score;
      const originalUserVote = userVote;
      
      setUserVote(newVoteValue);
      setScore(prevScore => prevScore + scoreDelta);
      
      console.log(`Voting operation ${operationId}: ${previousVote} -> ${newVoteValue}, delta: ${scoreDelta}`);
      
      // Perform database operation
      let dbError = null;
      
      if (newVoteValue === 0) {
        // Remove vote
        const { error } = await supabase
          .from('post_votes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);
          
        dbError = error;
      } else {
        // Upsert vote
        const { error } = await supabase
          .from('post_votes')
          .upsert({
            post_id: postId,
            user_id: user.id,
            value: newVoteValue
          }, {
            onConflict: 'post_id,user_id'
          });
          
        dbError = error;
      }

      if (dbError) {
        throw dbError;
      }

      // Only trigger parent refresh if this is still the latest operation
      if (lastVoteOperation.current === operationId) {
        debouncedParentRefresh();
      }
    } catch (error) {
      console.error('Error voting:', error);
      
      // Revert optimistic updates on error using the original values
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

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, []);

  return (
    <div className="flex items-center">
      <Button 
        variant="ghost"
        size="sm"
        className={`h-8 w-8 p-0 transition-colors ${
          userVote === 1 ? 'text-orange-500 bg-orange-500/10' : 'text-gray-400 hover:text-orange-500'
        }`}
        onClick={() => handleVote(1)}
        disabled={isVoting}
        title="Votar positivo"
      >
        <ArrowUp className="h-5 w-5" />
      </Button>
      
      <span className={`px-2 py-1 text-sm font-medium min-w-[24px] text-center transition-colors ${
        score > 0 ? 'text-orange-500' : 
        score < 0 ? 'text-blue-500' : 'text-gray-400'
      }`}>
        {score}
      </span>
      
      <Button 
        variant="ghost"
        size="sm"
        className={`h-8 w-8 p-0 transition-colors ${
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
