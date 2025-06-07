
// Enhanced issue card component with cover image support and improved visual design
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, User, FileText, Star } from 'lucide-react';
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
    // Extract edition number from title or use a default format
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

  // Use cover_image_url if available, otherwise use a deterministic placeholder
  const coverImage = issue.cover_image_url || 
    placeholderCovers[parseInt(issue.id.slice(-1)) % placeholderCovers.length];

  return (
    <Card 
      className="group cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 bg-card border-border hover:border-muted overflow-hidden"
      onClick={() => onClick(issue.id)}
    >
      {/* Cover Image */}
      <div className="relative h-48 overflow-hidden bg-muted/10">
        <img
          src={coverImage}
          alt={issue.search_title || issue.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={(e) => {
            const img = e.target as HTMLImageElement;
            img.src = 'https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7';
          }}
        />
        
        {/* Overlay with edition number and featured badge */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent">
          <div className="absolute top-3 left-3 flex items-center space-x-2">
            <Badge 
              variant="outline" 
              className="bg-black/20 backdrop-blur-sm text-white border-white/20 text-xs"
            >
              {getEditionNumber()}
            </Badge>
            {issue.featured && (
              <Badge 
                variant="outline" 
                className="bg-black/20 backdrop-blur-sm text-white border-white/20 text-xs flex items-center space-x-1"
              >
                <Star className="w-3 h-3 fill-current" />
                <span>Destaque</span>
              </Badge>
            )}
          </div>
          
          {tagMatches > 0 && (
            <div className="absolute top-3 right-3">
              <Badge 
                variant="outline" 
                className="bg-black/20 backdrop-blur-sm text-white border-white/20 text-xs"
              >
                {tagMatches} match{tagMatches > 1 ? 'es' : ''}
              </Badge>
            </div>
          )}
        </div>
      </div>

      <CardContent className="p-6 space-y-4">
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-foreground line-clamp-2 group-hover:text-muted-foreground transition-colors leading-tight">
            {issue.search_title || issue.title}
          </h3>
          
          {(issue.search_description || issue.description) && (
            <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
              {issue.search_description || issue.description}
            </p>
          )}
        </div>
        
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center space-x-3">
            {issue.authors && (
              <div className="flex items-center space-x-1">
                <User className="w-3 h-3" />
                <span className="line-clamp-1 max-w-24">{issue.authors.split(',')[0].trim()}</span>
              </div>
            )}
            <div className="flex items-center space-x-1">
              <Calendar className="w-3 h-3" />
              <span>{formatDate(issue.published_at || issue.created_at)}</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-1">
            <FileText className="w-3 h-3" />
            <span>PDF</span>
          </div>
        </div>
        
        {issue.specialty && (
          <div className="flex flex-wrap gap-1 pt-2 border-t border-border">
            {issue.specialty.split(',').slice(0, 2).map((tag, index) => (
              <Badge 
                key={index}
                variant="outline" 
                className="text-xs bg-transparent text-muted-foreground border-border"
              >
                {tag.trim()}
              </Badge>
            ))}
            {issue.specialty.split(',').length > 2 && (
              <Badge 
                variant="outline" 
                className="text-xs bg-transparent text-muted-foreground border-border"
              >
                +{issue.specialty.split(',').length - 2}
              </Badge>
            )}
          </div>
        )}
        
        {issue.year && (
          <div className="text-xs text-muted-foreground pt-1">
            Estudo de {issue.year}
            {issue.design && ` • ${issue.design}`}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
