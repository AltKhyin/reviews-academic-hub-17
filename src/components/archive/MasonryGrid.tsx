
// ABOUTME: Pinterest-style masonry grid with dynamic heights and smooth transitions
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

  // Base card dimensions - keeping current proportions
  const baseWidth = 280; // Fixed width for all cards
  const baseHeight = 374; // Current aspect-[3/4] height (280 * 4/3)
  const gap = 20; // Fixed gap between cards

  // Height variants (0.85x to 1.6x of base height)
  const heightVariants = [
    baseHeight * 0.85,  // Short cards
    baseHeight * 1.0,   // Standard cards
    baseHeight * 1.2,   // Medium cards
    baseHeight * 1.4,   // Tall cards
    baseHeight * 1.6    // Very tall cards
  ];

  // Determine number of columns based on container width
  const updateColumns = useCallback(() => {
    if (!containerRef.current) return;
    
    const containerWidth = containerRef.current.offsetWidth;
    const cardWithGap = baseWidth + gap;
    
    // Calculate how many columns can fit
    const maxColumns = Math.floor((containerWidth + gap) / cardWithGap);
    
    // Default to 4 columns, but adjust based on available space
    let newColumns = 4;
    if (maxColumns < 4) {
      newColumns = Math.max(1, maxColumns);
    } else if (maxColumns >= 5) {
      newColumns = 5;
    }
    
    if (newColumns !== columns) {
      setColumns(newColumns);
    }
  }, [columns, baseWidth, gap]);

  // Get deterministic height variant for each issue
  const getCardHeight = useCallback((issueId: string, index: number): number => {
    // Use issue ID hash + index for deterministic but varied heights
    const hash = issueId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const variantIndex = (hash + index) % heightVariants.length;
    return heightVariants[variantIndex];
  }, [heightVariants]);

  // Calculate masonry layout
  const calculateLayout = useCallback(() => {
    if (!issues.length || columns === 0) return;

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

  // Handle window resize
  useEffect(() => {
    updateColumns();
    
    const handleResize = () => updateColumns();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [updateColumns]);

  // Initial column calculation
  useEffect(() => {
    const timer = setTimeout(updateColumns, 100);
    return () => clearTimeout(timer);
  }, [updateColumns]);

  if (!issues.length) return null;

  // Calculate the total width needed for the grid
  const gridWidth = columns * baseWidth + (columns - 1) * gap;

  return (
    <div className="flex justify-center w-full">
      <div 
        ref={containerRef}
        className="relative"
        style={{ 
          height: containerHeight,
          width: gridWidth
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
