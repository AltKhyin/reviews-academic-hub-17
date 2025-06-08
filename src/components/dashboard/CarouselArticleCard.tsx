
// ABOUTME: Carousel article card with archive visual style adapted for carousel use
import React, { useState } from 'react';
import { Issue } from '@/types/issue';
import { useNavigate } from 'react-router-dom';
import { Bookmark, Heart, ThumbsUp, ThumbsDown, Calendar, User } from 'lucide-react';
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'short'
    });
  };

  const getEditionNumber = () => {
    const match = issue.title.match(/#(\d+)/);
    return match ? `#${match[1]}` : `#${issue.id.slice(-3)}`;
  };

  // Placeholder covers for visual appeal (same as archive)
  const placeholderCovers = [
    'https://images.unsplash.com/photo-1649972904349-6e44c42644a7',
    'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b',
    'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158',
    'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5',
    'https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7'
  ];

  const coverImage = issue.cover_image_url || 
    placeholderCovers[parseInt(issue.id.slice(-1)) % placeholderCovers.length];

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
            src={coverImage}
            alt={issue.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={(e) => {
              e.currentTarget.src = 'https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7';
            }}
          />
          
          {/* Archive-style gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
          
          {/* Edition Badge - Archive style */}
          <div className="absolute top-3 left-3 z-10">
            <Badge 
              variant="outline" 
              className="bg-black/60 backdrop-blur-sm text-white border-white/30 text-xs font-medium"
            >
              {getEditionNumber()}
            </Badge>
          </div>

          {/* Content overlay - always visible with archive styling */}
          <div className={`absolute bottom-0 left-0 right-0 p-3 transition-opacity duration-300 ${isHovered ? 'opacity-0' : 'opacity-100'}`}>
            <div className="text-white/80 text-xs mb-1 flex items-center space-x-1"
                 style={{ textShadow: '0 1px 4px rgba(0,0,0,0.8)' }}>
              <Calendar className="w-3 h-3" />
              <span>{formatDate(issue.created_at)}</span>
            </div>
            <h3 className="text-white font-medium text-sm leading-tight line-clamp-2"
                style={{ textShadow: '0 2px 8px rgba(0,0,0,0.8), 0 1px 3px rgba(0,0,0,0.9)' }}>
              {issue.title}
            </h3>
          </div>

          {/* Bookmark button - appears on hover at top right */}
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

          {/* Action buttons - archive style hover overlay */}
          <div className={`absolute inset-0 bg-black/90 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-3 flex flex-col justify-center z-20 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
            <div className="space-y-2">
              {/* Title */}
              <h3 className="text-white font-semibold text-base leading-tight line-clamp-3">
                {issue.title}
              </h3>
              
              {/* Description */}
              {issue.description && (
                <p className="text-white/90 text-xs leading-relaxed line-clamp-4">
                  {issue.description}
                </p>
              )}
              
              {/* Authors */}
              {issue.authors && (
                <div className="flex items-center space-x-1 text-white/80 text-xs">
                  <User className="w-3 h-3" />
                  <span>{issue.authors.split(',')[0].trim()}</span>
                  {issue.authors.split(',').length > 1 && (
                    <span className="text-white/60">+{issue.authors.split(',').length - 1}</span>
                  )}
                </div>
              )}

              {/* Action buttons row */}
              <div className="flex gap-2 pt-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button 
                      className="bg-black/60 rounded-full p-1.5 hover:bg-black/80 transition-colors text-white flex-1"
                      onClick={(e) => handleActionClick(e, 'heart')}
                      disabled={reactionMutation.isPending}
                    >
                      <Heart className={`w-4 h-4 mx-auto ${reactions?.includes('want_more') ? 'fill-white' : ''}`} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Quero mais sobre isso</p>
                  </TooltipContent>
                </Tooltip>
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button 
                      className="bg-black/60 rounded-full p-1.5 hover:bg-black/80 transition-colors text-white flex-1"
                      onClick={(e) => handleActionClick(e, 'thumbs-up')}
                      disabled={reactionMutation.isPending}
                    >
                      <ThumbsUp className={`w-4 h-4 mx-auto ${reactions?.includes('like') ? 'fill-white' : ''}`} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Gostei</p>
                  </TooltipContent>
                </Tooltip>
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button 
                      className="bg-black/60 rounded-full p-1.5 hover:bg-black/80 transition-colors text-white flex-1"
                      onClick={(e) => handleActionClick(e, 'thumbs-down')}
                      disabled={reactionMutation.isPending}
                    >
                      <ThumbsDown className={`w-4 h-4 mx-auto ${reactions?.includes('dislike') ? 'fill-white' : ''}`} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Não gostei</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
          </div>
        </div>
      </a>
    </TooltipProvider>
  );
};

export default CarouselArticleCard;
