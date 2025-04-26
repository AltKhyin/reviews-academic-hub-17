
import React, { useState } from 'react';
import { Bookmark, ThumbsUp, ThumbsDown, Heart } from 'lucide-react';
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Link } from 'react-router-dom';
import { ArticleActions } from '../article/ArticleActions';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ArticleCardProps {
  article: {
    id: string;
    title: string;
    description: string;
    image: string;
    category: string;
  };
}

const ArticleCard = ({ article }: ArticleCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const bookmarkMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data: existing } = await supabase
        .from('user_bookmarks')
        .select('id')
        .eq('article_id', article.id)
        .eq('user_id', user.id)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from('user_bookmarks')
          .delete()
          .eq('article_id', article.id)
          .eq('user_id', user.id);
        if (error) throw error;
        return { action: 'removed' };
      } else {
        const { error } = await supabase
          .from('user_bookmarks')
          .insert({ 
            article_id: article.id,
            user_id: user.id 
          });
        if (error) throw error;
        return { action: 'added' };
      }
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['article-bookmark'] });
      toast({
        description: result.action === 'added' ? "Artigo salvo nos favoritos" : "Artigo removido dos favoritos",
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        description: "Não foi possível atualizar os favoritos",
      });
    }
  });

  const reactionMutation = useMutation({
    mutationFn: async ({ type }: { type: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('user_article_reactions')
        .upsert({ 
          article_id: article.id, 
          reaction_type: type,
          user_id: user.id
        });
      
      if (error) throw error;
      return { type };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['article-reactions'] });
      const reactionMessages: Record<string, string> = {
        'want_more': 'Quero mais conteúdo como este',
        'like': 'Você gostou deste artigo',
        'dislike': 'Você verá menos conteúdos como este'
      };
      toast({
        description: reactionMessages[result.type] || "Sua reação foi registrada",
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        description: "Não foi possível registrar sua reação",
      });
    }
  });

  const handleBookmark = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    bookmarkMutation.mutate();
  };

  const handleReaction = (e: React.MouseEvent, type: string) => {
    e.preventDefault();
    e.stopPropagation();
    reactionMutation.mutate({ type });
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
                      className="bg-black/60 rounded-full p-1.5 hover:bg-black/80 transition-colors"
                      onClick={handleBookmark}
                    >
                      <Bookmark size={16} className="text-white" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p>Salvar</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            <div className={`absolute bottom-4 right-4 ${isHovered ? 'opacity-100' : 'opacity-0'} transition-opacity flex gap-2`}>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button 
                      className="bg-black/60 rounded-full p-1.5 hover:bg-black/80 transition-colors"
                      onClick={(e) => handleReaction(e, 'want_more')}
                    >
                      <Heart size={16} className="text-white" />
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
                      className="bg-black/60 rounded-full p-1.5 hover:bg-black/80 transition-colors"
                      onClick={(e) => handleReaction(e, 'like')}
                    >
                      <ThumbsUp size={16} className="text-white" />
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
                      className="bg-black/60 rounded-full p-1.5 hover:bg-black/80 transition-colors"
                      onClick={(e) => handleReaction(e, 'dislike')}
                    >
                      <ThumbsDown size={16} className="text-white" />
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
          <ArticleActions articleId={article.id} />
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};

export default ArticleCard;
