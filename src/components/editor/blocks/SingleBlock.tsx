
// ABOUTME: Single block component with drag and drop support
// Handles individual block rendering with controls and interactions

import React, { useCallback } from 'react';
import { ReviewBlock } from '@/types/review';
import { BlockRenderer } from '@/components/review/BlockRenderer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  Plus, 
  Eye, 
  EyeOff, 
  Copy, 
  Trash2, 
  Columns2,
  Columns3,
  Columns4,
  GripVertical
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface DragState {
  draggedBlockId: number | null;
  dragOverRowId: string | null;
  dragOverPosition: number | null;
  isDragging: boolean;
  draggedFromRowId: string | null;
  dropTargetType: 'grid' | 'single' | 'merge' | null;
}

interface SingleBlockProps {
  block: ReviewBlock;
  globalIndex: number;
  activeBlockId: number | null;
  dragState: DragState;
  onActiveBlockChange: (blockId: number | null) => void;
  onUpdateBlock: (blockId: number, updates: Partial<ReviewBlock>) => void;
  onDeleteBlock: (blockId: number) => void;
  onDuplicateBlock: (blockId: number) => void;
  onConvertToGrid: (blockId: number, columns: number) => void;
  onAddBlockBetween: (position: number) => void;
  onDragStart: (e: React.DragEvent, blockId: number) => void;
  onDragEnd: () => void;
  onDragOver: (e: React.DragEvent, targetRowId: string, targetPosition?: number, targetType?: 'grid' | 'single' | 'merge') => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, targetRowId: string, targetPosition?: number, dropType?: 'grid' | 'single' | 'merge') => void;
}

export const SingleBlock: React.FC<SingleBlockProps> = ({
  block,
  globalIndex,
  activeBlockId,
  dragState,
  onActiveBlockChange,
  onUpdateBlock,
  onDeleteBlock,
  onDuplicateBlock,
  onConvertToGrid,
  onAddBlockBetween,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDragLeave,
  onDrop
}) => {
  const isActive = activeBlockId === block.id;
  const isDragging = dragState.draggedBlockId === block.id;
  const rowId = `single-${block.id}`;
  const isDropTarget = dragState.dragOverRowId === rowId && dragState.dropTargetType === 'merge';

  const handleBlockClick = useCallback((blockId: number, event: React.MouseEvent) => {
    const target = event.target as Element;
    const isInteractiveElement = target.closest(
      '.inline-editor-display, .inline-rich-editor-display, input, textarea, button, select, [contenteditable], .grid-controls, .resizable-handle'
    );
    
    if (!isInteractiveElement) {
      event.stopPropagation();
      onActiveBlockChange(activeBlockId === blockId ? null : blockId);
    }
  }, [activeBlockId, onActiveBlockChange]);

  const handleBlockVisibilityToggle = useCallback((blockId: number, event: React.MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();
    
    onUpdateBlock(blockId, { visible: !block.visible });
  }, [block.visible, onUpdateBlock]);

  const convertToLayout = useCallback((blockId: number, columns: number, event: React.MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();
    onConvertToGrid(blockId, columns);
  }, [onConvertToGrid]);

  const createBlockUpdateWrapper = useCallback((blockId: number) => {
    return (updates: Partial<ReviewBlock>) => {
      onUpdateBlock(blockId, updates);
    };
  }, [onUpdateBlock]);

  return (
    <div className="relative group mb-6 mx-2">
      {isDropTarget && (
        <div className="absolute inset-0 border-2 border-green-500 rounded-lg z-10 animate-pulse bg-green-500/10">
          <div className="absolute top-2 left-2 text-xs text-green-400 font-medium">
            Soltar para criar grid
          </div>
        </div>
      )}

      <div className="flex justify-center mb-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onAddBlockBetween(globalIndex)}
          className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-white h-6 w-16 text-xs"
        >
          <Plus className="w-3 h-3 mr-1" />
          Add
        </Button>
      </div>

      <Card 
        className={cn(
          "p-4 transition-all duration-200 cursor-pointer relative",
          isActive ? "ring-2 ring-blue-500 shadow-lg" : "hover:shadow-md",
          !block.visible && "opacity-50",
          isDragging && "opacity-30 scale-95"
        )}
        style={{ 
          backgroundColor: isActive ? 'rgba(59, 130, 246, 0.1)' : '#1a1a1a',
          borderColor: isActive ? '#3b82f6' : '#2a2a2a',
          marginLeft: '2rem'
        }}
        onClick={(e) => handleBlockClick(block.id, e)}
        onDragOver={(e) => onDragOver(e, rowId, 0, 'merge')}
        onDragLeave={onDragLeave}
        onDrop={(e) => onDrop(e, rowId, 0, 'merge')}
      >
        {/* Drag Handle */}
        <div className="absolute -left-8 top-4 opacity-0 group-hover:opacity-100 transition-opacity">
          <div
            className="drag-handle cursor-grab active:cursor-grabbing transition-all duration-200 flex items-center justify-center rounded border bg-gray-800 border-gray-600 hover:bg-gray-700 hover:border-gray-500"
            style={{ width: '20px', height: '20px' }}
            draggable
            onDragStart={(e) => onDragStart(e, block.id)}
            onDragEnd={onDragEnd}
            title="Arrastar bloco"
          >
            <GripVertical className="w-3 h-3 text-gray-400" />
          </div>
        </div>

        {/* Block Actions */}
        <div className={cn(
          "absolute top-2 right-2 flex items-center gap-1 transition-opacity z-10",
          isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        )}>
          <div className="flex items-center gap-1 mr-2">
            {[2, 3, 4].map((cols) => {
              const Icon = cols === 2 ? Columns2 : cols === 3 ? Columns3 : Columns4;
              return (
                <Button
                  key={cols}
                  variant="ghost"
                  size="sm"
                  onClick={(e) => convertToLayout(block.id, cols, e)}
                  className="h-6 w-6 p-0 bg-gray-800 border border-gray-600 hover:bg-blue-700"
                  title={`Converter para ${cols} colunas`}
                >
                  <Icon className="w-3 h-3" />
                </Button>
              );
            })}
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => handleBlockVisibilityToggle(block.id, e)}
            className="h-6 w-6 p-0 bg-gray-800 border border-gray-600"
            title={block.visible ? "Ocultar" : "Mostrar"}
          >
            {block.visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onDuplicateBlock(block.id);
            }}
            className="h-6 w-6 p-0 bg-gray-800 border border-gray-600"
            title="Duplicar"
          >
            <Copy className="w-3 h-3" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onDeleteBlock(block.id);
            }}
            className="h-6 w-6 p-0 bg-red-800 border border-red-600 hover:bg-red-700"
            title="Deletar"
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>

        <BlockRenderer
          block={block}
          onUpdate={createBlockUpdateWrapper(block.id)}
          readonly={false}
        />
      </Card>
    </div>
  );
};
