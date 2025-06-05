
// ABOUTME: 2D grid container with row and column management
// Renders complete 2D grids with visual row controls and cell interactions

import React, { useCallback } from 'react';
import { ReviewBlock } from '@/types/review';
import { Grid2DLayout, GridPosition } from '@/types/grid';
import { GridRowControls } from './GridRowControls';
import { GridPanel } from './GridPanel';
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
  onAddBlock: (gridId: string, position: GridPosition) => void;
  onAddRowAbove: (gridId: string, rowIndex: number) => void;
  onAddRowBelow: (gridId: string, rowIndex: number) => void;
  onRemoveRow: (gridId: string, rowIndex: number) => void;
  onUpdateGridLayout: (gridId: string, updates: Partial<Grid2DLayout>) => void;
  readonly?: boolean;
  className?: string;
  dragState?: DragState;
  onDragOver?: (e: React.DragEvent, targetRowId: string, targetPosition?: number, targetType?: 'grid' | 'single' | 'merge') => void;
  onDragLeave?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent, targetRowId: string, targetPosition?: number, dropType?: 'grid' | 'single' | 'merge') => void;
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
  
  const handleAddBlock = useCallback((position: GridPosition) => {
    onAddBlock(grid.id, position);
  }, [grid.id, onAddBlock]);

  const handleAddRowAbove = useCallback((rowIndex: number) => {
    onAddRowAbove(grid.id, rowIndex);
  }, [grid.id, onAddRowAbove]);

  const handleAddRowBelow = useCallback((rowIndex: number) => {
    onAddRowBelow(grid.id, rowIndex);
  }, [grid.id, onAddRowBelow]);

  const handleRemoveRow = useCallback((rowIndex: number) => {
    onRemoveRow(grid.id, rowIndex);
  }, [grid.id, onRemoveRow]);

  // Convert GridPosition to number for GridPanel compatibility
  const handleCellDragOver = useCallback((e: React.DragEvent, position: GridPosition) => {
    if (onDragOver) {
      const positionNumber = position.row * grid.columns + position.column;
      onDragOver(e, grid.id, positionNumber, 'grid');
    }
  }, [grid.id, grid.columns, onDragOver]);

  const handleCellDrop = useCallback((e: React.DragEvent, position: GridPosition) => {
    if (onDrop) {
      const positionNumber = position.row * grid.columns + position.column;
      onDrop(e, grid.id, positionNumber, 'grid');
    }
  }, [grid.id, grid.columns, onDrop]);

  const handleGridPanelAdd = useCallback((targetRowId: string, positionNumber: number) => {
    // Convert position number back to GridPosition
    const row = Math.floor(positionNumber / grid.columns);
    const column = positionNumber % grid.columns;
    handleAddBlock({ row, column });
  }, [grid.columns, handleAddBlock]);

  const isGridDropTarget = dragState?.dragOverRowId === grid.id && dragState?.dropTargetType === 'grid';

  return (
    <div className={cn("grid-2d-container my-8", className)}>
      {/* Grid Header */}
      <div className="mb-4 text-center">
        <h3 className="text-sm font-medium text-gray-400">
          Grid 2D • {grid.columns} colunas × {grid.rows.length} linhas
        </h3>
      </div>

      {/* 2D Grid Structure */}
      <div 
        className={cn(
          "border rounded-lg transition-all",
          isGridDropTarget && "border-green-500 shadow-lg bg-green-500/5",
          "bg-gray-900/50 border-gray-700"
        )}
        style={{ 
          display: 'grid',
          gridTemplateColumns: grid.columnWidths 
            ? grid.columnWidths.map(w => `${w}%`).join(' ')
            : `repeat(${grid.columns}, 1fr)`,
          gridTemplateRows: grid.rowHeights
            ? grid.rowHeights.map(h => `${h}%`).join(' ')
            : `repeat(${grid.rows.length}, 1fr)`,
          gap: `${grid.gap}px`,
          minHeight: '400px',
          padding: `${grid.gap}px`
        }}
        onDragOver={onDragLeave}
        onDragLeave={onDragLeave}
      >
        {grid.rows.map((row, rowIndex) => (
          <React.Fragment key={row.id}>
            {/* Row Controls - Only show for first column */}
            {!readonly && (
              <div 
                className="absolute -left-8 flex flex-col items-center justify-center h-full"
                style={{ 
                  gridColumn: 1,
                  gridRow: rowIndex + 1,
                  position: 'relative'
                }}
              >
                <GridRowControls
                  rowIndex={rowIndex}
                  totalRows={grid.rows.length}
                  onAddRowAbove={handleAddRowAbove}
                  onAddRowBelow={handleAddRowBelow}
                  onRemoveRow={handleRemoveRow}
                  compact={true}
                />
              </div>
            )}

            {/* Grid Cells */}
            {row.cells.map((cell, colIndex) => {
              const position: GridPosition = { row: rowIndex, column: colIndex };
              const positionNumber = rowIndex * grid.columns + colIndex;
              const isDropTarget = dragState?.dragOverRowId === grid.id && 
                                 dragState?.dragOverPosition === positionNumber;

              return (
                <div
                  key={cell.id}
                  className={cn(
                    "grid-cell border border-dashed border-gray-600 rounded transition-all",
                    isDropTarget && "border-green-500 bg-green-500/10",
                    cell.block && "border-solid border-gray-500"
                  )}
                  style={{
                    gridColumn: colIndex + 1,
                    gridRow: rowIndex + 1,
                    minHeight: '120px'
                  }}
                  onDragOver={(e) => handleCellDragOver(e, position)}
                  onDragLeave={onDragLeave}
                  onDrop={(e) => handleCellDrop(e, position)}
                >
                  {cell.block ? (
                    <GridPanel
                      rowId={grid.id}
                      position={positionNumber}
                      block={cell.block}
                      readonly={readonly}
                      activeBlockId={activeBlockId}
                      dragState={dragState}
                      onActiveBlockChange={onActiveBlockChange}
                      onUpdateBlock={onUpdateBlock}
                      onDeleteBlock={onDeleteBlock}
                      onAddBlock={handleGridPanelAdd}
                      onDragOver={onDragOver}
                      onDragLeave={onDragLeave}
                      onDrop={onDrop}
                      className="h-full"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      <button
                        onClick={() => handleAddBlock(position)}
                        className="w-8 h-8 rounded-full border border-dashed border-gray-500 hover:border-gray-400 transition-colors flex items-center justify-center"
                        disabled={readonly}
                      >
                        <span className="text-sm">+</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>

      {/* Grid Drop Feedback */}
      {isGridDropTarget && (
        <div className="mt-2 text-center text-green-400 text-sm font-medium animate-pulse">
          ↓ Solte o bloco na célula desejada ↓
        </div>
      )}

      {/* Grid Info */}
      {!readonly && (
        <div className="mt-4 text-xs text-gray-400 text-center space-y-1">
          <div>
            {grid.columns} colunas × {grid.rows.length} linhas • Gap: {grid.gap}px
          </div>
          {grid.columnWidths && (
            <div>
              Larguras: {grid.columnWidths.map(w => `${w.toFixed(1)}%`).join(' / ')}
            </div>
          )}
          {grid.rowHeights && (
            <div>
              Alturas: {grid.rowHeights.map(h => `${h.toFixed(1)}%`).join(' / ')}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
