
// ABOUTME: Enhanced 2D grid container with complete string ID support and proper block construction
// Main container for 2D grid layouts with comprehensive grid management

import React, { useCallback } from 'react';
import { Grid2DLayout, GridPosition } from '@/types/grid';
import { ReviewBlock } from '@/types/review';
import { Grid2DRow } from './Grid2DRow';
import { Button } from '@/components/ui/button';
import { Plus, Minus, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DragState {
  draggedBlockId: string | null;
  dragOverRowId: string | null;
  dragOverPosition: number | null;
  isDragging: boolean;
  draggedFromRowId: string | null;
  dropTargetType: 'grid' | 'single' | 'merge' | null;
}

interface Grid2DContainerProps {
  grid: Grid2DLayout;
  activeBlockId: string | null;
  onActiveBlockChange: (blockId: string | null) => void;
  onUpdateBlock: (blockId: string, updates: Partial<ReviewBlock>) => void;
  onDeleteBlock: (blockId: string) => void;
  onAddBlock: (gridId: string, position: GridPosition) => void;
  onAddRowAbove: (gridId: string, rowIndex: number) => void;
  onAddRowBelow: (gridId: string, rowIndex: number) => void;
  onRemoveRow: (gridId: string, rowIndex: number) => void;
  onUpdateGridLayout: (gridId: string, updates: Partial<Grid2DLayout>) => void;
  dragState: DragState;
  onDragOver: (e: React.DragEvent, targetRowId: string, targetPosition?: number, targetType?: 'grid' | 'single' | 'merge') => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, targetRowId: string, targetPosition?: number, dropType?: 'grid' | 'single' | 'merge') => void;
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
  dragState,
  onDragOver,
  onDragLeave,
  onDrop
}) => {
  const handleAddBlock = useCallback((position: GridPosition) => {
    onAddBlock(grid.id, position);
  }, [onAddBlock, grid.id]);

  const handleMove = useCallback((blockId: string, direction: 'up' | 'down') => {
    // 2D Grid blocks don't support traditional up/down movement
    console.log('2D Grid block movement not supported:', { blockId, direction });
  }, []);

  const handleAddBlockAtPosition = useCallback((type: any, position?: number) => {
    // For 2D grids, we need to convert linear position to grid position
    if (position !== undefined) {
      const row = Math.floor(position / grid.columns);
      const column = position % grid.columns;
      onAddBlock(grid.id, { row, column });
    } else {
      // Find first empty cell
      for (let row = 0; row < grid.rows.length; row++) {
        for (let col = 0; col < grid.columns; col++) {
          const cell = grid.rows[row]?.cells[col];
          if (!cell?.block) {
            onAddBlock(grid.id, { row, column: col });
            return;
          }
        }
      }
      // If no empty cells, add to first cell of first row
      onAddBlock(grid.id, { row: 0, column: 0 });
    }
  }, [onAddBlock, grid.id, grid.columns, grid.rows]);

  return (
    <div className="grid-2d-container border border-gray-600 rounded-lg p-4 mb-4 bg-gray-900/10">
      {/* Grid Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Settings className="w-4 h-4 text-blue-400" />
          <span className="text-sm font-medium text-gray-300">
            Grid 2D: {grid.columns}×{grid.rows.length}
          </span>
          <span className="text-xs text-gray-500">#{grid.id}</span>
        </div>
        
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onAddRowBelow(grid.id, grid.rows.length - 1)}
            className="text-green-400 hover:text-green-300 hover:bg-green-900/20"
            title="Adicionar linha"
          >
            <Plus className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {/* Grid Layout */}
      <div
        className="grid-2d-layout"
        style={{
          display: 'grid',
          gridTemplateColumns: grid.columnWidths 
            ? grid.columnWidths.map(w => `${w}%`).join(' ')
            : `repeat(${grid.columns}, 1fr)`,
          gridTemplateRows: grid.rowHeights
            ? grid.rowHeights.map(h => `${h}px`).join(' ')
            : `repeat(${grid.rows.length}, minmax(120px, auto))`,
          gap: `${grid.gap}px`,
          minHeight: '240px'
        }}
      >
        {grid.rows.map((row, rowIndex) => (
          <Grid2DRow
            key={row.id}
            row={row}
            rowIndex={rowIndex}
            gridId={grid.id}
            columns={grid.columns}
            activeBlockId={activeBlockId}
            onActiveBlockChange={onActiveBlockChange}
            onUpdateBlock={onUpdateBlock}
            onDeleteBlock={onDeleteBlock}
            onAddBlock={handleAddBlock}
            onAddRowAbove={onAddRowAbove}
            onAddRowBelow={onAddRowBelow}
            onRemoveRow={onRemoveRow}
            onMove={handleMove}
            onAddBlockAtPosition={handleAddBlockAtPosition}
            dragState={dragState}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            canRemoveRow={grid.rows.length > 1}
          />
        ))}
      </div>

      {/* Add Row Controls */}
      <div className="flex justify-center mt-3 pt-2 border-t border-gray-700">
        <Button
          size="sm"
          variant="ghost"
          onClick={() => onAddRowBelow(grid.id, grid.rows.length - 1)}
          className="text-gray-400 hover:text-gray-300 hover:bg-gray-800"
        >
          <Plus className="w-4 h-4 mr-1" />
          Adicionar Linha
        </Button>
      </div>
    </div>
  );
};
