
// ABOUTME: Individual grid panel for block rendering and interactions
// Handles block display, empty states, and drag-and-drop within grid cells

import React, { useCallback } from 'react';
import { ReviewBlock } from '@/types/review';
import { BlockRenderer } from '../blocks/BlockRenderer';
import { Button } from '@/components/ui/button';
import { Plus, Grip } from 'lucide-react';
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
  onAddBlock: (targetRowId: string, position: number) => void;
  onDragOver?: (e: React.DragEvent, targetRowId: string, targetPosition?: number, targetType?: 'grid' | 'single' | 'merge') => void;
  onDragLeave?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent, targetRowId: string, targetPosition?: number, dropType?: 'grid' | 'single' | 'merge') => void;
  className?: string;
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
  onDrop,
  className
}) => {

  const isActive = block && activeBlockId === block.id;
  const isDropTarget = dragState?.dragOverRowId === rowId && 
                      dragState?.dragOverPosition === position;
  const isDraggedBlock = block && dragState?.draggedBlockId === block.id;

  const handleAddBlock = useCallback(() => {
    onAddBlock(rowId, position);
  }, [rowId, position, onAddBlock]);

  const handleBlockClick = useCallback(() => {
    if (block && onActiveBlockChange) {
      onActiveBlockChange(block.id);
    }
  }, [block, onActiveBlockChange]);

  const handleDragStart = useCallback((e: React.DragEvent) => {
    if (!block || readonly) {
      e.preventDefault();
      return;
    }

    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', block.id.toString());
    e.dataTransfer.setData('application/json', JSON.stringify({
      blockId: block.id,
      sourceRowId: rowId,
      sourcePosition: position
    }));

    console.log('Started dragging block from grid panel:', {
      blockId: block.id,
      rowId,
      position
    });
  }, [block, readonly, rowId, position]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    if (onDragOver && !readonly) {
      onDragOver(e, rowId, position, 'grid');
    }
  }, [onDragOver, readonly, rowId, position]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    if (onDrop && !readonly) {
      onDrop(e, rowId, position, 'grid');
    }
  }, [onDrop, readonly, rowId, position]);

  if (!block) {
    return (
      <div 
        className={cn(
          "grid-panel-empty h-full flex items-center justify-center",
          "border border-dashed border-gray-600 rounded-lg transition-all",
          isDropTarget && "border-green-500 bg-green-500/10",
          "hover:border-gray-500",
          className
        )}
        onDragOver={handleDragOver}
        onDragLeave={onDragLeave}
        onDrop={handleDrop}
      >
        {!readonly && (
          <Button
            onClick={handleAddBlock}
            variant="ghost"
            size="sm"
            className="text-gray-500 hover:text-gray-300 hover:bg-gray-800"
          >
            <Plus className="w-4 h-4 mr-2" />
            Adicionar bloco
          </Button>
        )}
        
        {isDropTarget && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-green-400 text-sm font-medium animate-pulse">
              Soltar aqui
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div 
      className={cn(
        "grid-panel-filled h-full relative group",
        isActive && "ring-2 ring-blue-500",
        isDraggedBlock && "opacity-50",
        isDropTarget && "ring-2 ring-green-500",
        className
      )}
      onClick={handleBlockClick}
      onDragOver={handleDragOver}
      onDragLeave={onDragLeave}
      onDrop={handleDrop}
    >
      {/* Drag Handle */}
      {!readonly && (
        <div 
          className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
          draggable
          onDragStart={handleDragStart}
        >
          <Button
            variant="ghost"
            size="sm"
            className="w-6 h-6 p-0 bg-gray-800/80 hover:bg-gray-700/80 text-gray-400 hover:text-white"
          >
            <Grip className="w-3 h-3" />
          </Button>
        </div>
      )}

      {/* Block Content */}
      <div className="h-full overflow-hidden">
        <BlockRenderer
          block={block}
          readonly={readonly}
          onUpdate={onUpdateBlock}
          className="h-full"
        />
      </div>

      {/* Drop Indicator */}
      {isDropTarget && (
        <div className="absolute inset-0 border-2 border-green-500 rounded-lg bg-green-500/5 flex items-center justify-center pointer-events-none">
          <div className="text-green-400 text-sm font-medium animate-pulse">
            ↓ Soltar bloco aqui ↓
          </div>
        </div>
      )}
    </div>
  );
};
