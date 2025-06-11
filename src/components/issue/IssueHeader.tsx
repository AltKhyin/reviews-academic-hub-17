
// ABOUTME: Issue header with corrected homepage navigation and fixed type issues
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Issue } from '@/types/issue';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface IssueHeaderProps {
  issue: Issue;
  showBackButton?: boolean;
}

export const IssueHeader: React.FC<IssueHeaderProps> = ({ 
  issue, 
  showBackButton = true 
}) => {
  const navigate = useNavigate();

  const handleBackToHomepage = () => {
    // Fix: Navigate to correct homepage route instead of non-existent dashboard
    navigate('/homepage');
  };

  return (
    <div className="mb-6">
      {showBackButton && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleBackToHomepage}
          className="flex items-center gap-2 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para Homepage
        </Button>
      )}
      
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Badge variant="secondary">
            Edição {issue.edition || 'N/A'}
          </Badge>
          <span className="text-sm text-gray-400">
            {formatDistanceToNow(new Date(issue.created_at), { 
              addSuffix: true, 
              locale: ptBR 
            })}
          </span>
        </div>
        
        <h1 className="text-3xl font-bold">{issue.title}</h1>
        
        {issue.description && (
          <p className="text-gray-300 text-lg">{issue.description}</p>
        )}
        
        <div className="flex items-center gap-4 text-sm text-gray-400">
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>
              Publicado em {new Date(issue.published_at || issue.created_at).toLocaleDateString('pt-BR')}
            </span>
          </div>
          
          {issue.authors && (
            <div className="flex items-center gap-1">
              <User className="h-4 w-4" />
              <span>Por {issue.authors}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
