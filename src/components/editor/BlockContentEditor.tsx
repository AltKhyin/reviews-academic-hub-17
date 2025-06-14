
// ABOUTME: Renders the appropriate editor for a given block type.
// This is a placeholder for BlockContentEditor.tsx to define its props.
import React from 'react';
import { ReviewBlock, BlockType } from '@/types/review';
import { TextBlock } from './blocks/TextBlock';
import { HeadingBlock } from './blocks/HeadingBlock';
import { ImageBlock } from './blocks/ImageBlock';
import { TableBlock } from './blocks/TableBlock';
import { CalloutBlock } from './blocks/CalloutBlock';
import { NumberCardBlock } from './blocks/NumberCardBlock';
import { ReviewerQuoteBlock } from './blocks/ReviewerQuoteBlock';
import { PollBlock } from './blocks/PollBlock';
import { CitationListBlock } from './blocks/CitationListBlock';
import { SnapshotCardBlock } from '../review/blocks/SnapshotCardBlock';
import { DiagramBlock } from '../review/blocks/DiagramBlock'; 
// ... import other specific block components

export interface BlockContentEditorProps {
  block: ReviewBlock;
  isActive: boolean;
  onSelect: () => void;
  onUpdate: (blockId: string, updates: Partial<ReviewBlock>) => void;
  onDelete: (blockId: string) => void;
  onMove: (blockId: string, direction: 'up' | 'down') => void; // Simplified for context
  onAddBlock: (type: BlockType, position?: number) => void; // To add blocks relative to this one
  readonly?: boolean;
  isFirst?: boolean;
  isLast?: boolean;
  // Add any other common props your block editors might need
}

export const BlockContentEditor: React.FC<BlockContentEditorProps> = ({
  block,
  isActive,
  onSelect,
  onUpdate,
  onDelete,
  // onMove, // onMove might be handled by BlockList buttons directly
  // onAddBlock, // onAddBlock might be handled by BlockList buttons directly
  readonly,
}) => {
  const handleUpdateContent = (contentUpdates: any) => {
    onUpdate(block.id, { content: { ...block.content, ...contentUpdates } });
  };

  // Basic click handler to select the block
  const handleClick = (e: React.MouseEvent) => {
    // Prevent click propagation if interacting with inner editable elements
    if ((e.target as HTMLElement).closest('[contenteditable="true"], input, textarea, button')) {
      return;
    }
    if (!isActive) {
      onSelect();
    }
  };

  const commonBlockProps = {
    block,
    onUpdate: (updates: Partial<ReviewBlock>) => onUpdate(block.id, updates),
    readonly,
  };

  // Outer div to handle selection click
  // Add a visual cue for active state if desired (e.g., border)
  return (
    <div 
      onClick={handleClick} 
      className={`block-content-editor-wrapper w-full ${isActive ? 'outline outline-2 outline-blue-500 outline-offset-2' : ''} rounded`}
      role="button" // Make it keyboard accessible for selection
      tabIndex={0} // Make it focusable
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { handleClick(e as any); }}}
    >
      {(() => {
        switch (block.type) {
          case 'paragraph':
          case 'text':
            return <TextBlock {...commonBlockProps} content={block.content} onUpdateContent={handleUpdateContent} />;
          case 'heading':
            return <HeadingBlock {...commonBlockProps} content={block.content} onUpdateContent={handleUpdateContent} />;
          case 'image':
          case 'figure':
            return <ImageBlock {...commonBlockProps} content={block.content} onUpdateContent={handleUpdateContent} />;
          case 'table':
            return <TableBlock {...commonBlockProps} content={block.content} onUpdateContent={handleUpdateContent} />;
          case 'callout':
            return <CalloutBlock {...commonBlockProps} content={block.content} onUpdateContent={handleUpdateContent} />;
          case 'number_card':
            return <NumberCardBlock {...commonBlockProps} content={block.content} onUpdateContent={handleUpdateContent} />;
          case 'reviewer_quote':
            return <ReviewerQuoteBlock {...commonBlockProps} content={block.content} onUpdateContent={handleUpdateContent} />;
          case 'poll':
            return <PollBlock {...commonBlockProps} content={block.content} onUpdateContent={handleUpdateContent} />;
          case 'citation_list':
            return <CitationListBlock {...commonBlockProps} content={block.content} onUpdateContent={handleUpdateContent} />;
          case 'snapshot_card':
            // SnapshotCardBlock might wrap SnapshotCard and handle editing logic itself
            return <SnapshotCardBlock block={block} onUpdate={(updates) => onUpdate(block.id, updates)} readonly={readonly} />;
          case 'diagram':
             return <DiagramBlock block={block} onUpdate={(updates) => onUpdate(block.id, updates)} readonly={readonly} />;
          // ... cases for other block types
          default:
            return (
              <div className="p-4 border border-dashed border-red-400 rounded bg-red-900/20 text-red-300">
                <p className="font-semibold">Unsupported block type: "{block.type}"</p>
                <p className="text-xs mt-1">ID: {block.id}</p>
                <pre className="mt-2 text-xs bg-black/30 p-2 rounded overflow-auto">
                  {JSON.stringify(block.content, null, 2)}
                </pre>
                 {!readonly && <Button size="sm" variant="destructive" className="mt-2" onClick={() => onDelete(block.id)}>Delete this block</Button>}
              </div>
            );
        }
      })()}
    </div>
  );
};
