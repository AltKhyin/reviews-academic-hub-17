
// ABOUTME: Enhanced block renderer with error boundaries and comprehensive block type coverage
// Handles all block types with consistent error handling and spacing system integration

import React from 'react';
import { ReviewBlock } from '@/types/review';
import { BlockErrorBoundary } from './BlockErrorBoundary';
import { HeadingBlock } from './blocks/HeadingBlock';
import { ParagraphBlock } from './blocks/ParagraphBlock';
import { FigureBlock } from './blocks/FigureBlock';
import { TableBlock } from './blocks/TableBlock';
import { CalloutBlock } from './blocks/CalloutBlock';
import { SnapshotCardBlock } from './blocks/SnapshotCardBlock';
import { NumberCard } from './blocks/NumberCard';
import { ReviewerQuote } from './blocks/ReviewerQuote';
import { PollBlock } from './blocks/PollBlock';
import { CitationListBlock } from './blocks/CitationListBlock';
import { DividerBlock } from './blocks/DividerBlock';
import { DiagramBlock } from './blocks/DiagramBlock';
import { generateSpacingStyles, getDefaultSpacing } from '@/utils/spacingUtils';
import { cn } from '@/lib/utils';

interface BlockRendererProps {
  block: ReviewBlock;
  onUpdate?: (updates: Partial<ReviewBlock>) => void;
  readonly?: boolean;
  className?: string;
  renderAsGrid?: boolean;
  gridBlocks?: ReviewBlock[];
  onInteraction?: (blockId: string, interactionType: string, data?: any) => void;
  onSectionView?: (blockId: string) => void;
}

export const BlockRenderer: React.FC<BlockRendererProps> = ({
  block,
  onUpdate,
  readonly = false,
  className,
  renderAsGrid = false,
  gridBlocks = [],
  onInteraction,
  onSectionView
}) => {
  // Normalize block data to handle database inconsistencies
  const normalizedBlock: ReviewBlock = {
    ...block,
    // Handle both 'content' and 'payload' properties from database
    content: block.content || (block as any).payload || {},
    // Ensure sort_index exists
    sort_index: block.sort_index ?? 0,
    // Ensure visible property exists
    visible: block.visible ?? true
  };

  const handleUpdate = (updates: Partial<ReviewBlock>) => {
    if (onUpdate) {
      onUpdate(updates);
    }
  };

  const handleInteraction = (interactionType: string, data?: any) => {
    if (onInteraction) {
      onInteraction(normalizedBlock.id, interactionType, data);
    }
  };

  // Generate spacing styles
  const spacingStyles = generateSpacingStyles(
    normalizedBlock.meta?.spacing || getDefaultSpacing(normalizedBlock.type)
  );

  const renderBlockContent = () => {
    const commonProps = {
      block: normalizedBlock,
      onUpdate: handleUpdate,
      readonly,
      onInteraction: handleInteraction
    };

    switch (normalizedBlock.type) {
      case 'heading':
        return <HeadingBlock {...commonProps} />;
      
      case 'paragraph':
      case 'text':
        return <ParagraphBlock {...commonProps} />;
      
      case 'figure':
      case 'image':
        return <FigureBlock {...commonProps} />;
      
      case 'table':
        return <TableBlock {...commonProps} />;
      
      case 'callout':
        return <CalloutBlock {...commonProps} />;
      
      case 'snapshot_card':
        return <SnapshotCardBlock {...commonProps} />;
      
      case 'number_card':
        return <NumberCard {...commonProps} />;
      
      case 'reviewer_quote':
        return <ReviewerQuote {...commonProps} />;
      
      case 'poll':
        return <PollBlock {...commonProps} />;
      
      case 'citation_list':
        return <CitationListBlock {...commonProps} />;
      
      case 'divider':
        return <DividerBlock {...commonProps} />;
      
      case 'diagram':
        return <DiagramBlock {...commonProps} />;
      
      default:
        // Fallback for unknown block types
        return (
          <div className="unknown-block p-4 bg-yellow-900/20 border border-yellow-600 rounded">
            <div className="text-yellow-400 text-sm font-medium mb-2">
              Tipo de bloco não suportado: {normalizedBlock.type}
            </div>
            <pre className="text-xs text-yellow-300 overflow-auto">
              {JSON.stringify(normalizedBlock.content, null, 2)}
            </pre>
          </div>
        );
    }
  };

  return (
    <BlockErrorBoundary blockId={normalizedBlock.id} blockType={normalizedBlock.type}>
      <div
        className={cn(
          "block-renderer",
          `block-type-${normalizedBlock.type}`,
          renderAsGrid && "grid-block",
          className
        )}
        style={{
          ...spacingStyles,
          opacity: normalizedBlock.visible ? 1 : 0.5
        }}
        data-block-id={normalizedBlock.id}
        data-block-type={normalizedBlock.type}
      >
        {renderBlockContent()}
      </div>
    </BlockErrorBoundary>
  );
};
