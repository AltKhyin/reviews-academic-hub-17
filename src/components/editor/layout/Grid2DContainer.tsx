
// ABOUTME: 2D Grid container component for complex grid layouts
// Renders and manages 2D grid structures with interactive controls

import React from 'react';
import { Grid2DLayout, GridPosition } from '@/types/grid';
import { Grid2DCell } from './Grid2DCell';
import { Button } from '@/components/ui/button';
import { Plus, Minus } from 'lucide-react';

interface Grid2DContainerProps {
  grid: Grid2DLayout;
  activeBlockId: string | null;
  onActiveBlockChange: (blockId: string | null) => void;
  onUpdateBlock: (blockId: string, updates: any) => void;
  onDeleteBlock: (blockId: string) => void;
  onAddBlock: (gridId: string, position: GridPosition) => void;
  onAddRowAbove: (gridId: string, rowIndex: number) => void;
  onAddRowBelow: (gridId: string, rowIndex: number) => void;
  onRemoveRow: (gridId: string, rowIndex: number) => void;
  onUpdateGridLayout: (gridId: string, updates: Partial<Grid2DLayout>) => void;
  dragState: any;
  onDragOver: () => void;
  onDragLeave: () => void;
  onDrop: () => void;
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
  const totalCells = grid.columns * (grid.grid_rows || 2);

  return (
    <div className="grid-2d-container p-4 border border-gray-600 rounded-lg bg-gray-800/20">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium text-white">
          Grid 2D ({grid.columns}×{grid.grid_rows || 2})
        </h4>
        <div className="flex gap-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onAddRowBelow(grid.id, (grid.grid_rows || 2) - 1)}
            className="h-6 w-6 p-0"
          >
            <Plus className="w-3 h-3" />
          </Button>
          {(grid.grid_rows || 2) > 1 && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onRemoveRow(grid.id, (grid.grid_rows || 2) - 1)}
              className="h-6 w-6 p-0"
            >
              <Minus className="w-3 h-3" />
            </Button>
          )}
        </div>
      </div>

      <div
        className="grid gap-2"
        style={{
          gridTemplateColumns: grid.columnWidths 
            ? grid.columnWidths.map(w => `${w}%`).join(' ')
            : `repeat(${grid.columns}, 1fr)`,
          gridTemplateRows: grid.rowHeights
            ? grid.rowHeights.map(h => `${h}px`).join(' ')
            : `repeat(${grid.grid_rows || 2}, minmax(120px, auto))`
        }}
      >
        {Array.from({ length: totalCells }).map((_, index) => {
          const row = Math.floor(index / grid.columns);
          const column = index % grid.columns;
          const position: GridPosition = { row, column };

          return (
            <Grid2DCell
              key={`${grid.id}-${row}-${column}`}
              gridId={grid.id}
              position={position}
              block={null}
              activeBlockId={activeBlockId}
              onActiveBlockChange={onActiveBlockChange}
              onUpdateBlock={onUpdateBlock}
              onDeleteBlock={onDeleteBlock}
              onAddBlock={onAddBlock}
              dragState={dragState}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
            />
          );
        })}
      </div>
    </div>
  );
};
