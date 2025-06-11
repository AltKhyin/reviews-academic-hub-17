
// ABOUTME: Enhanced results grid with navigation integration and improved loading states
import React from 'react';
import { OptimizedMasonryGrid } from './OptimizedMasonryGrid';
import { ArchiveIssue } from '@/types/archive';

interface ResultsGridProps {
  issues: ArchiveIssue[];
  isLoading: boolean;
  searchQuery?: string;
  onIssueClick: (issueId: string) => void;
}

export const ResultsGrid: React.FC<ResultsGridProps> = ({
  issues,
  isLoading,
  searchQuery = '',
  onIssueClick
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, index) => (
          <div
            key={index}
            className="bg-card rounded-lg overflow-hidden animate-pulse"
            style={{ height: `${300 + (index % 3) * 50}px` }}
          >
            <div className="h-48 bg-muted"></div>
            <div className="p-4 space-y-2">
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (issues.length === 0) {
    const emptyMessage = searchQuery.trim() 
      ? `Nenhuma edição encontrada para "${searchQuery}"`
      : 'Nenhuma edição disponível no momento';
      
    return (
      <div className="text-center py-12">
        <div className="text-muted-foreground text-lg mb-2">
          {emptyMessage}
        </div>
        {searchQuery.trim() && (
          <p className="text-sm text-muted-foreground">
            Tente ajustar os termos de busca ou limpar os filtros.
          </p>
        )}
      </div>
    );
  }

  return (
    <OptimizedMasonryGrid
      issues={issues}
      onIssueClick={onIssueClick}
      searchQuery={searchQuery}
    />
  );
};
