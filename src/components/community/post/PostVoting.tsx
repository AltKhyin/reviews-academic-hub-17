
// ABOUTME: Fixed voting race conditions with optimistic updates and debouncing
import React, { useState, useCallback, useRef } from 'react';
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
  
  // Local state for optimistic updates
  const [localScore, setLocalScore] = useState(initialScore);
  const [localUserVote, setLocalUserVote] = useState(initialUserVote);
  const [isVoting, setIsVoting] = useState(false);
  
  // Refs for race condition prevention
  const lastVoteRef = useRef<number>(initialUserVote);
  const pendingVoteRef = useRef<boolean>(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced vote handler to prevent rapid clicking issues
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

    const currentVote = lastVoteRef.current;
    const newVote = currentVote === value ? 0 : value;
    
    // Calculate score delta for optimistic update
    const scoreDelta = newVote - currentVote;
    
    // Optimistic updates
    setLocalUserVote(newVote);
    setLocalScore(prevScore => prevScore + scoreDelta);
    lastVoteRef.current = newVote;
    
    // Set pending flag and debounce
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

        // Delay parent refresh to allow DB triggers to complete
        setTimeout(() => {
          onVoteChange();
        }, 500);
        
      } catch (error) {
        console.error('Error voting on post:', error);
        
        // Revert optimistic updates on error
        setLocalScore(initialScore);
        setLocalUserVote(initialUserVote);
        lastVoteRef.current = initialUserVote;
        
        toast({
          title: "Erro ao votar",
          description: "Não foi possível registrar seu voto.",
          variant: "destructive",
        });
      } finally {
        pendingVoteRef.current = false;
        setIsVoting(false);
      }
    }, 300); // 300ms debounce
  }, [user, postId, initialScore, initialUserVote, onVoteChange, toast]);

  return (
    <div className="flex items-center space-x-1">
      <button
        className={`
          p-1.5 hover:bg-gray-800 rounded transition-colors disabled:opacity-50 flex items-center justify-center
          ${localUserVote === 1 ? 'text-orange-500' : 'text-gray-400 hover:text-gray-300'}
        `}
        onClick={() => handleVote(1)}
        disabled={isVoting}
        aria-label="Vote up"
      >
        <ArrowUp className="h-4 w-4" />
      </button>
      
      <span className={`text-sm font-medium min-w-[24px] text-center ${
        localScore > 0 ? 'text-orange-500' : 
        localScore < 0 ? 'text-blue-500' : 'text-gray-400'
      }`}>
        {localScore}
      </span>
      
      <button
        className={`
          p-1.5 hover:bg-gray-800 rounded transition-colors disabled:opacity-50 flex items-center justify-center
          ${localUserVote === -1 ? 'text-blue-500' : 'text-gray-400 hover:text-gray-300'}
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
