// ABOUTME: Represents a single row within a 2D grid layout.
// Manages and renders Grid2DCells for the current row.
import React, { useState } from 'react';
import { ReviewBlock, BlockType, GridCell, GridPosition } from '@/types/review';
import { Grid2DCell } from './Grid2DCell';
import { cn } from '@/lib/utils';

export interface Grid2DRowProps {
  gridId: string;
  rowIndex: number;
  cells: GridCell[];
  numCols: number; // Total number of columns in the grid for consistent layout
  blocks: { [key: string]: ReviewBlock };
  onUpdateBlock: (blockId: string, updates: Partial<ReviewBlock>) => void;
  onDeleteBlock: (blockId: string) => void;
  onAddBlockToGrid: (type: BlockType, gridId: string, position: GridPosition) => void;
  onActiveBlockChange: (blockId: string | null) => void;
  activeBlockId: string | null;
  readonly?: boolean;
  onCellDragOver?: (e: React.DragEvent<HTMLDivElement>, position: GridPosition) => void;
  onCellDrop?: (e: React.DragEvent<HTMLDivElement>, position: GridPosition) => void;
}

export const Grid2DRow: React.FC<Grid2DRowProps> = ({
  gridId,
  rowIndex,
  cells,
  numCols,
  blocks,
  onUpdateBlock,
  onDeleteBlock,
  onAddBlockToGrid,
  onActiveBlockChange,
  activeBlockId,
  readonly = false,
  onCellDragOver,
  onCellDrop,
}) => {
  // State for drag-over visual feedback, if needed at row/cell level
  const [dragOverCellPosition, setDragOverCellPosition] = useState<GridPosition | null>(null);

  const handleCellDragOver = (e: React.DragEvent<HTMLDivElement>, position: GridPosition) => {
    if (onCellDragOver) onCellDragOver(e, position);
    setDragOverCellPosition(position);
  };

  const handleCellDrop = (e: React.DragEvent<HTMLDivElement>, position: GridPosition) => {
    if (onCellDrop) onCellDrop(e, position);
    setDragOverCellPosition(null); // Reset visual feedback
  };

  const handleDragLeaveGrid = () => {
    setDragOverCellPosition(null);
  };

  // Ensure cells array matches numCols, filling with empty cell data if necessary
  // This is more for visual consistency if data is sparse
  const displayCells = Array.from({ length: numCols }, (_, colIndex) => {
    return cells[colIndex] || { id: `placeholder-${gridId}-${rowIndex}-${colIndex}`, blockId: null, colSpan: 1, rowSpan: 1 };
  });


  return (
    <div 
      className={cn(
        "grid-2d-row flex gap-2",
        // Tailwind CSS needs full class names, dynamic generation like `grid-cols-${numCols}` won't work directly for arbitrary numbers.
        // Use inline style for dynamic columns or predefine limited set of grid-cols-X classes if numCols is bounded.
        // For arbitrary numbers, style is the way to go.
      )}
      style={{ display: 'grid', gridTemplateColumns: `repeat(${numCols}, minmax(0, 1fr))` }}
      onDragLeave={handleDragLeaveGrid} // Clear drag over when leaving the row area
    >
      {displayCells.map((cell, colIndex) => {
        const block = cell.blockId ? blocks[cell.blockId] : null;
        const position: GridPosition = { row: rowIndex, col: colIndex };
        const isDragOver = dragOverCellPosition?.row === rowIndex && dragOverCellPosition?.col === colIndex;
        
        return (
          <div key={cell.id || `cell-${colIndex}`} className="flex-1 min-w-0"> {/* Ensure cells can shrink and grow */}
            <Grid2DCell
              position={position}
              block={block}
              activeBlockId={activeBlockId}
              onActiveBlockChange={onActiveBlockChange}
              onUpdateBlock={onUpdateBlock}
              onDeleteBlock={onDeleteBlock}
              onAddBlockToGrid={onAddBlockToGrid}
              gridId={gridId}
              onDragOverCell={handleCellDragOver}
              onDropInCell={handleCellDrop}
              isDragOver={isDragOver}
              readonly={readonly}
            />
          </div>
        );
      })}
    </div>
  );
};
