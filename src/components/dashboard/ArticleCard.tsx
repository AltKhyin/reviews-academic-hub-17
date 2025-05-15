
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Issue } from '@/types/issue';
import { useAuth } from '@/contexts/AuthContext';
import { ArticleCardActions } from './ArticleCardActions';
import { useArticleCard } from './hooks/useArticleCard';

interface ArticleCardProps {
  issue: Issue;
  className?: string;
}

export const ArticleCard = ({ issue, className = '' }: ArticleCardProps) => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const { 
    isBookmarked,
    hasLiked,
    isDeleting,
    isLoadingBookmark,
    isLoadingReactions,
    toggleBookmark,
    toggleLike,
    handleDelete
  } = useArticleCard(issue);
  
  // Format tags for display
  const specialties = issue.specialty?.split(', ') || [];

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't navigate if clicking on the buttons
    if ((e.target as Element).closest('button')) {
      return;
    }
    navigate(`/article/${issue.id}`);
  };
  
  return (
    <Card 
      className={`overflow-hidden hover:bg-accent/10 cursor-pointer transition-all ${className}`}
      onClick={handleCardClick}
    >
      <div className="relative">
        {/* Optional Cover Image */}
        {issue.cover_image_url && (
          <img 
            src={issue.cover_image_url} 
            alt={issue.title} 
            className="w-full h-[150px] object-cover" 
          />
        )}
        
        {/* Featured Badge */}
        {issue.featured && (
          <Badge 
            variant="default" 
            className="absolute top-2 right-2 bg-amber-500"
          >
            Em destaque
          </Badge>
        )}
      </div>
      
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg line-clamp-2">{issue.title}</h3>
        
        {issue.description && (
          <p className="text-muted-foreground mt-2 text-sm line-clamp-3">
            {issue.description}
          </p>
        )}
        
        {/* Specialty Tags */}
        {specialties.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {specialties.map((specialty) => (
              <Badge key={specialty} variant="outline" className="text-xs">
                {specialty}
              </Badge>
            ))}
          </div>
        )}
        
        <ArticleCardActions 
          id={issue.id}
          isBookmarked={isBookmarked}
          hasLiked={hasLiked}
          isAdmin={isAdmin}
          isDeleting={isDeleting}
          isLoadingBookmark={isLoadingBookmark}
          isLoadingReactions={isLoadingReactions}
          onToggleBookmark={toggleBookmark.mutate}
          onToggleLike={toggleLike.mutate}
          onDelete={handleDelete}
        />
      </CardContent>
    </Card>
  );
};
