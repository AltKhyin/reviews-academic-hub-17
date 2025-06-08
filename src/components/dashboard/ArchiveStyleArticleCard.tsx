
// ABOUTME: Article card with archive visual style adapted for homepage use
import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, User, FileText, Heart, Bookmark } from 'lucide-react';
import { Issue } from '@/types/issue';
import { useOptimizedUserInteractions } from '@/hooks/useOptimizedUserInteractions';
import { useNavigate } from 'react-router-dom';

interface ArchiveStyleArticleCardProps {
  issue: Issue;
  onClick?: () => void;
  variant?: 'default' | 'featured';
  featured?: boolean;
  className?: string;
  tagMatches?: number;
}

export const ArchiveStyleArticleCard: React.FC<ArchiveStyleArticleCardProps> = ({ 
  issue, 
  onClick, 
  variant = 'default', 
  featured = false,
  className = '',
  tagMatches = 0
}) => {
  const navigate = useNavigate();
  const { 
    hasReaction, 
    isBookmarked, 
    toggleReaction, 
    toggleBookmark,
    isUpdatingReaction,
    isUpdatingBookmark
  } = useOptimizedUserInteractions();

  const handleClick = onClick || (() => navigate(`/article/${issue.id}`));

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'short'
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

  const hasWantMoreReaction = hasReaction(issue.id, 'want_more');
  const isIssueBookmarked = isBookmarked(issue.id);

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

  // Homepage positioning: maintain fixed heights for grid consistency
  const cardClasses = variant === 'featured' 
    ? `group cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-2 bg-card border-border overflow-hidden ${className}`
    : `group cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 bg-card border-border overflow-hidden ${className}`;

  return (
    <Card 
      className={cardClasses}
      onClick={handleClick}
    >
      {/* Cover Image - Archive style with dynamic aspect ratio but homepage height control */}
      <div className={`relative overflow-hidden ${variant === 'featured' ? 'h-64' : 'h-48'}`}>
        <img
          src={coverImage}
          alt={issue.search_title || issue.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
          onError={(e) => {
            const img = e.target as HTMLImageElement;
            img.src = 'https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7';
          }}
        />
        
        {/* Enhanced Gradient Overlay for Better Text Readability - Archive style */}
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

        {/* Featured badge */}
        {(featured || issue.featured) && (
          <div className="absolute top-3 right-3 z-10">
            <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-400/30">
              Destaque
            </Badge>
          </div>
        )}

        {/* Tag Matches Indicator - Archive style */}
        {tagMatches > 0 && (
          <div className="absolute top-3 right-3 z-10">
            <Badge 
              variant="outline" 
              className="bg-white/20 backdrop-blur-sm text-white border-white/40 text-xs font-medium"
            >
              {tagMatches} match{tagMatches > 1 ? 'es' : ''}
            </Badge>
          </div>
        )}

        {/* Action buttons - Archive style positioning */}
        <div className="absolute bottom-3 right-3 flex gap-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            onClick={handleBookmarkClick}
            disabled={isUpdatingBookmark}
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
            disabled={isUpdatingReaction}
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

      {/* Content Section - Archive style with homepage spacing */}
      <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
        {/* Title - Archive style with text shadow */}
        <h3 className={`text-white font-semibold leading-tight mb-2 line-clamp-2 ${
          variant === 'featured' ? 'text-xl' : 'text-base'
        }`}
            style={{ 
              textShadow: '0 2px 8px rgba(0,0,0,0.8), 0 1px 3px rgba(0,0,0,0.9)' 
            }}>
          {issue.search_title || issue.title}
        </h3>
        
        {/* Micro Information - Archive style */}
        <div className="flex items-center justify-between text-white/80 text-xs"
             style={{ 
               textShadow: '0 1px 4px rgba(0,0,0,0.8)' 
             }}>
          <div className="flex items-center space-x-1">
            <Calendar className="w-3 h-3" />
            <span>{formatDate(issue.created_at)}</span>
          </div>
          
          <div className="flex items-center space-x-1">
            <User className="w-3 h-3" />
            <span>{issue.authors?.split(',')[0] || 'Autor'}</span>
          </div>
        </div>
      </div>

      {/* Detailed Information Overlay - Archive style hover effect */}
      <div className="absolute inset-0 bg-black/90 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4 flex flex-col justify-center z-20">
        <div className="space-y-3">
          {/* Title */}
          <h3 className={`text-white font-semibold leading-tight ${
            variant === 'featured' ? 'text-xl' : 'text-lg'
          }`}>
            {issue.search_title || issue.title}
          </h3>
          
          {/* Description */}
          {(issue.search_description || issue.description) && (
            <p className="text-white/90 text-sm leading-relaxed line-clamp-3">
              {issue.search_description || issue.description}
            </p>
          )}
          
          {/* Authors */}
          {issue.authors && (
            <div className="flex items-center space-x-2 text-white/80 text-sm">
              <User className="w-3 h-3" />
              <span>{issue.authors.split(',')[0].trim()}</span>
              {issue.authors.split(',').length > 1 && (
                <span className="text-white/60">+{issue.authors.split(',').length - 1}</span>
              )}
            </div>
          )}
          
          {/* Specialty Tags */}
          {issue.specialty && (
            <div className="flex flex-wrap gap-1">
              {issue.specialty.split(',').slice(0, 3).map((tag, index) => (
                <Badge 
                  key={index}
                  variant="outline" 
                  className="text-xs bg-white/10 text-white/90 border-white/30"
                >
                  {tag.trim()}
                </Badge>
              ))}
              {issue.specialty.split(',').length > 3 && (
                <Badge 
                  variant="outline" 
                  className="text-xs bg-white/10 text-white/60 border-white/20"
                >
                  +{issue.specialty.split(',').length - 3}
                </Badge>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};
