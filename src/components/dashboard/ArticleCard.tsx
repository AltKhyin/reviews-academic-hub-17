
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Issue } from '@/types/issue';
import { useNavigate } from 'react-router-dom';
import { Calendar, User, FileText, Star, Heart, ThumbsUp, ThumbsDown, Bookmark } from 'lucide-react';
import { ArticleActions } from '@/components/article/ArticleActions';

interface ArticleCardProps {
  issue: Issue;
  featured?: boolean;
  variant?: 'default' | 'compact' | 'featured';
  className?: string;
}

export const ArticleCard: React.FC<ArticleCardProps> = ({ 
  issue, 
  featured = false, 
  variant = 'default',
  className = '' 
}) => {
  const navigate = useNavigate();

  const handleClick = (e: React.MouseEvent) => {
    // Don't navigate if clicking on action buttons
    if ((e.target as HTMLElement).closest('.article-actions')) {
      return;
    }
    navigate(`/article/${issue.id}`);
  };

  const getCardSizeClass = () => {
    switch (variant) {
      case 'compact':
        return 'h-80';
      case 'featured':
        return 'h-96 md:h-[28rem]';
      default:
        return 'h-72';
    }
  };

  const formatDate = (date: string) => {
    try {
      return new Date(date).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return 'Data inválida';
    }
  };

  const getSpecialtyColor = (specialty: string) => {
    const colors = {
      'Cardiologia': 'bg-red-500/20 text-red-300 border-red-500/30',
      'Neurologia': 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      'Oncologia': 'bg-orange-500/20 text-orange-300 border-orange-500/30',
      'Pediatria': 'bg-green-500/20 text-green-300 border-green-500/30',
      'Psiquiatria': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      'Nutrição': 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
    };
    return colors[specialty as keyof typeof colors] || 'bg-gray-500/20 text-gray-300 border-gray-500/30';
  };

  return (
    <Card 
      className={`group cursor-pointer transition-all duration-500 hover:shadow-2xl hover:shadow-primary/20 hover:scale-[1.03] hover:-translate-y-2 border-white/10 bg-gradient-to-br from-white/8 to-white/4 backdrop-blur-sm ${getCardSizeClass()} ${className} overflow-hidden`}
      onClick={handleClick}
    >
      <CardContent className="p-0 h-full flex flex-col relative">
        {/* Cover Image Section */}
        <div className="relative h-3/5 bg-gradient-to-br from-primary/15 to-secondary/15 overflow-hidden">
          {issue.cover_image_url ? (
            <div className="relative w-full h-full">
              <img 
                src={issue.cover_image_url} 
                alt={issue.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20">
              <FileText className="w-16 h-16 text-white/30" />
            </div>
          )}
          
          {/* Enhanced Status Badges */}
          <div className="absolute top-4 right-4 flex flex-col gap-2">
            {(featured || issue.featured) && (
              <Badge className="bg-gradient-to-r from-yellow-500/90 to-amber-500/90 text-yellow-900 hover:from-yellow-500 hover:to-amber-500 border-0 shadow-lg backdrop-blur-sm font-medium">
                <Star className="w-3 h-3 mr-1 fill-current" />
                Destaque
              </Badge>
            )}
            
            {!issue.published && (
              <Badge variant="secondary" className="bg-gray-500/90 text-white border-0 shadow-lg backdrop-blur-sm font-medium">
                Rascunho
              </Badge>
            )}
          </div>

          {/* Gradient Overlay for Better Text Readability */}
          <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
        </div>

        {/* Content Section */}
        <div className="p-6 h-2/5 flex flex-col justify-between bg-gradient-to-b from-transparent to-white/5">
          <div className="space-y-3 flex-1">
            {/* Title */}
            <h3 className="font-serif font-semibold text-base leading-tight line-clamp-2 group-hover:text-primary transition-colors duration-300 tracking-tight">
              {issue.title}
            </h3>
            
            {/* Description */}
            {issue.description && variant !== 'compact' && (
              <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                {issue.description}
              </p>
            )}
          </div>

          {/* Meta Information and Actions */}
          <div className="space-y-3 mt-auto">
            {/* Specialty Tags */}
            {issue.specialty && (
              <div className="flex flex-wrap gap-2">
                {issue.specialty.split(', ').slice(0, 2).map((tag, index) => (
                  <Badge 
                    key={index} 
                    variant="outline" 
                    className={`text-xs px-3 py-1 border ${getSpecialtyColor(tag.trim())} hover:scale-105 transition-transform duration-200`}
                  >
                    {tag.trim()}
                  </Badge>
                ))}
              </div>
            )}
            
            {/* Bottom Meta and Actions */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span className="font-medium">{formatDate(issue.created_at)}</span>
                </div>
                
                {issue.authors && (
                  <div className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    <span className="truncate max-w-20 font-medium">{issue.authors}</span>
                  </div>
                )}
              </div>

              {/* Article Actions */}
              <div className="article-actions opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="flex items-center gap-1">
                  <button className="p-2 hover:bg-white/10 rounded-full transition-colors duration-200 hover:scale-110">
                    <Heart className="w-4 h-4 text-gray-400 hover:text-red-400" />
                  </button>
                  <button className="p-2 hover:bg-white/10 rounded-full transition-colors duration-200 hover:scale-110">
                    <ThumbsUp className="w-4 h-4 text-gray-400 hover:text-green-400" />
                  </button>
                  <button className="p-2 hover:bg-white/10 rounded-full transition-colors duration-200 hover:scale-110">
                    <Bookmark className="w-4 h-4 text-gray-400 hover:text-blue-400" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ArticleCard;
