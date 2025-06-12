
// ABOUTME: Clean, monochromatic issue card with stable hover states and dynamic height support for Pinterest-style masonry
import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, User, FileText } from 'lucide-react';
import { ArchiveIssue } from '@/types/archive';

interface IssueCardProps {
  issue: ArchiveIssue;
  onClick: (issueId: string) => void;
  tagMatches?: number;
  height?: number; // Dynamic height support for Pinterest-style masonry layout
  className?: string;
}

export const IssueCard: React.FC<IssueCardProps> = ({
  issue,
  onClick,
  tagMatches = 0,
  height,
  className = ""
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

  // Smart text truncation based on available content and card height
  const getTruncatedDescription = (text: string, maxLength: number = 120) => {
    if (!text || text.length <= maxLength) return text;
    const truncated = text.substring(0, maxLength);
    const lastSpace = truncated.lastIndexOf(' ');
    return lastSpace > 0 ? truncated.substring(0, lastSpace) + '...' : truncated + '...';
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

  // Pinterest-style dynamic sizing - use height prop when provided, otherwise default aspect ratio
  const cardStyle = height ? { height: `${height}px` } : {};
  const aspectRatioClass = height ? '' : 'aspect-[3/4]';

  return (
    <Card 
      className={`group cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 bg-card border-border overflow-hidden ${aspectRatioClass} relative w-full ${className}`}
      style={cardStyle}
      onClick={() => onClick(issue.id)}
    >
      {/* Cover Image - Primary Visual Element */}
      <div className="absolute inset-0">
        <img
          src={coverImage}
          alt={issue.search_title || issue.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            const img = e.target as HTMLImageElement;
            img.src = 'https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7';
          }}
        />
        
        {/* Enhanced Gradient Overlay for Better Text Readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
      </div>

      {/* Edition Badge - Top Corner */}
      <div className="absolute top-3 left-3 z-10">
        <Badge 
          variant="outline" 
          className="bg-black/60 backdrop-blur-sm text-white border-white/30 text-xs font-medium"
        >
          {getEditionNumber()}
        </Badge>
      </div>

      {/* Tag Matches Indicator */}
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

      {/* Content Overlay - Always Visible with Enhanced Shadow */}
      <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
        {/* Title - Secondary Element with Enhanced Shadow */}
        <h3 className="text-white font-semibold text-lg leading-tight mb-3 line-clamp-2" 
            style={{ 
              textShadow: '0 2px 8px rgba(0,0,0,0.8), 0 1px 3px rgba(0,0,0,0.9)' 
            }}>
          {issue.search_title || issue.title}
        </h3>
        
        {/* Micro Information - Tertiary Elements with Enhanced Shadow */}
        <div className="flex items-center justify-between text-white/80 text-sm"
             style={{ 
               textShadow: '0 1px 4px rgba(0,0,0,0.8)' 
             }}>
          <div className="flex items-center space-x-1">
            <Calendar className="w-3 h-3" />
            <span>{formatDate(issue.published_at || issue.created_at)}</span>
          </div>
          
          <div className="flex items-center space-x-1">
            <FileText className="w-3 h-3" />
            <span>PDF</span>
          </div>
        </div>
      </div>

      {/* Detailed Information - Revealed on Hover - Optimized for Variable Heights */}
      <div className="absolute inset-0 bg-black/90 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4 flex flex-col justify-between z-20">
        <div className="flex-1 space-y-3 overflow-hidden">
          {/* Title */}
          <h3 className="text-white font-semibold text-xl leading-tight line-clamp-3">
            {issue.search_title || issue.title}
          </h3>
          
          {/* Description with smart truncation adapted to card height */}
          {(issue.search_description || issue.description) && (
            <p className="text-white/90 text-sm leading-relaxed flex-1 overflow-hidden">
              {getTruncatedDescription(
                issue.search_description || issue.description || '', 
                height ? Math.round(height * 0.25) : 100 // Adapt description length to card height
              )}
            </p>
          )}
          
          {/* Authors */}
          {issue.authors && (
            <div className="flex items-center space-x-2 text-white/80 text-sm">
              <User className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">{issue.authors.split(',')[0].trim()}</span>
              {issue.authors.split(',').length > 1 && (
                <span className="text-white/60 flex-shrink-0">+{issue.authors.split(',').length - 1}</span>
              )}
            </div>
          )}
        </div>
        
        {/* Bottom section with tags and details */}
        <div className="space-y-2 pt-2">
          {/* Specialty Tags */}
          {issue.specialty && (
            <div className="flex flex-wrap gap-1">
              {issue.specialty.split(',').slice(0, 2).map((tag, index) => (
                <Badge 
                  key={index}
                  variant="outline" 
                  className="text-xs bg-white/10 text-white/90 border-white/30 truncate max-w-20"
                >
                  {tag.trim()}
                </Badge>
              ))}
              {issue.specialty.split(',').length > 2 && (
                <Badge 
                  variant="outline" 
                  className="text-xs bg-white/10 text-white/60 border-white/20"
                >
                  +{issue.specialty.split(',').length - 2}
                </Badge>
              )}
            </div>
          )}
          
          {/* Study Details */}
          {issue.year && (
            <div className="text-xs text-white/70 border-t border-white/20 pt-2 truncate">
              Estudo de {issue.year}
              {issue.design && ` • ${issue.design}`}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};
