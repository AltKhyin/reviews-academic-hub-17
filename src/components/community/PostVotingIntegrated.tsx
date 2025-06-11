
// ABOUTME: Immutable voting component with proper state management and conflict resolution
import React, { useState, useEffect, useCallback, useRef } from 'react';
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

interface VotingState {
  optimisticScore: number;
  optimisticVote: number;
  serverScore: number;
  serverVote: number;
  isPending: boolean;
}

export const PostVotingIntegrated: React.FC<PostVotingIntegratedProps> = ({
  postId,
  initialScore,
  initialUserVote,
  onVoteChange
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Immutable state management
  const [votingState, setVotingState] = useState<VotingState>({
    optimisticScore: initialScore,
    optimisticVote: initialUserVote,
    serverScore: initialScore,
    serverVote: initialUserVote,
    isPending: false
  });

  const pendingVoteRef = useRef<boolean>(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Update state when props change (immutable update)
  useEffect(() => {
    if (!pendingVoteRef.current) {
      setVotingState(prev => ({
        ...prev,
        optimisticScore: initialScore,
        optimisticVote: initialUserVote,
        serverScore: initialScore,
        serverVote: initialUserVote
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

  const handleVote = useCallback(async (value: 1 | -1) => {
    if (!user) {
      toast({
        title: "Autenticação necessária",
        description: "Faça login para votar.",
        variant: "destructive",
      });
      return;
    }

    if (pendingVoteRef.current) {
      return;
    }

    // Clear any pending operations
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const newVote = votingState.optimisticVote === value ? 0 : value;
    const scoreDelta = newVote - votingState.serverVote;
    
    // Immutable optimistic update
    setVotingState(prev => ({
      ...prev,
      optimisticScore: prev.serverScore + scoreDelta,
      optimisticVote: newVote,
      isPending: true
    }));
    
    pendingVoteRef.current = true;
    abortControllerRef.current = new AbortController();

    // Debounced database operation
    timeoutRef.current = setTimeout(async () => {
      try {
        if (newVote === 0) {
          // Remove vote
          const { error } = await supabase
            .from('post_votes')
            .delete()
            .eq('post_id', postId)
            .eq('user_id', user.id)
            .abortSignal(abortControllerRef.current?.signal);

          if (error && error.name !== 'AbortError') throw error;
        } else {
          // Upsert vote
          const { error } = await supabase
            .from('post_votes')
            .upsert({
              post_id: postId,
              user_id: user.id,
              value: newVote
            })
            .abortSignal(abortControllerRef.current?.signal);

          if (error && error.name !== 'AbortError') throw error;
        }

        // Immutable server state update
        setVotingState(prev => ({
          ...prev,
          serverScore: prev.optimisticScore,
          serverVote: prev.optimisticVote,
          isPending: false
        }));

        // Delayed parent refresh to prevent conflicts
        setTimeout(() => {
          if (!pendingVoteRef.current) {
            onVoteChange();
          }
        }, 1000);
        
      } catch (error: any) {
        if (error?.name === 'AbortError') {
          return;
        }
        
        console.error('Error voting on post:', error);
        
        // Immutable revert on error
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
    }, 500);
  }, [user, postId, votingState, onVoteChange, toast]);

  return (
    <div className="flex items-center">
      <Button 
        variant="ghost"
        size="sm"
        className={`h-8 w-8 p-0 ${
          votingState.optimisticVote === 1 ? 'text-orange-500 bg-orange-500/10' : 'text-gray-400 hover:text-orange-500'
        }`}
        onClick={() => handleVote(1)}
        disabled={votingState.isPending}
        title="Votar positivo"
      >
        <ArrowUp className="h-5 w-5" />
      </Button>
      
      <span className={`px-2 py-1 text-sm font-medium min-w-[24px] text-center ${
        votingState.optimisticScore > 0 ? 'text-orange-500' : 
        votingState.optimisticScore < 0 ? 'text-blue-500' : 'text-gray-400'
      }`}>
        {votingState.optimisticScore}
      </span>
      
      <Button 
        variant="ghost"
        size="sm"
        className={`h-8 w-8 p-0 ${
          votingState.optimisticVote === -1 ? 'text-blue-500 bg-blue-500/10' : 'text-gray-400 hover:text-blue-500'
        }`}
        onClick={() => handleVote(-1)}
        disabled={votingState.isPending}
        title="Votar negativo"
      >
        <ArrowDown className="h-5 w-5" />
      </Button>
    </div>
  );
};
