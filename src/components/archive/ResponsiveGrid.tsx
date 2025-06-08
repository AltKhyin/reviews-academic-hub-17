
// ABOUTME: Simple responsive grid component with proper centering and 4-column layout
import React, { useCallback } from 'react';
import { IssueCard } from './IssueCard';
import { ArchiveIssue } from '@/types/archive';

interface ResponsiveGridProps {
  issues: ArchiveIssue[];
  searchQuery: string;
  selectedTags: string[];
  isLoading: boolean;
}

export const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  issues,
  searchQuery,
  selectedTags,
  isLoading
}) => {
  // Handle card click
  const handleCardClick = useCallback((issueId: string) => {
    console.log('Issue clicked:', issueId);
    // TODO: Implement navigation to issue detail page or open modal
  }, []);

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 justify-items-center">
          {Array.from({ length: 8 }).map((_, i) => (
            <div 
              key={i} 
              className="w-full max-w-sm bg-gray-200 animate-pulse rounded-lg h-64" 
            />
          ))}
        </div>
      </div>
    );
  }

  // Empty state
  if (issues.length === 0) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4">
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            {searchQuery || selectedTags.length > 0 
              ? 'Nenhum resultado encontrado para os filtros aplicados.'
              : 'Nenhum artigo disponível no momento.'
            }
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 justify-items-center">
        {issues.map((issue) => (
          <IssueCard
            key={issue.id}
            issue={issue}
            onClick={handleCardClick}
            className="w-full max-w-sm"
          />
        ))}
      </div>
    </div>
  );
};
