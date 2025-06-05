
// ABOUTME: Enhanced block renderer with vertical alignment support
// Handles all block types with consistent alignment application

import React from 'react';
import { ReviewBlock } from '@/types/review';
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
import { cn } from '@/lib/utils';

interface BlockRendererProps {
  block: ReviewBlock;
  onUpdate?: (updates: Partial<ReviewBlock>) => void;
  readonly?: boolean;
  className?: string;
}

export const BlockRenderer: React.FC<BlockRendererProps> = ({
  block,
  onUpdate,
  readonly = false,
  className
}) => {
  // Get vertical alignment from block metadata
  const verticalAlign = block.meta?.alignment?.vertical || 'top';
  
  // Convert alignment to CSS classes
  const getAlignmentClass = (alignment: string) => {
    switch (alignment) {
      case 'center':
        return 'flex items-center';
      case 'bottom':
        return 'flex items-end';
      default:
        return 'flex items-start';
    }
  };

  const renderBlockContent = () => {
    switch (block.type) {
      case 'heading':
        return <HeadingBlock block={block} onUpdate={onUpdate} readonly={readonly} />;
      case 'paragraph':
        return <ParagraphBlock block={block} onUpdate={onUpdate} readonly={readonly} />;
      case 'figure':
        return <FigureBlock block={block} onUpdate={onUpdate} readonly={readonly} />;
      case 'table':
        return <TableBlock block={block} onUpdate={onUpdate} readonly={readonly} />;
      case 'callout':
        return <CalloutBlock block={block} onUpdate={onUpdate} readonly={readonly} />;
      case 'snapshot_card':
        return <SnapshotCardBlock block={block} onUpdate={onUpdate} readonly={readonly} />;
      case 'number_card':
        return <NumberCard block={block} onUpdate={onUpdate} readonly={readonly} />;
      case 'reviewer_quote':
        return <ReviewerQuote block={block} onUpdate={onUpdate} readonly={readonly} />;
      case 'poll':
        return <PollBlock block={block} onUpdate={onUpdate} readonly={readonly} />;
      case 'citation_list':
        return <CitationListBlock block={block} onUpdate={onUpdate} readonly={readonly} />;
      default:
        return (
          <div className="p-4 border border-red-500 rounded bg-red-500/10">
            <p className="text-red-400">Tipo de bloco desconhecido: {block.type}</p>
          </div>
        );
    }
  };

  return (
    <div 
      className={cn(
        "block-renderer h-full",
        getAlignmentClass(verticalAlign),
        className
      )}
    >
      <div className="w-full">
        {renderBlockContent()}
      </div>
    </div>
  );
};
