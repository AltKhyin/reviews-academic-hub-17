
import React, { useState } from 'react';
import { Issue } from '@/types/issue';
import { useNavigate } from 'react-router-dom';
import { Bookmark, Heart, ThumbsUp, ThumbsDown } from 'lucide-react';
import { useReactionData } from '@/hooks/comments/useReactionData';
import { useBookmarkData } from '@/hooks/comments/useBookmarkData';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';

interface CarouselArticleCardProps {
  issue: Issue;
  className?: string;
}

export const CarouselArticleCard: React.FC<CarouselArticleCardProps> = ({ 
  issue, 
  className = '' 
}) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isHovered, setIsHovered] = useState(false);
  
  const { reactions, reactionMutation } = useReactionData(issue.id, 'issue');
  const { isBookmarked, bookmarkMutation } = useBookmarkData(issue.id, 'issue');

  const handleClick = () => {
    navigate(`/article/${issue.id}`);
  };

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

  const handleActionClick = (e: React.MouseEvent, action: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    checkAuthAndProceed(() => {
      switch (action) {
        case 'bookmark':
          bookmarkMutation.mutate();
          break;
        case 'heart':
          reactionMutation.mutate({ type: 'want_more' });
          break;
        case 'thumbs-up':
          reactionMutation.mutate({ type: 'like' });
          break;
        case 'thumbs-down':
          reactionMutation.mutate({ type: 'dislike' });
          break;
      }
    });
  };

  const getEditionNumber = () => {
    const match = issue.title.match(/#(\d+)/);
    return match ? `#${match[1]}` : `#${issue.id.slice(-3)}`;
  };

  return (
    <TooltipProvider>
      <a 
        href={`/article/${issue.id}`}
        onClick={(e) => {
          e.preventDefault();
          handleClick();
        }}
        className="block"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className={`relative rounded-md overflow-hidden h-[360px] w-[202px] cursor-pointer group ${className}`}>
          <img 
            src={issue.cover_image_url || '/placeholder.svg'} 
            alt={issue.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={(e) => {
              e.currentTarget.src = '/placeholder.svg';
            }}
          />
          
          {/* Enhanced Archive-style Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
          
          {/* Edition Badge - Archive Style */}
          <div className="absolute top-3 left-3 z-10">
            <Badge 
              variant="outline" 
              className="bg-black/60 backdrop-blur-sm text-white border-white/30 text-xs font-medium"
            >
              {getEditionNumber()}
            </Badge>
          </div>

          {/* Specialty tag - with archive styling, hide when hovered and actions are shown */}
          <div className={`absolute bottom-4 left-4 transition-opacity duration-300 ${isHovered ? 'opacity-0' : 'opacity-100'}`}>
            <Badge 
              variant="outline" 
              className="bg-black/60 backdrop-blur-sm text-white border-white/30 text-xs font-medium"
            >
              {issue.specialty || ''}
            </Badge>
          </div>

          {/* Bookmark button - appears on hover at top right with archive styling */}
          <div className={`absolute top-3 right-3 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button 
                  className="bg-black/60 backdrop-blur-sm rounded-full p-1.5 hover:bg-black/80 transition-colors text-white"
                  onClick={(e) => handleActionClick(e, 'bookmark')}
                  disabled={bookmarkMutation.isPending}
                >
                  <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-white' : ''}`} />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isBookmarked ? 'Remover dos salvos' : 'Salvar'}</p>
              </TooltipContent>
            </Tooltip>
          </div>

          {/* Action buttons - appear on hover at bottom right with archive styling */}
          <div className={`absolute bottom-4 right-4 transition-opacity duration-300 flex gap-2 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button 
                  className="bg-black/60 backdrop-blur-sm rounded-full p-1.5 hover:bg-black/80 transition-colors text-white"
                  onClick={(e) => handleActionClick(e, 'heart')}
                  disabled={reactionMutation.isPending}
                >
                  <Heart className={`w-4 h-4 ${reactions?.includes('want_more') ? 'fill-white' : ''}`} />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Quero mais sobre isso</p>
              </TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <button 
                  className="bg-black/60 backdrop-blur-sm rounded-full p-1.5 hover:bg-black/80 transition-colors text-white"
                  onClick={(e) => handleActionClick(e, 'thumbs-up')}
                  disabled={reactionMutation.isPending}
                >
                  <ThumbsUp className={`w-4 h-4 ${reactions?.includes('like') ? 'fill-white' : ''}`} />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Gostei</p>
              </TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <button 
                  className="bg-black/60 backdrop-blur-sm rounded-full p-1.5 hover:bg-black/80 transition-colors text-white"
                  onClick={(e) => handleActionClick(e, 'thumbs-down')}
                  disabled={reactionMutation.isPending}
                >
                  <ThumbsDown className={`w-4 h-4 ${reactions?.includes('dislike') ? 'fill-white' : ''}`} />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Não gostei</p>
              </TooltipContent>
            </Tooltip>
          </div>

          {/* Title overlay at bottom with archive styling and enhanced text shadow */}
          <div className="absolute bottom-0 left-0 right-0 p-3 z-10">
            <h3 className="text-white font-semibold text-sm leading-tight line-clamp-2"
                style={{ 
                  textShadow: '0 2px 8px rgba(0,0,0,0.8), 0 1px 3px rgba(0,0,0,0.9)' 
                }}>
              {issue.search_title || issue.title}
            </h3>
          </div>
        </div>
      </a>
    </TooltipProvider>
  );
};

export default CarouselArticleCard;
