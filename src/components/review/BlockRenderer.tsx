
// ABOUTME: Core block rendering system for native reviews
// Dynamically renders different block types with proper styling and interactions

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
import { DividerBlock } from './blocks/DividerBlock';
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
  // Don't render if block is not visible
  if (!block.visible) {
    return null;
  }

  const baseProps = {
    block,
    onInteraction,
    onSectionView,
    readonly
  };

  const renderBlock = () => {
    switch (block.type) {
      case 'snapshot_card':
        return <SnapshotCard {...baseProps} />;
      case 'heading':
        return <HeadingBlock {...baseProps} />;
      case 'paragraph':
        return <ParagraphBlock {...baseProps} />;
      case 'figure':
        return <FigureBlock {...baseProps} />;
      case 'table':
        return <TableBlock {...baseProps} />;
      case 'callout':
        return <CalloutBlock {...baseProps} />;
      case 'number_card':
        return <NumberCard {...baseProps} />;
      case 'reviewer_quote':
        return <ReviewerQuote {...baseProps} />;
      case 'divider':
        return <DividerBlock {...baseProps} />;
      default:
        console.warn(`Unknown block type: ${block.type}`);
        return (
          <div className="p-4 border border-dashed border-red-300 rounded-lg bg-red-50">
            <p className="text-red-600 text-sm">
              Unknown block type: <code className="font-mono">{block.type}</code>
            </p>
            <pre className="text-xs text-red-500 mt-2 overflow-auto">
              {JSON.stringify(block.payload, null, 2)}
            </pre>
          </div>
        );
    }
  };

  return (
    <div
      className={cn(
        'review-block',
        `block-type-${block.type}`,
        block.meta?.styles?.className,
        className
      )}
      data-block-id={block.id}
      data-block-type={block.type}
      style={block.meta?.styles?.inline}
    >
      {renderBlock()}
    </div>
  );
};
