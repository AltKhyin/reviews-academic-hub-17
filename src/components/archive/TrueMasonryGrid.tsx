
// ABOUTME: True masonry grid implementation with absolute positioning, fixed width cards, and dynamic height
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { IssueCard } from './IssueCard';
import { ArchiveIssue } from '@/types/archive';

interface TrueMasonryGridProps {
  issues: ArchiveIssue[];
  searchQuery: string;
  selectedTags: string[];
  isLoading: boolean;
}

// Fixed masonry configuration
const MASONRY_CONFIG = {
  cardWidth: 280,
  horizontalGap: 4,
  verticalGap: 0,
  minColumns: 1,
  maxColumns: 4,
  containerPadding: 16
};

// Calculate optimal number of columns based on container width
const calculateColumns = (containerWidth: number): number => {
  if (containerWidth <= 0) return 1;
  
  const { cardWidth, horizontalGap, containerPadding } = MASONRY_CONFIG;
  const availableWidth = containerWidth - (2 * containerPadding);
  
  // Calculate how many columns can fit
  let columns = 1;
  while (columns <= MASONRY_CONFIG.maxColumns) {
    const totalWidth = (columns * cardWidth) + ((columns - 1) * horizontalGap);
    if (totalWidth <= availableWidth) {
      columns++;
    } else {
      break;
    }
  }
  
  return Math.max(MASONRY_CONFIG.minColumns, Math.min(MASONRY_CONFIG.maxColumns, columns - 1));
};

// Calculate centered container offset
const calculateContainerOffset = (containerWidth: number, columns: number): number => {
  const { cardWidth, horizontalGap, containerPadding } = MASONRY_CONFIG;
  const gridWidth = (columns * cardWidth) + ((columns - 1) * horizontalGap);
  const availableWidth = containerWidth - (2 * containerPadding);
  
  return Math.max(0, (availableWidth - gridWidth) / 2) + containerPadding;
};

interface CardPosition {
  id: string;
  x: number;
  y: number;
  height: number;
}

export const TrueMasonryGrid = React.memo<TrueMasonryGridProps>(({
  issues,
  searchQuery,
  selectedTags,
  isLoading
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const [containerWidth, setContainerWidth] = useState(0);
  const [cardPositions, setCardPositions] = useState<CardPosition[]>([]);
  const [containerHeight, setContainerHeight] = useState(0);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  // Enhanced filtering with proper tag matching and scoring
  const processedIssues = useMemo(() => {
    if (!issues?.length) return [];
    
    let filteredIssues = issues.filter(issue => {
      // Search query filter
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

    // Calculate tag match scores for reordering (not filtering)
    if (selectedTags.length > 0) {
      filteredIssues = filteredIssues.map(issue => {
        let tagMatchScore = 0;
        
        if (issue.backend_tags) {
          try {
            const tags = typeof issue.backend_tags === 'string' 
              ? JSON.parse(issue.backend_tags) 
              : issue.backend_tags;
            
            if (typeof tags === 'object' && tags !== null) {
              selectedTags.forEach(selectedTag => {
                // Check if selected tag is a category (parent)
                if (tags[selectedTag]) {
                  tagMatchScore += 10; // High score for parent match
                }
                
                // Check if selected tag is a subcategory
                Object.values(tags).forEach(tagList => {
                  if (Array.isArray(tagList) && tagList.some(tag => 
                    typeof tag === 'string' && tag.toLowerCase() === selectedTag.toLowerCase()
                  )) {
                    tagMatchScore += 15; // Higher score for specific subcategory match
                  }
                });
              });
            }
          } catch {
            // Skip parsing errors
          }
        }
        
        return { ...issue, tagMatchScore };
      }).sort((a, b) => {
        // Sort by tag match score first, then by creation date
        if (b.tagMatchScore !== a.tagMatchScore) {
          return b.tagMatchScore - a.tagMatchScore;
        }
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
    }
    
    return filteredIssues;
  }, [issues, searchQuery, selectedTags]);

  // Debounced resize handling
  const handleResize = useCallback((entries: ResizeObserverEntry[]) => {
    const entry = entries[0];
    if (!entry) return;
    
    const newWidth = entry.contentRect.width;
    if (Math.abs(newWidth - containerWidth) > 20) {
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

  // Calculate card positions using true masonry algorithm
  const calculateMasonryLayout = useCallback(() => {
    if (!containerWidth || processedIssues.length === 0) return;

    const columns = calculateColumns(containerWidth);
    const containerOffset = calculateContainerOffset(containerWidth, columns);
    const columnHeights = new Array(columns).fill(0);
    const positions: CardPosition[] = [];

    processedIssues.forEach((issue) => {
      // Find the shortest column
      const shortestColumnIndex = columnHeights.indexOf(Math.min(...columnHeights));
      
      // Get actual card height from DOM if available
      const cardElement = cardRefs.current.get(issue.id);
      let cardHeight = 320; // Default fallback height
      
      if (cardElement) {
        cardHeight = cardElement.offsetHeight;
      } else {
        // Estimate height based on content
        const baseHeight = 280;
        const titleHeight = (issue.title?.length || 0) * 0.8;
        const descriptionHeight = (issue.description?.length || 0) * 0.1;
        cardHeight = baseHeight + titleHeight + descriptionHeight;
      }

      // Calculate position
      const x = containerOffset + (shortestColumnIndex * (MASONRY_CONFIG.cardWidth + MASONRY_CONFIG.horizontalGap));
      const y = columnHeights[shortestColumnIndex];

      positions.push({
        id: issue.id,
        x,
        y,
        height: cardHeight
      });

      // Update column height
      columnHeights[shortestColumnIndex] += cardHeight + MASONRY_CONFIG.verticalGap;
    });

    setCardPositions(positions);
    setContainerHeight(Math.max(...columnHeights));
  }, [containerWidth, processedIssues]);

  // Recalculate layout when dependencies change
  useEffect(() => {
    // Small delay to allow DOM updates
    const timeoutId = setTimeout(calculateMasonryLayout, 100);
    return () => clearTimeout(timeoutId);
  }, [calculateMasonryLayout]);

  // Handle card click
  const handleCardClick = useCallback((issueId: string) => {
    console.log('Issue clicked:', issueId);
    // TODO: Implement navigation to issue detail page
  }, []);

  // Store card ref
  const setCardRef = useCallback((issueId: string, element: HTMLDivElement | null) => {
    if (element) {
      cardRefs.current.set(issueId, element);
    } else {
      cardRefs.current.delete(issueId);
    }
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <div className="w-full px-4">
        <div className="flex justify-center">
          <div 
            className="grid gap-1"
            style={{
              gridTemplateColumns: `repeat(4, ${MASONRY_CONFIG.cardWidth}px)`,
              gap: `${MASONRY_CONFIG.verticalGap}px ${MASONRY_CONFIG.horizontalGap}px`
            }}
          >
            {Array.from({ length: 8 }).map((_, i) => (
              <div 
                key={i} 
                className="bg-muted animate-pulse rounded-lg"
                style={{ 
                  width: `${MASONRY_CONFIG.cardWidth}px`,
                  height: `${300 + (i % 3) * 50}px`
                }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Empty state
  if (processedIssues.length === 0) {
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
      {/* Masonry container with absolute positioning */}
      <div 
        className="relative mx-auto"
        style={{ 
          height: `${containerHeight}px`,
          maxWidth: `${(MASONRY_CONFIG.cardWidth * 4) + (MASONRY_CONFIG.horizontalGap * 3) + (MASONRY_CONFIG.containerPadding * 2)}px`
        }}
      >
        {processedIssues.map((issue, index) => {
          const position = cardPositions.find(pos => pos.id === issue.id);
          
          return (
            <div
              key={issue.id}
              ref={(el) => setCardRef(issue.id, el)}
              className="absolute transition-all duration-300 ease-out"
              style={{
                left: position?.x || 0,
                top: position?.y || 0,
                width: `${MASONRY_CONFIG.cardWidth}px`,
                transform: position ? 'translateZ(0)' : 'translateY(20px)',
                opacity: position ? 1 : 0,
              }}
            >
              <IssueCard
                issue={issue}
                onClick={handleCardClick}
                className="w-full transition-all duration-200 hover:shadow-lg hover:scale-[1.02]"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
});

TrueMasonryGrid.displayName = 'TrueMasonryGrid';
