
// ABOUTME: Standardized ArticleCard using coordinated data access patterns
// Replaces individual API calls with coordinated user interaction data

import React from 'react';
import { useStandardizedData } from '@/hooks/useStandardizedData';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bookmark, Heart, Share2, ExternalLink } from 'lucide-react';
import { useAppNavigation } from '@/hooks/useAppNavigation';
import { architecturalGuards } from '@/core/ArchitecturalGuards';

interface StandardizedArticleCardProps {
  issue: {
    id: string;
    title: string;
    description?: string;
    cover_image_url?: string;
    specialty?: string;
    published_at?: string;
    authors?: string;
    score?: number;
  };
  variant?: 'default' | 'featured' | 'compact';
  className?: string;
}

export const StandardizedArticleCard: React.FC<StandardizedArticleCardProps> = ({
  issue,
  variant = 'default',
  className = ''
}) => {
  const { navigateToIssue } = useAppNavigation();
  
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

  // Get user interaction state from coordinated data (no individual API calls)
  const isBookmarkedState = isBookmarked(issue.id);
  const hasLikeReaction = hasReaction(issue.id, 'like');

  const handleCardClick = () => {
    console.log('ArticleCard: Navigating via coordinated navigation:', issue.id);
    navigateToIssue(issue.id);
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

  const handleLikeClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await toggleReaction(issue.id, 'like');
      console.log('ArticleCard: Reaction toggled via coordinated action');
    } catch (error) {
      console.error('ArticleCard: Reaction error:', error);
    }
  };

  const handleShareClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}/issue/${issue.id}`;
    navigator.clipboard.writeText(url);
    console.log('ArticleCard: Issue URL copied to clipboard');
  };

  const cardVariantClasses = {
    default: 'p-4',
    featured: 'p-6',
    compact: 'p-3'
  };

  const imageVariantClasses = {
    default: 'h-48',
    featured: 'h-64',
    compact: 'h-32'
  };

  return (
    <Card 
      className={`cursor-pointer hover:shadow-lg transition-shadow ${className}`}
      onClick={handleCardClick}
    >
      <CardContent className={cardVariantClasses[variant]}>
        {/* Cover Image */}
        {issue.cover_image_url && (
          <div className={`w-full ${imageVariantClasses[variant]} mb-4 overflow-hidden rounded-lg`}>
            <img
              src={issue.cover_image_url}
              alt={issue.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        )}

        {/* Content */}
        <div className="space-y-3">
          {/* Specialty Badge */}
          {issue.specialty && (
            <div className="flex flex-wrap gap-2">
              <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                {issue.specialty}
              </span>
            </div>
          )}

          {/* Title */}
          <h3 className={`font-semibold line-clamp-2 ${
            variant === 'featured' ? 'text-xl' : 'text-lg'
          }`}>
            {issue.title}
          </h3>

          {/* Description */}
          {issue.description && (
            <p className="text-muted-foreground text-sm line-clamp-3">
              {issue.description}
            </p>
          )}

          {/* Authors */}
          {issue.authors && (
            <p className="text-xs text-muted-foreground">
              Por: {issue.authors}
            </p>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center space-x-2">
              {/* Bookmark - Coordinated Action */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBookmarkClick}
                disabled={userDataLoading}
                className={`h-8 w-8 p-0 ${isBookmarkedState ? 'text-primary' : 'text-muted-foreground'}`}
              >
                <Bookmark className={`h-4 w-4 ${isBookmarkedState ? 'fill-current' : ''}`} />
              </Button>

              {/* Like - Coordinated Action */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLikeClick}
                disabled={userDataLoading}
                className={`h-8 w-8 p-0 ${hasLikeReaction ? 'text-red-500' : 'text-muted-foreground'}`}
              >
                <Heart className={`h-4 w-4 ${hasLikeReaction ? 'fill-current' : ''}`} />
              </Button>

              {/* Share */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleShareClick}
                className="h-8 w-8 p-0 text-muted-foreground"
              >
                <Share2 className="h-4 w-4" />
              </Button>
            </div>

            {/* Score/Read More */}
            <div className="flex items-center space-x-2">
              {issue.score && (
                <span className="text-xs text-muted-foreground">
                  {issue.score} pts
                </span>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-muted-foreground"
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
