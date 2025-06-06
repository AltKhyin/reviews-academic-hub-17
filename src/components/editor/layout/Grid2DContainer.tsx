
// ABOUTME: Complete 2D grid container with row management and drag/drop
// Renders 2D grids with interactive row controls and proper drag integration

import React, { useCallback, useState } from 'react';
import { ReviewBlock } from '@/types/review';
import { Grid2DLayout, GridPosition } from '@/types/grid';
import { GridPanel } from './GridPanel';
import { Button } from '@/components/ui/button';
import { Plus, Minus, GripVertical } from 'lucide-react';
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
  const [hoveredRowIndex, setHoveredRowIndex] = useState<number | null>(null);
  
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
    const row = Math.floor(positionNumber / grid.columns);
    const column = positionNumber % grid.columns;
    handleAddBlock({ row, column });
  }, [grid.columns, handleAddBlock]);

  const isGridDropTarget = dragState?.dragOverRowId === grid.id && dragState?.dropTargetType === 'grid';

  return (
    <div className={cn("grid-2d-container my-8 relative", className)}>
      {/* Grid Header */}
      <div className="mb-4 text-center">
        <h3 className="text-sm font-medium text-gray-400">
          Grid 2D • {grid.columns} colunas × {grid.rows.length} linhas
        </h3>
      </div>

      {/* Row Controls and Grid Structure */}
      <div className="relative">
        <div 
          className={cn(
            "border rounded-lg transition-all",
            isGridDropTarget && "border-green-500 shadow-lg bg-green-500/5"
          )}
          style={{ 
            backgroundColor: '#1a1a1a',
            borderColor: isGridDropTarget ? '#22c55e' : '#2a2a2a',
            display: 'grid',
            gridTemplateColumns: grid.columnWidths 
              ? grid.columnWidths.map(w => `${w}%`).join(' ')
              : `repeat(${grid.columns}, 1fr)`,
            gridTemplateRows: grid.rowHeights
              ? grid.rowHeights.map(h => `${h}px`).join(' ')
              : `repeat(${grid.rows.length}, minmax(120px, auto))`,
            gap: `${grid.gap}px`,
            padding: `${grid.gap}px`,
            position: 'relative'
          }}
          onDragOver={onDragLeave}
          onDragLeave={onDragLeave}
        >
          {/* Render all cells */}
          {grid.rows.map((row, rowIndex) => (
            row.cells.map((cell, colIndex) => {
              const position: GridPosition = { row: rowIndex, column: colIndex };
              const positionNumber = rowIndex * grid.columns + colIndex;
              const isDropTarget = dragState?.dragOverRowId === grid.id && 
                                 dragState?.dragOverPosition === positionNumber;

              return (
                <div
                  key={cell.id}
                  className={cn(
                    "grid-cell border border-dashed border-gray-600 rounded transition-all relative group",
                    isDropTarget && "border-green-500 bg-green-500/10",
                    cell.block && "border-solid border-gray-500"
                  )}
                  style={{
                    gridColumn: colIndex + 1,
                    gridRow: rowIndex + 1,
                    minHeight: '120px'
                  }}
                  onMouseEnter={() => setHoveredRowIndex(rowIndex)}
                  onMouseLeave={() => setHoveredRowIndex(null)}
                  onDragOver={(e) => handleCellDragOver(e, position)}
                  onDragLeave={onDragLeave}
                  onDrop={(e) => handleCellDrop(e, position)}
                >
                  {/* Row Controls - Show only on first column */}
                  {!readonly && colIndex === 0 && hoveredRowIndex === rowIndex && (
                    <div className="absolute -left-16 top-1/2 transform -translate-y-1/2 flex flex-col items-center gap-1 z-20">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleAddRowAbove(rowIndex)}
                        className="w-8 h-6 p-0 text-gray-400 hover:text-white hover:bg-gray-700"
                        title="Adicionar linha acima"
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                      
                      <div className="w-6 h-6 flex items-center justify-center text-gray-500">
                        <GripVertical className="w-3 h-3" />
                      </div>
                      
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleAddRowBelow(rowIndex)}
                        className="w-8 h-6 p-0 text-gray-400 hover:text-white hover:bg-gray-700"
                        title="Adicionar linha abaixo"
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                      
                      {grid.rows.length > 1 && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRemoveRow(rowIndex)}
                          className="w-8 h-6 p-0 text-red-400 hover:text-red-300 hover:bg-red-900/20"
                          title="Remover linha"
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  )}

                  {/* Cell Content */}
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
            })
          ))}
        </div>

        {/* Global Row Controls for Empty Grids */}
        {!readonly && grid.rows.length === 0 && (
          <div className="absolute -left-16 top-1/2 transform -translate-y-1/2 flex flex-col items-center gap-1 z-20">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleAddRowAbove(0)}
              className="w-8 h-6 p-0 text-gray-400 hover:text-white hover:bg-gray-700"
              title="Adicionar primeira linha"
            >
              <Plus className="w-3 h-3" />
            </Button>
          </div>
        )}
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
              Alturas: {grid.rowHeights.map(h => `${h.toFixed(1)}px`).join(' / ')}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
