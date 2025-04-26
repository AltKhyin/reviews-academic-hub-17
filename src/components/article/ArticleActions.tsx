import React from 'react';
import { ThumbsUp, ThumbsDown, Heart, Bookmark } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface ArticleActionsProps {
  articleId: string;
}

export const ArticleActions = ({ articleId }: ArticleActionsProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch current user's reactions
  const { data: reactions } = useQuery({
    queryKey: ['article-reactions', articleId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('user_article_reactions')
        .select('reaction_type')
        .eq('article_id', articleId)
        .eq('user_id', user.id);
      
      if (error) throw error;
      return data.map(r => r.reaction_type);
    }
  });

  // Fetch bookmark status
  const { data: isBookmarked } = useQuery({
    queryKey: ['article-bookmark', articleId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { data, error } = await supabase
        .from('user_bookmarks')
        .select('id')
        .eq('article_id', articleId)
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error) throw error;
      return !!data;
    }
  });

  // Handle reactions
  const reactionMutation = useMutation({
    mutationFn: async ({ type }: { type: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('user_article_reactions')
        .upsert({ 
          article_id: articleId, 
          reaction_type: type,
          user_id: user.id
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['article-reactions'] });
      toast({
        description: "Sua reação foi registrada",
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        description: "Não foi possível registrar sua reação",
      });
    }
  });

  // Handle bookmarks
  const bookmarkMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      if (isBookmarked) {
        const { error } = await supabase
          .from('user_bookmarks')
          .delete()
          .eq('article_id', articleId)
          .eq('user_id', user.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('user_bookmarks')
          .insert({ 
            article_id: articleId,
            user_id: user.id 
          });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['article-bookmark'] });
      toast({
        description: isBookmarked ? "Artigo removido dos favoritos" : "Artigo salvo nos favoritos",
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        description: "Não foi possível atualizar os favoritos",
      });
    }
  });

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => reactionMutation.mutate({ type: 'like' })}
        className={reactions?.includes('like') ? 'text-green-600' : ''}
      >
        <ThumbsUp className="mr-1" size={16} />
        Gostei
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => reactionMutation.mutate({ type: 'dislike' })}
        className={reactions?.includes('dislike') ? 'text-red-600' : ''}
      >
        <ThumbsDown className="mr-1" size={16} />
        Não gostei
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => reactionMutation.mutate({ type: 'want_more' })}
        className={reactions?.includes('want_more') ? 'text-purple-600' : ''}
      >
        <Heart className="mr-1" size={16} />
        Quero mais
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => bookmarkMutation.mutate()}
        className={isBookmarked ? 'text-blue-600' : ''}
      >
        <Bookmark className="mr-1" size={16} />
        {isBookmarked ? 'Salvo' : 'Salvar'}
      </Button>
    </div>
  );
};
