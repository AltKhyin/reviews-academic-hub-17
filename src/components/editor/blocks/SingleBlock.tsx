
// ABOUTME: Enhanced single block component with proper string ID support
// Handles individual block rendering with drag/drop and conversion capabilities

import React, { useCallback } from 'react';
import { ReviewBlock, BlockType } from '@/types/review';
import { BlockContentEditor } from '../BlockContentEditor';
import { Button } from '@/components/ui/button';
import { Plus, Grid3X3, LayoutGrid } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DragState {
  draggedBlockId: string | null; // Changed from number to string
  dragOverRowId: string | null;
  dragOverPosition: number | null;
  isDragging: boolean;
  draggedFromRowId: string | null;
  dropTargetType: 'grid' | 'single' | 'merge' | null;
}

interface SingleBlockProps {
  block: ReviewBlock;
  globalIndex: number;
  activeBlockId: string | null; // Changed from number to string
  dragState: DragState;
  onActiveBlockChange: (blockId: string | null) => void; // Changed from number to string
  onUpdateBlock: (blockId: string, updates: Partial<ReviewBlock>) => void; // Changed from number to string
  onDeleteBlock: (blockId: string) => void; // Changed from number to string
  onDuplicateBlock: (blockId: string) => void; // Changed from number to string
  onConvertToGrid: (blockId: string, columns: number) => void; // Changed from number to string
  onConvertTo2DGrid?: (blockId: string, columns: number, rows: number) => void; // Changed from number to string
  onAddBlockBetween: (position: number, type?: BlockType) => string; // Changed return type from number to string
  onDragStart: (e: React.DragEvent, blockId: string) => void; // Changed from number to string
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
  onConvertTo2DGrid,
  onAddBlockBetween,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDragLeave,
  onDrop
}) => {
  const isActive = activeBlockId === block.id;
  const isDraggedOver = dragState.dragOverRowId === `single-${block.id}`;
  const isDragging = dragState.draggedBlockId === block.id;

  const handleMove = useCallback((blockId: string, direction: 'up' | 'down') => { // Changed from number to string
    const currentIndex = globalIndex;
    if (direction === 'up' && currentIndex > 0) {
      // Move block up logic would be handled by parent
    } else if (direction === 'down') {
      // Move block down logic would be handled by parent
    }
  }, [globalIndex]);

  return (
    <div className="mb-4 w-full max-w-full overflow-hidden">
      {/* Insert Point Above */}
      <div 
        className={cn(
          "insert-point opacity-0 hover:opacity-100 transition-opacity duration-200 h-8 flex items-center justify-center mb-2",
          isDraggedOver && dragState.dragOverPosition === 0 && "opacity-100 bg-blue-500/20 border-2 border-blue-500 border-dashed rounded"
        )}
        onDragOver={(e) => onDragOver(e, `single-${block.id}`, 0, 'single')}
        onDragLeave={onDragLeave}
        onDrop={(e) => onDrop(e, `single-${block.id}`, 0, 'single')}
      >
        <Button
          size="sm"
          variant="ghost"
          onClick={() => onAddBlockBetween(globalIndex)}
          className="text-xs text-gray-500 hover:text-gray-300"
        >
          <Plus className="w-3 h-3 mr-1" />
          Inserir bloco aqui
        </Button>
      </div>

      {/* Block Container */}
      <div 
        className={cn(
          "relative",
          isDragging && "opacity-50",
          isDraggedOver && "ring-2 ring-blue-400"
        )}
        onDragOver={(e) => onDragOver(e, `single-${block.id}`, undefined, 'merge')}
        onDragLeave={onDragLeave}
        onDrop={(e) => onDrop(e, `single-${block.id}`, undefined, 'merge')}
      >
        <BlockContentEditor
          block={block}
          isActive={isActive}
          isFirst={globalIndex === 0}
          isLast={false}
          onSelect={onActiveBlockChange}
          onUpdate={onUpdateBlock}
          onDelete={onDeleteBlock}
          onDuplicate={onDuplicateBlock}
          onMove={handleMove}
          onAddBlock={(type: BlockType, position?: number) => onAddBlockBetween(position || globalIndex + 1, type)}
        />

        {/* Conversion Controls */}
        {isActive && (
          <div className="absolute -right-2 top-1/2 transform -translate-y-1/2 flex flex-col gap-1 z-30">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onConvertToGrid(block.id, 2)}
              className="w-8 h-8 p-0 bg-gray-800 hover:bg-gray-700 border border-gray-600"
              title="Converter para Grid 1D (2 cols)"
            >
              <Grid3X3 className="w-3 h-3 text-blue-400" />
            </Button>
            
            {onConvertTo2DGrid && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onConvertTo2DGrid(block.id, 2, 2)}
                className="w-8 h-8 p-0 bg-gray-800 hover:bg-gray-700 border border-gray-600"
                title="Converter para Grid 2D (2x2)"
              >
                <LayoutGrid className="w-3 h-3 text-green-400" />
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
