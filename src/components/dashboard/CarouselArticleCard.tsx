
// ABOUTME: Carousel article card component using shared context data only
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, User, Heart, Bookmark } from 'lucide-react';
import { Issue } from '@/types/issue';
import { useUserInteractionContext } from '@/contexts/UserInteractionContext';
import { useNavigate } from 'react-router-dom';

interface CarouselArticleCardProps {
  issue: Issue;
  onClick?: () => void;
  className?: string;
}

export const CarouselArticleCard: React.FC<CarouselArticleCardProps> = ({ 
  issue, 
  onClick,
  className = '' 
}) => {
  const navigate = useNavigate();
  
  // PERFORMANCE FIX: Use ONLY shared context - no individual API calls
  const { 
    hasBookmark,
    hasReaction, 
    toggleBookmark,
    toggleReaction,
    isLoading
  } = useUserInteractionContext();

  const handleClick = onClick || (() => navigate(`/article/${issue.id}`));

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleReactionClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleReaction(issue.id, 'want_more');
  };

  const handleBookmarkClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleBookmark(issue.id);
  };

  // Use context helpers - NO individual API calls
  const hasWantMoreReaction = hasReaction(issue.id, 'want_more');
  const isIssueBookmarked = hasBookmark(issue.id);

  return (
    <Card 
      className={`group cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 bg-card border-border overflow-hidden h-80 ${className}`}
      onClick={handleClick}
    >
      {/* Cover Image */}
      <div className="relative overflow-hidden aspect-video">
        <img
          src={issue.cover_image_url}
          alt={issue.search_title || issue.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={(e) => {
            const img = e.target as HTMLImageElement;
            img.src = 'https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        
        {/* Action buttons using shared context ONLY */}
        <div className="absolute top-3 right-3 flex gap-2 z-10">
          <button
            onClick={handleBookmarkClick}
            disabled={isLoading}
            className={`p-2 rounded-full backdrop-blur-sm transition-colors ${
              isIssueBookmarked 
                ? 'bg-yellow-500/20 text-yellow-400' 
                : 'bg-black/20 text-white hover:bg-black/40'
            }`}
          >
            <Bookmark className={`w-4 h-4 ${isIssueBookmarked ? 'fill-current' : ''}`} />
          </button>
          
          <button
            onClick={handleReactionClick}
            disabled={isLoading}
            className={`p-2 rounded-full backdrop-blur-sm transition-colors ${
              hasWantMoreReaction 
                ? 'bg-red-500/20 text-red-400' 
                : 'bg-black/20 text-white hover:bg-black/40'
            }`}
          >
            <Heart className={`w-4 h-4 ${hasWantMoreReaction ? 'fill-current' : ''}`} />
          </button>
        </div>
      </div>

      {/* Content */}
      <CardContent className="p-4">
        <h3 className="font-semibold leading-tight mb-2 line-clamp-2 text-foreground text-base">
          {issue.search_title || issue.title}
        </h3>
        
        <div className="flex items-center justify-between text-muted-foreground text-sm">
          <div className="flex items-center space-x-1">
            <Calendar className="w-3 h-3" />
            <span>{formatDate(issue.created_at)}</span>
          </div>
          
          <div className="flex items-center space-x-1">
            <User className="w-3 h-3" />
            <span>{issue.authors?.split(',')[0] || 'Autor'}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
