
import React, { useState } from 'react';
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
  const [isVoting, setIsVoting] = useState(false);
  const [localScore, setLocalScore] = useState(initialScore);
  const [localUserVote, setLocalUserVote] = useState(initialUserVote);

  const handleVote = async (value: number) => {
    if (!user) {
      toast({
        title: "Autenticação necessária",
        description: "Faça login para votar em publicações.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsVoting(true);
      
      const currentVote = localUserVote;
      const newVote = currentVote === value ? 0 : value;
      
      let scoreDelta = 0;
      
      if (currentVote === newVote) {
        scoreDelta = 0;
      } else if (newVote === 0) {
        scoreDelta = -currentVote;
      } else if (currentVote === 0) {
        scoreDelta = newVote;
      } else {
        scoreDelta = newVote - currentVote;
      }
      
      setLocalUserVote(newVote);
      setLocalScore(prevScore => prevScore + scoreDelta);
      
      const { data, error } = await supabase
        .from('post_votes')
        .select('value')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        if (newVote === 0) {
          await supabase
            .from('post_votes')
            .delete()
            .eq('post_id', postId)
            .eq('user_id', user.id);
        } else {
          await supabase
            .from('post_votes')
            .update({ value: newVote })
            .eq('post_id', postId)
            .eq('user_id', user.id);
        }
      } else if (newVote !== 0) {
        await supabase
          .from('post_votes')
          .insert({ post_id: postId, user_id: user.id, value: newVote });
      }

      setTimeout(() => {
        onVoteChange();
      }, 300);
    } catch (error) {
      console.error('Error voting on post:', error);
      
      setLocalScore(initialScore);
      setLocalUserVote(initialUserVote);
      
      toast({
        title: "Erro ao votar",
        description: "Não foi possível registrar seu voto.",
        variant: "destructive",
      });
    } finally {
      setIsVoting(false);
    }
  };

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
