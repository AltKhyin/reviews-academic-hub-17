// ABOUTME: Simple masonry grid without tag filtering functionality
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { IssueCard } from './IssueCard';
import { ArchiveIssue } from '@/types/archive';

interface TrueMasonryGridProps {
  issues: ArchiveIssue[];
  searchQuery: string;
  isLoading: boolean;
}

// Enhanced grid calculation for responsive layout with dynamic column width (235px-289px) and 4px gaps
const calculateOptimalGridLayout = (containerWidth: number) => {
  if (containerWidth <= 0) return { columns: 1, columnWidth: 289, gap: 4 };
  
  // Define breakpoints for responsive behavior
  const breakpoints = {
    mobile: 640,
    tablet: 768,
    desktop: 1024,
    wide: 1280,
  };
  
  const gap = 4; // Fixed 4px gap
  const minColumnWidth = 235; // Minimum column width
  const maxColumnWidth = 289; // Maximum column width
  
  // Calculate maximum possible columns within container
  const availableWidth = containerWidth - 32; // 32px for container padding
  
  // Start with maximum columns possible at minimum width
  let maxPossibleColumns = Math.floor((availableWidth + gap) / (minColumnWidth + gap));
  
  // Apply responsive constraints
  if (containerWidth < breakpoints.mobile) {
    maxPossibleColumns = Math.min(maxPossibleColumns, 1);
  } else if (containerWidth < breakpoints.tablet) {
    maxPossibleColumns = Math.min(maxPossibleColumns, 2);
  } else if (containerWidth < breakpoints.desktop) {
    maxPossibleColumns = Math.min(maxPossibleColumns, 3);
  } else {
    maxPossibleColumns = Math.min(maxPossibleColumns, 4);
  }
  
  // Ensure at least 1 column
  const targetColumns = Math.max(1, maxPossibleColumns);
  
  // Calculate optimal column width - prefer larger cards when possible
  const totalGapWidth = gap * (targetColumns - 1);
  const availableForColumns = availableWidth - totalGapWidth;
  let columnWidth = Math.floor(availableForColumns / targetColumns);
  
  // Clamp column width between min and max
  columnWidth = Math.min(Math.max(columnWidth, minColumnWidth), maxColumnWidth);
  
  return {
    columns: targetColumns,
    columnWidth,
    gap
  };
};

export const TrueMasonryGrid = React.memo<TrueMasonryGridProps>(({
  issues,
  searchQuery,
  isLoading
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [gridLayout, setGridLayout] = useState({ columns: 4, columnWidth: 289, gap: 4 });
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  // Debounced resize handling for better performance
  const handleResize = useCallback((entries: ResizeObserverEntry[]) => {
    const entry = entries[0];
    if (!entry) return;
    
    const newWidth = entry.contentRect.width;
    if (Math.abs(newWidth - containerWidth) > 20) {
      setContainerWidth(newWidth);
    }
  }, [containerWidth]);

  // Initialize and manage resize observer
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

  // Recalculate grid layout when container width changes
  useEffect(() => {
    if (containerWidth > 0) {
      const newLayout = calculateOptimalGridLayout(containerWidth);
      
      if (newLayout.columns !== gridLayout.columns || 
          Math.abs(newLayout.columnWidth - gridLayout.columnWidth) > 10) {
        setGridLayout(newLayout);
      }
    }
  }, [containerWidth, gridLayout.columns, gridLayout.columnWidth]);

  // Simple filtering with only search query (no tags)
  const filteredIssues = useMemo(() => {
    if (!issues?.length) return [];
    
    return issues.filter(issue => {
      // Search query filter only
      if (searchQuery.trim()) {
        const searchLower = searchQuery.toLowerCase();
        const searchableText = [
          issue.title,
          issue.description,
          issue.specialty,
          issue.authors
        ].filter(Boolean).join(' ').toLowerCase();
        
        return searchableText.includes(searchLower);
      }
      
      return true;
    });
  }, [issues, searchQuery]);

  // Optimized column distribution for masonry layout
  const columnArrays = useMemo(() => {
    const columns: ArchiveIssue[][] = Array.from({ length: gridLayout.columns }, () => []);
    const columnHeights = new Array(gridLayout.columns).fill(0);
    
    filteredIssues.forEach((issue) => {
      // Find the shortest column for better distribution
      const shortestColumnIndex = columnHeights.indexOf(Math.min(...columnHeights));
      columns[shortestColumnIndex].push(issue);
      
      // Estimate height for better distribution
      const baseHeight = 300;
      const titleHeight = (issue.title?.length || 0) * 0.8;
      const descriptionHeight = (issue.description?.length || 0) * 0.1;
      const estimatedHeight = baseHeight + titleHeight + descriptionHeight;
      
      columnHeights[shortestColumnIndex] += estimatedHeight + gridLayout.gap;
    });
    
    return columns;
  }, [filteredIssues, gridLayout.columns, gridLayout.gap]);

  // Handle card click
  const handleCardClick = useCallback((issueId: string) => {
    console.log('Issue clicked:', issueId);
    // TODO: Implement navigation to issue detail page
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <div className="w-full">
        <div 
          className="grid"
          style={{
            gridTemplateColumns: `repeat(${Math.min(gridLayout.columns, 4)}, 1fr)`,
            gap: `${gridLayout.gap}px`
          }}
        >
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-muted animate-pulse rounded-lg h-80" />
          ))}
        </div>
      </div>
    );
  }

  // Empty state
  if (filteredIssues.length === 0) {
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

  return (
    <div 
      ref={containerRef}
      className="w-full px-4"
      style={{ minHeight: '400px' }}
    >
      {/* Centered masonry grid container with 4px gaps */}
      <div 
        className="flex justify-center items-start mx-auto"
        style={{ 
          gap: `${gridLayout.gap}px`,
          maxWidth: `${(gridLayout.columnWidth * gridLayout.columns) + (gridLayout.gap * (gridLayout.columns - 1))}px`
        }}
      >
        {columnArrays.map((column, columnIndex) => (
          <div
            key={columnIndex}
            className="flex flex-col"
            style={{ 
              width: `${gridLayout.columnWidth}px`,
              gap: `${gridLayout.gap}px`
            }}
          >
            {column.map((issue) => (
              <IssueCard
                key={issue.id}
                issue={issue}
                onClick={handleCardClick}
                className="w-full transition-all duration-200 hover:shadow-lg"
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
});

TrueMasonryGrid.displayName = 'TrueMasonryGrid';
