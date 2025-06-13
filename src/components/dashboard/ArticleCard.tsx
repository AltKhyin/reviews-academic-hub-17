
// ABOUTME: Migrated ArticleCard using coordinated data access patterns
// Replaces individual user interaction API calls with shared context

import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, User, Heart, Bookmark } from 'lucide-react';
import { Issue } from '@/types/issue';
import { useStandardizedData } from '@/hooks/useStandardizedData';
import { useNavigate } from 'react-router-dom';
import { architecturalGuards } from '@/core/ArchitecturalGuards';

interface ArticleCardProps {
  issue: Issue;
  onClick?: () => void;
  variant?: 'default' | 'featured';
  featured?: boolean;
  className?: string;
}

export const ArticleCard: React.FC<ArticleCardProps> = ({ 
  issue, 
  onClick, 
  variant = 'default', 
  featured = false,
  className = '' 
}) => {
  const navigate = useNavigate();
  
  // ARCHITECTURAL FIX: Use coordinated user context instead of individual API calls
  const { 
    isBookmarked,
    hasReaction, 
    toggleBookmark,
    toggleReaction,
    loading: userDataLoading
  } = useStandardizedData.useUserContext();

  // PERFORMANCE MONITORING: Track coordination usage
  React.useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      // Verify no direct API calls in this component
      const violations = architecturalGuards.flagArchitecturalViolations();
      const cardViolations = violations.filter(v => v.component.includes('ArticleCard'));
      
      if (cardViolations.length > 0) {
        console.warn('🚨 ArticleCard: Architectural violations detected:', cardViolations);
      } else {
        console.log('✅ ArticleCard: Using coordinated data access successfully');
      }
    }
  }, []);

  const handleClick = onClick || (() => navigate(`/article/${issue.id}`));

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleReactionClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await toggleReaction(issue.id, 'want_more');
      console.log('ArticleCard: Reaction toggled via coordinated action');
    } catch (error) {
      console.error('ArticleCard: Reaction error:', error);
    }
  };

  const handleBookmarkClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await toggleBookmark(issue.id);
      console.log('ArticleCard: Bookmark toggled via coordinated action');
    } catch (error) {
      console.error('ArticleCard: Bookmark error:', error);
    }
  };

  // Use coordinated data instead of individual context calls
  const hasWantMoreReaction = hasReaction(issue.id, 'want_more');
  const isIssueBookmarked = isBookmarked(issue.id);

  // Different styling for featured variant
  const cardClasses = variant === 'featured' 
    ? `group cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-2 bg-card border-border overflow-hidden h-96 ${className}`
    : `group cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 bg-card border-border overflow-hidden ${className}`;

  return (
    <Card 
      className={cardClasses}
      onClick={handleClick}
    >
      {/* Cover Image - Primary Visual Element */}
      <div className={`relative overflow-hidden ${variant === 'featured' ? 'aspect-video' : 'aspect-video'}`}>
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
        
        {/* Featured badge */}
        {(featured || issue.featured) && (
          <div className="absolute top-3 left-3 z-10">
            <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-400/30">
              Destaque
            </Badge>
          </div>
        )}
      </div>
      
      {/* Action buttons using coordinated data */}
      <div className="absolute top-3 right-3 flex gap-2 z-10">
        <button
          onClick={handleBookmarkClick}
          disabled={userDataLoading}
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
          disabled={userDataLoading}
          className={`p-2 rounded-full backdrop-blur-sm transition-colors ${
            hasWantMoreReaction 
              ? 'bg-red-500/20 text-red-400' 
              : 'bg-black/20 text-white hover:bg-black/40'
          }`}
        >
          <Heart className={`w-4 h-4 ${hasWantMoreReaction ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* Content Overlay - Always Visible with Enhanced Shadow */}
      <div className="p-4">
        {/* Title - Secondary Element with Enhanced Shadow */}
        <h3 className={`font-semibold leading-tight mb-2 line-clamp-2 text-foreground ${
          variant === 'featured' ? 'text-xl' : 'text-lg'
        }`}>
          {issue.search_title || issue.title}
        </h3>
        
        {/* Micro Information - Tertiary Elements with Enhanced Shadow */}
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
      </div>
    </Card>
  );
};
