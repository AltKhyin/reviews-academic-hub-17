// ABOUTME: Represents a single cell in a 2D grid, capable of holding a block.
// Handles block rendering, adding new blocks to empty cells, and drag/drop interactions.
import React from 'react';
import { ReviewBlock, BlockType, GridPosition } from '@/types/review';
import { BlockContentEditor, BlockContentEditorProps } from '../BlockContentEditor';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Grid2DCellProps {
  position: GridPosition; // Make sure GridPosition is exported from types
  block: ReviewBlock | null; 
  activeBlockId: string | null;
  onActiveBlockChange: (blockId: string | null) => void;
  onUpdateBlock: (blockId: string, updates: Partial<ReviewBlock>) => void;
  onDeleteBlock: (blockId: string) => void;
  onAddBlockToGrid: (type: BlockType, gridId: string, position: GridPosition) => void;
  gridId: string; 
  onDragOverCell?: (e: React.DragEvent<HTMLDivElement>, position: GridPosition) => void;
  onDropInCell?: (e: React.DragEvent<HTMLDivElement>, position: GridPosition) => void;
  isDragOver?: boolean; 
  readonly?: boolean;
}

export const Grid2DCell: React.FC<Grid2DCellProps> = ({
  position,
  block,
  activeBlockId,
  onActiveBlockChange,
  onUpdateBlock,
  onDeleteBlock,
  onAddBlockToGrid,
  gridId,
  onDragOverCell,
  onDropInCell,
  isDragOver,
  readonly,
}) => {
  const handleAddClick = () => {
    onAddBlockToGrid("text", gridId, position); // Use string literal "text"
  };

  const handleSelectBlock = () => {
    if (block && !readonly) {
      onActiveBlockChange(block.id);
    }
  };
  
  const handleMovePlaceholder = (id: string, dir: 'up' | 'down') => {
      console.log("Move within cell via BlockContentEditor not directly handled here; blockId, direction:", id, dir);
  };

  const blockContentEditorProps: BlockContentEditorProps | null = block ? {
    block: block,
    isActive: activeBlockId === block.id,
    onSelect: handleSelectBlock,
    onUpdate: onUpdateBlock,
    onDelete: onDeleteBlock,
    onMove: handleMovePlaceholder, 
    onAddBlock: (options) => { 
        console.log("Adding block from within a grid cell is not supported via this action. Options:", options);
    },
    readonly: !!readonly,
  } : null;


  return (
    <div
      className={cn(
        "grid-2d-cell border-2 border-dashed rounded min-h-[120px] p-2 flex flex-col justify-center items-center transition-all duration-150 relative", 
        block ? "border-gray-700 bg-gray-900/50 hover:bg-gray-850/60" : "border-gray-800 hover:border-gray-700 hover:bg-gray-850/30",
        activeBlockId && block && activeBlockId === block.id && !readonly && "ring-2 ring-blue-500 border-blue-500 shadow-md",
        isDragOver && !readonly && "bg-blue-900/40 border-blue-500 ring-2 ring-blue-400",
        readonly && block && "border-transparent bg-transparent p-0", 
        readonly && !block && "border-gray-800 bg-gray-900/20" 
      )}
      onClick={handleSelectBlock}
      onDragOver={(e) => onDragOverCell?.(e, position)}
      onDrop={(e) => onDropInCell?.(e, position)}
    >
      {block && blockContentEditorProps ? (
        <BlockContentEditor {...blockContentEditorProps} />
      ) : (
        <div className="w-full h-full flex items-center justify-center p-2">
          {!readonly && (
            <Button
              variant="ghost"
              size="sm"
              className="w-full h-full border-2 border-dashed border-gray-700 hover:border-blue-500 hover:bg-gray-800/50 text-gray-500 hover:text-blue-400"
              onClick={handleAddClick}
            >
              <Plus size={18} />
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
