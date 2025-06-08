
// ABOUTME: Clean, monochromatic issue card with natural dynamic height and content flow
import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, User, FileText } from 'lucide-react';
import { ArchiveIssue } from '@/types/archive';

interface IssueCardProps {
  issue: ArchiveIssue;
  onClick: (issueId: string) => void;
  tagMatches?: number;
  className?: string;
}

export const IssueCard: React.FC<IssueCardProps> = ({
  issue,
  onClick,
  tagMatches = 0,
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

  // Generate dynamic height multiplier based on content factors
  const generateHeightMultiplier = () => {
    const titleLength = (issue.search_title || issue.title).length;
    const descriptionLength = (issue.search_description || issue.description || '').length;
    const authorsCount = issue.authors ? issue.authors.split(',').length : 0;
    
    // Content complexity factor (0.85 to 1.6 multiplier)
    let heightMultiplier = 0.85;
    
    // Title impact (longer titles need more space)
    if (titleLength > 60) heightMultiplier += 0.15;
    else if (titleLength > 40) heightMultiplier += 0.1;
    else if (titleLength > 20) heightMultiplier += 0.05;
    
    // Description impact
    if (descriptionLength > 200) heightMultiplier += 0.25;
    else if (descriptionLength > 100) heightMultiplier += 0.15;
    else if (descriptionLength > 50) heightMultiplier += 0.1;
    
    // Authors impact
    if (authorsCount > 3) heightMultiplier += 0.1;
    else if (authorsCount > 1) heightMultiplier += 0.05;
    
    // Specialty tags impact
    const specialtyCount = issue.specialty ? issue.specialty.split(',').length : 0;
    if (specialtyCount > 3) heightMultiplier += 0.1;
    else if (specialtyCount > 1) heightMultiplier += 0.05;
    
    // Add some controlled randomness for visual variety
    const randomFactor = (parseInt(issue.id.slice(-2)) % 20) / 100; // 0 to 0.19
    heightMultiplier += randomFactor;
    
    // Clamp to acceptable range
    heightMultiplier = Math.max(0.85, Math.min(1.6, heightMultiplier));
    
    return heightMultiplier;
  };

  const heightMultiplier = generateHeightMultiplier();
  const baseImageHeight = 240; // Base height for image
  const imageHeight = Math.floor(baseImageHeight * heightMultiplier);

  return (
    <Card 
      className={`group cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 bg-card border-border overflow-hidden relative w-full ${className}`}
      onClick={() => onClick(issue.id)}
      style={{ height: 'auto' }} // Ensure natural height
    >
      {/* Cover Image - Dynamic Height Based on Content */}
      <div className="relative w-full" style={{ height: `${imageHeight}px` }}>
        <img
          src={coverImage}
          alt={issue.search_title || issue.title}
          className="w-full h-full object-cover"
          loading="lazy"
          onError={(e) => {
            const img = e.target as HTMLImageElement;
            img.src = 'https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7';
          }}
        />
        
        {/* Enhanced Gradient Overlay for Better Text Readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
        
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
      </div>

      {/* Content Section - Natural Flow */}
      <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
        {/* Title - Natural Line Height */}
        <h3 className="text-white font-semibold text-base leading-tight mb-2 line-clamp-3" 
            style={{ 
              textShadow: '0 2px 8px rgba(0,0,0,0.8), 0 1px 3px rgba(0,0,0,0.9)' 
            }}>
          {issue.search_title || issue.title}
        </h3>
        
        {/* Micro Information - Always Visible */}
        <div className="flex items-center justify-between text-white/80 text-xs"
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

      {/* Detailed Information - Revealed on Hover */}
      <div className="absolute inset-0 bg-black/90 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4 flex flex-col justify-center z-20">
        <div className="space-y-3">
          {/* Title */}
          <h3 className="text-white font-semibold text-lg leading-tight">
            {issue.search_title || issue.title}
          </h3>
          
          {/* Description - Variable Content */}
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
          
          {/* Specialty Tags - Variable Count */}
          {issue.specialty && (
            <div className="flex flex-wrap gap-1">
              {issue.specialty.split(',').slice(0, 4).map((tag, index) => (
                <Badge 
                  key={index}
                  variant="outline" 
                  className="text-xs bg-white/10 text-white/90 border-white/30"
                >
                  {tag.trim()}
                </Badge>
              ))}
              {issue.specialty.split(',').length > 4 && (
                <Badge 
                  variant="outline" 
                  className="text-xs bg-white/10 text-white/60 border-white/20"
                >
                  +{issue.specialty.split(',').length - 4}
                </Badge>
              )}
            </div>
          )}
          
          {/* Study Details - Additional Content */}
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
