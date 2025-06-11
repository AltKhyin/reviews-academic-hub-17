
// ABOUTME: High-performance masonry grid with navigation handlers and optimized rendering
import React, { useMemo } from 'react';
import { IssueCard } from './IssueCard';
import { ArchiveIssue } from '@/types/archive';

interface OptimizedMasonryGridProps {
  issues: ArchiveIssue[];
  onIssueClick: (issueId: string) => void;
  searchQuery?: string;
  className?: string;
}

export const OptimizedMasonryGrid: React.FC<OptimizedMasonryGridProps> = ({
  issues,
  onIssueClick,
  searchQuery = '',
  className = ''
}) => {
  // Calculate tag matches for search highlighting
  const issuesWithMatches = useMemo(() => {
    if (!searchQuery.trim()) {
      return issues.map(issue => ({ ...issue, tagMatches: 0 }));
    }

    const searchTerms = searchQuery.toLowerCase().split(' ').filter(term => term.length > 2);
    
    return issues.map(issue => {
      let matches = 0;
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
          matches++;
        }
      });

      return { ...issue, tagMatches: matches };
    });
  }, [issues, searchQuery]);

  // Optimized rendering with minimal re-renders
  const handleCardClick = React.useCallback((issueId: string) => {
    console.log('OptimizedMasonryGrid: Issue clicked:', issueId);
    onIssueClick(issueId);
  }, [onIssueClick]);

  return (
    <div className={`columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-1 space-y-1 ${className}`}>
      {issuesWithMatches.map((issue) => (
        <div key={issue.id} className="break-inside-avoid mb-1">
          <IssueCard
            issue={issue}
            onClick={handleCardClick}
            tagMatches={issue.tagMatches}
            className="w-full"
          />
        </div>
      ))}
    </div>
  );
};
