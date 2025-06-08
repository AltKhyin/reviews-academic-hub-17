
// ABOUTME: Simplified results grid component without tag functionality
import React from 'react';
import { TrueMasonryGrid } from './TrueMasonryGrid';
import { ArchiveIssue } from '@/types/archive';

interface ResultsGridProps {
  issues: ArchiveIssue[];
  searchQuery: string;
  isLoading: boolean;
}

export const ResultsGrid: React.FC<ResultsGridProps> = ({
  issues,
  searchQuery,
  isLoading,
}) => {
  return (
    <div className="w-full">
      <TrueMasonryGrid
        issues={issues}
        searchQuery={searchQuery}
        isLoading={isLoading}
      />
    </div>
  );
};
