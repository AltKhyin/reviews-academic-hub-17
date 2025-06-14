
// ABOUTME: Represents a single cell in a 2D grid, capable of holding a block.
import React from 'react';
import { ReviewBlock } from '@/types/review';
import { GridPosition } from '@/types/grid';
import { BlockContentEditor } from '../BlockContentEditor'; // Assuming BlockContentEditorProps allows readonly
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Grid2DCellProps {
  position: GridPosition;
  block: ReviewBlock | null; // Cell might be empty
  activeBlockId: string | null;
  onActiveBlockChange: (blockId: string | null) => void;
  onUpdateBlock: (blockId: string, updates: Partial<ReviewBlock>) => void;
  onDeleteBlock: (blockId: string) => void;
  onAddBlock: (position: GridPosition) => void; // Cell requests block at its position
  gridId: string; // To associate with the parent grid
  // Drag and drop related props (simplified for now)
  onDragOverCell?: (e: React.DragEvent, position: GridPosition) => void;
  onDropInCell?: (e: React.DragEvent, position: GridPosition) => void;
  isDragOver?: boolean; // To highlight if something is being dragged over this cell
  readonly?: boolean;
}

export const Grid2DCell: React.FC<Grid2DCellProps> = ({
  position,
  block,
  activeBlockId,
  onActiveBlockChange,
  onUpdateBlock,
  onDeleteBlock,
  onAddBlock,
  // gridId, // gridId is mainly for context, block content editor doesn't directly need it
  onDragOverCell,
  onDropInCell,
  isDragOver,
  readonly,
}) => {
  const handleAddClick = () => {
    onAddBlock(position);
  };

  const handleSelectBlock = () => {
    if (block) {
      onActiveBlockChange(block.id);
    }
  };
  
  // Dummy onMove, actual move is complex and handled by Grid2DContainer/BlockEditor
  const handleMovePlaceholder = () => console.log("Move within cell not implemented directly here");


  return (
    <div
      className={cn(
        "grid-2d-cell border-2 border-dashed rounded min-h-[100px] p-1 flex flex-col justify-center items-center transition-all duration-150",
        block ? "border-gray-700 bg-gray-900/30" : "border-gray-800 hover:border-gray-700",
        activeBlockId && block && activeBlockId === block.id && "ring-2 ring-blue-500 border-blue-500",
        isDragOver && "bg-blue-900/30 border-blue-500" // Highlight on drag over
      )}
      style={{ borderColor: isDragOver ? '#3b82f6' : (block ? '#374151' : '#2b3245') }}
      onDragOver={(e) => {
        if (onDragOverCell) {
            e.preventDefault(); // Necessary to allow drop
            onDragOverCell(e, position);
        }
      }}
      onDrop={(e) => {
        if (onDropInCell) {
            e.preventDefault();
            onDropInCell(e, position);
        }
      }}
      onClick={!block ? handleAddClick : undefined} // Add block if empty, otherwise let BlockContentEditor handle clicks
    >
      {block ? (
        <BlockContentEditor
          block={block}
          isActive={activeBlockId === block.id}
          onSelect={handleSelectBlock}
          onUpdate={onUpdateBlock}
          onDelete={onDeleteBlock}
          // BlockContentEditor might not need these for a cell context, or they'd be no-ops
          onMove={handleMovePlaceholder} 
          onAddBlock={() => console.log("Add from within cell editor not standard")} // Or provide specific functionality
          readonly={readonly}
          // isFirst/isLast might not be relevant here or need different logic
        />
      ) : (
        !readonly && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleAddClick}
            className="text-gray-400 hover:text-gray-300 hover:bg-gray-800"
          >
            <Plus className="w-4 h-4 mr-1" />
            Bloco
          </Button>
        )
      )}
    </div>
  );
};
