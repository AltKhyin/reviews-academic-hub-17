// ABOUTME: Pinterest-style masonry grid with dynamic heights, improved responsiveness and minimal spacing
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

  // Reduced base card dimensions and minimal spacing
  const baseWidth = 280;
  const baseHeight = 374;
  const gap = 4; // Reduced from 20 to 4 for minimal spacing

  // Height variants for visual interest
  const heightVariants = [
    baseHeight * 0.85,
    baseHeight * 1.0,
    baseHeight * 1.2,
    baseHeight * 1.4,
    baseHeight * 1.6
  ];

  // Improved responsive column calculation
  const updateColumns = useCallback(() => {
    if (!containerRef.current) return;
    
    const containerWidth = containerRef.current.offsetWidth;
    const cardWithGap = baseWidth + gap;
    
    // Calculate optimal columns based on container width
    const maxPossibleColumns = Math.floor((containerWidth + gap) / cardWithGap);
    
    let newColumns = 4; // Default
    
    if (containerWidth < 640) { // Mobile
      newColumns = 1;
    } else if (containerWidth < 768) { // Small tablet
      newColumns = 2;
    } else if (containerWidth < 1024) { // Tablet
      newColumns = 3;
    } else if (containerWidth < 1280) { // Desktop
      newColumns = 4;
    } else { // Large desktop
      newColumns = Math.min(5, maxPossibleColumns);
    }
    
    console.log(`Container width: ${containerWidth}, Setting columns: ${newColumns}`);
    
    if (newColumns !== columns) {
      setColumns(newColumns);
    }
  }, [columns, baseWidth, gap]);

  // Get deterministic height variant for each issue
  const getCardHeight = useCallback((issueId: string, index: number): number => {
    const hash = issueId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const variantIndex = (hash + index) % heightVariants.length;
    return heightVariants[variantIndex];
  }, [heightVariants]);

  // Calculate masonry layout with improved algorithm
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

  // Improved resize handling with debouncing
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        updateColumns();
      }, 100); // Debounce resize events
    };

    updateColumns(); // Initial calculation
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timeoutId);
    };
  }, [updateColumns]);

  // Use ResizeObserver for more accurate container size tracking
  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width } = entry.contentRect;
        if (width > 0) {
          updateColumns();
        }
      }
    });

    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, [updateColumns]);

  if (!issues.length) return null;

  // Calculate the total width needed for the grid
  const gridWidth = columns * baseWidth + (columns - 1) * gap;

  return (
    <div className="flex justify-center w-full">
      <div 
        ref={containerRef}
        className="relative w-full max-w-none"
        style={{ 
          height: containerHeight,
          maxWidth: gridWidth
        }}
      >
        {issues.map((issue, index) => {
          const layout = layouts.find(l => l.id === issue.id);
          if (!layout) return null;

          const left = layout.column * (baseWidth + gap);

          return (
            <div
              key={issue.id}
              className={`absolute transition-all duration-300 ease-out ${
                layout.transition ? 'opacity-100' : 'opacity-0'
              }`}
              style={{
                left: `${left}px`,
                top: `${layout.top}px`,
                width: `${baseWidth}px`,
                transform: 'translateZ(0)', // Hardware acceleration
              }}
            >
              <IssueCard
                issue={issue}
                onClick={onIssueClick}
                tagMatches={issue.tagMatches}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};
