// ABOUTME: Wrapper for a single editable block within a list or grid.
// Handles selection state, actions, and renders BlockContentEditor.
import React from 'react';
import { ReviewBlock, BlockType, LayoutElement, AddBlockOptions } from '@/types/review';
import { BlockContentEditor } from '../BlockContentEditor';
import { Button } from '@/components/ui/button';
import { Trash2, ChevronUp, ChevronDown, PlusCircle, GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SingleBlockProps {
  layoutElement: LayoutElement & { type: 'block_container', blockId: string };
  block: ReviewBlock;
  index: number; 
  onUpdateBlock: (blockId: string, updates: Partial<ReviewBlock>) => void;
  onDeleteBlock: (blockId: string) => void;
  onMoveElement: (layoutElementId: string, direction: 'up' | 'down') => void;
  onSelectBlock: (blockId: string | null) => void;
  onAddBlock?: (options: Partial<AddBlockOptions> & { type: BlockType }) => void;
  activeBlockId: string | null;
  readonly?: boolean;
}

export const SingleBlock: React.FC<SingleBlockProps> = ({
  layoutElement,
  block,
  index,
  onUpdateBlock,
  onDeleteBlock,
  onMoveElement,
  onSelectBlock,
  onAddBlock,
  activeBlockId,
  readonly = false,
}) => {
  const isActive = activeBlockId === block.id;

  const handleAddBlockAbove = () => {
    if (onAddBlock) {
      onAddBlock({
        type: "text", 
        position: 'above', 
        relativeToLayoutElementId: layoutElement.id
      });
    }
  };

  const renderBlockActions = () => (
    <div className={cn(
        "absolute -top-3 right-1 z-20 flex items-center gap-1 p-1 bg-gray-800 border border-gray-700 rounded-md shadow-lg",
        "opacity-0 group-hover/singleblock:opacity-100 focus-within:opacity-100 transition-opacity duration-150",
        isActive && "opacity-100" 
      )}
    >
      {onAddBlock && (
         <Button variant="ghost" size="icon" onClick={handleAddBlockAbove} className="text-gray-400 hover:text-blue-400 h-6 w-6">
           <PlusCircle size={14} />
         </Button>
      )}
      <Button variant="ghost" size="icon" onClick={() => onMoveElement(layoutElement.id, 'up')} className="text-gray-400 hover:text-gray-200 h-6 w-6">
        <ChevronUp size={16} />
      </Button>
      <Button variant="ghost" size="icon" onClick={() => onMoveElement(layoutElement.id, 'down')} className="text-gray-400 hover:text-gray-200 h-6 w-6">
        <ChevronDown size={16} />
      </Button>
      <Button variant="ghost" size="icon" onClick={() => onDeleteBlock(block.id)} className="text-red-500 hover:text-red-400 h-6 w-6">
        <Trash2 size={14} />
      </Button>
    </div>
  );

  const containerClasses = cn(
    "single-block group/singleblock relative my-1 transition-shadow duration-150",
    !readonly && "hover:shadow-md",
    isActive && !readonly && "shadow-lg"
  );

  if (readonly) {
    return (
      <div className="single-block-readonly mb-2">
        <BlockContentEditor
          block={block}
          isActive={false}
          onSelect={() => {}}
          onUpdate={onUpdateBlock}
          onDelete={onDeleteBlock} 
          onMove={(elementId, dir) => onMoveElement(elementId, dir)}
          onAddBlock={(options) => onAddBlock?.(options)}
          readonly={true}
        />
      </div>
    );
  }

  return (
    <div
      className={containerClasses}
      onClickCapture={(e) => { 
        if (!isActive && !readonly) {
          onSelectBlock(block.id);
          // Prevent event from bubbling up and closing modals, etc.
          e.stopPropagation();
        }
        const target = e.target as HTMLElement;
        if (target.closest('input, textarea, button, [contenteditable=true], select, .ProseMirror')) {
          return;
        }
      }}
    >
      {!readonly && renderBlockActions()}
      
      <BlockContentEditor
        block={block}
        isActive={isActive}
        onSelect={() => onSelectBlock(block.id)}
        onUpdate={onUpdateBlock}
        onDelete={onDeleteBlock}
        onMove={(elementId, dir) => onMoveElement(elementId, dir)}
        onAddBlock={(options) => onAddBlock?.(options)}
        readonly={readonly}
      />
    </div>
  );
};
