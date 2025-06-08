
// ABOUTME: Pinterest-style masonry grid with enhanced responsive behavior and minimal spacing
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { IssueCard } from './IssueCard';
import { ArchiveIssue } from '@/types/archive';

interface MasonryGridProps {
  issues: Array<ArchiveIssue & { tagMatches?: number }>;
  onIssueClick: (issueId: string) => void;
}

interface CardLayout {
  id: string;
  height: number;
  column: number;
  top: number;
  transition: boolean;
}

export const MasonryGrid: React.FC<MasonryGridProps> = ({
  issues,
  onIssueClick
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [layouts, setLayouts] = useState<CardLayout[]>([]);
  const [columns, setColumns] = useState(4);
  const [containerHeight, setContainerHeight] = useState(0);
  const resizeTimeoutRef = useRef<NodeJS.Timeout>();

  // Base card dimensions with minimal spacing
  const baseWidth = 280;
  const baseHeight = 374;
  const gap = 8; // Reduced from 20 to 8 for minimal spacing

  // Height variants for visual variety
  const heightVariants = [
    baseHeight * 0.85,
    baseHeight * 1.0,
    baseHeight * 1.2,
    baseHeight * 1.4,
    baseHeight * 1.6
  ];

  // Enhanced responsive column calculation
  const updateColumns = useCallback(() => {
    if (!containerRef.current) return;
    
    const containerWidth = containerRef.current.offsetWidth;
    const cardWithGap = baseWidth + gap;
    
    // Calculate optimal columns based on container width
    const maxPossibleColumns = Math.floor((containerWidth + gap) / cardWithGap);
    
    // Responsive breakpoints with better mobile support
    let newColumns = 4; // Default
    
    if (containerWidth < 400) {
      newColumns = 1; // Mobile portrait
    } else if (containerWidth < 680) {
      newColumns = 2; // Mobile landscape / small tablet
    } else if (containerWidth < 1024) {
      newColumns = 3; // Tablet
    } else if (containerWidth < 1400) {
      newColumns = 4; // Desktop
    } else {
      newColumns = Math.min(5, maxPossibleColumns); // Large desktop, max 5 columns
    }
    
    // Ensure we don't exceed what fits
    newColumns = Math.min(newColumns, maxPossibleColumns);
    newColumns = Math.max(1, newColumns); // Minimum 1 column
    
    if (newColumns !== columns) {
      setColumns(newColumns);
    }
  }, [columns, baseWidth, gap]);

  // Debounced resize handler for better performance
  const handleResize = useCallback(() => {
    if (resizeTimeoutRef.current) {
      clearTimeout(resizeTimeoutRef.current);
    }
    
    resizeTimeoutRef.current = setTimeout(() => {
      updateColumns();
    }, 100); // 100ms debounce
  }, [updateColumns]);

  // Get deterministic height variant for each issue
  const getCardHeight = useCallback((issueId: string, index: number): number => {
    const hash = issueId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const variantIndex = (hash + index) % heightVariants.length;
    return heightVariants[variantIndex];
  }, [heightVariants]);

  // Enhanced layout calculation with better performance
  const calculateLayout = useCallback(() => {
    if (!issues.length || columns === 0) {
      setLayouts([]);
      setContainerHeight(0);
      return;
    }

    const columnHeights = new Array(columns).fill(0);
    const newLayouts: CardLayout[] = [];

    issues.forEach((issue, index) => {
      const height = getCardHeight(issue.id, index);
      
      // Find column with minimum height
      const minColumnIndex = columnHeights.indexOf(Math.min(...columnHeights));
      
      newLayouts.push({
        id: issue.id,
        height,
        column: minColumnIndex,
        top: columnHeights[minColumnIndex],
        transition: true
      });

      // Update column height
      columnHeights[minColumnIndex] += height + gap;
    });

    setLayouts(newLayouts);
    setContainerHeight(Math.max(...columnHeights) - gap);
  }, [issues, columns, getCardHeight, gap]);

  // Recalculate layout when dependencies change
  useEffect(() => {
    calculateLayout();
  }, [calculateLayout]);

  // Enhanced resize handling with proper cleanup
  useEffect(() => {
    // Initial calculation
    updateColumns();
    
    // Add resize listener with debouncing
    window.addEventListener('resize', handleResize);
    
    // Also listen for orientation changes on mobile
    window.addEventListener('orientationchange', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
    };
  }, [handleResize, updateColumns]);

  // Force recalculation when container becomes visible
  useEffect(() => {
    const observer = new ResizeObserver(() => {
      handleResize();
    });
    
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    
    return () => observer.disconnect();
  }, [handleResize]);

  if (!issues.length) return null;

  // Calculate the total width needed for centered grid
  const gridWidth = columns * baseWidth + (columns - 1) * gap;

  return (
    <div className="flex justify-center w-full">
      <div 
        ref={containerRef}
        className="relative transition-all duration-300 ease-out"
        style={{ 
          height: containerHeight,
          width: Math.min(gridWidth, window.innerWidth - 32), // Account for page padding
          maxWidth: '100%'
        }}
      >
        {issues.map((issue, index) => {
          const layout = layouts.find(l => l.id === issue.id);
          if (!layout) return null;

          const left = layout.column * (baseWidth + gap);

          return (
            <div
              key={issue.id}
              className={`absolute transition-all duration-500 ease-out ${
                layout.transition ? 'opacity-100' : 'opacity-0'
              }`}
              style={{
                left: `${left}px`,
                top: `${layout.top}px`,
                width: `${baseWidth}px`,
                height: `${layout.height}px`,
                transform: 'translateZ(0)', // Hardware acceleration
                willChange: 'transform, opacity', // Optimize for animations
              }}
            >
              <IssueCard
                issue={issue}
                onClick={onIssueClick}
                tagMatches={issue.tagMatches}
                height={layout.height}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};
