
// ABOUTME: Renders a single row within a 2D grid layout, handling block placement and interactions.
// Supports dynamic column rendering and responsive adjustments.

import React from 'react';
import { GridCell, GridPosition } from '@/types/grid';
import { ReviewBlock, BlockType } from '@/types/review';
import { SingleBlock } from '../blocks/SingleBlock';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

// Minimal DragState for SingleBlock if full state not needed from Grid2DRow context
interface MinimalDragStateForSingleBlock {
  draggedBlockId: string | null;
  isDragging: boolean;
  // Add other fields if SingleBlock specifically uses them from DragState
}

interface Grid2DRowProps {
  gridId: string;
  rowIndex: number;
  row: { id: string; cells: GridCell[]; columns: number };
  activeBlockId: string | null;
  onActiveBlockChange: (blockId: string | null) => void;
  onUpdateBlock: (blockId: string, updates: Partial<ReviewBlock>) => void;
  onDeleteBlock: (blockId: string) => void;
  onAddBlock: (gridId: string, position: GridPosition, blockType?: BlockType) => string | void; // Allow string or void return
  dragState?: any; // Define more specifically if possible, e.g. the DragState from BlockEditor
  onDragOverCell?: (gridId: string, position: GridPosition) => void;
  onDropInCell?: (gridId: string, position: GridPosition) => void;
  onDragStartCell?: (blockId: string, gridId: string, position: GridPosition) => void;
}

export const Grid2DRow: React.FC<Grid2DRowProps> = ({
  gridId,
  rowIndex,
  row,
  activeBlockId,
  onActiveBlockChange,
  onUpdateBlock,
  onDeleteBlock,
  onAddBlock,
  dragState, // Full dragState from BlockEditor context
  onDragOverCell,
  onDropInCell,
  onDragStartCell,
}) => {
  const handleAddBlockToCell = (colIndex: number) => {
    onAddBlock(gridId, { row: rowIndex, column: colIndex });
  };

  return (
    <div 
      className="grid-2d-row flex w-full" 
      // Using flex basis for columns instead of gridTemplateColumns for finer control with potential gaps
      // style={{ gridTemplateColumns: `repeat(${row.columns}, 1fr)`, gap: '0.5rem' }}
    >
      {Array.from({ length: row.columns }).map((_, colIndex) => {
        const cell = row.cells.find(c => {
            // Check block's meta.layout.grid_position
            const blockMetaPos = c.block?.meta?.layout?.grid_position;
            if (blockMetaPos) {
                return blockMetaPos.row === rowIndex && blockMetaPos.column === colIndex;
            }
            // Fallback to cell's direct row/column if they exist (they do per GridCell type)
            return c.row === rowIndex && c.column === colIndex;
        });
        
        const blockInCell = cell?.block ? {
          id: cell.block.id,
          type: cell.block.type as BlockType,
          content: cell.block.content,
          visible: cell.block.visible,
          meta: cell.block.meta,
          sort_index: cell.block.sort_index // Ensured in type
        } as ReviewBlock : null;

        const cellPosition: GridPosition = { row: rowIndex, column: colIndex };
        
        // Use the full dragState from BlockEditor for consistency
        const isDragOver = dragState?.dropTargetType === '2d-grid-cell' && 
                           dragState?.dragOverGridId === gridId &&
                           dragState?.dragOverPosition?.row === rowIndex && // Check if dragOverPosition is GridPosition
                           dragState?.dragOverPosition?.column === colIndex;

        return (
          <div
            key={`${gridId}-${rowIndex}-${colIndex}`}
            className={cn(
              "grid-2d-cell flex-1 p-1 border border-dashed rounded-md min-h-[80px] flex flex-col justify-center items-center",
              isDragOver ? "border-blue-500 bg-blue-500/10" : "border-gray-700 hover:border-gray-500"
            )}
            style={{
              flexBasis: `calc(${100 / row.columns}% - 0.25rem)`, // Example for gap handling with flex
              margin: '0.125rem', // Half of the desired gap
              borderColor: isDragOver ? '#3b82f6' : '#4b5563',
              backgroundColor: isDragOver ? 'rgba(59, 130, 246, 0.1)' : '#1e1e1e'
            }}
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onDragOverCell?.(gridId, cellPosition);
            }}
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onDropInCell?.(gridId, cellPosition);
            }}
            onClick={() => !blockInCell && handleAddBlockToCell(colIndex)}
          >
            {blockInCell ? (
              <SingleBlock
                block={blockInCell}
                activeBlockId={activeBlockId}
                onActiveBlockChange={onActiveBlockChange}
                onUpdateBlock={onUpdateBlock}
                onDeleteBlock={onDeleteBlock}
                globalIndex={0} // Needs context or removal
                dragState={dragState as MinimalDragStateForSingleBlock || { draggedBlockId: null, isDragging: false }} // Pass down relevant part of dragState or a default
                onDuplicateBlock={() => { console.log('Duplicate in Grid2D cell (NYI)'); }}
                onAddBlockBetween={(pos, type) => { console.log('Add between in Grid2D cell (NYI)'); return ''; }} // Return string
                onDragStart={(e) => {
                  e.stopPropagation();
                  onDragStartCell?.(blockInCell.id, gridId, cellPosition);
                }}
                // onConvertToGrid, onConvertTo2DGrid not typically used for blocks *already* in a 2D grid cell
              />
            ) : (
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-gray-500 hover:text-gray-300"
                // onClick prop removed from here, parent div handles it
              >
                <Plus className="w-4 h-4 mr-1" /> Add Block
              </Button>
            )}
          </div>
        );
      })}
    </div>
  );
};

