
import React, { useState } from 'react';
import { Bookmark, ThumbsUp, ThumbsDown, Heart } from 'lucide-react';
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Link } from 'react-router-dom';
import { ArticleActions } from '../article/ArticleActions';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useReactionData } from '@/hooks/comments/useReactionData';
import { useBookmarkData } from '@/hooks/comments/useBookmarkData';

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
  const queryClient = useQueryClient();

  const { isBookmarked, isLoadingBookmark } = useBookmarkData(article.id, entityType);
  const { reactions, isLoadingReactions } = useReactionData(article.id, entityType);

  const bookmarkMutation = useMutation({
    mutationFn: async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error('User not authenticated');

        if (isBookmarked) {
          // Remove bookmark
          let deleteQuery = supabase
            .from('user_bookmarks')
            .delete()
            .eq('user_id', session.user.id);
          
          if (entityType === 'article') {
            deleteQuery = deleteQuery.eq('article_id', article.id).is('issue_id', null);
          } else {
            deleteQuery = deleteQuery.eq('issue_id', article.id).is('article_id', null);
          }
          
          const { error } = await deleteQuery;
          
          if (error) throw error;
          return { action: 'removed' };
        } else {
          // Add bookmark
          const payload: any = { 
            user_id: session.user.id 
          };
          
          if (entityType === 'article') {
            payload.article_id = article.id;
          } else {
            payload.issue_id = article.id;
          }
          
          console.log("Bookmark payload:", payload);
          const { error } = await supabase
            .from('user_bookmarks')
            .insert(payload);
            
          if (error) throw error;
          return { action: 'added' };
        }
      } catch (err) {
        console.error('Error updating bookmark:', err);
        throw err;
      }
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['entity-bookmark', article.id, entityType] });
      toast({
        description: result.action === 'added' ? "Artigo salvo nos favoritos" : "Artigo removido dos favoritos",
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

  const reactionMutation = useMutation({
    mutationFn: async ({ type }: { type: string }) => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error('User not authenticated');

        const hasReaction = reactions?.includes(type);
        
        if (hasReaction) {
          // Remove reaction
          let deleteQuery = supabase
            .from('user_article_reactions')
            .delete()
            .eq('user_id', session.user.id)
            .eq('reaction_type', type);
          
          if (entityType === 'article') {
            deleteQuery = deleteQuery.eq('article_id', article.id).is('issue_id', null);
          } else {
            deleteQuery = deleteQuery.eq('issue_id', article.id).is('article_id', null);
          }
          
          const { error } = await deleteQuery;
          
          if (error) throw error;
          return { added: false, type };
        } else {
          // Add reaction
          const payload: any = { 
            user_id: session.user.id,
            reaction_type: type
          };
          
          if (entityType === 'article') {
            payload.article_id = article.id;
          } else {
            payload.issue_id = article.id;
          }
          
          console.log("Reaction payload:", payload);
          const { error } = await supabase
            .from('user_article_reactions')
            .insert(payload);
          
          if (error) throw error;
          return { added: true, type };
        }
      } catch (err) {
        console.error('Reaction error:', err);
        throw err;
      }
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['entity-reactions', article.id, entityType] });
      const reactionMessages: Record<string, string> = {
        'want_more': result.added ? 'Quero mais conteúdo como este' : 'Preferência removida',
        'like': result.added ? 'Você gostou deste artigo' : 'Avaliação removida',
        'dislike': result.added ? 'Você verá menos conteúdos como este' : 'Avaliação removida'
      };
      
      toast({
        description: reactionMessages[result.type] || "Sua reação foi atualizada",
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
                      className={`bg-black/60 rounded-full p-1.5 hover:bg-black/80 transition-colors ${isBookmarked ? 'text-blue-400' : 'text-white'}`}
                      onClick={handleBookmark}
                      disabled={isLoadingBookmark || bookmarkMutation.isPending}
                    >
                      <Bookmark size={16} />
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
                      className={`bg-black/60 rounded-full p-1.5 hover:bg-black/80 transition-colors ${reactions?.includes('want_more') ? 'text-purple-400' : 'text-white'}`}
                      onClick={(e) => handleReaction(e, 'want_more')}
                      disabled={isLoadingReactions || reactionMutation.isPending}
                    >
                      <Heart size={16} />
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
                      className={`bg-black/60 rounded-full p-1.5 hover:bg-black/80 transition-colors ${reactions?.includes('like') ? 'text-green-400' : 'text-white'}`}
                      onClick={(e) => handleReaction(e, 'like')}
                      disabled={isLoadingReactions || reactionMutation.isPending}
                    >
                      <ThumbsUp size={16} />
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
                      className={`bg-black/60 rounded-full p-1.5 hover:bg-black/80 transition-colors ${reactions?.includes('dislike') ? 'text-red-400' : 'text-white'}`}
                      onClick={(e) => handleReaction(e, 'dislike')}
                      disabled={isLoadingReactions || reactionMutation.isPending}
                    >
                      <ThumbsDown size={16} />
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
