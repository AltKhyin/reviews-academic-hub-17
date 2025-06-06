
// ABOUTME: Complete 2D grid container with proper drag/drop and row management
// Editor-only component with invisible grid structure and enhanced interaction

import React, { useCallback, useState, useRef } from 'react';
import { ReviewBlock } from '@/types/review';
import { Grid2DLayout, GridPosition } from '@/types/grid';
import { GridPanel } from './GridPanel';
import { Button } from '@/components/ui/button';
import { Plus, Minus, Move } from 'lucide-react';
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
  const [controlsVisible, setControlsVisible] = useState(false);
  const [hoveredRowIndex, setHoveredRowIndex] = useState<number | null>(null);
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

  // Enhanced hover management for row controls
  const handleMouseEnter = useCallback(() => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    setControlsVisible(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    controlsTimeoutRef.current = setTimeout(() => {
      setControlsVisible(false);
      setHoveredRowIndex(null);
    }, 300); // 300ms delay before hiding
  }, []);

  const handleControlsMouseEnter = useCallback(() => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
  }, []);

  const isGridDropTarget = dragState?.dragOverRowId === grid.id && dragState?.dropTargetType === 'grid';

  return (
    <div 
      className={cn("grid-2d-container relative overflow-visible", className)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      ref={containerRef}
    >
      {/* Row Controls - Positioned to stay visible during interaction */}
      {!readonly && controlsVisible && (
        <div 
          className="grid-row-controls absolute left-0 top-0 bottom-0 w-16 z-50 pointer-events-none"
          style={{ transform: 'translateX(-100%)' }}
          onMouseEnter={handleControlsMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {/* Global controls at top */}
          <div 
            className="absolute top-0 left-4 flex flex-col gap-1 pointer-events-auto"
            style={{ transform: 'translateX(-100%)' }}
          >
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleAddRowAbove(0)}
              className="h-6 w-8 p-0 text-gray-400 hover:text-white bg-gray-800/90 border-gray-600 hover:bg-gray-700"
              title="Adicionar linha no início"
            >
              <Plus className="w-3 h-3" />
            </Button>
          </div>

          {/* Per-row controls */}
          {grid.rows.map((row, rowIndex) => (
            <div
              key={row.id}
              className="absolute flex flex-col items-end gap-1 pointer-events-auto"
              style={{
                top: `${(rowIndex / grid.rows.length) * 100}%`,
                transform: 'translateY(-50%) translateX(-100%)',
                right: '4px'
              }}
              onMouseEnter={() => setHoveredRowIndex(rowIndex)}
            >
              <div className="flex items-center gap-1">
                <span className="text-xs text-gray-500 mr-1">L{rowIndex + 1}</span>
                
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleAddRowAbove(rowIndex)}
                  className="h-6 w-6 p-0 text-gray-400 hover:text-white bg-gray-800/90 border-gray-600 hover:bg-blue-600"
                  title="Adicionar linha acima"
                >
                  <Plus className="w-3 h-3" />
                </Button>
              </div>

              <div className="flex items-center gap-1">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-6 w-6 p-0 cursor-move bg-gray-800/90 border-gray-600 hover:bg-gray-600"
                  title="Arrastar linha"
                >
                  <Move className="w-3 h-3 text-gray-400" />
                </Button>
              </div>

              <div className="flex items-center gap-1">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleAddRowBelow(rowIndex)}
                  className="h-6 w-6 p-0 text-gray-400 hover:text-white bg-gray-800/90 border-gray-600 hover:bg-blue-600"
                  title="Adicionar linha abaixo"
                >
                  <Plus className="w-3 h-3" />
                </Button>
              </div>

              {grid.rows.length > 1 && (
                <div className="flex items-center gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleRemoveRow(rowIndex)}
                    className="h-6 w-6 p-0 text-red-400 hover:text-red-300 bg-red-900/50 border-red-600 hover:bg-red-800"
                    title="Remover linha"
                  >
                    <Minus className="w-3 h-3" />
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Grid Structure - Invisible in editor, pure positioning */}
      <div 
        className={cn(
          "grid-structure transition-all",
          isGridDropTarget && "ring-2 ring-green-500/50 bg-green-500/5"
        )}
        style={{ 
          display: 'grid',
          gridTemplateColumns: grid.columnWidths 
            ? grid.columnWidths.map(w => `${w}%`).join(' ')
            : `repeat(${grid.columns}, 1fr)`,
          gridTemplateRows: grid.rowHeights
            ? grid.rowHeights.map(h => `${h}px`).join(' ')
            : `repeat(${grid.rows.length}, minmax(120px, auto))`,
          gap: `${grid.gap}px`,
          // Minimal visual styling in editor mode only
          ...(readonly ? {} : {
            border: hoveredRowIndex !== null || isGridDropTarget ? '1px dashed #374151' : '1px dashed transparent',
            borderRadius: '4px',
            padding: '2px'
          })
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
                  "grid-cell transition-all relative group",
                  !readonly && "border border-dashed border-transparent hover:border-gray-600",
                  isDropTarget && "border-green-500 bg-green-500/10 ring-1 ring-green-500",
                  cell.block && !readonly && "border-solid border-gray-700"
                )}
                style={{
                  gridColumn: colIndex + 1,
                  gridRow: rowIndex + 1,
                  minHeight: '120px'
                }}
                onMouseEnter={() => setHoveredRowIndex(rowIndex)}
                onDragOver={(e) => handleCellDragOver(e, position)}
                onDragLeave={onDragLeave}
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
                    {!readonly && (
                      <button
                        onClick={() => handleAddBlock(position)}
                        className="w-8 h-8 rounded-full border border-dashed border-gray-500 hover:border-gray-400 transition-colors flex items-center justify-center group-hover:border-blue-500"
                        title={`Adicionar bloco em L${rowIndex + 1}C${colIndex + 1}`}
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                )}

                {/* Drop Target Overlay */}
                {isDropTarget && (
                  <div className="absolute inset-0 border-2 border-green-500 bg-green-500/20 rounded flex items-center justify-center z-10 pointer-events-none">
                    <div className="text-center text-green-400 font-medium text-sm animate-pulse">
                      ↓ Soltar em L{rowIndex + 1}C{colIndex + 1} ↓
                    </div>
                  </div>
                )}
              </div>
            );
          })
        ))}
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
