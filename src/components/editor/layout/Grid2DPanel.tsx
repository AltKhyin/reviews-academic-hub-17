
// ABOUTME: 2D Grid panel component for advanced layout management
// Handles multi-dimensional grid layouts with row and column management

import React, { useCallback, useMemo } from 'react';
import { ReviewBlock } from '@/types/review';
import { GridPosition } from '@/types/grid';
import { Button } from '@/components/ui/button';
import { Plus, Grid3X3, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DragState {
  draggedBlockId: string | null;
  dragOverRowId: string | null;
  dragOverPosition: number | null;
  isDragging: boolean;
  draggedFromRowId: string | null;
  dropTargetType: 'grid' | 'single' | 'merge' | null;
}

interface Grid2DPanelProps {
  gridId: string;
  blocks: ReviewBlock[];
  globalIndex: number;
  activeBlockId: string | null;
  dragState: DragState;
  onActiveBlockChange?: (blockId: string | null) => void;
  onUpdateBlock: (blockId: string, updates: Partial<ReviewBlock>) => void;
  onDeleteBlock: (blockId: string) => void;
  onDuplicateBlock: (blockId: string) => void;
  onPlaceBlockIn2DGrid: (blockId: string, gridId: string, position: GridPosition) => void;
  onAddBlockBetween: (position: number, type?: string) => string;
  onDragStart: (e: React.DragEvent, blockId: string) => void;
  onDragEnd: () => void;
  onDragOver: (e: React.DragEvent, targetRowId: string, targetPosition?: number, targetType?: string) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, targetRowId: string, targetPosition?: number, dropType?: string) => void;
}

export const Grid2DPanel: React.FC<Grid2DPanelProps> = ({
  gridId,
  blocks,
  globalIndex,
  activeBlockId,
  dragState,
  onActiveBlockChange,
  onUpdateBlock,
  onDeleteBlock,
  onDuplicateBlock,
  onPlaceBlockIn2DGrid,
  onAddBlockBetween,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDragLeave,
  onDrop
}) => {
  // Extract grid layout from first block with grid metadata
  const gridMeta = useMemo(() => {
    const firstGridBlock = blocks.find(block => 
      block.meta?.layout?.grid_id === gridId
    );
    
    if (!firstGridBlock?.meta?.layout) {
      return {
        columns: 2,
        rows: 1,
        gap: 4,
        columnWidths: [50, 50],
        rowHeights: [100]
      };
    }

    const layout = firstGridBlock.meta.layout;
    return {
      columns: layout.columns || 2,
      rows: layout.grid_rows || 1,
      gap: layout.gap || 4,
      columnWidths: layout.columnWidths || Array(layout.columns || 2).fill(100 / (layout.columns || 2)),
      rowHeights: layout.rowHeights || Array(layout.grid_rows || 1).fill(100 / (layout.grid_rows || 1))
    };
  }, [blocks, gridId]);

  // Organize blocks by grid position
  const gridBlocks = useMemo(() => {
    const grid: (ReviewBlock | null)[][] = Array(gridMeta.rows)
      .fill(null)
      .map(() => Array(gridMeta.columns).fill(null));

    blocks.forEach(block => {
      const pos = block.meta?.layout?.grid_position;
      if (pos && pos.row < gridMeta.rows && pos.column < gridMeta.columns) {
        grid[pos.row][pos.column] = block;
      }
    });

    return grid;
  }, [blocks, gridMeta]);

  const handleAddBlock = useCallback((position: GridPosition) => {
    // Create a new block and place it in the grid
    const newBlockId = onAddBlockBetween(globalIndex + 1, 'paragraph');
    if (newBlockId) {
      onPlaceBlockIn2DGrid(newBlockId, gridId, position);
    }
  }, [onAddBlockBetween, onPlaceBlockIn2DGrid, gridId, globalIndex]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    onDragOver(e, gridId, 0, 'grid');
  }, [onDragOver, gridId]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    onDrop(e, gridId, 0, 'merge');
  }, [onDrop, gridId]);

  const isDropTarget = dragState.dragOverRowId === gridId;

  return (
    <div 
      className={cn(
        "grid-2d-panel bg-gray-900/20 border border-gray-700 rounded-lg p-4 relative group",
        isDropTarget && "ring-2 ring-green-500 bg-green-500/10"
      )}
      onDragOver={handleDragOver}
      onDragLeave={onDragLeave}
      onDrop={handleDrop}
    >
      {/* Grid Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Grid3X3 className="w-4 h-4 text-blue-400" />
          <span className="text-sm font-medium text-gray-300">
            Grid 2D ({gridMeta.columns}×{gridMeta.rows})
          </span>
        </div>
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
            <Settings className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {/* Grid Content */}
      <div 
        className="grid gap-2"
        style={{
          gridTemplateColumns: gridMeta.columnWidths.map(w => `${w}%`).join(' '),
          gridTemplateRows: gridMeta.rowHeights.map(h => `${h}px`).join(' '),
          minHeight: `${gridMeta.rowHeights.reduce((a, b) => a + b, 0)}px`
        }}
      >
        {gridBlocks.map((row, rowIndex) =>
          row.map((block, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              className={cn(
                "grid-cell border border-dashed border-gray-600 rounded min-h-[120px] p-2",
                block && "border-solid border-gray-500",
                !block && "hover:border-gray-500 hover:bg-gray-800/30"
              )}
            >
              {block ? (
                <div 
                  className={cn(
                    "h-full cursor-pointer",
                    activeBlockId === block.id && "ring-2 ring-blue-500"
                  )}
                  onClick={() => onActiveBlockChange?.(block.id)}
                  draggable
                  onDragStart={(e) => onDragStart(e, block.id)}
                  onDragEnd={onDragEnd}
                >
                  <div className="text-xs text-gray-400 mb-2">
                    {block.type}
                  </div>
                  <div className="text-sm text-gray-300">
                    {typeof block.content === 'string' ? 
                      block.content.slice(0, 50) + '...' : 
                      JSON.stringify(block.content).slice(0, 50) + '...'
                    }
                  </div>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleAddBlock({ row: rowIndex, column: colIndex })}
                    className="text-gray-500 hover:text-gray-300"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Adicionar
                  </Button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Drop Indicator */}
      {isDropTarget && (
        <div className="absolute inset-0 border-2 border-green-500 rounded-lg bg-green-500/5 flex items-center justify-center pointer-events-none">
          <div className="text-green-400 text-sm font-medium animate-pulse">
            ↓ Soltar bloco no grid ↓
          </div>
        </div>
      )}
    </div>
  );
};
