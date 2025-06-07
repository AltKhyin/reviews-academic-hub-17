
// ABOUTME: Clean results grid with discrete search integration
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { IssueCard } from './IssueCard';
import { ArchiveIssue } from '@/types/archive';

interface ResultsGridProps {
  issues: Array<ArchiveIssue & { tagMatches?: number }>;
  isLoading: boolean;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const ResultsGrid: React.FC<ResultsGridProps> = ({
  issues,
  isLoading,
  searchQuery,
  onSearchChange
}) => {
  const navigate = useNavigate();

  const handleIssueClick = (issueId: string) => {
    navigate(`/article/${issueId}`);
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        {/* Loading State */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, index) => (
            <div 
              key={index}
              className="bg-card border border-border rounded-lg overflow-hidden animate-pulse aspect-[3/4]"
            >
              <div className="h-full bg-muted/20"></div>
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
      {/* Clean header with discrete search */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          <span className="font-semibold text-foreground text-lg">{issues.length}</span>
          <span className="ml-1">
            edição{issues.length !== 1 ? 'ões' : ''} encontrada{issues.length !== 1 ? 's' : ''}
          </span>
        </div>
        
        {/* Discrete search */}
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            type="text"
            placeholder="Buscar conteúdo..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 h-9 bg-muted/10 border-muted/30 text-foreground placeholder:text-muted-foreground focus:border-foreground focus:ring-1 focus:ring-foreground/20 text-sm rounded-full"
          />
        </div>
      </div>
      
      {/* Grid with improved spacing */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
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
