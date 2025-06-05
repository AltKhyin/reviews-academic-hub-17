
// ABOUTME: Main block renderer that routes to specific block components
// Handles all block types and provides consistent interface

import React from 'react';
import { ReviewBlock } from '@/types/review';
import { SnapshotCard } from './blocks/SnapshotCard';
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
  onInteraction?: (blockId: string, interactionType: string, data?: any) => void;
  onSectionView?: (blockId: string) => void;
  readonly?: boolean;
  className?: string;
}

export const BlockRenderer: React.FC<BlockRendererProps> = ({
  block,
  onInteraction,
  onSectionView,
  readonly = false,
  className
}) => {
  // Don't render invisible blocks
  if (!block.visible) return null;

  const commonProps = {
    block,
    onInteraction,
    onSectionView,
    readonly
  };

  const renderBlock = () => {
    switch (block.type) {
      case 'snapshot_card':
        return <SnapshotCard {...commonProps} />;
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
            <hr className="border-gray-200 dark:border-gray-700" />
          </div>
        );
      default:
        return (
          <div className="unknown-block my-4 p-4 border border-red-200 dark:border-red-800 rounded-lg bg-red-50 dark:bg-red-950/20">
            <div className="text-center text-red-600 dark:text-red-400">
              ❌ Tipo de bloco desconhecido: {block.type}
            </div>
          </div>
        );
    }
  };

  return (
    <div 
      data-block-id={block.id}
      className={cn("block-renderer", className)}
    >
      {renderBlock()}
    </div>
  );
};
