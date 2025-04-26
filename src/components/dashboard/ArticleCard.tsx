
import React from 'react';
import { Bookmark, ThumbsUp, ThumbsDown, Heart } from 'lucide-react';
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Link } from 'react-router-dom';
import { ArticleActions } from '../article/ArticleActions';

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
  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <Link to={`/article/${article.id}`} className="block">
          <div className="relative rounded-md overflow-hidden h-[360px] w-[202px] cursor-pointer group">
            <img 
              src={article.image} 
              alt={article.title}
              className="w-full h-full object-cover transition-transform duration-300 hover:scale-105 hover:brightness-75"
            />
            
            <div className="absolute bottom-4 left-4 opacity-100 group-hover:opacity-0 transition-opacity">
              <span className="text-xs font-medium text-white bg-black/60 px-2 py-1 rounded">
                {article.category}
              </span>
            </div>
            
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className="bg-black/60 rounded-full p-1.5 hover:bg-black/80 transition-colors">
                      <Bookmark size={16} className="text-white" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p>Salvar</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className="bg-black/60 rounded-full p-1.5 hover:bg-black/80 transition-colors">
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
                    <button className="bg-black/60 rounded-full p-1.5 hover:bg-black/80 transition-colors">
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
                    <button className="bg-black/60 rounded-full p-1.5 hover:bg-black/80 transition-colors">
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
