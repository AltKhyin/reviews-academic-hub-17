
// ABOUTME: Updated results grid component using the optimized masonry grid
import React from 'react';
import { OptimizedMasonryGrid } from './OptimizedMasonryGrid';
import { ArchiveIssue } from '@/types/archive';

interface ResultsGridProps {
  issues: ArchiveIssue[];
  searchQuery: string;
  selectedTags: string[];
  isLoading: boolean;
}

export const ResultsGrid: React.FC<ResultsGridProps> = ({
  issues,
  searchQuery,
  selectedTags,
  isLoading,
}) => {
  return (
    <div className="w-full">
      <OptimizedMasonryGrid
        issues={issues}
        searchQuery={searchQuery}
        selectedTags={selectedTags}
        isLoading={isLoading}
      />
    </div>
  );
};
