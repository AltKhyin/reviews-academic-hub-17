
// Minimal issue card with upward overlay expansion for optimal catalog experience
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
      className="group cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 bg-card border-border hover:border-muted overflow-hidden relative"
      onClick={() => onClick(issue.id)}
    >
      {/* Cover Image with optimized aspect ratio */}
      <div className="relative h-48 overflow-hidden bg-muted/10">
        <img
          src={coverImage}
          alt={issue.search_title || issue.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            const img = e.target as HTMLImageElement;
            img.src = 'https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7';
          }}
        />
        
        {/* Static badges on cover */}
        <div className="absolute top-3 left-3 flex items-center space-x-2">
          <Badge 
            variant="outline" 
            className="bg-black/60 backdrop-blur-sm text-white border-white/30 text-xs"
          >
            {getEditionNumber()}
          </Badge>
          {issue.featured && (
            <Badge 
              variant="outline" 
              className="bg-black/60 backdrop-blur-sm text-white border-white/30 text-xs flex items-center space-x-1"
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
              className="bg-green-500/80 backdrop-blur-sm text-white border-green-400/50 text-xs"
            >
              {tagMatches} match{tagMatches > 1 ? 'es' : ''}
            </Badge>
          )}
        )}

        {/* Upward expanding overlay - covers the entire cover area on hover */}
        <div className="absolute inset-0 bg-black/90 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-center p-4">
          <div className="space-y-3 text-white">
            {(issue.search_description || issue.description) && (
              <p className="text-sm leading-relaxed line-clamp-4">
                {issue.search_description || issue.description}
              </p>
            )}
            
            {issue.specialty && (
              <div className="flex flex-wrap gap-1">
                {issue.specialty.split(',').slice(0, 4).map((tag, index) => (
                  <Badge 
                    key={index}
                    variant="outline" 
                    className="text-xs bg-green-500/20 text-green-300 border-green-400/50"
                  >
                    {tag.trim()}
                  </Badge>
                ))}
                {issue.specialty.split(',').length > 4 && (
                  <Badge 
                    variant="outline" 
                    className="text-xs bg-white/20 text-white border-white/30"
                  >
                    +{issue.specialty.split(',').length - 4}
                  </Badge>
                )}
              </div>
            )}
            
            {issue.year && (
              <div className="text-xs text-gray-300 pt-2 border-t border-white/20">
                Estudo de {issue.year}
                {issue.design && ` • ${issue.design}`}
              </div>
            )}
          </div>
        </div>
      </div>

      <CardContent className="p-4">
        {/* Minimal info always visible */}
        <div className="space-y-3">
          <h3 className="text-base font-semibold text-foreground line-clamp-2 leading-tight min-h-[2.5rem]">
            {issue.search_title || issue.title}
          </h3>
          
          {/* Essential pills with consistent styling */}
          <div className="flex flex-wrap gap-2">
            {issue.authors && (
              <Badge variant="outline" className="text-xs bg-muted/10 text-muted-foreground border-border">
                <User className="w-3 h-3 mr-1" />
                {issue.authors.split(',')[0].trim()}
              </Badge>
            )}
            
            <Badge variant="outline" className="text-xs bg-muted/10 text-muted-foreground border-border">
              <Calendar className="w-3 h-3 mr-1" />
              {formatDate(issue.published_at || issue.created_at)}
            </Badge>
            
            <Badge variant="outline" className="text-xs bg-muted/10 text-muted-foreground border-border">
              <FileText className="w-3 h-3 mr-1" />
              PDF
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
