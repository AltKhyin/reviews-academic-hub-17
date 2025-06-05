
// ABOUTME: Individual cell component for 2D grid layout
// Renders a single cell with block content or empty state

import React, { useCallback } from 'react';
import { GridCell, Grid2DLayout, GridPosition } from '@/types/grid';
import { ReviewBlock } from '@/types/review';
import { BlockRenderer } from '@/components/review/BlockRenderer';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DragState {
  draggedBlockId: number | null;
  dragOverRowId: string | null;
  dragOverPosition: number | null;
  isDragging: boolean;
  draggedFromRowId: string | null;
  dropTargetType: 'grid' | 'single' | 'merge' | null;
}

interface Grid2DCellProps {
  cell: GridCell;
  grid: Grid2DLayout;
  position: GridPosition;
  activeBlockId?: number | null;
  onActiveBlockChange?: (blockId: number | null) => void;
  onUpdateBlock: (blockId: number, updates: Partial<ReviewBlock>) => void;
  onDeleteBlock: (blockId: number) => void;
  onAddBlock: () => void;
  readonly?: boolean;
  dragState?: DragState;
  onDragOver?: (e: React.DragEvent, targetId: string, position?: GridPosition, targetType?: string) => void;
  onDragLeave?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent, targetId: string, position?: GridPosition, dropType?: string) => void;
}

export const Grid2DCell: React.FC<Grid2DCellProps> = ({
  cell,
  grid,
  position,
  activeBlockId,
  onActiveBlockChange,
  onUpdateBlock,
  onDeleteBlock,
  onAddBlock,
  readonly = false,
  dragState,
  onDragOver,
  onDragLeave,
  onDrop
}) => {
  const isDropTarget = dragState?.dragOverRowId === grid.id && 
                      dragState?.dragOverPosition === position.row * grid.columns + position.column;

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (onDragOver && dragState?.isDragging) {
      onDragOver(e, grid.id, position, 'merge');
    }
  }, [onDragOver, grid.id, position, dragState]);

  const handleDragDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (onDrop && dragState?.isDragging) {
      onDrop(e, grid.id, position, 'merge');
    }
  }, [onDrop, grid.id, position, dragState]);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      if (onDragLeave) {
        onDragLeave(e);
      }
    }
  }, [onDragLeave]);

  const handleBlockClick = useCallback((blockId: number, event: React.MouseEvent) => {
    if (!readonly && onActiveBlockChange) {
      const target = event.target as Element;
      
      const isInteractiveElement = target.closest(
        '.inline-editor-display, .inline-rich-editor-display, input, textarea, button, select, [contenteditable], .grid-controls'
      );
      
      if (!isInteractiveElement) {
        event.stopPropagation();
        onActiveBlockChange(activeBlockId === blockId ? null : blockId);
      }
    }
  }, [activeBlockId, onActiveBlockChange, readonly]);

  const createBlockUpdateWrapper = useCallback((blockId: number) => {
    return (updates: Partial<ReviewBlock>) => {
      onUpdateBlock(blockId, updates);
    };
  }, [onUpdateBlock]);

  if (cell.block) {
    const isActive = activeBlockId === cell.block.id;
    const isDragging = dragState?.draggedBlockId === cell.block.id;

    return (
      <div 
        className="relative group h-full" 
        key={`block-${cell.block.id}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDragDrop}
      >
        {/* Drop zone overlay */}
        {isDropTarget && (
          <div className="absolute inset-0 border-2 border-green-500 rounded-lg z-20 animate-pulse bg-green-500/20 flex items-center justify-center">
            <div className="text-center">
              <div className="text-green-400 font-medium text-sm mb-2">
                ↓ Soltar bloco aqui ↓
              </div>
              <div className="text-green-300 text-xs">
                Linha {position.row + 1}, Coluna {position.column + 1}
              </div>
            </div>
          </div>
        )}

        <div
          className={cn(
            "h-full transition-all duration-200 cursor-pointer rounded-lg relative",
            isActive ? "ring-2 ring-blue-500 shadow-lg" : "hover:shadow-md",
            !cell.block.visible && "opacity-50",
            isDragging && "opacity-30 scale-95"
          )}
          style={{ 
            backgroundColor: isActive ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
            borderColor: isActive ? '#3b82f6' : 'transparent'
          }}
          onClick={(e) => handleBlockClick(cell.block!.id, e)}
        >
          {/* Block Controls */}
          {!readonly && (
            <div className={cn(
              "absolute -top-2 -right-2 z-10 transition-opacity",
              isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"
            )}>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  onDeleteBlock(cell.block!.id);
                }}
                className="h-6 w-6 p-0 bg-red-800 border border-red-600 hover:bg-red-700"
                title="Remover bloco"
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          )}

          {/* Block Content */}
          <div className="p-4 h-full">
            <BlockRenderer
              block={cell.block}
              onUpdate={createBlockUpdateWrapper(cell.block.id)}
              readonly={readonly}
            />
          </div>
        </div>
      </div>
    );
  }

  // Empty cell
  return (
    <div
      className={cn(
        "min-h-[120px] border-2 border-dashed rounded-lg flex flex-col items-center justify-center transition-all relative group",
        "border-gray-600 hover:border-gray-500",
        isDropTarget && "border-green-500 bg-green-500/20 animate-pulse"
      )}
      style={{ borderColor: isDropTarget ? '#22c55e' : '#2a2a2a' }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDragDrop}
    >
      {isDropTarget && (
        <div className="absolute inset-0 flex items-center justify-center bg-green-500/30 rounded-lg z-10">
          <div className="text-center">
            <div className="text-green-400 font-medium text-sm mb-2">
              ↓ Soltar bloco aqui ↓
            </div>
            <div className="text-green-300 text-xs">
              Linha {position.row + 1}, Coluna {position.column + 1}
            </div>
          </div>
        </div>
      )}
      
      {!readonly && !isDropTarget && (
        <div className="text-center opacity-60 group-hover:opacity-100 transition-opacity">
          <div className="text-gray-400 text-xs mb-3">
            L{position.row + 1} C{position.column + 1}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onAddBlock}
            className="text-gray-400 hover:text-white border border-gray-600 hover:border-gray-500"
          >
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Bloco
          </Button>
          <div className="text-xs text-gray-500 mt-2">
            ou arraste um bloco existente
          </div>
        </div>
      )}
    </div>
  );
};
