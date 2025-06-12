
// ABOUTME: Results grid component that orchestrates different grid layouts for the archive
import React from 'react';
import { MasonryGrid } from './MasonryGrid';
import { ArchiveIssue } from '@/types/archive';

interface ResultsGridProps {
  issues: ArchiveIssue[];
  isLoading: boolean;
  searchQuery: string;
  onIssueClick: (issueId: string) => void;
}

export const ResultsGrid: React.FC<ResultsGridProps> = ({
  issues,
  isLoading,
  searchQuery,
  onIssueClick
}) => {
  // Loading state with Pinterest-style skeleton
  if (isLoading) {
    return (
      <div className="w-full">
        <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-1 space-y-1">
          {Array.from({ length: 12 }).map((_, i) => {
            // Vary skeleton heights to match Pinterest style
            const heights = ['h-64', 'h-80', 'h-96', 'h-72', 'h-88'];
            const heightClass = heights[i % heights.length];
            return (
              <div 
                key={i} 
                className={`bg-muted animate-pulse rounded-lg break-inside-avoid mb-1 ${heightClass}`} 
              />
            );
          })}
        </div>
      </div>
    );
  }

  // Empty state
  if (issues.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground text-lg">
          {searchQuery.trim()
            ? 'Nenhum resultado encontrado para a busca realizada.'
            : 'Nenhum artigo disponível no momento.'
          }
        </p>
      </div>
    );
  }

  // Enhanced issues with tag matches for search highlighting
  const enhancedIssues = issues.map(issue => {
    let tagMatches = 0;
    
    if (searchQuery.trim()) {
      const searchTerms = searchQuery.toLowerCase().split(' ').filter(term => term.length > 2);
      const searchableText = `
        ${issue.title || ''} 
        ${issue.search_title || ''} 
        ${issue.description || ''} 
        ${issue.search_description || ''} 
        ${issue.specialty || ''} 
        ${issue.authors || ''}
      `.toLowerCase();

      searchTerms.forEach(term => {
        if (searchableText.includes(term)) {
          tagMatches++;
        }
      });
    }

    return { ...issue, tagMatches };
  });

  // Use Pinterest-style MasonryGrid for all layouts
  return (
    <div className="w-full px-4">
      <MasonryGrid
        issues={enhancedIssues}
        onIssueClick={onIssueClick}
      />
    </div>
  );
};
