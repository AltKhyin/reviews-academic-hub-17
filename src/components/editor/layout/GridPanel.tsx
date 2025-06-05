
// ABOUTME: Individual grid panel component for better modularity
// Handles single panel rendering with proper drag and drop support

import React, { useCallback } from 'react';
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

interface GridPanelProps {
  rowId: string;
  position: number;
  block?: ReviewBlock;
  readonly?: boolean;
  activeBlockId?: number | null;
  dragState?: DragState;
  onActiveBlockChange?: (blockId: number | null) => void;
  onUpdateBlock: (blockId: number, updates: Partial<ReviewBlock>) => void;
  onDeleteBlock: (blockId: number) => void;
  onAddBlock: (rowId: string, position: number) => void;
  onDragOver?: (e: React.DragEvent, targetRowId: string, targetPosition?: number, targetType?: 'grid' | 'single' | 'merge') => void;
  onDragLeave?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent, targetRowId: string, targetPosition?: number, dropType?: 'grid' | 'single' | 'merge') => void;
}

export const GridPanel: React.FC<GridPanelProps> = ({
  rowId,
  position,
  block,
  readonly = false,
  activeBlockId,
  dragState,
  onActiveBlockChange,
  onUpdateBlock,
  onDeleteBlock,
  onAddBlock,
  onDragOver,
  onDragLeave,
  onDrop
}) => {
  const isDropTarget = dragState?.dragOverRowId === rowId && 
                      dragState?.dragOverPosition === position && 
                      dragState?.dropTargetType === 'merge';

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (onDragOver && dragState?.isDragging) {
      onDragOver(e, rowId, position, 'merge');
    }
  }, [onDragOver, rowId, position, dragState]);

  const handleDragDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (onDrop && dragState?.isDragging) {
      console.log('Panel drop:', { rowId, position, draggedBlock: dragState.draggedBlockId });
      onDrop(e, rowId, position, 'merge');
    }
  }, [onDrop, rowId, position, dragState]);

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

  const handleAddBlock = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('Adding block to grid position:', { rowId, position });
    onAddBlock(rowId, position);
  }, [rowId, position, onAddBlock]);

  // Create wrapper function for onUpdate
  const createBlockUpdateWrapper = useCallback((blockId: number) => {
    return (updates: Partial<ReviewBlock>) => {
      onUpdateBlock(blockId, updates);
    };
  }, [onUpdateBlock]);

  if (block) {
    const isActive = activeBlockId === block.id;
    const isDragging = dragState?.draggedBlockId === block.id;

    return (
      <div className="relative group h-full" key={`block-${block.id}`}>
        {/* Drop zone indicator for merge */}
        {isDropTarget && (
          <div className="absolute inset-0 border-2 border-green-500 rounded-lg z-10 animate-pulse bg-green-500/10">
            <div className="absolute top-2 left-2 text-xs text-green-400 font-medium">
              Mesclar aqui
            </div>
          </div>
        )}

        <div
          className={cn(
            "h-full transition-all duration-200 cursor-pointer rounded-lg relative",
            isActive ? "ring-2 ring-blue-500 shadow-lg" : "hover:shadow-md",
            !block.visible && "opacity-50",
            isDragging && "opacity-30 scale-95"
          )}
          style={{ 
            backgroundColor: isActive ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
            borderColor: isActive ? '#3b82f6' : 'transparent'
          }}
          onClick={(e) => handleBlockClick(block.id, e)}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDragDrop}
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
                  console.log('Deleting block from grid:', { blockId: block.id, rowId });
                  onDeleteBlock(block.id);
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
              block={block}
              onUpdate={createBlockUpdateWrapper(block.id)}
              readonly={readonly}
            />
          </div>
        </div>
      </div>
    );
  }

  // Empty slot
  return (
    <div
      className={cn(
        "min-h-[120px] border-2 border-dashed rounded-lg flex flex-col items-center justify-center transition-all relative group",
        "border-gray-600 hover:border-gray-500",
        isDropTarget && "border-green-500 bg-green-500/10 animate-pulse"
      )}
      style={{ borderColor: isDropTarget ? '#22c55e' : '#2a2a2a' }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDragDrop}
    >
      {isDropTarget && (
        <div className="absolute inset-0 flex items-center justify-center bg-green-500/20 rounded-lg">
          <div className="text-center">
            <div className="text-green-400 font-medium text-sm mb-2">
              ↓ Soltar bloco aqui ↓
            </div>
            <div className="text-green-300 text-xs">
              Será adicionado à posição {position + 1}
            </div>
          </div>
        </div>
      )}
      
      {!readonly && !isDropTarget && (
        <div className="text-center opacity-60 group-hover:opacity-100 transition-opacity">
          <div className="text-gray-400 text-sm mb-3">Posição {position + 1}</div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleAddBlock}
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
