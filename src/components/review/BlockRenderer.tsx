
// ABOUTME: Enhanced block renderer with proper grid layout support using shared utilities
// Ensures consistent rendering between editor and preview using shared grid calculation logic

import React from 'react';
import { ReviewBlock } from '@/types/review';
import { SnapshotCardBlock } from './blocks/SnapshotCardBlock';
import { HeadingBlock } from './blocks/HeadingBlock';
import { ParagraphBlock } from './blocks/ParagraphBlock';
import { FigureBlock } from './blocks/FigureBlock';
import { TableBlock } from './blocks/TableBlock';
import { CalloutBlock } from './blocks/CalloutBlock';
import { NumberCard } from './blocks/NumberCard';
import { ReviewerQuote } from './blocks/ReviewerQuote';
import { PollBlock } from './blocks/PollBlock';
import { CitationListBlock } from './blocks/CitationListBlock';
import { generateGridContainerStyles } from '@/utils/gridLayoutUtils';
import { cn } from '@/lib/utils';

interface BlockRendererProps {
  block: ReviewBlock;
  onUpdate?: (blockId: number, updates: Partial<ReviewBlock>) => void;
  onInteraction?: (blockId: string, interactionType: string, data?: any) => void;
  onSectionView?: (blockId: string) => void;
  readonly?: boolean;
  className?: string;
  renderAsGrid?: boolean;
  gridBlocks?: ReviewBlock[];
}

export const BlockRenderer: React.FC<BlockRendererProps> = ({
  block,
  onUpdate,
  onInteraction,
  onSectionView,
  readonly = false,
  className,
  renderAsGrid = false,
  gridBlocks = []
}) => {
  // Don't render invisible blocks
  if (!block.visible) return null;

  // If this block has layout metadata and we're rendering as grid, handle it specially
  if (renderAsGrid && block.meta?.layout?.row_id && gridBlocks.length > 1) {
    const layout = block.meta.layout;
    const sortedGridBlocks = gridBlocks.sort((a, b) => {
      const aPos = a.meta?.layout?.position ?? 0;
      const bPos = b.meta?.layout?.position ?? 0;
      return aPos - bPos;
    });

    // Only render the grid container for the first block in the row
    const isFirstInRow = sortedGridBlocks[0]?.id === block.id;
    if (!isFirstInRow) {
      return null; // Other blocks in the row will be rendered by the first block
    }

    console.log('Rendering grid container:', { 
      rowId: layout.row_id, 
      columns: layout.columns, 
      blocksCount: sortedGridBlocks.length,
      columnWidths: layout.columnWidths 
    });

    // Generate consistent grid styles using shared utilities
    const gridStyles = generateGridContainerStyles(
      layout.columns,
      layout.gap || 4,
      layout.columnWidths
    );

    return (
      <div 
        className={cn("grid-layout-container my-6", className)}
        style={gridStyles}
        data-row-id={layout.row_id}
      >
        {sortedGridBlocks.map((gridBlock) => (
          <div key={gridBlock.id} className="grid-block-item">
            <SingleBlockRenderer
              block={gridBlock}
              onUpdate={onUpdate}
              onInteraction={onInteraction}
              onSectionView={onSectionView}
              readonly={readonly}
            />
          </div>
        ))}
      </div>
    );
  }

  // Render single block
  return (
    <SingleBlockRenderer
      block={block}
      onUpdate={onUpdate}
      onInteraction={onInteraction}
      onSectionView={onSectionView}
      readonly={readonly}
      className={className}
    />
  );
};

// Separate component for rendering individual blocks
const SingleBlockRenderer: React.FC<{
  block: ReviewBlock;
  onUpdate?: (blockId: number, updates: Partial<ReviewBlock>) => void;
  onInteraction?: (blockId: string, interactionType: string, data?: any) => void;
  onSectionView?: (blockId: string) => void;
  readonly?: boolean;
  className?: string;
}> = ({
  block,
  onUpdate,
  onInteraction,
  onSectionView,
  readonly = false,
  className
}) => {
  // Create update handler for this specific block
  const handleBlockUpdate = (updates: Partial<ReviewBlock>) => {
    if (onUpdate) {
      onUpdate(block.id, updates);
    }
  };

  const commonProps = {
    block,
    onUpdate: handleBlockUpdate,
    onInteraction,
    onSectionView,
    readonly
  };

  // Don't interfere with inline editing by preventing event bubbling
  const handleContentInteraction = (e: React.MouseEvent) => {
    // Only stop propagation if we're in edit mode and clicking on interactive elements
    if (!readonly) {
      const target = e.target as Element;
      const isInteractiveElement = target.closest('.inline-editor-display, .inline-rich-editor-display, input, textarea, button, select');
      
      if (isInteractiveElement) {
        e.stopPropagation();
      }
    }
  };

  const renderBlock = () => {
    switch (block.type) {
      case 'snapshot_card':
        return <SnapshotCardBlock {...commonProps} />;
      case 'heading':
        return <HeadingBlock {...commonProps} />;
      case 'paragraph':
        return <ParagraphBlock {...commonProps} />;
      case 'figure':
        return <FigureBlock {...commonProps} />;
      case 'table':
        return <TableBlock {...commonProps} />;
      case 'callout':
        return <CalloutBlock {...commonProps} />;
      case 'number_card':
        return <NumberCard {...commonProps} />;
      case 'reviewer_quote':
        return <ReviewerQuote {...commonProps} />;
      case 'poll':
        return <PollBlock {...commonProps} />;
      case 'citation_list':
        return <CitationListBlock {...commonProps} />;
      case 'divider':
        return (
          <div className="divider-block my-8">
            <hr style={{ borderColor: '#2a2a2a' }} className="border-t" />
          </div>
        );
      default:
        return (
          <div 
            className="unknown-block my-4 p-4 border rounded-lg shadow-sm"
            style={{
              backgroundColor: '#991b1b',
              borderColor: '#dc2626',
              color: '#fecaca'
            }}
          >
            <div className="text-center">
              ❌ Tipo de bloco desconhecido: {block.type}
            </div>
          </div>
        );
    }
  };

  return (
    <div 
      data-block-id={block.id}
      className={cn("block-renderer transition-all duration-200", className)}
      style={{ color: '#ffffff' }}
      onClick={handleContentInteraction}
    >
      {renderBlock()}
    </div>
  );
};
