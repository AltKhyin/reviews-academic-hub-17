
// ABOUTME: Container for a 2D grid layout, managing rows and cells.
// Handles overall grid structure and passes props down to Grid2DRow.
import React from 'react';
import { ReviewBlock, LayoutElement, GridPosition, BlockType } from '@/types/review';
import { Grid2DRow } from './Grid2DRow';
import { Button } from '@/components/ui/button'; // Assuming Button component
import { PlusCircle } from 'lucide-react';

export interface Grid2DContainerProps {
  layoutElement: LayoutElement & { type: 'grid' }; // Grid specific layout element
  blocks: { [key: string]: ReviewBlock };
  onUpdateBlock: (blockId: string, updates: Partial<ReviewBlock>) => void;
  onDeleteBlock: (blockId: string) => void;
  onAddBlockToGrid: (type: BlockType, gridId: string, position: GridPosition) => void;
  onActiveBlockChange: (blockId: string | null) => void;
  activeBlockId: string | null;
  readonly?: boolean;
  // Drag and drop related props if managed at this level
  onCellDragOver?: (e: React.DragEvent<HTMLDivElement>, position: GridPosition) => void;
  onCellDrop?: (e: React.DragEvent<HTMLDivElement>, position: GridPosition) => void;
  draggedBlockType?: BlockType | null; // To indicate what's being dragged over
}

export const Grid2DContainer: React.FC<Grid2DContainerProps> = ({
  layoutElement,
  blocks,
  onUpdateBlock,
  onDeleteBlock,
  onAddBlockToGrid,
  onActiveBlockChange,
  activeBlockId,
  readonly = false,
  onCellDragOver,
  onCellDrop,
  // draggedBlockType, // This prop might be used for visual feedback
}) => {
  const { id: gridId, rows = [], settings } = layoutElement;
  const numCols = settings?.columns || Math.max(1, ...rows.map(row => row.cells.length)); // Calculate from rows or default

  const handleAddRow = () => {
    // This function would need to update the main 'elements' state via a callback
    console.log("Add row to grid", gridId, "- Implementation needed in parent (e.g., BlockEditor/useBlockManagement)");
    // Example: onUpdateLayoutElement(gridId, { rows: [...rows, { id: newRowId, cells: new Array(numCols).fill(null).map(() => ({ id: newCellId, blockId: null})) }] });
  };

  return (
    <div className="grid-2d-container my-4 p-2 border border-gray-800 rounded-lg bg-gray-950/50 space-y-2">
      {rows.map((row, rowIndex) => (
        <Grid2DRow
          key={row.id || `row-${rowIndex}`}
          gridId={gridId}
          rowIndex={rowIndex}
          cells={row.cells}
          numCols={numCols} // Pass numCols for consistent row structure
          blocks={blocks}
          onUpdateBlock={onUpdateBlock}
          onDeleteBlock={onDeleteBlock}
          onAddBlockToGrid={onAddBlockToGrid}
          onActiveBlockChange={onActiveBlockChange}
          activeBlockId={activeBlockId}
          readonly={readonly}
          onCellDragOver={onCellDragOver}
          onCellDrop={onCellDrop}
        />
      ))}
      {!readonly && (
        <div className="mt-2 flex justify-center">
          <Button variant="outline" size="sm" onClick={handleAddRow} className="text-gray-400 border-gray-700 hover:bg-gray-800 hover:text-white">
            <PlusCircle size={16} className="mr-2" />
            Adicionar Linha à Grade
          </Button>
        </div>
      )}
    </div>
  );
};

