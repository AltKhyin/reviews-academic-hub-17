
import React from 'react';
import { ThumbsUp, ThumbsDown, Heart, Bookmark, HeartIcon, ThumbsUpIcon, ThumbsDownIcon, BookmarkIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
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
  const { reactions, isLoadingReactions, reactionMutation } = useReactionData(articleId, entityType);
  const { isBookmarked, isLoadingBookmark, bookmarkMutation } = useBookmarkData(articleId, entityType);

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
        className="group"
        disabled={isLoadingReactions || reactionMutation.isPending}
      >
        {reactions?.includes('want_more') ? (
          <HeartIcon className="mr-1 fill-white" size={16} />
        ) : (
          <Heart className="mr-1" size={16} />
        )}
        Quero mais como esse
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => checkAuthAndProceed(() => reactionMutation.mutate({ type: 'like' }))}
        className="group"
        disabled={isLoadingReactions || reactionMutation.isPending}
      >
        {reactions?.includes('like') ? (
          <ThumbsUpIcon className="mr-1 fill-white" size={16} />
        ) : (
          <ThumbsUp className="mr-1" size={16} />
        )}
        Gostei
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => checkAuthAndProceed(() => reactionMutation.mutate({ type: 'dislike' }))}
        className="group"
        disabled={isLoadingReactions || reactionMutation.isPending}
      >
        {reactions?.includes('dislike') ? (
          <ThumbsDownIcon className="mr-1 fill-white" size={16} />
        ) : (
          <ThumbsDown className="mr-1" size={16} />
        )}
        Mostre menos conteúdos como este
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => checkAuthAndProceed(() => bookmarkMutation.mutate())}
        className="group"
        disabled={isLoadingBookmark || bookmarkMutation.isPending}
      >
        {isBookmarked ? (
          <BookmarkIcon className="mr-1 fill-white" size={16} />
        ) : (
          <Bookmark className="mr-1" size={16} />
        )}
        {isBookmarked ? 'Salvo' : 'Salvar'}
      </Button>
    </div>
  );
};
