
// Enhanced results grid with discrete search integration and improved spacing
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
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-4 bg-muted/30 rounded w-48"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 12 }).map((_, index) => (
            <div 
              key={index}
              className="bg-card border border-border rounded-lg overflow-hidden animate-pulse"
            >
              <div className="h-48 bg-muted/20"></div>
              <div className="p-4 space-y-3">
                <div className="h-4 bg-muted/20 rounded"></div>
                <div className="h-5 bg-muted/20 rounded"></div>
                <div className="flex gap-2">
                  <div className="h-4 bg-muted/20 rounded w-16"></div>
                  <div className="h-4 bg-muted/20 rounded w-20"></div>
                  <div className="h-4 bg-muted/20 rounded w-12"></div>
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
      <div className="text-center py-16">
        <div className="max-w-md mx-auto space-y-6">
          <div className="w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center mx-auto">
            <Search className="w-8 h-8 text-muted-foreground" />
          </div>
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-foreground">
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
    <div className="space-y-6">
      {/* Results header with integrated discrete search */}
      <div className="flex justify-between items-center border-b border-border pb-4">
        <div className="text-sm text-muted-foreground">
          <span className="font-semibold text-foreground text-base">{issues.length}</span>
          <span className="ml-1">
            edição{issues.length !== 1 ? 'ões' : ''} encontrada{issues.length !== 1 ? 's' : ''}
          </span>
        </div>
        
        {/* Discrete search input replacing sort indicator */}
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            type="text"
            placeholder="Buscar..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 h-9 bg-transparent border-border text-foreground placeholder:text-muted-foreground focus:border-muted text-sm rounded-full border-2"
          />
        </div>
      </div>
      
      {/* Optimized grid with tighter spacing */}
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
