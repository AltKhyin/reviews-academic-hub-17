
// ABOUTME: Fixed voting race conditions with separated state management and proper conflict resolution
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

interface VotingState {
  optimisticScore: number;
  optimisticVote: number;
  serverScore: number;
  serverVote: number;
  isPending: boolean;
  lastUpdateTime: number;
}

export const PostVoting: React.FC<PostVotingProps> = ({
  postId,
  initialScore,
  initialUserVote,
  onVoteChange
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Separated voting state management
  const [votingState, setVotingState] = useState<VotingState>({
    optimisticScore: initialScore,
    optimisticVote: initialUserVote,
    serverScore: initialScore,
    serverVote: initialUserVote,
    isPending: false,
    lastUpdateTime: Date.now()
  });
  
  // Refs for managing pending operations
  const pendingVoteRef = useRef<boolean>(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Update state when props change (server data refresh)
  useEffect(() => {
    if (!pendingVoteRef.current) {
      setVotingState(prev => ({
        ...prev,
        optimisticScore: initialScore,
        optimisticVote: initialUserVote,
        serverScore: initialScore,
        serverVote: initialUserVote,
        lastUpdateTime: Date.now()
      }));
    }
  }, [initialScore, initialUserVote]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

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

    // Cancel any pending request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const currentVote = votingState.optimisticVote;
    const newVote = currentVote === value ? 0 : value;
    
    // Calculate score delta for optimistic update based on server state
    const scoreDelta = newVote - votingState.serverVote;
    
    // Optimistic updates with separated state
    setVotingState(prev => ({
      ...prev,
      optimisticScore: prev.serverScore + scoreDelta,
      optimisticVote: newVote,
      isPending: true,
      lastUpdateTime: Date.now()
    }));
    
    // Set pending flag
    pendingVoteRef.current = true;

    // Create new abort controller for this request
    abortControllerRef.current = new AbortController();

    // Debounce the actual API call
    timeoutRef.current = setTimeout(async () => {
      try {
        const { data: existingVote, error: checkError } = await supabase
          .from('post_votes')
          .select('value')
          .eq('post_id', postId)
          .eq('user_id', user.id)
          .abortSignal(abortControllerRef.current?.signal)
          .maybeSingle();

        if (checkError && checkError.name !== 'AbortError') throw checkError;

        if (existingVote) {
          if (newVote === 0) {
            // Remove vote
            const { error: deleteError } = await supabase
              .from('post_votes')
              .delete()
              .eq('post_id', postId)
              .eq('user_id', user.id)
              .abortSignal(abortControllerRef.current?.signal);

            if (deleteError && deleteError.name !== 'AbortError') throw deleteError;
          } else {
            // Update vote
            const { error: updateError } = await supabase
              .from('post_votes')
              .update({ value: newVote })
              .eq('post_id', postId)
              .eq('user_id', user.id)
              .abortSignal(abortControllerRef.current?.signal);

            if (updateError && updateError.name !== 'AbortError') throw updateError;
          }
        } else if (newVote !== 0) {
          // Insert new vote
          const { error: insertError } = await supabase
            .from('post_votes')
            .insert({ post_id: postId, user_id: user.id, value: newVote })
            .abortSignal(abortControllerRef.current?.signal);

          if (insertError && insertError.name !== 'AbortError') throw insertError;
        }

        // Update server state to match optimistic state
        setVotingState(prev => ({
          ...prev,
          serverScore: prev.optimisticScore,
          serverVote: prev.optimisticVote,
          isPending: false
        }));

        // Delay parent refresh to allow DB triggers to complete and prevent conflicts
        setTimeout(() => {
          if (!pendingVoteRef.current) {
            onVoteChange();
          }
        }, 1000);
        
      } catch (error: any) {
        if (error?.name === 'AbortError') {
          return; // Request was cancelled, ignore
        }
        
        console.error('Error voting on post:', error);
        
        // Revert optimistic updates on error
        setVotingState(prev => ({
          ...prev,
          optimisticScore: prev.serverScore,
          optimisticVote: prev.serverVote,
          isPending: false
        }));
        
        toast({
          title: "Erro ao votar",
          description: "Não foi possível registrar seu voto.",
          variant: "destructive",
        });
      } finally {
        pendingVoteRef.current = false;
      }
    }, 500); // Increased debounce to 500ms for better stability
  }, [user, postId, votingState, onVoteChange, toast]);

  return (
    <div className="flex items-center space-x-1">
      <button
        className={`
          p-1.5 hover:bg-gray-800 rounded transition-colors disabled:opacity-50 flex items-center justify-center
          ${votingState.optimisticVote === 1 ? 'text-orange-500' : 'text-gray-400 hover:text-gray-300'}
        `}
        onClick={() => handleVote(1)}
        disabled={votingState.isPending}
        aria-label="Vote up"
      >
        <ArrowUp className="h-4 w-4" />
      </button>
      
      <span className={`text-sm font-medium min-w-[24px] text-center ${
        votingState.optimisticScore > 0 ? 'text-orange-500' : 
        votingState.optimisticScore < 0 ? 'text-blue-500' : 'text-gray-400'
      }`}>
        {votingState.optimisticScore}
      </span>
      
      <button
        className={`
          p-1.5 hover:bg-gray-800 rounded transition-colors disabled:opacity-50 flex items-center justify-center
          ${votingState.optimisticVote === -1 ? 'text-blue-500' : 'text-gray-400 hover:text-gray-300'}
        `}
        onClick={() => handleVote(-1)}
        disabled={votingState.isPending}
        aria-label="Vote down"
      >
        <ArrowDown className="h-4 w-4" />
      </button>
    </div>
  );
};
