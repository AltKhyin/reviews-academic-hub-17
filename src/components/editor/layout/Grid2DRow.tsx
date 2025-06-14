
// ABOUTME: Enhanced 2D grid row component with string ID support and proper event handling
// Manages individual rows within 2D grid layouts

import React, { useCallback } from 'react';
import { GridRow, GridPosition, GridCell as GridCellType } from '@/types/grid';
import { ReviewBlock } from '@/types/review';
import { Grid2DCell, Grid2DCellProps } from './Grid2DCell'; // Grid2DCellProps now exported
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
  columns: number;
  activeBlockId: string | null;
  onActiveBlockChange: (blockId: string | null) => void;
  onUpdateBlock: (blockId: string, updates: Partial<ReviewBlock>) => void;
  onDeleteBlock: (blockId: string) => void;
  onAddBlock: (gridId: string, position: GridPosition) => void;
  onAddRowAbove: (gridId: string, rowIndex: number) => void;
  onAddRowBelow: (gridId: string, rowIndex: number) => void;
  onRemoveRow: (gridId: string, rowIndex: number) => void;
  canRemoveRow: boolean;
  // Drag/drop related for cells within this row
  onCellDragOver?: (e: React.DragEvent, position: GridPosition) => void;
  onCellDrop?: (e: React.DragEvent, position: GridPosition) => void;
  dragOverCellPosition?: GridPosition | null; // Which cell is currently being dragged over
  readonly?: boolean;
}

export const Grid2DRow: React.FC<Grid2DRowProps> = ({
  row,
  rowIndex,
  gridId,
  activeBlockId,
  onActiveBlockChange,
  onUpdateBlock,
  onDeleteBlock,
  onAddBlock,
  onAddRowAbove,
  onAddRowBelow,
  onRemoveRow,
  canRemoveRow,
  onCellDragOver,
  onCellDrop,
  dragOverCellPosition,
  readonly,
}) => {
  const handleAddBlockInSpecificCell = useCallback((cellPosition: GridPosition) => {
    onAddBlock(gridId, cellPosition);
  }, [onAddBlock, gridId]);

  return (
    <>
      {/* Row Controls */}
      {!readonly && (
        <div className="grid-2d-row-controls col-span-full flex items-center justify-between py-1 mb-2">
          <span className="text-xs text-gray-500 font-mono">
            Linha {rowIndex + 1} (ID: {row.id.substring(0,8)})
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
      )}

      {/* Row Cells */}
      {row.cells.map((cell: GridCellType) => {
        const cellPosition: GridPosition = { row: cell.row, column: cell.column };
        const isDragOver = dragOverCellPosition?.row === cell.row && dragOverCellPosition?.column === cell.column;
        
        const cellProps: Grid2DCellProps = {
            key: cell.id,
            position: cellPosition,
            block: cell.block,
            activeBlockId: activeBlockId,
            onActiveBlockChange: onActiveBlockChange,
            onUpdateBlock: onUpdateBlock,
            onDeleteBlock: onDeleteBlock,
            onAddBlock: handleAddBlockInSpecificCell, // This is (position: GridPosition) => void after currying gridId
            gridId: gridId,
            onDragOverCell: onCellDragOver, // Pass down D&D handlers
            onDropInCell: onCellDrop,
            isDragOver: isDragOver,
            readonly: readonly,
        };
        return <Grid2DCell {...cellProps} />;
      })}
    </>
  );
};
