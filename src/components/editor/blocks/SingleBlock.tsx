
// ABOUTME: Wrapper for a single draggable/editable block within a list or grid.
// Handles drag handle, selection state, and renders BlockContentEditor.
import React from 'react';
import { Draggable, DraggableProvided, DraggableStateSnapshot } from '@hello-pangea/dnd';
import { ReviewBlock, BlockType, LayoutElement, AddBlockOptions } from '@/types/review';
import { BlockContentEditor } from '../BlockContentEditor';
import { Button } from '@/components/ui/button';
import { Trash2, ChevronUp, ChevronDown, PlusCircle } from 'lucide-react';
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
          onAddBlock={(type, _pos, relId) => onAddBlock?.(type, undefined, relId)}
          readonly={true}
        />
      </div>
    );
  }

  return (
    <Draggable draggableId={layoutElement.id} index={index} isDragDisabled={readonly} type="LAYOUT_ELEMENT">
      {(provided: DraggableProvided, snapshot: DraggableStateSnapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={cn(
            "single-block group/singleblock relative mb-3 transition-shadow duration-150",
            snapshot.isDragging && "shadow-2xl outline-dashed outline-2 outline-blue-600 bg-gray-800/50",
          )}
          onClickCapture={(e) => { 
            if (!isActive) {
              onSelectBlock(block.id);
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
            onAddBlock={(type) => onAddBlock?.({type})}
            readonly={readonly}
            dragHandleProps={provided.dragHandleProps} 
          />
        </div>
      )}
    </Draggable>
  );
};
