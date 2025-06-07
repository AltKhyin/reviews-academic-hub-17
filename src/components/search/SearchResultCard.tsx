
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Issue } from '@/types/issue';
import { useNavigate } from 'react-router-dom';
import { Calendar, User, FileText, ExternalLink, Download } from 'lucide-react';

interface SearchResultCardProps {
  article: Issue;
}

export const SearchResultCard: React.FC<SearchResultCardProps> = ({ article }) => {
  const navigate = useNavigate();

  const handleView = () => {
    navigate(`/article/${article.id}`);
  };

  const handleDownloadPDF = () => {
    if (article.pdf_url) {
      window.open(article.pdf_url, '_blank');
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
    // All specialties use grayscale - no color coding
    return 'bg-muted text-muted-foreground border-border';
  };

  return (
    <Card className="border bg-card hover:shadow-lg transition-all duration-300">
      <CardContent className="p-6">
        <div className="flex gap-4">
          {/* Thumbnail */}
          <div className="flex-shrink-0 w-24 h-24 bg-muted rounded-lg overflow-hidden">
            {article.cover_image_url ? (
              <img 
                src={article.cover_image_url} 
                alt={article.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <FileText className="w-8 h-8 text-muted-foreground" />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 space-y-3">
            {/* Title */}
            <div>
              <h3 className="text-lg font-semibold hover:text-foreground transition-colors cursor-pointer" onClick={handleView}>
                {article.title}
              </h3>
              {article.real_title && article.real_title !== article.title && (
                <p className="text-sm text-muted-foreground mt-1">
                  Título original: {article.real_title}
                </p>
              )}
            </div>

            {/* Description */}
            {article.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {article.description}
              </p>
            )}

            {/* Meta Information */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              {article.authors && (
                <div className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  <span>{article.authors}</span>
                </div>
              )}
              
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(article.created_at)}</span>
              </div>

              {article.year && (
                <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded">
                  {article.year}
                </span>
              )}

              {article.design && (
                <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded">
                  {article.design}
                </span>
              )}
            </div>

            {/* Specialty Tags - All Grayscale */}
            {article.specialty && (
              <div className="flex flex-wrap gap-2">
                {article.specialty.split(', ').map((tag, index) => (
                  <Badge 
                    key={index} 
                    variant="outline" 
                    className={`text-xs ${getSpecialtyColor(tag.trim())}`}
                  >
                    {tag.trim()}
                  </Badge>
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-2 pt-2">
              <Button 
                onClick={handleView}
                className="flex items-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                Visualizar
              </Button>
              
              {article.pdf_url && (
                <Button 
                  variant="outline" 
                  onClick={handleDownloadPDF}
                  className="flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  PDF
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SearchResultCard;
