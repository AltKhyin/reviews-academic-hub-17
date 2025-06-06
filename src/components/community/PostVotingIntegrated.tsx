
import React, { useState, useEffect } from 'react';
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

  useEffect(() => {
    setScore(initialScore);
    setUserVote(initialUserVote);
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

    if (isVoting) return;

    setIsVoting(true);
    try {
      const newVoteValue = userVote === value ? 0 : value;
      
      if (newVoteValue === 0) {
        // Remove vote
        await supabase
          .from('post_votes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);
      } else {
        // Upsert vote
        await supabase
          .from('post_votes')
          .upsert({
            post_id: postId,
            user_id: user.id,
            value: newVoteValue
          });
      }

      // Update local state optimistically
      const scoreDelta = newVoteValue - userVote;
      setScore(prev => prev + scoreDelta);
      setUserVote(newVoteValue);
      
      // Trigger parent refresh
      onVoteChange();
    } catch (error) {
      console.error('Error voting:', error);
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
