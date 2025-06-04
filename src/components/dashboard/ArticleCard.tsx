
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Issue } from '@/types/issue';
import { useNavigate } from 'react-router-dom';
import { Calendar, User, FileText, Star } from 'lucide-react';

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

  const handleClick = () => {
    navigate(`/article/${issue.id}`);
  };

  const getCardSizeClass = () => {
    switch (variant) {
      case 'compact':
        return 'h-32';
      case 'featured':
        return 'h-64 md:h-80';
      default:
        return 'h-48';
    }
  };

  const formatDate = (date: string) => {
    try {
      return new Date(date).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return 'Data inválida';
    }
  };

  const getSpecialtyColor = (specialty: string) => {
    const colors = {
      'Cardiologia': 'bg-red-500/20 text-red-300',
      'Neurologia': 'bg-purple-500/20 text-purple-300',
      'Oncologia': 'bg-orange-500/20 text-orange-300',
      'Pediatria': 'bg-green-500/20 text-green-300',
      'Psiquiatria': 'bg-blue-500/20 text-blue-300',
      'Nutrição': 'bg-yellow-500/20 text-yellow-300',
    };
    return colors[specialty as keyof typeof colors] || 'bg-gray-500/20 text-gray-300';
  };

  return (
    <Card 
      className={`group cursor-pointer transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 hover:scale-[1.02] border-white/10 bg-white/5 backdrop-blur-sm ${getCardSizeClass()} ${className}`}
      onClick={handleClick}
    >
      <CardContent className="p-0 h-full flex flex-col">
        {/* Cover Image */}
        <div className="relative h-1/2 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-t-lg overflow-hidden">
          {issue.cover_image_url ? (
            <img 
              src={issue.cover_image_url} 
              alt={issue.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <FileText className="w-12 h-12 text-white/30" />
            </div>
          )}
          
          {/* Featured Badge */}
          {(featured || issue.featured) && (
            <div className="absolute top-2 right-2">
              <Badge className="bg-yellow-500/90 text-yellow-900 hover:bg-yellow-500">
                <Star className="w-3 h-3 mr-1" />
                Destaque
              </Badge>
            </div>
          )}
          
          {/* Published Status */}
          {!issue.published && (
            <div className="absolute top-2 left-2">
              <Badge variant="secondary" className="bg-gray-500/90 text-white">
                Rascunho
              </Badge>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 h-1/2 flex flex-col justify-between">
          <div className="space-y-2">
            {/* Title */}
            <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-primary transition-colors">
              {issue.title}
            </h3>
            
            {/* Description */}
            {issue.description && variant !== 'compact' && (
              <p className="text-xs text-muted-foreground line-clamp-2">
                {issue.description}
              </p>
            )}
          </div>

          {/* Meta Information */}
          <div className="space-y-2 mt-auto">
            {/* Specialty Tags */}
            {issue.specialty && (
              <div className="flex flex-wrap gap-1">
                {issue.specialty.split(', ').slice(0, 2).map((tag, index) => (
                  <Badge 
                    key={index} 
                    variant="outline" 
                    className={`text-xs px-2 py-0.5 ${getSpecialtyColor(tag.trim())}`}
                  >
                    {tag.trim()}
                  </Badge>
                ))}
              </div>
            )}
            
            {/* Bottom Meta */}
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>{formatDate(issue.created_at)}</span>
              </div>
              
              {issue.authors && (
                <div className="flex items-center gap-1">
                  <User className="w-3 h-3" />
                  <span className="truncate max-w-20">{issue.authors}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ArticleCard;
