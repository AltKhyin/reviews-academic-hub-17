
// ABOUTME: 2D Grid container component with enhanced block management and dark theme
// Renders 2D grids with proper cell management, drag/drop support, and overflow handling

import React, { useState, useCallback } from 'react';
import { Grid2DLayout, GridPosition } from '@/types/grid';
import { ReviewBlock } from '@/types/review';
import { BlockRenderer } from '@/components/review/BlockRenderer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus, MoreVertical, RowsIcon, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';

interface Grid2DContainerProps {
  grid: Grid2DLayout;
  activeBlockId: number | null;
  onActiveBlockChange: (blockId: number | null) => void;
  onUpdateBlock: (blockId: number, updates: Partial<ReviewBlock>) => void;
  onDeleteBlock: (blockId: number) => void;
  onAddBlock: (gridId: string, position: GridPosition) => void;
  onAddRowAbove: (gridId: string, rowIndex: number) => void;
  onAddRowBelow: (gridId: string, rowIndex: number) => void;
  onRemoveRow: (gridId: string, rowIndex: number) => void;
  onUpdateGridLayout: (gridId: string, updates: Partial<Grid2DLayout>) => void;
  dragState: any;
  onDragOver: (e: React.DragEvent, targetRowId: string, targetPosition?: number, targetType?: string) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, targetRowId: string, targetPosition?: number, dropType?: string) => void;
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
  const [hoveredCell, setHoveredCell] = useState<string | null>(null);

  const handleCellClick = useCallback((position: GridPosition) => {
    onAddBlock(grid.id, position);
  }, [grid.id, onAddBlock]);

  const handleBlockUpdate = useCallback((blockId: number) => {
    return (updates: Partial<ReviewBlock>) => {
      onUpdateBlock(blockId, updates);
    };
  }, [onUpdateBlock]);

  const getCellLinearPosition = useCallback((row: number, column: number): number => {
    return row * grid.columns + column;
  }, [grid.columns]);

  const isDragTarget = dragState.dragOverRowId === grid.id;

  return (
    <Card 
      className="grid-2d-container p-4 border-2 transition-all duration-200"
      style={{ 
        backgroundColor: '#1a1a1a',
        borderColor: isDragTarget ? '#3b82f6' : '#2a2a2a',
        color: '#ffffff'
      }}
      onDragOver={(e) => onDragOver(e, grid.id, undefined, 'merge')}
      onDragLeave={onDragLeave}
      onDrop={(e) => onDrop(e, grid.id, undefined, 'merge')}
    >
      {/* Grid Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-blue-500"></div>
          <span className="text-sm font-medium" style={{ color: '#ffffff' }}>
            Grid 2D • {grid.columns} colunas × {grid.rows.length} linhas
          </span>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0"
                style={{ 
                  color: '#9ca3af',
                  zIndex: 1000
                }}
              >
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="end"
              className="w-56"
              style={{ 
                backgroundColor: '#1a1a1a',
                borderColor: '#2a2a2a',
                color: '#ffffff',
                zIndex: 1001
              }}
            >
              <DropdownMenuItem
                onClick={() => onAddRowAbove(grid.id, 0)}
                style={{ color: '#ffffff' }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Adicionar linha acima
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onAddRowBelow(grid.id, grid.rows.length - 1)}
                style={{ color: '#ffffff' }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Adicionar linha abaixo
              </DropdownMenuItem>
              {grid.rows.length > 1 && (
                <DropdownMenuItem
                  onClick={() => onRemoveRow(grid.id, grid.rows.length - 1)}
                  style={{ color: '#ef4444' }}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Remover última linha
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Grid Layout */}
      <div 
        className="grid gap-4 relative"
        style={{
          gridTemplateColumns: grid.columnWidths
            ? grid.columnWidths.map(w => `${w}%`).join(' ')
            : `repeat(${grid.columns}, 1fr)`,
          gridTemplateRows: grid.rowHeights
            ? grid.rowHeights.map(h => `${h}px`).join(' ')
            : `repeat(${grid.rows.length}, minmax(120px, auto))`,
          gap: `${grid.gap * 0.25}rem`
        }}
      >
        {grid.rows.map((row) =>
          row.cells.map((cell) => {
            const isHovered = hoveredCell === cell.id;
            const linearPosition = getCellLinearPosition(cell.row, cell.column);
            const isDragOverCell = isDragTarget && dragState.dragOverPosition === linearPosition;
            
            return (
              <div
                key={cell.id}
                className={cn(
                  "grid-cell relative min-h-[120px] border-2 border-dashed rounded transition-all duration-200",
                  cell.block ? "border-transparent" : "border-gray-600",
                  isDragOverCell && "border-blue-500 bg-blue-500/10",
                  isHovered && !cell.block && "border-gray-500 bg-gray-800/20"
                )}
                style={{
                  backgroundColor: cell.block ? 'transparent' : '#212121',
                  borderColor: cell.block ? 'transparent' : (isDragOverCell ? '#3b82f6' : '#2a2a2a')
                }}
                onMouseEnter={() => setHoveredCell(cell.id)}
                onMouseLeave={() => setHoveredCell(null)}
                onDragOver={(e) => onDragOver(e, grid.id, linearPosition, 'merge')}
                onDrop={(e) => onDrop(e, grid.id, linearPosition, 'merge')}
              >
                {cell.block ? (
                  <div className="relative h-full">
                    <BlockRenderer
                      block={cell.block}
                      onUpdate={handleBlockUpdate(cell.block.id)}
                      readonly={false}
                      className={cn(
                        "h-full",
                        activeBlockId === cell.block.id && "ring-2 ring-blue-500"
                      )}
                    />
                    
                    {/* Block overlay menu with proper z-index */}
                    <div 
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ zIndex: 1000 }}
                    >
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-6 w-6 p-0 rounded-full"
                            style={{ 
                              backgroundColor: '#1a1a1a',
                              color: '#ffffff',
                              zIndex: 1001
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              onActiveBlockChange(cell.block!.id);
                            }}
                          >
                            <MoreVertical className="w-3 h-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent 
                          align="end"
                          className="w-48"
                          style={{ 
                            backgroundColor: '#1a1a1a',
                            borderColor: '#2a2a2a',
                            color: '#ffffff',
                            zIndex: 1002
                          }}
                        >
                          <DropdownMenuItem
                            onClick={() => onDeleteBlock(cell.block!.id)}
                            style={{ color: '#ef4444' }}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Remover bloco
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ) : (
                  <button
                    className="w-full h-full flex items-center justify-center text-gray-400 hover:text-white transition-colors group"
                    onClick={() => handleCellClick({ row: cell.row, column: cell.column })}
                    style={{ color: '#9ca3af' }}
                  >
                    <div className="text-center">
                      <Plus className="w-8 h-8 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                      <span className="text-xs">Adicionar bloco</span>
                    </div>
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Grid Info */}
      <div className="mt-4 text-xs text-center" style={{ color: '#9ca3af' }}>
        {grid.columns} colunas × {grid.rows.length} linhas • Gap: {grid.gap}px
        <br />
        Larguras: {grid.columnWidths?.map(w => `${w.toFixed(1)}%`).join(' / ')}
        <br />
        Alturas: {grid.rowHeights?.map(h => `${h}px`).join(' / ')}
      </div>
    </Card>
  );
};
