import React, { useState } from 'react';
import { Bookmark, ThumbsUp, ThumbsDown, Heart, BookmarkIcon, ThumbsUpIcon, ThumbsDownIcon, HeartIcon } from 'lucide-react';
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Link } from 'react-router-dom';
import { ArticleActions } from '../article/ArticleActions';
import { useToast } from '@/hooks/use-toast';
import { useReactionData } from '@/hooks/comments/useReactionData';
import { useBookmarkData } from '@/hooks/comments/useBookmarkData';
import { supabase } from '@/integrations/supabase/client';

interface ArticleCardProps {
  article: {
    id: string;
    title: string;
    description: string;
    image: string;
    category: string;
  };
  entityType?: 'article' | 'issue';
}

const ArticleCard = ({ article, entityType = 'issue' }: ArticleCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const { toast } = useToast();

  const { isBookmarked, isLoadingBookmark, bookmarkMutation } = useBookmarkData(article.id, entityType);
  const { reactions, isLoadingReactions, reactionMutation } = useReactionData(article.id, entityType);

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

  const handleBookmark = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    checkAuthAndProceed(() => bookmarkMutation.mutate());
  };

  const handleReaction = (e: React.MouseEvent, type: string) => {
    e.preventDefault();
    e.stopPropagation();
    checkAuthAndProceed(() => reactionMutation.mutate({ type }));
  };

  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <Link 
          to={`/article/${article.id}`} 
          className="block"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div className="relative rounded-md overflow-hidden h-[360px] w-[202px] cursor-pointer group">
            <img 
              src={article.image} 
              alt={article.title}
              className="w-full h-full object-cover transition-transform duration-300 hover:scale-105 hover:brightness-75"
            />
            
            <div className={`absolute bottom-4 left-4 ${isHovered ? 'opacity-0' : 'opacity-100'} transition-opacity`}>
              <span className="text-xs font-medium text-white bg-black/60 px-2 py-1 rounded">
                {article.category}
              </span>
            </div>
            
            <div className={`absolute top-4 right-4 ${isHovered ? 'opacity-100' : 'opacity-0'} transition-opacity`}>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button 
                      className={`bg-black/60 rounded-full p-1.5 hover:bg-black/80 transition-colors text-white`}
                      onClick={handleBookmark}
                      disabled={isLoadingBookmark || bookmarkMutation.isPending}
                    >
                      {isBookmarked ? (
                        <BookmarkIcon size={16} className="fill-white" />
                      ) : (
                        <Bookmark size={16} />
                      )}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p>{isBookmarked ? 'Remover dos favoritos' : 'Salvar'}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            <div className={`absolute bottom-4 right-4 ${isHovered ? 'opacity-100' : 'opacity-0'} transition-opacity flex gap-2`}>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button 
                      className={`bg-black/60 rounded-full p-1.5 hover:bg-black/80 transition-colors text-white`}
                      onClick={(e) => handleReaction(e, 'want_more')}
                      disabled={isLoadingReactions || reactionMutation.isPending}
                    >
                      {reactions?.includes('want_more') ? (
                        <HeartIcon size={16} className="fill-white" />
                      ) : (
                        <Heart size={16} />
                      )}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p>Quero mais como esse</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button 
                      className={`bg-black/60 rounded-full p-1.5 hover:bg-black/80 transition-colors text-white`}
                      onClick={(e) => handleReaction(e, 'like')}
                      disabled={isLoadingReactions || reactionMutation.isPending}
                    >
                      {reactions?.includes('like') ? (
                        <ThumbsUpIcon size={16} className="fill-white" />
                      ) : (
                        <ThumbsUp size={16} />
                      )}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p>Gostei</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button 
                      className={`bg-black/60 rounded-full p-1.5 hover:bg-black/80 transition-colors text-white`}
                      onClick={(e) => handleReaction(e, 'dislike')}
                      disabled={isLoadingReactions || reactionMutation.isPending}
                    >
                      {reactions?.includes('dislike') ? (
                        <ThumbsDownIcon size={16} className="fill-white" />
                      ) : (
                        <ThumbsDown size={16} />
                      )}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p>Mostre menos conteúdos como este</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </Link>
      </HoverCardTrigger>
      
      <HoverCardContent className="w-80 p-0 overflow-hidden border-none shadow-lg">
        <div className="p-4 bg-card text-card-foreground">
          <h3 className="text-lg font-medium mb-2">{article.title}</h3>
          <p className="text-sm text-muted-foreground">{article.description}</p>
          <ArticleActions articleId={article.id} entityType={entityType} />
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};

export default ArticleCard;
