
// ABOUTME: Pinterest-style masonry grid with dynamic card heights and smooth transitions
import React, { useMemo, useRef, useEffect } from 'react';
import { IssueCard } from './IssueCard';
import { ArchiveIssue } from '@/types/archive';

interface MasonryGridProps {
  issues: Array<ArchiveIssue & { tagMatches?: number }>;
  onIssueClick: (issueId: string) => void;
}

// Height variants for different card types
const CARD_HEIGHTS = {
  small: 280,
  medium: 360,
  large: 480,
  featured: 560
} as const;

type CardHeight = keyof typeof CARD_HEIGHTS;

interface CardWithLayout extends ArchiveIssue {
  tagMatches?: number;
  heightVariant: CardHeight;
  isFeatured: boolean;
  gridRowSpan: number;
}

export const MasonryGrid: React.FC<MasonryGridProps> = ({
  issues,
  onIssueClick
}) => {
  const gridRef = useRef<HTMLDivElement>(null);

  // Calculate responsive columns based on viewport
  const getColumnCount = () => {
    if (typeof window === 'undefined') return 4;
    const width = window.innerWidth;
    if (width >= 1536) return 5; // 2xl
    if (width >= 1280) return 4; // xl
    if (width >= 1024) return 3; // lg
    if (width >= 768) return 2;  // md
    return 1; // sm
  };

  // Assign height variants to cards based on content and strategy
  const cardsWithLayout = useMemo((): CardWithLayout[] => {
    const cards: CardWithLayout[] = [];
    let featuredCount = 0;
    const maxFeatured = Math.floor(issues.length / 8); // 1 featured per 8 cards

    issues.forEach((issue, index) => {
      let heightVariant: CardHeight = 'medium'; // default
      let isFeatured = false;
      
      // Determine if this should be a featured card (2-column span)
      const shouldBeFeatured = featuredCount < maxFeatured && 
                              index > 0 && 
                              index % 8 === 3; // Strategic positioning
      
      if (shouldBeFeatured) {
        heightVariant = 'featured';
        isFeatured = true;
        featuredCount++;
      } else {
        // Assign height based on content and position for visual variety
        const hasLongTitle = (issue.search_title || issue.title).length > 60;
        const hasDescription = !!(issue.search_description || issue.description);
        const positionVariant = index % 6;
        
        if (hasLongTitle && hasDescription) {
          heightVariant = positionVariant < 2 ? 'large' : 'medium';
        } else if (hasDescription) {
          heightVariant = positionVariant === 0 ? 'large' : 
                        positionVariant < 3 ? 'medium' : 'small';
        } else {
          heightVariant = positionVariant < 2 ? 'medium' : 'small';
        }
      }

      // Calculate grid row span (each row is 20px base unit)
      const baseRowHeight = 20;
      const gridRowSpan = Math.ceil(CARD_HEIGHTS[heightVariant] / baseRowHeight);

      cards.push({
        ...issue,
        heightVariant,
        isFeatured,
        gridRowSpan
      });
    });

    return cards;
  }, [issues]);

  // Set up responsive columns on mount and resize
  useEffect(() => {
    const updateColumns = () => {
      if (gridRef.current) {
        const columns = getColumnCount();
        gridRef.current.style.setProperty('--columns', columns.toString());
      }
    };

    updateColumns();
    window.addEventListener('resize', updateColumns);
    return () => window.removeEventListener('resize', updateColumns);
  }, []);

  if (cardsWithLayout.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="max-w-md mx-auto space-y-6">
          <div className="w-20 h-20 bg-muted/20 rounded-full flex items-center justify-center mx-auto">
            <div className="w-10 h-10 text-muted-foreground">📚</div>
          </div>
          <div className="space-y-3">
            <h3 className="text-xl font-semibold text-foreground">
              Nenhuma edição encontrada
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              Nenhum resultado encontrado para os filtros selecionados.
              <br />
              Tente ajustar os termos de busca ou remover alguns filtros.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={gridRef}
      className="masonry-grid"
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(var(--columns, 4), 1fr)',
        gridAutoRows: '20px', // Base row unit for spanning calculations
        gap: '16px',
        '--columns': '4'
      } as React.CSSProperties & { '--columns': string }}
    >
      {cardsWithLayout.map((card) => (
        <div
          key={card.id}
          className={`masonry-item transition-all duration-300 ease-in-out ${
            card.isFeatured ? 'col-span-2' : ''
          }`}
          style={{
            gridRowEnd: `span ${card.gridRowSpan}`,
            minHeight: `${CARD_HEIGHTS[card.heightVariant]}px`
          }}
        >
          <IssueCard
            issue={card}
            onClick={onIssueClick}
            tagMatches={card.tagMatches}
            heightVariant={card.heightVariant}
            isFeatured={card.isFeatured}
          />
        </div>
      ))}
    </div>
  );
};
