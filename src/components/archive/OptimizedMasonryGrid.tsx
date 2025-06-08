
// ABOUTME: Enhanced masonry grid with proper 4-column responsive layout and optimal spacing
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { IssueCard } from './IssueCard';
import { ArchiveIssue } from '@/types/archive';

interface OptimizedMasonryGridProps {
  issues: ArchiveIssue[];
  searchQuery: string;
  selectedTags: string[];
  isLoading: boolean;
}

// Enhanced grid calculation for 4-column responsive layout
const calculateOptimalGridLayout = (containerWidth: number) => {
  if (containerWidth <= 0) return { columns: 1, columnWidth: 300, gap: 16 };
  
  // Define breakpoints for responsive behavior
  const breakpoints = {
    mobile: 640,
    tablet: 768,
    desktop: 1024,
    wide: 1280,
  };
  
  let targetColumns = 4; // Default to 4 columns as requested
  let gap = 20; // Minimal spacing as requested
  
  // Responsive column calculation
  if (containerWidth < breakpoints.mobile) {
    targetColumns = 1;
    gap = 16;
  } else if (containerWidth < breakpoints.tablet) {
    targetColumns = 2;
    gap = 18;
  } else if (containerWidth < breakpoints.desktop) {
    targetColumns = 3;
    gap = 20;
  } else {
    targetColumns = 4; // Always use 4 columns on desktop and wider
    gap = 20;
  }
  
  // Calculate optimal column width
  const totalGapWidth = gap * (targetColumns - 1);
  const availableWidth = containerWidth - totalGapWidth - 32; // Account for container padding
  const columnWidth = Math.floor(availableWidth / targetColumns);
  
  return {
    columns: targetColumns,
    columnWidth: Math.max(columnWidth, 280), // Minimum card width
    gap
  };
};

export const OptimizedMasonryGrid = React.memo<OptimizedMasonryGridProps>(({
  issues,
  searchQuery,
  selectedTags,
  isLoading
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [gridLayout, setGridLayout] = useState({ columns: 4, columnWidth: 300, gap: 20 });
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  // Debounced resize handling for better performance
  const handleResize = useCallback((entries: ResizeObserverEntry[]) => {
    const entry = entries[0];
    if (!entry) return;
    
    const newWidth = entry.contentRect.width;
    if (Math.abs(newWidth - containerWidth) > 20) { // Only update on significant changes
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
      
      // Only update if layout significantly changed
      if (newLayout.columns !== gridLayout.columns || 
          Math.abs(newLayout.columnWidth - gridLayout.columnWidth) > 10) {
        setGridLayout(newLayout);
      }
    }
  }, [containerWidth, gridLayout.columns, gridLayout.columnWidth]);

  // Enhanced filtering with proper tag matching
  const filteredIssues = useMemo(() => {
    if (!issues?.length) return [];
    
    return issues.filter(issue => {
      // Search query filter
      if (searchQuery.trim()) {
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
      
      // Enhanced tag filtering with hierarchy support
      if (selectedTags.length > 0) {
        if (!issue.backend_tags) return false;
        
        try {
          const tags = typeof issue.backend_tags === 'string' 
            ? JSON.parse(issue.backend_tags) 
            : issue.backend_tags;
          
          if (typeof tags === 'object' && tags !== null) {
            // Check if any selected tags match (categories or subcategories)
            const hasMatch = selectedTags.some(selectedTag => {
              // Check if selected tag is a category
              if (tags[selectedTag]) return true;
              
              // Check if selected tag is a subcategory
              return Object.values(tags).some(tagList => 
                Array.isArray(tagList) && tagList.some(tag => 
                  typeof tag === 'string' && tag.toLowerCase() === selectedTag.toLowerCase()
                )
              );
            });
            
            return hasMatch;
          }
        } catch {
          return false;
        }
      }
      
      return true;
    });
  }, [issues, searchQuery, selectedTags]);

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
          className="grid gap-5"
          style={{
            gridTemplateColumns: `repeat(${Math.min(gridLayout.columns, 4)}, 1fr)`
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
      className="w-full px-4"
      style={{ minHeight: '400px' }}
    >
      {/* Centered masonry grid container */}
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

OptimizedMasonryGrid.displayName = 'OptimizedMasonryGrid';
