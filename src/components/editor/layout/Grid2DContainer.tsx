
// ABOUTME: Complete 2D grid container with fixed drag/drop and row controls
// Renders 2D grids with proper interactive controls and drag integration

import React, { useCallback, useState, useRef } from 'react';
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
  const [controlsVisible, setControlsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();
  
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

  // Fixed row control visibility management
  const showControls = useCallback(() => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    setControlsVisible(true);
  }, []);

  const hideControls = useCallback(() => {
    controlsTimeoutRef.current = setTimeout(() => {
      setControlsVisible(false);
    }, 200); // Small delay to allow moving to controls
  }, []);

  const keepControlsVisible = useCallback(() => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
  }, []);

  // Enhanced drag handlers
  const handleCellDragOver = useCallback((e: React.DragEvent, position: GridPosition) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (onDragOver) {
      const positionNumber = position.row * grid.columns + position.column;
      onDragOver(e, grid.id, positionNumber, 'grid');
    }
  }, [grid.id, grid.columns, onDragOver]);

  const handleCellDrop = useCallback((e: React.DragEvent, position: GridPosition) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (onDrop) {
      const positionNumber = position.row * grid.columns + position.column;
      onDrop(e, grid.id, positionNumber, 'grid');
    }
  }, [grid.id, grid.columns, onDrop]);

  const handleCellDragLeave = useCallback((e: React.DragEvent) => {
    // Only trigger drag leave if actually leaving the cell
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      if (onDragLeave) {
        onDragLeave(e);
      }
    }
  }, [onDragLeave]);

  const handleGridPanelAdd = useCallback((targetRowId: string, positionNumber: number) => {
    const row = Math.floor(positionNumber / grid.columns);
    const column = positionNumber % grid.columns;
    handleAddBlock({ row, column });
  }, [grid.columns, handleAddBlock]);

  const isGridDropTarget = dragState?.dragOverRowId === grid.id && dragState?.dropTargetType === 'grid';

  return (
    <div 
      className={cn("grid-2d-container my-8 relative", className)}
      ref={containerRef}
      onMouseEnter={showControls}
      onMouseLeave={hideControls}
    >
      {/* Grid Structure */}
      <div className="relative">
        <div 
          className={cn(
            "grid-container transition-all",
            isGridDropTarget && "ring-2 ring-green-500 shadow-lg"
          )}
          style={{ 
            backgroundColor: 'transparent', // No background in edit mode
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
        >
          {/* Render all cells with proper drag handling */}
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
                    "grid-cell relative group transition-all",
                    isDropTarget && "ring-2 ring-green-500 bg-green-500/5",
                    cell.block && "has-block"
                  )}
                  style={{
                    gridColumn: colIndex + 1,
                    gridRow: rowIndex + 1,
                    minHeight: '120px',
                    border: cell.block ? 'none' : '1px dashed #404040', // Subtle border for empty cells
                    borderRadius: '4px'
                  }}
                  onMouseEnter={() => setHoveredRowIndex(rowIndex)}
                  onDragOver={(e) => handleCellDragOver(e, position)}
                  onDragLeave={handleCellDragLeave}
                  onDrop={(e) => handleCellDrop(e, position)}
                >
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

                  {/* Drop indicator */}
                  {isDropTarget && (
                    <div className="absolute inset-0 border-2 border-green-500 rounded bg-green-500/10 flex items-center justify-center pointer-events-none">
                      <div className="text-green-400 text-sm font-medium animate-pulse">
                        ↓ Soltar aqui ↓
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          ))}
        </div>

        {/* FIXED: Row Controls with proper positioning and interaction */}
        {!readonly && controlsVisible && (
          <div 
            className="absolute left-0 top-0 h-full flex flex-col justify-around items-start z-20"
            style={{ 
              transform: 'translateX(-60px)',
              pointerEvents: 'all' // Ensure controls are interactive
            }}
            onMouseEnter={keepControlsVisible}
            onMouseLeave={hideControls}
          >
            {grid.rows.map((_, rowIndex) => (
              <div 
                key={`row-controls-${rowIndex}`}
                className="flex flex-col items-center gap-1 bg-gray-800 border border-gray-600 rounded-md p-1"
                style={{ 
                  opacity: hoveredRowIndex === rowIndex ? 1 : 0.6,
                  transition: 'opacity 0.2s'
                }}
              >
                {/* Add row above */}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleAddRowAbove(rowIndex)}
                  className="w-6 h-6 p-0 text-gray-400 hover:text-white hover:bg-gray-700"
                  title="Adicionar linha acima"
                >
                  <Plus className="w-3 h-3" />
                </Button>
                
                {/* Row drag handle */}
                <div className="w-6 h-6 flex items-center justify-center text-gray-500 cursor-move">
                  <GripVertical className="w-3 h-3" />
                </div>
                
                {/* Add row below */}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleAddRowBelow(rowIndex)}
                  className="w-6 h-6 p-0 text-gray-400 hover:text-white hover:bg-gray-700"
                  title="Adicionar linha abaixo"
                >
                  <Plus className="w-3 h-3" />
                </Button>
                
                {/* Remove row (only if more than 1 row) */}
                {grid.rows.length > 1 && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleRemoveRow(rowIndex)}
                    className="w-6 h-6 p-0 text-red-400 hover:text-red-300 hover:bg-red-900/20"
                    title="Remover linha"
                  >
                    <Minus className="w-3 h-3" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Global controls for empty grids */}
        {!readonly && grid.rows.length === 0 && controlsVisible && (
          <div 
            className="absolute left-0 top-1/2 transform -translate-y-1/2 z-20"
            style={{ transform: 'translateX(-60px) translateY(-50%)' }}
            onMouseEnter={keepControlsVisible}
          >
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
    </div>
  );
};
