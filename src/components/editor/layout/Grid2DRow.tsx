// ABOUTME: Enhanced 2D grid row component with string ID support and proper event handling
// Manages individual rows within 2D grid layouts

import React, { useCallback } from 'react';
import { GridRow, GridPosition, GridCell as GridCellType } from '@/types/grid'; 
import { ReviewBlock } from '@/types/review';
import { Grid2DCell, Grid2DCellProps } from './Grid2DCell'; // Import Grid2DCellProps
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
  onAddBlock: (gridId: string, position: GridPosition) => void; // This is the main handler
  onAddRowAbove: (gridId: string, rowIndex: number) => void;
  onAddRowBelow: (gridId: string, rowIndex: number) => void;
  onRemoveRow: (gridId: string, rowIndex: number) => void;
  canRemoveRow: boolean;
  // Optional props related to drag/drop, not directly used for cell iteration logic here
  onMove?: (blockId: string, direction: 'up' | 'down') => void;
  onAddBlockAtPosition?: (type: any, position?: number) => void; 
  dragState?: DragState; 
  onDragOver?: (e: React.DragEvent, targetRowId: string, targetPosition?: number, targetType?: 'grid' | 'single' | 'merge') => void; 
  onDragLeave?: (e: React.DragEvent) => void; 
  onDrop?: (e: React.DragEvent, targetRowId: string, targetPosition?: number, dropType?: 'grid' | 'single' | 'merge') => void; 
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
  canRemoveRow
}) => {
  // This callback is for a cell wanting to add a block at its specific GridPosition.
  // It calls the parent's onAddBlock with the gridId and the cell's position.
  const handleAddBlockInSpecificCell = useCallback((cellPosition: GridPosition) => {
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
      {row.cells.map((cell: GridCellType) => {
        // Prepare props for Grid2DCell, ensuring onAddBlock matches Grid2DCellProps
        const cellProps: Grid2DCellProps = {
            key: cell.id,
            position: { row: cell.row, column: cell.column },
            block: cell.block,
            activeBlockId: activeBlockId,
            onActiveBlockChange: onActiveBlockChange,
            onUpdateBlock: onUpdateBlock,
            onDeleteBlock: onDeleteBlock,
            // This onAddBlock is specific to the cell. It knows its position.
            onAddBlock: () => handleAddBlockInSpecificCell({ row: cell.row, column: cell.column }),
            gridId: gridId,
        };
        return <Grid2DCell {...cellProps} />;
      })}
    </>
  );
};
