
// ABOUTME: Clean, monochromatic issue card with stable hover states and visual hierarchy
import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, User, FileText } from 'lucide-react';
import { ArchiveIssue } from '@/types/archive';

interface IssueCardProps {
  issue: ArchiveIssue;
  onClick: (issueId: string) => void;
  tagMatches?: number;
}

export const IssueCard: React.FC<IssueCardProps> = ({
  issue,
  onClick,
  tagMatches = 0
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

  return (
    <Card 
      className="group cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 bg-card border-border overflow-hidden aspect-[3/4] relative"
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
        
        {/* Gradient Overlay for Text Readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
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

      {/* Content Overlay - Always Visible */}
      <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
        {/* Title - Secondary Element */}
        <h3 className="text-white font-semibold text-lg leading-tight mb-3 line-clamp-2">
          {issue.search_title || issue.title}
        </h3>
        
        {/* Micro Information - Tertiary Elements */}
        <div className="flex items-center justify-between text-white/80 text-sm">
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

      {/* Detailed Information - Revealed on Hover */}
      <div className="absolute inset-0 bg-black/90 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4 flex flex-col justify-center z-20">
        <div className="space-y-4">
          {/* Title */}
          <h3 className="text-white font-semibold text-xl leading-tight">
            {issue.search_title || issue.title}
          </h3>
          
          {/* Description */}
          {(issue.search_description || issue.description) && (
            <p className="text-white/90 text-sm leading-relaxed line-clamp-4">
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
          
          {/* Study Details */}
          {issue.year && (
            <div className="text-xs text-white/70 pt-2 border-t border-white/20">
              Estudo de {issue.year}
              {issue.design && ` • ${issue.design}`}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};
