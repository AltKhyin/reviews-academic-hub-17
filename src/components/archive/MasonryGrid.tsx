
// ABOUTME: Pinterest-style masonry grid with robust mount-safe measurement and dynamic height calculation
import React, { useEffect, useLayoutEffect, useRef, useState, useCallback, useMemo } from 'react';
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
  left: number;
  measured: boolean;
}

export const MasonryGrid: React.FC<MasonryGridProps> = ({
  issues,
  onIssueClick
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const [layouts, setLayouts] = useState<CardLayout[]>([]);
  const [columns, setColumns] = useState(4);
  const [containerHeight, setContainerHeight] = useState(0);
  const [isLayoutReady, setIsLayoutReady] = useState(false);
  const [imageLoadCount, setImageLoadCount] = useState(0);
  const layoutTimeoutRef = useRef<NodeJS.Timeout>();
  const resizeObserverRef = useRef<ResizeObserver>();

  // Fixed masonry configuration
  const baseWidth = 280;
  const gap = 4;
  const maxRetries = 10;
  const retryDelay = 50;

  // Calculate responsive columns based on container width
  const calculateColumns = useCallback((containerWidth: number): number => {
    if (containerWidth <= 0) return 1;
    
    const cardWithGap = baseWidth + gap;
    const maxPossibleColumns = Math.floor((containerWidth + gap) / cardWithGap);
    
    if (containerWidth < 640) return 1; // Mobile
    if (containerWidth < 768) return 2; // Small tablet
    if (containerWidth < 1024) return 3; // Tablet
    if (containerWidth < 1280) return 4; // Desktop
    return Math.min(5, maxPossibleColumns); // Large desktop
  }, [baseWidth, gap]);

  // Measure actual card height from DOM
  const measureCardHeight = useCallback((cardId: string): number => {
    const cardElement = cardRefs.current.get(cardId);
    if (!cardElement) return 0;
    
    // Force a reflow to ensure accurate measurement
    cardElement.style.height = 'auto';
    const height = cardElement.offsetHeight;
    
    // Fallback to computed style if offsetHeight is 0
    if (height === 0) {
      const computedStyle = window.getComputedStyle(cardElement);
      return parseInt(computedStyle.height, 10) || 0;
    }
    
    return height;
  }, []);

  // Check if all cards have been measured and have valid heights
  const areAllCardsMeasured = useCallback((): boolean => {
    if (issues.length === 0) return true;
    
    for (const issue of issues) {
      const cardElement = cardRefs.current.get(issue.id);
      if (!cardElement) return false;
      
      const height = measureCardHeight(issue.id);
      if (height <= 0) return false;
    }
    
    return true;
  }, [issues, measureCardHeight]);

  // Calculate masonry layout with actual measured heights
  const calculateLayout = useCallback((retryCount = 0): void => {
    if (!containerRef.current || issues.length === 0) {
      setLayouts([]);
      setContainerHeight(0);
      setIsLayoutReady(true);
      return;
    }

    const containerWidth = containerRef.current.offsetWidth;
    if (containerWidth <= 0) {
      if (retryCount < maxRetries) {
        setTimeout(() => calculateLayout(retryCount + 1), retryDelay);
      }
      return;
    }

    const cols = calculateColumns(containerWidth);
    setColumns(cols);

    // Check if all cards are measured
    if (!areAllCardsMeasured()) {
      if (retryCount < maxRetries) {
        // Use requestAnimationFrame for better timing
        requestAnimationFrame(() => {
          setTimeout(() => calculateLayout(retryCount + 1), retryDelay);
        });
      }
      return;
    }

    const columnHeights = new Array(cols).fill(0);
    const newLayouts: CardLayout[] = [];
    const containerOffset = Math.max(0, (containerWidth - (cols * baseWidth + (cols - 1) * gap)) / 2);

    issues.forEach((issue) => {
      // Find column with minimum height
      const minColumnIndex = columnHeights.indexOf(Math.min(...columnHeights));
      
      // Measure actual height from DOM
      const height = measureCardHeight(issue.id);
      
      // Calculate position
      const left = containerOffset + (minColumnIndex * (baseWidth + gap));
      const top = columnHeights[minColumnIndex];

      newLayouts.push({
        id: issue.id,
        height,
        column: minColumnIndex,
        top,
        left,
        measured: height > 0
      });

      // Update column height (no vertical gap for tight packing)
      columnHeights[minColumnIndex] += height;
    });

    setLayouts(newLayouts);
    setContainerHeight(Math.max(...columnHeights));
    setIsLayoutReady(true);

    console.log(`Layout calculated: ${newLayouts.length} cards, ${cols} columns, height: ${Math.max(...columnHeights)}`);
  }, [issues, calculateColumns, measureCardHeight, areAllCardsMeasured, baseWidth, gap, maxRetries, retryDelay]);

  // Debounced layout calculation
  const debouncedCalculateLayout = useCallback(() => {
    if (layoutTimeoutRef.current) {
      clearTimeout(layoutTimeoutRef.current);
    }
    
    setIsLayoutReady(false);
    layoutTimeoutRef.current = setTimeout(() => {
      calculateLayout();
    }, 100);
  }, [calculateLayout]);

  // Handle container resize
  const handleResize = useCallback((entries: ResizeObserverEntry[]) => {
    const entry = entries[0];
    if (!entry) return;
    
    const newWidth = entry.contentRect.width;
    const newColumns = calculateColumns(newWidth);
    
    if (newColumns !== columns) {
      console.log(`Columns changed: ${columns} -> ${newColumns}`);
      debouncedCalculateLayout();
    }
  }, [columns, calculateColumns, debouncedCalculateLayout]);

  // Handle image load events
  const handleImageLoad = useCallback(() => {
    setImageLoadCount(prev => prev + 1);
    // Recalculate layout after a short delay to allow for DOM updates
    setTimeout(() => {
      calculateLayout();
    }, 100);
  }, [calculateLayout]);

  // Store card ref
  const setCardRef = useCallback((issueId: string, element: HTMLDivElement | null) => {
    if (element) {
      cardRefs.current.set(issueId, element);
      
      // Attach image load listeners
      const images = element.querySelectorAll('img');
      images.forEach(img => {
        if (!img.complete) {
          img.addEventListener('load', handleImageLoad, { once: true });
          img.addEventListener('error', handleImageLoad, { once: true });
        }
      });
    } else {
      cardRefs.current.delete(issueId);
    }
  }, [handleImageLoad]);

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

  // Layout effect for DOM measurements (runs after DOM updates)
  useLayoutEffect(() => {
    // Clear any existing timeout
    if (layoutTimeoutRef.current) {
      clearTimeout(layoutTimeoutRef.current);
    }

    // Calculate layout after a brief delay to ensure all cards are mounted
    layoutTimeoutRef.current = setTimeout(() => {
      calculateLayout();
    }, 50);

    return () => {
      if (layoutTimeoutRef.current) {
        clearTimeout(layoutTimeoutRef.current);
      }
    };
  }, [issues, calculateLayout]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (layoutTimeoutRef.current) {
        clearTimeout(layoutTimeoutRef.current);
      }
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
      }
    };
  }, []);

  // Memoized container styles for performance
  const containerStyles = useMemo(() => {
    const maxWidth = (baseWidth * 4) + (gap * 3) + 32; // 4 columns max + padding
    return {
      height: `${containerHeight}px`,
      maxWidth: `${maxWidth}px`,
      position: 'relative' as const,
      margin: '0 auto',
    };
  }, [containerHeight, baseWidth, gap]);

  if (!issues.length) return null;

  return (
    <div className="flex justify-center w-full">
      <div 
        ref={containerRef}
        className="w-full px-4"
        style={containerStyles}
      >
        {issues.map((issue, index) => {
          const layout = layouts.find(l => l.id === issue.id);
          const isVisible = layout && layout.measured && isLayoutReady;

          return (
            <div
              key={issue.id}
              ref={(el) => setCardRef(issue.id, el)}
              className={`absolute transition-all duration-300 ease-out ${
                isVisible ? 'opacity-100' : 'opacity-0'
              }`}
              style={{
                left: layout?.left || 0,
                top: layout?.top || 0,
                width: `${baseWidth}px`,
                transform: 'translateZ(0)', // Hardware acceleration
                visibility: isVisible ? 'visible' : 'hidden',
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
