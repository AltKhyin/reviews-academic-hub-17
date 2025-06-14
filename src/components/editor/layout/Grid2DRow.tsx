// ABOUTME: Enhanced 2D grid row component with string ID support and proper event handling
// Manages individual rows within 2D grid layouts

import React, { useCallback } from 'react';
import { GridRow, GridPosition, GridCell as GridCellType } from '@/types/grid'; // Renamed GridCell to GridCellType to avoid conflict
import { ReviewBlock } from '@/types/review';
import { Grid2DCell } from './Grid2DCell';
import { Button } from '@/components/ui/button';
import { Plus, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DragState {
  draggedBlockId: string | null;
  dragOverRowId: string | null;
  dragOverPosition: number | null;
  isDragging: boolean;
  draggedFromRowId: string | null;
  dropTargetType: 'grid' | 'single' | 'merge' | null;
}

interface Grid2DRowProps {
  row: GridRow;
  rowIndex: number;
  gridId: string;
  columns: number; // This might be derivable from row.columns or row.cells.length / row.grid_rows
  activeBlockId: string | null;
  onActiveBlockChange: (blockId: string | null) => void;
  onUpdateBlock: (blockId: string, updates: Partial<ReviewBlock>) => void;
  onDeleteBlock: (blockId: string) => void;
  onAddBlock: (gridId: string, position: GridPosition) => void; // Changed signature
  onAddRowAbove: (gridId: string, rowIndex: number) => void;
  onAddRowBelow: (gridId: string, rowIndex: number) => void;
  onRemoveRow: (gridId: string, rowIndex: number) => void;
  onMove?: (blockId: string, direction: 'up' | 'down') => void; // Made optional as not used in this file
  onAddBlockAtPosition?: (type: any, position?: number) => void; // Made optional
  dragState?: DragState; // Made optional
  onDragOver?: (e: React.DragEvent, targetRowId: string, targetPosition?: number, targetType?: 'grid' | 'single' | 'merge') => void; // Made optional
  onDragLeave?: (e: React.DragEvent) => void; // Made optional
  onDrop?: (e: React.DragEvent, targetRowId: string, targetPosition?: number, dropType?: 'grid' | 'single' | 'merge') => void; // Made optional
  canRemoveRow: boolean;
}

export const Grid2DRow: React.FC<Grid2DRowProps> = ({
  row,
  rowIndex,
  gridId,
  // columns, // This can be derived from row.columns
  activeBlockId,
  onActiveBlockChange,
  onUpdateBlock,
  onDeleteBlock,
  onAddBlock, // This is (gridId: string, position: GridPosition) => void;
  onAddRowAbove,
  onAddRowBelow,
  onRemoveRow,
  canRemoveRow
  // ... other props are optional and not used directly here for cell iteration logic
}) => {
  // This callback is for a cell wanting to add a block at its position
  const handleAddBlockInCell = useCallback((cellPosition: GridPosition) => {
    onAddBlock(gridId, cellPosition);
  }, [onAddBlock, gridId]);

  return (
    <>
      {/* Row Controls */}
      <div className="grid-2d-row-controls col-span-full flex items-center justify-between py-1 mb-2">
        <span className="text-xs text-gray-500 font-mono">
          Linha {rowIndex + 1} (ID: {row.id})
        </span>
        
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onAddRowAbove(gridId, rowIndex)}
            className="w-6 h-6 p-0 text-blue-400 hover:text-blue-300 hover:bg-blue-900/20"
            title="Adicionar linha acima"
          >
            <Plus className="w-3 h-3" />
          </Button>
          
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onAddRowBelow(gridId, rowIndex)}
            className="w-6 h-6 p-0 text-green-400 hover:text-green-300 hover:bg-green-900/20"
            title="Adicionar linha abaixo"
          >
            <Plus className="w-3 h-3" />
          </Button>
          
          {canRemoveRow && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onRemoveRow(gridId, rowIndex)}
              className="w-6 h-6 p-0 text-red-400 hover:text-red-300 hover:bg-red-900/20"
              title="Remover linha"
            >
              <Minus className="w-3 h-3" />
            </Button>
          )}
        </div>
      </div>

      {/* Row Cells */}
      {/* Assuming row.cells are correctly populated with GridCellType which includes row/column and ReviewBlock */}
      {row.cells.map((cell: GridCellType) => (
        <Grid2DCell
          key={cell.id}
          position={{ row: cell.row, column: cell.column }} // cell.row and cell.column now exist from updated GridCellType
          block={cell.block} // cell.block is now ReviewBlock | undefined
          activeBlockId={activeBlockId}
          onActiveBlockChange={onActiveBlockChange}
          onUpdateBlock={onUpdateBlock}
          onDeleteBlock={onDeleteBlock}
          onAddBlock={handleAddBlockInCell} // Passed the adapted handler
          gridId={gridId} // Grid2DCell might need gridId for some operations
        />
      ))}
    </>
  );
};
