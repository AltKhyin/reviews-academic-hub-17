
// ABOUTME: Article action buttons with corrected homepage navigation and fixed props
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, BookOpen, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ArticleActionsProps {
  onToggleBookmark?: () => void;
  isBookmarked?: boolean;
  showBackButton?: boolean;
  // Remove articleId and entityType as they're not used in this component
}

export const ArticleActions: React.FC<ArticleActionsProps> = ({
  onToggleBookmark,
  isBookmarked = false,
  showBackButton = true
}) => {
  const navigate = useNavigate();

  const handleBackToHomepage = () => {
    // Fix: Navigate to correct homepage route instead of non-existent dashboard
    navigate('/homepage');
  };

  return (
    <div className="flex items-center gap-2 mb-4">
      {showBackButton && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleBackToHomepage}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para Homepage
        </Button>
      )}
      
      {onToggleBookmark && (
        <Button
          variant={isBookmarked ? "default" : "outline"}
          size="sm"
          onClick={onToggleBookmark}
          className="flex items-center gap-2"
        >
          <BookOpen className="h-4 w-4" />
          {isBookmarked ? 'Remover dos Salvos' : 'Salvar Artigo'}
        </Button>
      )}
    </div>
  );
};
