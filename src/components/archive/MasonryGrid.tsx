
// ABOUTME: Pinterest-style masonry grid with dynamic heights (0.85x-1.5x), improved responsiveness and minimal spacing
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

  // Pinterest-style configuration - fixed base dimensions with 4px gaps
  const baseWidth = 280;
  const baseHeight = 374;
  const gap = 4;

  // Pinterest-style height variants (0.85x to 1.5x as requested)
  const heightMultipliers = [0.85, 1.0, 1.15, 1.3, 1.5];
  const heightVariants = heightMultipliers.map(multiplier => Math.round(baseHeight * multiplier));

  // Responsive column calculation optimized for Pinterest-style layout
  const updateColumns = useCallback(() => {
    if (!containerRef.current) return;
    
    const containerWidth = containerRef.current.offsetWidth;
    const cardWithGap = baseWidth + gap;
    
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
      const maxPossibleColumns = Math.floor((containerWidth + gap) / cardWithGap);
      newColumns = Math.min(5, maxPossibleColumns);
    }
    
    if (newColumns !== columns) {
      console.log(`MasonryGrid: Container width ${containerWidth}px, setting ${newColumns} columns`);
      setColumns(newColumns);
    }
  }, [columns, baseWidth, gap]);

  // Deterministic height assignment for Pinterest-style consistency
  const getCardHeight = useCallback((issueId: string, index: number): number => {
    // Use both issueId hash and index for better distribution
    const hash = issueId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const combinedSeed = (hash + index * 7) % 1000; // Multiply index by prime for better distribution
    const variantIndex = combinedSeed % heightVariants.length;
    return heightVariants[variantIndex];
  }, [heightVariants]);

  // Enhanced Pinterest-style masonry layout algorithm
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
      
      // Find column with minimum height for better balance
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
    
    console.log(`MasonryGrid: Layout calculated for ${issues.length} issues in ${columns} columns, max height: ${Math.max(...columnHeights) - gap}px`);
  }, [issues, columns, getCardHeight, gap]);

  // Recalculate layout when dependencies change
  useEffect(() => {
    calculateLayout();
  }, [calculateLayout]);

  // Debounced resize handling for performance
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        updateColumns();
      }, 150); // Slightly longer debounce for stability
    };

    updateColumns(); // Initial calculation
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timeoutId);
    };
  }, [updateColumns]);

  // ResizeObserver for precise container tracking
  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width } = entry.contentRect;
        if (width > 0) {
          // Debounce ResizeObserver calls
          setTimeout(() => updateColumns(), 50);
        }
      }
    });

    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, [updateColumns]);

  if (!issues.length) return null;

  // Calculate total width for centering
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
                height: `${layout.height}px`,
                transform: 'translateZ(0)', // Hardware acceleration
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
