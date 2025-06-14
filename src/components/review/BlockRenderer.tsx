
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
import { SnapshotCardBlock } from './blocks/SnapshotCardBlock'; // Corrected component name
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
  onUpdate?: (updates: Partial<ReviewBlock>) => void; // For updating the current block
  onUpdateBlock?: (blockId: string, updates: Partial<ReviewBlock>) => void; // For general updates by ID
  onDeleteBlock?: (blockId: string) => void; // For general deletion by ID
  isActive?: boolean; // To pass down to blocks like DiagramBlock
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
  onUpdateBlock, // Receive general onUpdateBlock
  onDeleteBlock, // Receive general onDeleteBlock
  isActive,      // Receive isActive
  readonly = false,
  className,
  renderAsGrid = false,
  gridBlocks = [],
  onInteraction,
  onSectionView
}) => {
  const normalizedBlock: ReviewBlock = {
    ...block,
    content: block.content || (block as any).payload || {},
    sort_index: block.sort_index ?? 0,
    visible: block.visible ?? true
  };

  const handleUpdateCurrentBlock = (updates: Partial<ReviewBlock>) => {
    if (onUpdate) {
      onUpdate(updates);
    } else if (onUpdateBlock) { // Fallback if specific onUpdate isn't provided
      onUpdateBlock(normalizedBlock.id, updates);
    }
  };
  
  const handleDeleteCurrentBlock = () => {
    if (onDeleteBlock) {
      onDeleteBlock(normalizedBlock.id);
    }
  };


  const handleInteraction = (interactionType: string, data?: any) => {
    if (onInteraction) {
      onInteraction(normalizedBlock.id, interactionType, data);
    }
  };

  const spacingStyles = generateSpacingStyles(
    normalizedBlock.meta?.spacing || getDefaultSpacing(normalizedBlock.type)
  );

  const renderBlockContent = () => {
    // Props for blocks that manage their own content updates via a simple callback
    const selfContainedBlockProps = {
      block: normalizedBlock,
      onUpdate: handleUpdateCurrentBlock, // Use the specific updater for the current block
      readonly,
      onInteraction: handleInteraction,
      // These might be needed by some blocks, ensure they are passed if BlockRenderer receives them
      onDeleteBlock: handleDeleteCurrentBlock, 
      isActive: !!isActive, // Ensure boolean
    };

    // Props for blocks that need to call a general update/delete by ID (like DiagramBlock was)
    const generalBlockProps = {
        block: normalizedBlock,
        onUpdateBlock: onUpdateBlock || ((id, updates) => handleUpdateCurrentBlock(updates)), // Fallback for DiagramBlock-like structure
        onDeleteBlock: onDeleteBlock ? () => onDeleteBlock(normalizedBlock.id) : handleDeleteCurrentBlock,
        isActive: !!isActive,
        readonly,
        onInteraction: handleInteraction,
    };


    switch (normalizedBlock.type) {
      case 'heading':
        return <HeadingBlock {...selfContainedBlockProps} />;
      
      case 'paragraph':
      case 'text':
        return <ParagraphBlock {...selfContainedBlockProps} />;
      
      case 'figure':
      case 'image':
        return <FigureBlock {...selfContainedBlockProps} />;
      
      case 'table':
        return <TableBlock {...selfContainedBlockProps} />;
      
      case 'callout':
        return <CalloutBlock {...selfContainedBlockProps} />;
      
      case 'snapshot_card':
        return <SnapshotCardBlock {...generalBlockProps} />; // Uses general props
      
      case 'number_card':
        return <NumberCard {...selfContainedBlockProps} />;
      
      case 'reviewer_quote':
        return <ReviewerQuote {...selfContainedBlockProps} />;
      
      case 'poll':
        return <PollBlock {...selfContainedBlockProps} />;
      
      case 'citation_list':
        return <CitationListBlock {...selfContainedBlockProps} />;
      
      case 'divider':
        return <DividerBlock {...selfContainedBlockProps} />;
      
      case 'diagram':
        // DiagramBlock expects onUpdateBlock, onDeleteBlock, isActive
        return <DiagramBlock 
                    block={normalizedBlock}
                    // Pass the general onUpdateBlock if available, otherwise adapt current block's onUpdate
                    onUpdateBlock={onUpdateBlock || ((_id, updates) => handleUpdateCurrentBlock(updates))}
                    onDeleteBlock={onDeleteBlock ? () => onDeleteBlock(normalizedBlock.id) : handleDeleteCurrentBlock}
                    isActive={!!isActive} 
                />;
      
      default:
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

