
// ABOUTME: Performance-optimized masonry grid component with proper memoization and dependency management
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { IssueCard } from './IssueCard';
import { ArchiveIssue } from '@/types/archive';

interface OptimizedMasonryGridProps {
  issues: ArchiveIssue[];
  searchQuery: string;
  selectedTags: string[];
  isLoading: boolean;
}

// Memoized grid calculation function
const calculateGridLayout = (containerWidth: number, cardWidth: number, gap: number) => {
  if (containerWidth <= 0) return { columns: 1, columnWidth: cardWidth };
  
  const availableWidth = containerWidth - gap;
  const cardWithGap = cardWidth + gap;
  const columns = Math.max(1, Math.floor(availableWidth / cardWithGap));
  const actualColumnWidth = Math.floor((availableWidth - (gap * (columns - 1))) / columns);
  
  return { columns, columnWidth: actualColumnWidth };
};

export const OptimizedMasonryGrid = React.memo<OptimizedMasonryGridProps>(({
  issues,
  searchQuery,
  selectedTags,
  isLoading
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [gridLayout, setGridLayout] = useState({ columns: 1, columnWidth: 300 });
  
  // Stable resize observer reference
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  
  // Memoized grid configuration
  const gridConfig = useMemo(() => ({
    minCardWidth: 280,
    maxCardWidth: 400,
    gap: 16,
    breakpoints: {
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
    }
  }), []);

  // Optimized resize handling with debouncing
  const handleResize = useCallback((entries: ResizeObserverEntry[]) => {
    const entry = entries[0];
    if (!entry) return;
    
    const newWidth = entry.contentRect.width;
    if (Math.abs(newWidth - containerWidth) > 10) { // Only update if significant change
      setContainerWidth(newWidth);
    }
  }, [containerWidth]);

  // Initialize resize observer
  useEffect(() => {
    if (!containerRef.current) return;

    resizeObserverRef.current = new ResizeObserver(handleResize);
    resizeObserverRef.current.observe(containerRef.current);

    return () => {
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
      }
    };
  }, [handleResize]);

  // Calculate grid layout when container width changes
  useEffect(() => {
    if (containerWidth > 0) {
      const newLayout = calculateGridLayout(containerWidth, gridConfig.minCardWidth, gridConfig.gap);
      
      // Only update if layout actually changed
      if (newLayout.columns !== gridLayout.columns || 
          Math.abs(newLayout.columnWidth - gridLayout.columnWidth) > 5) {
        setGridLayout(newLayout);
      }
    }
  }, [containerWidth, gridConfig.minCardWidth, gridConfig.gap, gridLayout.columns, gridLayout.columnWidth]);

  // Memoized filtered issues to prevent unnecessary recalculations
  const filteredIssues = useMemo(() => {
    if (!issues?.length) return [];
    
    return issues.filter(issue => {
      // Search query filter
      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase();
        const searchableText = [
          issue.title,
          issue.description,
          issue.specialty,
          issue.authors
        ].filter(Boolean).join(' ').toLowerCase();
        
        if (!searchableText.includes(searchLower)) {
          return false;
        }
      }
      
      // Tags filter
      if (selectedTags.length > 0) {
        if (!issue.backend_tags) return false;
        
        try {
          const tags = typeof issue.backend_tags === 'string' 
            ? JSON.parse(issue.backend_tags) 
            : issue.backend_tags;
          
          if (typeof tags === 'object' && tags !== null) {
            const allTags = Object.values(tags).flat().filter(Boolean);
            return selectedTags.some(selectedTag => 
              allTags.some(tag => 
                typeof tag === 'string' && tag.toLowerCase().includes(selectedTag.toLowerCase())
              )
            );
          }
        } catch {
          return false;
        }
      }
      
      return true;
    });
  }, [issues, searchQuery, selectedTags]);

  // Memoized column arrays for performance
  const columnArrays = useMemo(() => {
    const columns: ArchiveIssue[][] = Array.from({ length: gridLayout.columns }, () => []);
    const columnHeights = new Array(gridLayout.columns).fill(0);
    
    filteredIssues.forEach((issue, index) => {
      // Distribute items to shortest column
      const shortestColumnIndex = columnHeights.indexOf(Math.min(...columnHeights));
      columns[shortestColumnIndex].push(issue);
      
      // Estimate height for better distribution (could be improved with actual measurements)
      const estimatedHeight = 300 + (issue.description?.length || 0) * 0.1;
      columnHeights[shortestColumnIndex] += estimatedHeight;
    });
    
    return columns;
  }, [filteredIssues, gridLayout.columns]);

  // Handle card click
  const handleCardClick = useCallback((issueId: string) => {
    console.log('Issue clicked:', issueId);
    // TODO: Implement navigation to issue detail page or open modal
  }, []);

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="bg-gray-200 animate-pulse rounded-lg h-64" />
        ))}
      </div>
    );
  }

  // Empty state
  if (filteredIssues.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">
          {searchQuery || selectedTags.length > 0 
            ? 'Nenhum resultado encontrado para os filtros aplicados.'
            : 'Nenhum artigo disponível no momento.'
          }
        </p>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="w-full"
      style={{ minHeight: '200px' }}
    >
      <div 
        className="flex justify-start items-start"
        style={{ gap: `${gridConfig.gap}px` }}
      >
        {columnArrays.map((column, columnIndex) => (
          <div
            key={columnIndex}
            className="flex flex-col"
            style={{ 
              width: `${gridLayout.columnWidth}px`,
              gap: `${gridConfig.gap}px`
            }}
          >
            {column.map((issue) => (
              <IssueCard
                key={issue.id}
                issue={issue}
                onClick={handleCardClick}
                className="w-full"
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
});

OptimizedMasonryGrid.displayName = 'OptimizedMasonryGrid';
