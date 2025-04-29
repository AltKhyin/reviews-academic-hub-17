
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { PostData } from '@/types/community';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowUp, ArrowDown, MessageSquare, Bookmark, Share } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { PostContent } from '@/components/community/PostContent';

interface PostProps {
  post: PostData;
  onVoteChange: () => void;
}

export const Post: React.FC<PostProps> = ({ post, onVoteChange }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isVoting, setIsVoting] = useState(false);

  const formatDate = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), {
      addSuffix: true,
      locale: ptBR,
    });
  };

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
      const { data, error } = await supabase
        .from('post_votes')
        .select('value')
        .eq('post_id', post.id)
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        // User already voted, need to update or delete
        if (data.value === value) {
          // Remove vote if clicking the same button
          await supabase
            .from('post_votes')
            .delete()
            .eq('post_id', post.id)
            .eq('user_id', user.id);
        } else {
          // Update vote
          await supabase
            .from('post_votes')
            .update({ value })
            .eq('post_id', post.id)
            .eq('user_id', user.id);
        }
      } else {
        // New vote
        await supabase
          .from('post_votes')
          .insert({ post_id: post.id, user_id: user.id, value });
      }

      onVoteChange();
    } catch (error) {
      console.error('Error voting on post:', error);
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
    <div className="bg-gray-800/10 rounded-lg border border-gray-700/30 p-4">
      <div className="flex items-center space-x-4">
        {/* Vote buttons */}
        <div className="flex flex-col items-center">
          <Button
            variant="ghost"
            size="sm"
            className="px-1"
            onClick={() => handleVote(1)}
            disabled={isVoting}
          >
            <ArrowUp className={`h-5 w-5 ${post.score > 0 ? 'text-blue-500' : 'text-gray-500'}`} />
          </Button>
          <span className="text-sm font-medium">{post.score}</span>
          <Button
            variant="ghost"
            size="sm"
            className="px-1"
            onClick={() => handleVote(-1)}
            disabled={isVoting}
          >
            <ArrowDown className={`h-5 w-5 ${post.score < 0 ? 'text-red-500' : 'text-gray-500'}`} />
          </Button>
        </div>
        
        {/* Post content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <Avatar className="h-6 w-6">
              <AvatarImage src={post.profiles?.avatar_url || undefined} />
              <AvatarFallback>
                {post.profiles?.full_name?.[0] || 'U'}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm text-gray-300">
              {post.profiles?.full_name || 'Usuário'} • {formatDate(post.created_at)}
            </span>
            {post.post_flairs && (
              <Badge 
                style={{ backgroundColor: post.post_flairs.color }}
                className="text-xs"
              >
                {post.post_flairs.name}
              </Badge>
            )}
          </div>
          
          <h3 className="text-lg font-medium leading-tight">{post.title}</h3>
          
          <PostContent post={post} onVoteChange={onVoteChange} />
          
          <div className="flex mt-4 space-x-2">
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
              <MessageSquare className="h-4 w-4 mr-1" />
              Comentários
            </Button>
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
              <Share className="h-4 w-4 mr-1" />
              Compartilhar
            </Button>
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
              <Bookmark className="h-4 w-4 mr-1" />
              Salvar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
