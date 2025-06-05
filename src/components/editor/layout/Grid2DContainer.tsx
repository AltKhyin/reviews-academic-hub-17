
// ABOUTME: Container component for 2D grid layout with vertical functionality
// Renders grid with multiple rows and columns, handles drag and drop

import React, { useCallback } from 'react';
import { Grid2DLayout, GridPosition } from '@/types/grid';
import { ReviewBlock } from '@/types/review';
import { Grid2DRow } from './Grid2DRow';
import { Grid2DControls } from './Grid2DControls';
import { cn } from '@/lib/utils';

interface DragState {
  draggedBlockId: number | null;
  dragOverRowId: string | null;
  dragOverPosition: number | null;
  isDragging: boolean;
  draggedFromRowId: string | null;
  dropTargetType: 'grid' | 'single' | 'merge' | null;
}

interface Grid2DContainerProps {
  grid: Grid2DLayout;
  activeBlockId?: number | null;
  onActiveBlockChange?: (blockId: number | null) => void;
  onUpdateBlock: (blockId: number, updates: Partial<ReviewBlock>) => void;
  onDeleteBlock: (blockId: number) => void;
  onAddBlock?: (gridId: string, position: GridPosition) => void;
  onAddRowAbove: (gridId: string, rowIndex: number) => void;
  onAddRowBelow: (gridId: string, rowIndex: number) => void;
  onRemoveRow: (gridId: string, rowIndex: number) => void;
  onUpdateGridLayout?: (gridId: string, updates: any) => void;
  readonly?: boolean;
  className?: string;
  dragState?: DragState;
  onDragOver?: (e: React.DragEvent, targetId: string, position?: GridPosition, targetType?: string) => void;
  onDragLeave?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent, targetId: string, position?: GridPosition, dropType?: string) => void;
}

export const Grid2DContainer: React.FC<Grid2DContainerProps> = ({
  grid,
  activeBlockId,
  onActiveBlockChange,
  onUpdateBlock,
  onDeleteBlock,
  onAddBlock,
  onAddRowAbove,
  onAddRowBelow,
  onRemoveRow,
  onUpdateGridLayout,
  readonly = false,
  className,
  dragState,
  onDragOver,
  onDragLeave,
  onDrop
}) => {
  const isGridDropTarget = dragState?.dragOverRowId === grid.id && dragState?.dropTargetType === 'merge';

  const handleAddBlock = useCallback((position: GridPosition) => {
    if (onAddBlock) {
      onAddBlock(grid.id, position);
    }
  }, [onAddBlock, grid.id]);

  const handleAddRowAbove = useCallback((rowIndex: number) => {
    onAddRowAbove(grid.id, rowIndex);
  }, [onAddRowAbove, grid.id]);

  const handleAddRowBelow = useCallback((rowIndex: number) => {
    onAddRowBelow(grid.id, rowIndex);
  }, [onAddRowBelow, grid.id]);

  const handleRemoveRow = useCallback((rowIndex: number) => {
    onRemoveRow(grid.id, rowIndex);
  }, [onRemoveRow, grid.id]);

  return (
    <div 
      className={cn("grid-2d-container my-6", className)}
      style={{ margin: '0 1rem' }}
    >
      {/* Grid Controls */}
      {!readonly && (
        <Grid2DControls
          grid={grid}
          onAddRowAbove={() => handleAddRowAbove(0)}
          onAddRowBelow={() => handleAddRowBelow(grid.rows.length - 1)}
          onUpdateGridLayout={onUpdateGridLayout}
          className="mb-4"
        />
      )}

      {/* Grid Container */}
      <div
        className={cn(
          "border rounded-lg transition-all overflow-hidden",
          isGridDropTarget && "border-green-500 shadow-lg bg-green-500/5"
        )}
        style={{ 
          backgroundColor: '#1a1a1a',
          borderColor: isGridDropTarget ? '#22c55e' : '#2a2a2a',
          minHeight: '200px'
        }}
      >
        {/* Grid Rows */}
        <div className="grid-rows-container">
          {grid.rows.map((row, rowIndex) => (
            <Grid2DRow
              key={row.id}
              row={row}
              grid={grid}
              rowIndex={rowIndex}
              activeBlockId={activeBlockId}
              onActiveBlockChange={onActiveBlockChange}
              onUpdateBlock={onUpdateBlock}
              onDeleteBlock={onDeleteBlock}
              onAddBlock={handleAddBlock}
              onAddRowAbove={handleAddRowAbove}
              onAddRowBelow={handleAddRowBelow}
              onRemoveRow={handleRemoveRow}
              readonly={readonly}
              dragState={dragState}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
            />
          ))}
        </div>
      </div>
      
      {/* Grid Drop Feedback */}
      {isGridDropTarget && (
        <div className="mt-2 text-center text-green-400 text-sm font-medium animate-pulse">
          ↓ Solte o bloco para adicionar a este grid ↓
        </div>
      )}
      
      {/* Grid Info */}
      {!readonly && (
        <div className="mt-2 text-xs text-gray-400 text-center">
          {grid.columns} colunas × {grid.rows.length} linhas
          {grid.columnWidths && (
            <span className="ml-2">
              Proporções: {grid.columnWidths.map(w => `${w.toFixed(1)}%`).join(' / ')}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
