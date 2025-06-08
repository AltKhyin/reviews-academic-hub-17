
// ABOUTME: Updated results grid component using the true masonry grid implementation
import React from 'react';
import { TrueMasonryGrid } from './TrueMasonryGrid';
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
      <TrueMasonryGrid
        issues={issues}
        searchQuery={searchQuery}
        selectedTags={selectedTags}
        isLoading={isLoading}
      />
    </div>
  );
};
