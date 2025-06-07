
// Enhanced results grid component with improved visual design and cover support
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { IssueCard } from './IssueCard';
import { ArchiveIssue } from '@/types/archive';

interface ResultsGridProps {
  issues: Array<ArchiveIssue & { tagMatches?: number }>;
  isLoading: boolean;
  searchQuery: string;
}

export const ResultsGrid: React.FC<ResultsGridProps> = ({
  issues,
  isLoading,
  searchQuery
}) => {
  const navigate = useNavigate();

  const handleIssueClick = (issueId: string) => {
    navigate(`/article/${issueId}`);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-4 bg-muted/30 rounded w-48"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, index) => (
            <div 
              key={index}
              className="bg-card border border-border rounded-lg overflow-hidden animate-pulse"
            >
              <div className="h-48 bg-muted/20"></div>
              <div className="p-6 space-y-3">
                <div className="h-4 bg-muted/20 rounded"></div>
                <div className="h-6 bg-muted/20 rounded"></div>
                <div className="h-4 bg-muted/20 rounded"></div>
                <div className="h-4 bg-muted/20 rounded w-3/4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (issues.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="max-w-md mx-auto space-y-4">
          <div className="w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center mx-auto">
            <Search className="w-8 h-8 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-medium text-foreground">
              Nenhuma edição encontrada
            </h3>
            {searchQuery && (
              <p className="text-muted-foreground">
                Sua busca por "{searchQuery}" não retornou resultados. 
                Tente ajustar os termos de busca ou remover alguns filtros.
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{issues.length}</span>
          {' '}edição{issues.length !== 1 ? 'ões' : ''} encontrada{issues.length !== 1 ? 's' : ''}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {issues.map((issue) => (
          <IssueCard
            key={issue.id}
            issue={issue}
            onClick={handleIssueClick}
            tagMatches={issue.tagMatches}
          />
        ))}
      </div>
    </div>
  );
};
