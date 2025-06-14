
// ABOUTME: Main editor for individual block content, switching between block types.
// Handles rendering specific block editors (Text, Heading, Image, etc.)
import React from 'react';
import { ReviewBlock, BlockType } from '@/types/review';
import { TextBlock, TextBlockProps } from './blocks/TextBlock';
import { HeadingBlock, HeadingBlockProps } from './blocks/HeadingBlock';
import { ImageBlock, ImageBlockProps } from './blocks/ImageBlock';
import { TableBlock, TableBlockProps } from './blocks/TableBlock';
import { CalloutBlock, CalloutBlockProps } from './blocks/CalloutBlock'; // Assuming CalloutBlock exists
import { NumberCardBlock, NumberCardBlockProps } from './blocks/NumberCardBlock'; // Assuming NumberCardBlock exists
import { ReviewerQuoteBlock, ReviewerQuoteBlockProps } from './blocks/ReviewerQuoteBlock'; // Assuming ReviewerQuoteBlock exists
import { PollBlock, PollBlockProps } from './blocks/PollBlock'; // Assuming PollBlock exists
import { CitationListBlock, CitationListBlockProps } from './blocks/CitationListBlock'; // Assuming CitationListBlock exists

// REVIEW_BLOCKS_FROM_REVIEW_FOLDER_BELOW
import { DiagramBlock } from '@/components/review/blocks/DiagramBlock';
import { SnapshotCardBlock } from '@/components/review/blocks/SnapshotCardBlock';

import { cn } from '@/lib/utils';
import { GripVertical } from 'lucide-react';

export interface BlockContentEditorProps {
  block: ReviewBlock;
  isActive: boolean;
  onSelect: (blockId: string) => void;
  onUpdate: (blockId: string, updates: Partial<ReviewBlock>) => void;
  onDelete: (blockId: string) => void;
  onMove: (blockId: string, direction: 'up' | 'down') => void; // Or more complex move logic
  onAddBlock: (type: BlockType, position?: 'above' | 'below' | number) => void; // Position relative to current block or index
  readonly?: boolean;
  className?: string;
  draggableProps?: any; // For react-beautiful-dnd or other libraries
  dragHandleProps?: any; // For react-beautiful-dnd or other libraries
}

export const BlockContentEditor: React.FC<BlockContentEditorProps> = ({
  block,
  isActive,
  onSelect,
  onUpdate,
  // onDelete, // onDelete is passed but not used directly, might be for a wrapper
  // onMove, // onMove is passed but not used directly
  // onAddBlock, // onAddBlock is passed but not used directly
  readonly,
  className,
  // draggableProps, // draggableProps is passed but not used directly
  dragHandleProps,
}) => {
  const handleUpdateContent = (newContent: any) => {
    onUpdate(block.id, { content: { ...block.content, ...newContent } });
  };

  const renderBlock = () => {
    const commonProps = {
      block,
      onUpdate: (id: string, updates: Partial<ReviewBlock>) => onUpdate(id, updates),
      onUpdateContent: handleUpdateContent,
      readonly,
    };

    // Consolidate content access
    const content = block.content || {};

    switch (block.type) {
      case BlockType.TEXT:
        return <TextBlock {...commonProps as TextBlockProps} content={content} />;
      case BlockType.HEADING:
        return <HeadingBlock {...commonProps as HeadingBlockProps} content={content} />;
      case BlockType.IMAGE:
        return <ImageBlock {...commonProps as ImageBlockProps} content={content} />;
      case BlockType.TABLE:
        return <TableBlock {...commonProps as TableBlockProps} content={content} />;
      case BlockType.DIAGRAM: // Ensure DiagramBlock is correctly typed and handled
         return <DiagramBlock block={block} onUpdate={(updates) => onUpdate(block.id, updates)} readonly={readonly} />;
      case BlockType.SNAPSHOT_CARD:
        return <SnapshotCardBlock block={block} onUpdate={(updates) => onUpdate(block.id, updates)} readonly={readonly} />;
      case BlockType.CALLOUT:
        return <CalloutBlock {...commonProps as CalloutBlockProps} content={content} />;
      case BlockType.NUMBER_CARD:
        return <NumberCardBlock {...commonProps as NumberCardBlockProps} content={content} />;
      case BlockType.REVIEWER_QUOTE:
        return <ReviewerQuoteBlock {...commonProps as ReviewerQuoteBlockProps} content={content} />;
      case BlockType.POLL:
        return <PollBlock {...commonProps as PollBlockProps} content={content} />;
      case BlockType.CITATION_LIST:
        return <CitationListBlock {...commonProps as CitationListBlockProps} content={content} />;
      default:
        return <div className="text-red-500 p-2 bg-red-100 border border-red-300 rounded">Tipo de bloco desconhecido: {block.type}</div>;
    }
  };

  return (
    <div
      onClick={() => !readonly && onSelect(block.id)}
      className={cn(
        "block-content-editor relative group/blockeditor",
        "transition-all duration-150 ease-in-out",
        isActive && !readonly && "ring-2 ring-blue-500 shadow-lg bg-gray-800/30",
        !readonly && "cursor-pointer hover:bg-gray-800/20",
        readonly && "p-0", // No padding in readonly, block itself handles it
        !readonly && "p-2 rounded-md border border-transparent group-hover/blockeditor:border-gray-700", // Padding and border for edit mode
        className
      )}
      // {...draggableProps} // Apply draggable props here
    >
      {!readonly && dragHandleProps && (
        <div
          {...dragHandleProps}
          className={cn(
            "absolute -left-2 top-1/2 -translate-y-1/2 p-0.5 rounded text-gray-500 cursor-grab",
            "opacity-0 group-hover/blockeditor:opacity-100 transition-opacity",
            "hover:bg-gray-700 hover:text-gray-300"
            )}
            style={{ zIndex: 10 }} // Ensure drag handle is above content for easier grabbing
            aria-label="Mover bloco"
        >
          <GripVertical size={16} />
        </div>
      )}
      {renderBlock()}
    </div>
  );
};

