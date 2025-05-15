
import React from 'react';
import { ThumbsUp, ThumbsDown, Heart, Bookmark } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useReactionData } from '@/hooks/comments/useReactionData';
import { useBookmarkData } from '@/hooks/comments/useBookmarkData';

interface ArticleActionsProps {
  articleId: string;
  entityType?: 'article' | 'issue';
}

export const ArticleActions = ({ articleId, entityType = 'issue' }: ArticleActionsProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { reactions, isLoadingReactions } = useReactionData(articleId, entityType);
  const { isBookmarked, isLoadingBookmark } = useBookmarkData(articleId, entityType);

  // Handle reactions
  const reactionMutation = useMutation({
    mutationFn: async ({ type }: { type: string }) => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        const currentReactions = reactions || [];
        const hasReaction = currentReactions.includes(type);
        
        if (hasReaction) {
          // Remove the reaction
          let deleteQuery = supabase
            .from('user_article_reactions')
            .delete()
            .eq('user_id', user.id)
            .eq('reaction_type', type);
            
          if (entityType === 'article') {
            deleteQuery = deleteQuery.eq('article_id', articleId).is('issue_id', null);
          } else {
            deleteQuery = deleteQuery.eq('issue_id', articleId).is('article_id', null);
          }
          
          const { error } = await deleteQuery;
          
          if (error) throw error;
          return { added: false, type };
        } else {
          // Add or update the reaction
          const payload: any = { 
            user_id: user.id,
            reaction_type: type
          };
          
          if (entityType === 'article') {
            payload.article_id = articleId;
          } else {
            payload.issue_id = articleId;
          }
          
          console.log("Reaction payload:", payload);
          const { error } = await supabase
            .from('user_article_reactions')
            .insert(payload);
          
          if (error) throw error;
          return { added: true, type };
        }
      } catch (err) {
        console.error('Error registering reaction:', err);
        throw err;
      }
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['entity-reactions', articleId, entityType] });
      const message = result.added 
        ? "Sua reação foi registrada" 
        : "Sua reação foi removida";
      
      toast({
        description: message,
      });
    },
    onError: (error) => {
      console.error('Reaction error:', error);
      toast({
        variant: "destructive",
        description: "Não foi possível registrar sua reação",
      });
    }
  });

  // Handle bookmarks
  const bookmarkMutation = useMutation({
    mutationFn: async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        if (isBookmarked) {
          // Remove bookmark
          let deleteQuery = supabase
            .from('user_bookmarks')
            .delete()
            .eq('user_id', user.id);
            
          if (entityType === 'article') {
            deleteQuery = deleteQuery.eq('article_id', articleId).is('issue_id', null);
          } else {
            deleteQuery = deleteQuery.eq('issue_id', articleId).is('article_id', null);
          }
          
          const { error } = await deleteQuery;
            
          if (error) throw error;
          return { added: false };
        } else {
          // Add bookmark
          const payload: any = { 
            user_id: user.id
          };
          
          if (entityType === 'article') {
            payload.article_id = articleId;
          } else {
            payload.issue_id = articleId;
          }
          
          console.log("Bookmark payload:", payload);
          const { error } = await supabase
            .from('user_bookmarks')
            .insert(payload);
            
          if (error) throw error;
          return { added: true };
        }
      } catch (err) {
        console.error('Error updating bookmark:', err);
        throw err;
      }
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['entity-bookmark', articleId, entityType] });
      toast({
        description: result.added ? "Artigo salvo nos favoritos" : "Artigo removido dos favoritos",
      });
    },
    onError: (error) => {
      console.error('Bookmark error:', error);
      toast({
        variant: "destructive",
        description: "Não foi possível atualizar os favoritos",
      });
    }
  });

  // Check if user is authenticated
  const checkAuthAndProceed = async (callback: () => void) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast({
        variant: "destructive",
        description: "Você precisa estar logado para realizar essa ação",
      });
      return;
    }
    callback();
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => checkAuthAndProceed(() => reactionMutation.mutate({ type: 'want_more' }))}
        className={reactions?.includes('want_more') ? 'text-purple-600' : ''}
        disabled={isLoadingReactions || reactionMutation.isPending}
      >
        <Heart className="mr-1" size={16} />
        Quero mais como esse
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => checkAuthAndProceed(() => reactionMutation.mutate({ type: 'like' }))}
        className={reactions?.includes('like') ? 'text-green-600' : ''}
        disabled={isLoadingReactions || reactionMutation.isPending}
      >
        <ThumbsUp className="mr-1" size={16} />
        Gostei
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => checkAuthAndProceed(() => reactionMutation.mutate({ type: 'dislike' }))}
        className={reactions?.includes('dislike') ? 'text-red-600' : ''}
        disabled={isLoadingReactions || reactionMutation.isPending}
      >
        <ThumbsDown className="mr-1" size={16} />
        Mostre menos conteúdos como este
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => checkAuthAndProceed(() => bookmarkMutation.mutate())}
        className={isBookmarked ? 'text-blue-600' : ''}
        disabled={isLoadingBookmark || bookmarkMutation.isPending}
      >
        <Bookmark className="mr-1" size={16} />
        {isBookmarked ? 'Salvo' : 'Salvar'}
      </Button>
    </div>
  );
};
