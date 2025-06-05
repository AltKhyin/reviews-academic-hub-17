
// ABOUTME: Enhanced block renderer with update capabilities and proper event handling
// Routes to specific block components with edit/view mode support

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
import { cn } from '@/lib/utils';

interface BlockRendererProps {
  block: ReviewBlock;
  onUpdate?: (blockId: number, updates: Partial<ReviewBlock>) => void;
  onInteraction?: (blockId: string, interactionType: string, data?: any) => void;
  onSectionView?: (blockId: string) => void;
  readonly?: boolean;
  className?: string;
}

export const BlockRenderer: React.FC<BlockRendererProps> = ({
  block,
  onUpdate,
  onInteraction,
  onSectionView,
  readonly = false,
  className
}) => {
  // Don't render invisible blocks
  if (!block.visible) return null;

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

  const handleBlockClick = (e: React.MouseEvent) => {
    // Prevent event bubbling that might trigger unwanted block creation
    e.stopPropagation();
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
      onClick={handleBlockClick}
    >
      {renderBlock()}
    </div>
  );
};
