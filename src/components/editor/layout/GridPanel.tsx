
// ABOUTME: Individual grid panel with fixed drag functionality
// Handles block display, empty states, and proper drag-and-drop within grid cells

import React, { useCallback, useRef, useState } from 'react';
import { ReviewBlock } from '@/types/review';
import { BlockRenderer } from '@/components/review/BlockRenderer';
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
  const [isDragging, setIsDragging] = useState(false);
  const dragHandleRef = useRef<HTMLDivElement>(null);

  const isActive = block && activeBlockId === block.id;
  const isDropTarget = dragState?.dragOverRowId === rowId && 
                      dragState?.dragOverPosition === position;
  const isDraggedBlock = block && dragState?.draggedBlockId === block.id;

  const handleAddBlock = useCallback(() => {
    onAddBlock(rowId, position);
  }, [rowId, position, onAddBlock]);

  const handleBlockClick = useCallback((e: React.MouseEvent) => {
    // Don't trigger if clicking on drag handle
    if (dragHandleRef.current?.contains(e.target as Node)) {
      return;
    }
    
    if (block && onActiveBlockChange) {
      onActiveBlockChange(block.id);
    }
  }, [block, onActiveBlockChange]);

  // FIXED: Proper drag start implementation
  const handleDragStart = useCallback((e: React.DragEvent) => {
    if (!block || readonly) {
      e.preventDefault();
      return;
    }

    setIsDragging(true);
    
    // Set proper drag effect
    e.dataTransfer.effectAllowed = 'move';
    
    // Set comprehensive drag data
    e.dataTransfer.setData('text/plain', block.id.toString());
    e.dataTransfer.setData('application/json', JSON.stringify({
      blockId: block.id,
      sourceRowId: rowId,
      sourcePosition: position,
      sourceType: 'grid'
    }));

    // Add visual feedback
    document.body.classList.add('dragging');
    
    console.log('Started dragging block from grid panel:', {
      blockId: block.id,
      rowId,
      position
    });
  }, [block, readonly, rowId, position]);

  // FIXED: Proper drag end implementation
  const handleDragEnd = useCallback((e: React.DragEvent) => {
    setIsDragging(false);
    document.body.classList.remove('dragging');
    
    console.log('Drag ended for block:', block?.id);
  }, [block?.id]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (onDragOver && !readonly) {
      e.dataTransfer.dropEffect = 'move';
      onDragOver(e, rowId, position, 'grid');
    }
  }, [onDragOver, readonly, rowId, position]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (onDrop && !readonly) {
      onDrop(e, rowId, position, 'grid');
    }
  }, [onDrop, readonly, rowId, position]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    // Only trigger if actually leaving the element
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      if (onDragLeave) {
        onDragLeave(e);
      }
    }
  }, [onDragLeave]);

  const handleBlockUpdate = useCallback((updates: Partial<ReviewBlock>) => {
    if (block) {
      onUpdateBlock(block.id, updates);
    }
  }, [block, onUpdateBlock]);

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
        style={{ overflow: 'visible', position: 'relative', zIndex: 1 }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
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
        "grid-panel-filled h-full relative group cursor-pointer",
        isActive && "ring-2 ring-blue-500",
        isDraggedBlock && "opacity-50",
        isDropTarget && "ring-2 ring-green-500",
        isDragging && "cursor-grabbing",
        className
      )}
      style={{ 
        overflow: 'visible !important', 
        position: 'relative', 
        zIndex: isActive ? 10 : 1 
      }}
      onClick={handleBlockClick}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* FIXED: Drag Handle with proper implementation */}
      {!readonly && (
        <div 
          ref={dragHandleRef}
          className={cn(
            "absolute top-2 right-2 z-30 transition-opacity cursor-grab active:cursor-grabbing",
            "opacity-0 group-hover:opacity-100"
          )}
          draggable="true"
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onMouseDown={(e) => e.stopPropagation()} // Prevent block selection when grabbing handle
        >
          <Button
            variant="ghost"
            size="sm"
            className="w-6 h-6 p-0 bg-gray-800/90 hover:bg-gray-700/90 text-gray-400 hover:text-white border border-gray-600"
            tabIndex={-1} // Remove from tab order
          >
            <Grip className="w-3 h-3" />
          </Button>
        </div>
      )}

      {/* Block Content - CRITICAL: Must allow overflow for inline menus */}
      <div 
        className="h-full relative z-10" 
        style={{ overflow: 'visible !important', position: 'relative' }}
      >
        <BlockRenderer
          block={block}
          readonly={readonly}
          onUpdate={handleBlockUpdate}
          className="h-full"
        />
      </div>

      {/* Drop Indicator */}
      {isDropTarget && (
        <div className="absolute inset-0 border-2 border-green-500 rounded-lg bg-green-500/5 flex items-center justify-center pointer-events-none z-20">
          <div className="text-green-400 text-sm font-medium animate-pulse">
            ↓ Soltar bloco aqui ↓
          </div>
        </div>
      )}
    </div>
  );
};
