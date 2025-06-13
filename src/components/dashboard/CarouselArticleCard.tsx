
// ABOUTME: Optimized carousel article card using shared context exclusively (no individual API calls)
import React, { useState } from 'react';
import { Issue } from '@/types/issue';
import { useNavigate } from 'react-router-dom';
import { Bookmark, Heart, ThumbsUp, ThumbsDown } from 'lucide-react';
import { useUserInteractionContext } from '@/contexts/UserInteractionContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

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
  
  // PERFORMANCE FIX: Use ONLY shared context - no individual API calls
  const { 
    hasBookmark,
    hasReaction,
    toggleBookmark,
    toggleReaction,
    isLoading
  } = useUserInteractionContext();

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
          toggleBookmark(issue.id);
          break;
        case 'heart':
          toggleReaction(issue.id, 'want_more');
          break;
        case 'thumbs-up':
          toggleReaction(issue.id, 'like');
          break;
        case 'thumbs-down':
          toggleReaction(issue.id, 'dislike');
          break;
      }
    });
  };

  // CRITICAL: Use ONLY context helpers - no individual API calls
  const isBookmarked = hasBookmark(issue.id);
  const reactions = {
    want_more: hasReaction(issue.id, 'want_more'),
    like: hasReaction(issue.id, 'like'),
    dislike: hasReaction(issue.id, 'dislike'),
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
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105 hover:brightness-75"
            onError={(e) => {
              e.currentTarget.src = '/placeholder.svg';
            }}
          />
          
          {/* Specialty tag - hide when hovered and actions are shown */}
          <div className={`absolute bottom-4 left-4 transition-opacity duration-300 ${isHovered ? 'opacity-0' : 'opacity-100'}`}>
            <span className="text-xs font-medium text-white bg-black/60 px-2 py-1 rounded">
              {issue.specialty || ''}
            </span>
          </div>

          {/* Bookmark button - appears on hover at top right */}
          <div className={`absolute top-4 right-4 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button 
                  className="bg-black/60 rounded-full p-1.5 hover:bg-black/80 transition-colors text-white"
                  onClick={(e) => handleActionClick(e, 'bookmark')}
                  disabled={isLoading}
                >
                  <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-white' : ''}`} />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isBookmarked ? 'Remover dos salvos' : 'Salvar'}</p>
              </TooltipContent>
            </Tooltip>
          </div>

          {/* Action buttons - appear on hover at bottom right */}
          <div className={`absolute bottom-4 right-4 transition-opacity duration-300 flex gap-2 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button 
                  className="bg-black/60 rounded-full p-1.5 hover:bg-black/80 transition-colors text-white"
                  onClick={(e) => handleActionClick(e, 'heart')}
                  disabled={isLoading}
                >
                  <Heart className={`w-4 h-4 ${reactions.want_more ? 'fill-white' : ''}`} />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Quero mais sobre isso</p>
              </TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <button 
                  className="bg-black/60 rounded-full p-1.5 hover:bg-black/80 transition-colors text-white"
                  onClick={(e) => handleActionClick(e, 'thumbs-up')}
                  disabled={isLoading}
                >
                  <ThumbsUp className={`w-4 h-4 ${reactions.like ? 'fill-white' : ''}`} />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Gostei</p>
              </TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <button 
                  className="bg-black/60 rounded-full p-1.5 hover:bg-black/80 transition-colors text-white"
                  onClick={(e) => handleActionClick(e, 'thumbs-down')}
                  disabled={isLoading}
                >
                  <ThumbsDown className={`w-4 h-4 ${reactions.dislike ? 'fill-white' : ''}`} />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Não gostei</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </a>
    </TooltipProvider>
  );
};

export default CarouselArticleCard;
