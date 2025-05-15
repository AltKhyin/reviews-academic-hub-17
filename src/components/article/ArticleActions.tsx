
import React from 'react';
import { ThumbsUp, ThumbsDown, Heart, Bookmark } from 'lucide-react';
import { ReactionButton } from './ReactionButton';
import { useArticleReactions } from './hooks/useArticleReactions';

interface ArticleActionsProps {
  articleId: string;
}

export const ArticleActions = ({ articleId }: ArticleActionsProps) => {
  const {
    reactions,
    isBookmarked,
    isLoadingReactions,
    isLoadingBookmark,
    reactionMutation,
    bookmarkMutation,
    checkAuthAndProceed
  } = useArticleReactions(articleId);

  return (
    <div className="flex items-center gap-2">
      <ReactionButton
        icon={Heart}
        label="Quero mais como esse"
        isActive={reactions?.includes('want_more')}
        activeClassName="text-purple-600"
        disabled={isLoadingReactions || reactionMutation.isPending}
        onClick={() => checkAuthAndProceed(() => reactionMutation.mutate({ type: 'want_more' }))}
      />

      <ReactionButton
        icon={ThumbsUp}
        label="Gostei"
        isActive={reactions?.includes('like')}
        activeClassName="text-green-600"
        disabled={isLoadingReactions || reactionMutation.isPending}
        onClick={() => checkAuthAndProceed(() => reactionMutation.mutate({ type: 'like' }))}
      />

      <ReactionButton
        icon={ThumbsDown}
        label="Mostre menos conteúdos como este"
        isActive={reactions?.includes('dislike')}
        activeClassName="text-red-600"
        disabled={isLoadingReactions || reactionMutation.isPending}
        onClick={() => checkAuthAndProceed(() => reactionMutation.mutate({ type: 'dislike' }))}
      />

      <ReactionButton
        icon={Bookmark}
        label={isBookmarked ? 'Salvo' : 'Salvar'}
        isActive={isBookmarked}
        activeClassName="text-blue-600"
        disabled={isLoadingBookmark || bookmarkMutation.isPending}
        onClick={() => checkAuthAndProceed(() => bookmarkMutation.mutate())}
      />
    </div>
  );
};
