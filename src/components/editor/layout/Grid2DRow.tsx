
// ABOUTME: Renders a single row within a 2D grid layout, handling block placement and interactions.
// Supports dynamic column rendering and responsive adjustments.

import React from 'react';
import { GridCell, GridPosition } from '@/types/grid';
import { ReviewBlock, BlockType } from '@/types/review';
import { SingleBlock } from '../blocks/SingleBlock';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Grid2DRowProps {
  gridId: string;
  rowIndex: number;
  row: { id: string; cells: GridCell[]; columns: number };
  activeBlockId: string | null;
  onActiveBlockChange: (blockId: string | null) => void;
  onUpdateBlock: (blockId: string, updates: Partial<ReviewBlock>) => void;
  onDeleteBlock: (blockId: string) => void;
  onAddBlock: (gridId: string, position: GridPosition) => void; // Corrected signature
  dragState?: any; // Define more specifically if possible
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
  dragState,
  onDragOverCell,
  onDropInCell,
  onDragStartCell,
}) => {
  const handleAddBlockToCell = (colIndex: number) => {
    onAddBlock(gridId, { row: rowIndex, column: colIndex }); // Pass gridId and full GridPosition
  };

  return (
    <div 
      className="grid-2d-row flex w-full" 
      style={{ gridTemplateColumns: `repeat(${row.columns}, 1fr)`, gap: '0.5rem' /* Reduced gap */ }}
    >
      {Array.from({ length: row.columns }).map((_, colIndex) => {
        const cell = row.cells.find(c => {
            // Access grid_position from block's meta if cell itself doesn't store row/col
            // Or, if GridCell type was updated to include row/column directly:
            return c.row === rowIndex && c.column === colIndex;
        });
        
        const blockInCell = cell?.block ? {
          id: cell.block.id,
          type: cell.block.type as BlockType,
          content: cell.block.content,
          visible: cell.block.visible,
          meta: cell.block.meta,
          sort_index: cell.block.sort_index // Ensure sort_index is present
        } as ReviewBlock : null;

        const cellPosition: GridPosition = { row: rowIndex, column: colIndex };
        const isDragOver = dragState?.dropTargetType === '2d-grid-cell' && 
                           dragState?.dragOverGridId === gridId &&
                           dragState?.dragOverPosition?.row === rowIndex &&
                           dragState?.dragOverPosition?.column === colIndex;

        return (
          <div
            key={`${gridId}-${rowIndex}-${colIndex}`}
            className={cn(
              "grid-2d-cell flex-1 p-1 border border-dashed rounded-md min-h-[80px] flex flex-col justify-center items-center",
              isDragOver ? "border-blue-500 bg-blue-500/10" : "border-gray-700 hover:border-gray-500"
            )}
            style={{
              borderColor: isDragOver ? '#3b82f6' : '#4b5563', // Darker borders
              backgroundColor: isDragOver ? 'rgba(59, 130, 246, 0.1)' : '#1e1e1e' // Darker bg
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
                // Simplified props for SingleBlock in this context
                // Pass only essential props, or define a variant for grid usage
                globalIndex={0} // This might not be relevant here or needs context
                dragState={{}} // Pass appropriate drag state if SingleBlock handles internal drag
                onDuplicateBlock={() => {}} // Placeholder
                onAddBlockBetween={() => {}} // Placeholder
                onDragStart={(e) => {
                  e.stopPropagation();
                  onDragStartCell?.(blockInCell.id, gridId, cellPosition);
                }}
              />
            ) : (
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-gray-500 hover:text-gray-300"
                onClick={() => handleAddBlockToCell(colIndex)}
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
