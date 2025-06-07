
// Enhanced results grid with optimized spacing and visual hierarchy
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
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
      <div className="space-y-8">
        <div className="animate-pulse">
          <div className="h-4 bg-muted/30 rounded w-48"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8">
          {Array.from({ length: 10 }).map((_, index) => (
            <div 
              key={index}
              className="bg-card border border-border rounded-lg overflow-hidden animate-pulse"
            >
              <div className="h-56 bg-muted/20"></div>
              <div className="p-5 space-y-3">
                <div className="h-4 bg-muted/20 rounded"></div>
                <div className="h-6 bg-muted/20 rounded"></div>
                <div className="flex gap-2">
                  <div className="h-5 bg-muted/20 rounded w-16"></div>
                  <div className="h-5 bg-muted/20 rounded w-20"></div>
                  <div className="h-5 bg-muted/20 rounded w-12"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (issues.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="max-w-md mx-auto space-y-6">
          <div className="w-20 h-20 bg-muted/20 rounded-full flex items-center justify-center mx-auto">
            <Search className="w-10 h-10 text-muted-foreground" />
          </div>
          <div className="space-y-3">
            <h3 className="text-xl font-semibold text-foreground">
              Nenhuma edição encontrada
            </h3>
            {searchQuery && (
              <p className="text-muted-foreground leading-relaxed">
                Sua busca por <span className="font-medium text-foreground">"{searchQuery}"</span> não retornou resultados. 
                <br />
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
      {/* Results header with improved typography */}
      <div className="flex justify-between items-center border-b border-border pb-4">
        <div className="text-sm text-muted-foreground">
          <span className="font-semibold text-foreground text-lg">{issues.length}</span>
          <span className="ml-1">
            edição{issues.length !== 1 ? 'ões' : ''} encontrada{issues.length !== 1 ? 's' : ''}
          </span>
        </div>
        
        {/* Sort indicator for future enhancement */}
        <div className="text-xs text-muted-foreground">
          Ordenado por relevância
        </div>
      </div>
      
      {/* Enhanced grid with better responsive breakpoints */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8">
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
