
// ABOUTME: Wrapper for a single draggable/editable block within a list or grid.
// Handles drag handle, selection state, and renders BlockContentEditor.
import React from 'react';
import { Draggable, DraggableProvided, DraggableStateSnapshot } from '@hello-pangea/dnd';
import { ReviewBlock, BlockType } from '@/types/review';
import { BlockContentEditor } from '../BlockContentEditor';
import { Button } from '@/components/ui/button';
import { Trash2, ChevronUp, ChevronDown, PlusCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SingleBlockProps {
  block: ReviewBlock;
  index: number; // For react-beautiful-dnd
  onUpdateBlock: (blockId: string, updates: Partial<ReviewBlock>) => void;
  onDeleteBlock: (blockId: string) => void;
  onMoveBlock: (blockId: string, direction: 'up' | 'down') => void;
  onSelectBlock: (blockId: string | null) => void;
  onAddBlock?: (type: BlockType, position?: 'above' | 'below' | number) => void; // Optional for adding new blocks relative to this one
  activeBlockId: string | null;
  readonly?: boolean;
}

export const SingleBlock: React.FC<SingleBlockProps> = ({
  block,
  index,
  onUpdateBlock,
  onDeleteBlock,
  onMoveBlock,
  onSelectBlock,
  onAddBlock,
  activeBlockId,
  readonly = false,
}) => {
  const isActive = activeBlockId === block.id;

  const renderBlockActions = () => (
    <div className={cn(
        "absolute -top-3 right-1 z-20 flex items-center gap-1 p-1 bg-gray-800 border border-gray-700 rounded-md shadow-lg",
        "opacity-0 group-hover/singleblock:opacity-100 focus-within:opacity-100 transition-opacity duration-150",
        isActive && "opacity-100" // Always show for active block
      )}
    >
      {onAddBlock && (
         <Button variant="ghost" size="icon_xs" onClick={() => onAddBlock(BlockType.TEXT, 'above')} className="text-gray-400 hover:text-blue-400">
           <PlusCircle size={14} />
         </Button>
      )}
      <Button variant="ghost" size="icon_xs" onClick={() => onMoveBlock(block.id, 'up')} className="text-gray-400 hover:text-gray-200">
        <ChevronUp size={16} />
      </Button>
      <Button variant="ghost" size="icon_xs" onClick={() => onMoveBlock(block.id, 'down')} className="text-gray-400 hover:text-gray-200">
        <ChevronDown size={16} />
      </Button>
      <Button variant="ghost" size="icon_xs" onClick={() => onDeleteBlock(block.id)} className="text-red-500 hover:text-red-400">
        <Trash2 size={14} />
      </Button>
    </div>
  );


  if (readonly) {
    return (
      <div className="single-block-readonly mb-2"> {/* Added margin for readonly separation */}
        <BlockContentEditor
          block={block}
          isActive={false} // No active state in readonly
          onSelect={() => {}} // No selection in readonly
          onUpdate={onUpdateBlock}
          onDelete={onDeleteBlock} // May still be needed for some backend logic, but UI hidden
          onMove={onMoveBlock} // Same as delete
          onAddBlock={(type, _pos) => onAddBlock?.(type)} // Add block might be used if there is a global add button for readonly mode
          readonly={true}
        />
      </div>
    );
  }

  return (
    <Draggable draggableId={block.id} index={index} isDragDisabled={readonly}>
      {(provided: DraggableProvided, snapshot: DraggableStateSnapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          // Drag handle is now part of BlockContentEditor for better UX
          // {...provided.dragHandleProps} 
          className={cn(
            "single-block group/singleblock relative mb-3 transition-shadow duration-150",
            snapshot.isDragging && "shadow-2xl outline-dashed outline-2 outline-blue-600 bg-gray-800/50",
          )}
          onClickCapture={(e) => { // Use onClickCapture to ensure selection happens even if child stops propagation
            if (!isActive) {
              onSelectBlock(block.id);
            }
            // Don't stop propagation if the click is on an interactive element within the block editor
            const target = e.target as HTMLElement;
            if (target.closest('input, textarea, button, [contenteditable=true], select')) {
              return;
            }
          }}
          
        >
          {/* Actions are shown on hover or when active */}
          {renderBlockActions()}
          
          <BlockContentEditor
            block={block}
            isActive={isActive}
            onSelect={onSelectBlock}
            onUpdate={onUpdateBlock}
            onDelete={onDeleteBlock}
            onMove={onMoveBlock}
            onAddBlock={(type, _pos) => onAddBlock?.(type)}
            readonly={readonly}
            dragHandleProps={provided.dragHandleProps} // Pass drag handle to BCE
          />
        </div>
      )}
    </Draggable>
  );
};

