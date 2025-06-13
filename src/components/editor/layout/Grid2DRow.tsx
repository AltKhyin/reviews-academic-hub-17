
// ABOUTME: Individual row component for 2D grid layout
// Renders a single row with cells and row-specific controls

import React, { useCallback } from 'react';
import { GridRow, Grid2DLayout, GridPosition } from '@/types/grid';
import { ReviewBlock } from '@/types/review';
import { Grid2DCell } from './Grid2DCell';
import { Button } from '@/components/ui/button';
import { Plus, Minus, GripHorizontal } from 'lucide-react';
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
  grid: Grid2DLayout;
  rowIndex: number;
  activeBlockId?: string | null;
  onActiveBlockChange?: (blockId: string | null) => void;
  onUpdateBlock: (blockId: string, updates: Partial<ReviewBlock>) => void;
  onDeleteBlock: (blockId: string) => void;
  onAddBlock: (position: GridPosition) => void;
  onAddRowAbove: (rowIndex: number) => void;
  onAddRowBelow: (rowIndex: number) => void;
  onRemoveRow: (rowIndex: number) => void;
  readonly?: boolean;
  dragState?: DragState;
  onDragOver?: (e: React.DragEvent, targetId: string, position?: GridPosition, targetType?: string) => void;
  onDragLeave?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent, targetId: string, position?: GridPosition, dropType?: string) => void;
}

export const Grid2DRow: React.FC<Grid2DRowProps> = ({
  row,
  grid,
  rowIndex,
  activeBlockId,
  onActiveBlockChange,
  onUpdateBlock,
  onDeleteBlock,
  onAddBlock,
  onAddRowAbove,
  onAddRowBelow,
  onRemoveRow,
  readonly = false,
  dragState,
  onDragOver,
  onDragLeave,
  onDrop
}) => {
  const [showControls, setShowControls] = React.useState(false);
  const canRemoveRow = grid.rows.length > 1;

  const handleAddBlock = useCallback((columnIndex: number) => {
    const position: GridPosition = { row: rowIndex, column: columnIndex };
    onAddBlock(position);
  }, [rowIndex, onAddBlock]);

  const handleAddRowAbove = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onAddRowAbove(rowIndex);
  }, [rowIndex, onAddRowAbove]);

  const handleAddRowBelow = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onAddRowBelow(rowIndex);
  }, [rowIndex, onAddRowBelow]);

  const handleRemoveRow = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (canRemoveRow) {
      onRemoveRow(rowIndex);
    }
  }, [rowIndex, onRemoveRow, canRemoveRow]);

  return (
    <div
      className={cn("grid-2d-row group relative")}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
      style={{
        borderBottom: rowIndex < grid.rows.length - 1 ? '1px solid #2a2a2a' : 'none'
      }}
    >
      {/* Row Controls */}
      {!readonly && (
        <div className={cn(
          "absolute -left-12 top-1/2 transform -translate-y-1/2 flex flex-col items-center gap-1 z-10 transition-opacity",
          showControls ? "opacity-100" : "opacity-0"
        )}>
          {/* Add Row Above */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleAddRowAbove}
            className="h-6 w-8 p-0 bg-gray-800 border border-gray-600 hover:bg-blue-700"
            title="Adicionar linha acima"
          >
            <Plus className="w-3 h-3" />
          </Button>

          {/* Drag Handle */}
          <div
            className="h-6 w-8 flex items-center justify-center bg-gray-800 border border-gray-600 rounded cursor-move hover:bg-gray-700"
            title="Arrastar linha"
          >
            <GripHorizontal className="w-3 h-3 text-gray-400" />
          </div>

          {/* Remove Row */}
          {canRemoveRow && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRemoveRow}
              className="h-6 w-8 p-0 bg-red-800 border border-red-600 hover:bg-red-700"
              title="Remover linha"
            >
              <Minus className="w-3 h-3" />
            </Button>
          )}

          {/* Add Row Below */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleAddRowBelow}
            className="h-6 w-8 p-0 bg-gray-800 border border-gray-600 hover:bg-blue-700"
            title="Adicionar linha abaixo"
          >
            <Plus className="w-3 h-3" />
          </Button>
        </div>
      )}

      {/* Row Cells */}
      <div
        className="grid gap-1 p-2"
        style={{
          gridTemplateColumns: grid.columnWidths 
            ? grid.columnWidths.map(w => `${w}%`).join(' ')
            : `repeat(${grid.columns}, 1fr)`,
          minHeight: '120px'
        }}
      >
        {row.cells.map((cell, columnIndex) => (
          <Grid2DCell
            key={cell.id}
            gridId={grid.id}
            position={{ row: rowIndex, column: columnIndex }}
            block={cell.block || null}
            activeBlockId={activeBlockId}
            onActiveBlockChange={onActiveBlockChange}
            onUpdateBlock={onUpdateBlock}
            onDeleteBlock={onDeleteBlock}
            onAddBlock={() => handleAddBlock(columnIndex)}
            dragState={dragState}
            onDragOver={onDragOver ? () => onDragOver({} as React.DragEvent, grid.id, { row: rowIndex, column: columnIndex }) : undefined}
            onDragLeave={onDragLeave ? () => onDragLeave({} as React.DragEvent) : undefined}
            onDrop={onDrop ? () => onDrop({} as React.DragEvent, grid.id, { row: rowIndex,


 column: columnIndex }) : undefined}
            readonly={readonly}
          />
        ))}
      </div>
    </div>
  );
};
