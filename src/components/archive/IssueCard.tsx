
// ABOUTME: Redesigned card for masonry layout with dynamic heights and improved readability
import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, User, FileText } from 'lucide-react';
import { ArchiveIssue } from '@/types/archive';

interface IssueCardProps {
  issue: ArchiveIssue;
  onClick: (issueId: string) => void;
  tagMatches?: number;
  heightVariant: 'small' | 'medium' | 'large' | 'featured';
  isFeatured?: boolean;
}

export const IssueCard: React.FC<IssueCardProps> = ({
  issue,
  onClick,
  tagMatches = 0,
  heightVariant,
  isFeatured = false
}) => {
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

  // Placeholder covers for visual appeal
  const placeholderCovers = [
    'https://images.unsplash.com/photo-1649972904349-6e44c42644a7',
    'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b',
    'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158',
    'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5',
    'https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7'
  ];

  const coverImage = issue.cover_image_url || 
    placeholderCovers[parseInt(issue.id.slice(-1)) % placeholderCovers.length];

  // Content visibility based on height variant
  const showDescription = heightVariant === 'large' || heightVariant === 'featured';
  const showExtendedInfo = heightVariant === 'featured';
  const showAuthors = heightVariant !== 'small';

  return (
    <Card 
      className="group cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 bg-card border-border overflow-hidden h-full relative"
      onClick={() => onClick(issue.id)}
    >
      {/* Cover Image - Flexible height based on variant */}
      <div className={`relative overflow-hidden ${
        heightVariant === 'small' ? 'h-32' :
        heightVariant === 'medium' ? 'h-40' :
        heightVariant === 'large' ? 'h-48' :
        'h-56' // featured
      }`}>
        <img
          src={coverImage}
          alt={issue.search_title || issue.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            const img = e.target as HTMLImageElement;
            img.src = 'https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7';
          }}
        />
        
        {/* Enhanced gradient overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
        
        {/* Top badges */}
        <div className="absolute top-3 left-3 right-3 flex justify-between items-start z-10">
          <Badge 
            variant="outline" 
            className="bg-black/70 backdrop-blur-sm text-white border-white/40 text-xs font-medium shadow-lg"
          >
            {getEditionNumber()}
          </Badge>
          
          {tagMatches > 0 && (
            <Badge 
              variant="outline" 
              className="bg-white/20 backdrop-blur-sm text-white border-white/40 text-xs font-medium shadow-lg"
            >
              {tagMatches} match{tagMatches > 1 ? 'es' : ''}
            </Badge>
          )}
        </div>
      </div>

      {/* Content area - Always visible with dynamic height */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        {/* Title - Always visible with enhanced shadows */}
        <div className="mb-3">
          <h3 className="text-foreground font-semibold leading-tight line-clamp-2 drop-shadow-sm text-lg">
            {issue.search_title || issue.title}
          </h3>
        </div>
        
        {/* Description - Conditional based on height variant */}
        {showDescription && (issue.search_description || issue.description) && (
          <div className="mb-3 flex-1">
            <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3">
              {issue.search_description || issue.description}
            </p>
          </div>
        )}
        
        {/* Meta information */}
        <div className="space-y-2">
          {/* Authors - Conditional display */}
          {showAuthors && issue.authors && (
            <div className="flex items-center space-x-2 text-muted-foreground text-sm">
              <User className="w-3 h-3" />
              <span className="truncate">
                {issue.authors.split(',')[0].trim()}
                {issue.authors.split(',').length > 1 && (
                  <span className="text-muted-foreground/70">
                    {' '}+{issue.authors.split(',').length - 1}
                  </span>
                )}
              </span>
            </div>
          )}
          
          {/* Extended info for featured cards */}
          {showExtendedInfo && issue.specialty && (
            <div className="flex flex-wrap gap-1 mb-2">
              {issue.specialty.split(',').slice(0, 3).map((tag, index) => (
                <Badge 
                  key={index}
                  variant="outline" 
                  className="text-xs bg-muted/10 text-muted-foreground border-border"
                >
                  {tag.trim()}
                </Badge>
              ))}
              {issue.specialty.split(',').length > 3 && (
                <Badge 
                  variant="outline" 
                  className="text-xs bg-muted/10 text-muted-foreground/60 border-border"
                >
                  +{issue.specialty.split(',').length - 3}
                </Badge>
              )}
            </div>
          )}
          
          {/* Bottom row - Date and PDF indicator */}
          <div className="flex items-center justify-between text-muted-foreground text-sm">
            <div className="flex items-center space-x-1">
              <Calendar className="w-3 h-3" />
              <span>{formatDate(issue.published_at || issue.created_at)}</span>
            </div>
            
            <div className="flex items-center space-x-1">
              <FileText className="w-3 h-3" />
              <span>PDF</span>
            </div>
          </div>
          
          {/* Study details for featured cards */}
          {showExtendedInfo && issue.year && (
            <div className="text-xs text-muted-foreground/80 pt-2 border-t border-border">
              Estudo de {issue.year}
              {issue.design && ` • ${issue.design}`}
            </div>
          )}
        </div>
      </div>

      {/* Hover overlay - Appears on hover without changing layout */}
      <div className="absolute inset-0 bg-black/95 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4 flex flex-col justify-center z-20">
        <div className="space-y-4 text-center">
          {/* Enhanced title on hover */}
          <h3 className="text-white font-semibold text-xl leading-tight">
            {issue.search_title || issue.title}
          </h3>
          
          {/* Full description on hover */}
          {(issue.search_description || issue.description) && (
            <p className="text-white/90 text-sm leading-relaxed line-clamp-4">
              {issue.search_description || issue.description}
            </p>
          )}
          
          {/* Complete metadata on hover */}
          <div className="space-y-2 text-white/80 text-sm">
            {issue.authors && (
              <div className="flex items-center justify-center space-x-2">
                <User className="w-3 h-3" />
                <span>{issue.authors.split(',')[0].trim()}</span>
                {issue.authors.split(',').length > 1 && (
                  <span className="text-white/60">+{issue.authors.split(',').length - 1}</span>
                )}
              </div>
            )}
            
            <div className="text-xs text-white/70">
              {formatDate(issue.published_at || issue.created_at)}
              {issue.year && ` • Estudo de ${issue.year}`}
              {issue.design && ` • ${issue.design}`}
            </div>
          </div>
          
          {/* Click hint */}
          <div className="text-white/60 text-xs font-medium">
            Clique para ver o review completo
          </div>
        </div>
      </div>
    </Card>
  );
};
