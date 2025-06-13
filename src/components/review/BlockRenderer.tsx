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
  // Normalize block data to handle database inconsistencies and ensure content property exists
  const normalizedBlock: ReviewBlock = {
    ...block,
    // Handle both 'content' and 'payload' properties from database
    content: block.content || (block as any).payload || {},
    // Ensure id is converted to number if needed
    id: typeof block.id === 'string' ? parseInt(block.id) : block.id
  };

  // Get vertical alignment from block metadata
  const verticalAlign = normalizedBlock.meta?.alignment?.vertical || 'top';
  
  // Get spacing from block metadata or use defaults
  const customSpacing = normalizedBlock.meta?.spacing;
  const defaultSpacing = getDefaultSpacing(normalizedBlock.type);
  const finalSpacing = customSpacing || defaultSpacing;
  const spacingStyles = generateSpacingStyles(finalSpacing);
  
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

  // Handle interaction events
  const handleInteraction = (interactionType: string, data?: any) => {
    if (onInteraction) {
      onInteraction(normalizedBlock.id.toString(), interactionType, data);
    }
  };

  // Handle section view tracking
  const handleSectionView = () => {
    if (onSectionView) {
      onSectionView(normalizedBlock.id.toString());
    }
  };

  // If rendering as grid, render the grid blocks
  if (renderAsGrid && gridBlocks.length > 0) {
    const layout = normalizedBlock.meta?.layout;
    const columns = layout?.columns || gridBlocks.length;
    const columnWidths = layout?.columnWidths || [];
    
    // Normalize grid blocks as well
    const normalizedGridBlocks = gridBlocks.map(gridBlock => ({
      ...gridBlock,
      content: gridBlock.content || (gridBlock as any).payload || {},
      id: typeof gridBlock.id === 'string' ? parseInt(gridBlock.id) : gridBlock.id
    }));
    
    return (
      <div className={cn("grid-renderer", className)} style={spacingStyles}>
        <div 
          className="grid gap-4"
          style={{ 
            gridTemplateColumns: columnWidths.length > 0 
              ? columnWidths.map(w => `${w}%`).join(' ')
              : `repeat(${columns}, 1fr)`
          }}
        >
          {normalizedGridBlocks.map((gridBlock) => (
            <div key={gridBlock.id} className={getAlignmentClass(gridBlock.meta?.alignment?.vertical || 'top')}>
              <BlockRenderer
                block={gridBlock}
                onUpdate={onUpdate}
                readonly={readonly}
                onInteraction={onInteraction}
                onSectionView={onSectionView}
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const renderBlockContent = () => {
    switch (normalizedBlock.type) {
      case 'heading':
        return <HeadingBlock block={normalizedBlock} onUpdate={onUpdate} readonly={readonly} />;
      case 'paragraph':
        return <ParagraphBlock block={normalizedBlock} onUpdate={onUpdate} readonly={readonly} />;
      case 'figure':
        return <FigureBlock block={normalizedBlock} onUpdate={onUpdate} readonly={readonly} />;
      case 'table':
        return <TableBlock block={normalizedBlock} onUpdate={onUpdate} readonly={readonly} />;
      case 'callout':
        return <CalloutBlock block={normalizedBlock} onUpdate={onUpdate} readonly={readonly} />;
      case 'snapshot_card':
        return <SnapshotCardBlock block={normalizedBlock} onUpdate={onUpdate} readonly={readonly} />;
      case 'number_card':
        return <NumberCard block={normalizedBlock} onUpdate={onUpdate} readonly={readonly} />;
      case 'reviewer_quote':
        return <ReviewerQuote block={normalizedBlock} onUpdate={onUpdate} readonly={readonly} />;
      case 'poll':
        return (
          <PollBlock 
            block={normalizedBlock} 
            onUpdate={onUpdate} 
            readonly={readonly}
            onVote={(optionId) => handleInteraction('poll_vote', { optionId })}
          />
        );
      case 'citation_list':
        return <CitationListBlock block={normalizedBlock} onUpdate={onUpdate} readonly={readonly} />;
      case 'divider':
        return (
          <DividerBlock 
            block={normalizedBlock} 
            onUpdate={onUpdate}
            onInteraction={handleInteraction} 
            onSectionView={handleSectionView} 
            readonly={readonly} 
          />
        );
      case 'diagram':
        return <DiagramBlock block={normalizedBlock} onUpdate={onUpdate} readonly={readonly} />;
      default:
        return (
          <div className="p-4 border border-red-500 rounded bg-red-500/10">
            <p className="text-red-400">Tipo de bloco desconhecido: {normalizedBlock.type}</p>
            <p className="text-red-300 text-sm mt-2">
              Block ID: {normalizedBlock.id}
            </p>
            {normalizedBlock.content && (
              <details className="mt-2">
                <summary className="text-red-300 cursor-pointer">Debug Info</summary>
                <pre className="text-xs mt-2 text-red-200 overflow-auto">
                  {JSON.stringify(normalizedBlock.content, null, 2)}
                </pre>
              </details>
            )}
          </div>
        );
    }
  };

  // For heading and paragraph blocks, spacing is handled internally
  // For other blocks, apply spacing to the container
  const shouldApplyContainerSpacing = !['heading', 'paragraph'].includes(normalizedBlock.type);
  const containerStyle = shouldApplyContainerSpacing ? spacingStyles : {};

  return (
    <BlockErrorBoundary blockId={normalizedBlock.id} blockType={normalizedBlock.type}>
      <div 
        className={cn(
          "block-renderer h-full",
          getAlignmentClass(verticalAlign),
          className
        )}
        style={containerStyle}
        onClick={handleSectionView}
      >
        <div className="w-full">
          {renderBlockContent()}
        </div>
      </div>
    </BlockErrorBoundary>
  );
};
