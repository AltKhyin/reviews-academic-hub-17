
// ABOUTME: Fixed voting system with separated optimistic updates and conflict resolution
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ArrowUp, ArrowDown } from 'lucide-react';

interface PostVotingProps {
  postId: string;
  initialScore: number;
  initialUserVote: number;
  onVoteChange: () => void;
}

export const PostVoting: React.FC<PostVotingProps> = ({
  postId,
  initialScore,
  initialUserVote,
  onVoteChange
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Separated state management for optimistic updates
  const [optimisticScore, setOptimisticScore] = useState(initialScore);
  const [optimisticUserVote, setOptimisticUserVote] = useState(initialUserVote);
  const [serverScore, setServerScore] = useState(initialScore);
  const [serverUserVote, setServerUserVote] = useState(initialUserVote);
  const [isVoting, setIsVoting] = useState(false);
  
  // Conflict resolution refs
  const lastServerUpdateRef = useRef<number>(Date.now());
  const pendingVoteRef = useRef<boolean>(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Update server state when props change, but preserve optimistic during voting
  useEffect(() => {
    if (!pendingVoteRef.current) {
      setOptimisticScore(initialScore);
      setOptimisticUserVote(initialUserVote);
    }
    setServerScore(initialScore);
    setServerUserVote(initialUserVote);
    lastServerUpdateRef.current = Date.now();
  }, [initialScore, initialUserVote]);

  // Conflict resolution: restore server state if parent updates during voting
  useEffect(() => {
    if (pendingVoteRef.current && Date.now() - lastServerUpdateRef.current > 1000) {
      // Parent updated after our vote, check for conflicts
      const scoreDiff = Math.abs(optimisticScore - initialScore);
      if (scoreDiff > 2) {
        // Significant difference suggests conflict, restore server state
        setOptimisticScore(initialScore);
        setOptimisticUserVote(initialUserVote);
        pendingVoteRef.current = false;
      }
    }
  }, [initialScore, initialUserVote, optimisticScore]);

  const handleVote = useCallback(async (value: number) => {
    if (!user) {
      toast({
        title: "Autenticação necessária",
        description: "Faça login para votar em publicações.",
        variant: "destructive",
      });
      return;
    }

    // Prevent multiple simultaneous votes
    if (pendingVoteRef.current) {
      return;
    }

    // Clear any pending timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    const currentVote = optimisticUserVote;
    const newVote = currentVote === value ? 0 : value;
    
    // Calculate score delta for optimistic update
    const scoreDelta = newVote - currentVote;
    
    // Apply optimistic updates immediately
    setOptimisticUserVote(newVote);
    setOptimisticScore(prev => prev + scoreDelta);
    
    // Set pending flag
    pendingVoteRef.current = true;
    setIsVoting(true);

    // Debounce the actual API call
    timeoutRef.current = setTimeout(async () => {
      try {
        const { data: existingVote, error: checkError } = await supabase
          .from('post_votes')
          .select('value')
          .eq('post_id', postId)
          .eq('user_id', user.id)
          .maybeSingle();

        if (checkError) throw checkError;

        if (existingVote) {
          if (newVote === 0) {
            // Remove vote
            const { error: deleteError } = await supabase
              .from('post_votes')
              .delete()
              .eq('post_id', postId)
              .eq('user_id', user.id);

            if (deleteError) throw deleteError;
          } else {
            // Update vote
            const { error: updateError } = await supabase
              .from('post_votes')
              .update({ value: newVote })
              .eq('post_id', postId)
              .eq('user_id', user.id);

            if (updateError) throw updateError;
          }
        } else if (newVote !== 0) {
          // Insert new vote
          const { error: insertError } = await supabase
            .from('post_votes')
            .insert({ post_id: postId, user_id: user.id, value: newVote });

          if (insertError) throw insertError;
        }

        // Update server state
        setServerScore(optimisticScore);
        setServerUserVote(newVote);

        // Delay parent refresh to prevent conflicts with optimistic state
        setTimeout(() => {
          if (!pendingVoteRef.current) {
            onVoteChange();
          }
        }, 1500);
        
      } catch (error) {
        console.error('Error voting on post:', error);
        
        // Revert optimistic updates on error
        setOptimisticScore(serverScore);
        setOptimisticUserVote(serverUserVote);
        
        toast({
          title: "Erro ao votar",
          description: "Não foi possível registrar seu voto.",
          variant: "destructive",
        });
      } finally {
        pendingVoteRef.current = false;
        setIsVoting(false);
      }
    }, 300);
  }, [user, postId, optimisticUserVote, optimisticScore, serverScore, serverUserVote, onVoteChange, toast]);

  return (
    <div className="flex items-center space-x-1">
      <button
        className={`
          p-1.5 hover:bg-gray-800 rounded transition-colors disabled:opacity-50 flex items-center justify-center
          ${optimisticUserVote === 1 ? 'text-orange-500' : 'text-gray-400 hover:text-gray-300'}
        `}
        onClick={() => handleVote(1)}
        disabled={isVoting}
        aria-label="Vote up"
      >
        <ArrowUp className="h-4 w-4" />
      </button>
      
      <span className={`text-sm font-medium min-w-[24px] text-center ${
        optimisticScore > 0 ? 'text-orange-500' : 
        optimisticScore < 0 ? 'text-blue-500' : 'text-gray-400'
      }`}>
        {optimisticScore}
      </span>
      
      <button
        className={`
          p-1.5 hover:bg-gray-800 rounded transition-colors disabled:opacity-50 flex items-center justify-center
          ${optimisticUserVote === -1 ? 'text-blue-500' : 'text-gray-400 hover:text-gray-300'}
        `}
        onClick={() => handleVote(-1)}
        disabled={isVoting}
        aria-label="Vote down"
      >
        <ArrowDown className="h-4 w-4" />
      </button>
    </div>
  );
};
