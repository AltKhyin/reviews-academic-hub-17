
// ABOUTME: Enhanced resizable grid component with complete string ID support
// Provides resizable grid functionality with proper column management

import React, { useState, useCallback } from 'react';
import { ReviewBlock } from '@/types/review';
import { BlockContentEditor } from '../BlockContentEditor';
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

interface ResizableGridProps {
  rowId: string;
  blocks: ReviewBlock[];
  columns: number;
  gap: number;
  columnWidths?: number[];
  onUpdateLayout: (rowId: string, updates: { columnWidths: number[] }) => void;
  onAddBlock: (rowId: string, position: number) => void;
  onUpdateBlock: (blockId: string, updates: Partial<ReviewBlock>) => void;
  onDeleteBlock: (blockId: string) => void;
  activeBlockId: string | null;
  onActiveBlockChange: (blockId: string | null) => void;
  dragState: DragState;
  onDragOver: (e: React.DragEvent, targetRowId: string, targetPosition?: number, targetType?: 'grid' | 'single' | 'merge') => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, targetRowId: string, targetPosition?: number, dropType?: 'grid' | 'single' | 'merge') => void;
}

export const ResizableGrid: React.FC<ResizableGridProps> = ({
  rowId,
  blocks,
  columns,
  gap,
  columnWidths,
  onUpdateLayout,
  onAddBlock,
  onUpdateBlock,
  onDeleteBlock,
  activeBlockId,
  onActiveBlockChange,
  dragState,
  onDragOver,
  onDragLeave,
  onDrop
}) => {
  const [isResizing, setIsResizing] = useState(false);
  const [localColumnWidths, setLocalColumnWidths] = useState(
    columnWidths || Array(columns).fill(100 / columns)
  );

  const handleMove = useCallback((blockId: string, direction: 'up' | 'down') => {
    // Grid block movement is handled by parent components
    console.log('Grid block movement:', { blockId, direction, rowId });
  }, [rowId]);

  const handleAddBlockAtPosition = useCallback((type: any, position?: number) => {
    if (position !== undefined) {
      onAddBlock(rowId, position);
    } else {
      onAddBlock(rowId, blocks.length);
    }
  }, [onAddBlock, rowId, blocks.length]);

  const handleAddBlock = useCallback((position: number) => {
    onAddBlock(rowId, position);
  }, [onAddBlock, rowId]);

  const handleColumnResize = useCallback((columnIndex: number, newWidth: number) => {
    const newWidths = [...localColumnWidths];
    const oldWidth = newWidths[columnIndex];
    const diff = newWidth - oldWidth;
    
    // Adjust the next column to compensate
    if (columnIndex < newWidths.length - 1) {
      newWidths[columnIndex + 1] = Math.max(10, newWidths[columnIndex + 1] - diff);
    }
    
    newWidths[columnIndex] = Math.max(10, newWidth);
    
    setLocalColumnWidths(newWidths);
    onUpdateLayout(rowId, { columnWidths: newWidths });
  }, [localColumnWidths, onUpdateLayout, rowId]);

  return (
    <div className="resizable-grid border border-gray-600 rounded-lg p-4 mb-4 bg-gray-900/10">
      {/* Grid Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Grid3X3 className="w-4 h-4 text-purple-400" />
          <span className="text-sm font-medium text-gray-300">
            Grid Redimensionável: {columns} colunas
          </span>
          <span className="text-xs text-gray-500">#{rowId}</span>
        </div>
        
        <Button
          size="sm"
          variant="ghost"
          className="text-gray-400 hover:text-gray-300"
          title="Configurações do Grid"
        >
          <Settings className="w-4 h-4" />
        </Button>
      </div>

      {/* Grid Layout */}
      <div
        className="grid w-full"
        style={{
          gridTemplateColumns: localColumnWidths.map(w => `${w}%`).join(' '),
          gap: `${gap}px`
        }}
        onDragOver={(e) => onDragOver(e, rowId, undefined, 'merge')}
        onDragLeave={onDragLeave}
        onDrop={(e) => onDrop(e, rowId, undefined, 'merge')}
      >
        {Array.from({ length: columns }).map((_, index) => {
          const block = blocks[index];
          
          return (
            <div
              key={`resizable-grid-item-${index}`}
              className={cn(
                "resizable-grid-item relative border-2 border-dashed border-gray-600 rounded min-h-[120px]",
                "transition-all duration-200",
                block && "border-solid border-gray-500 bg-gray-900/10",
                dragState.dragOverRowId === rowId && "ring-2 ring-blue-400"
              )}
            >
              {/* Column Resizer */}
              {index < columns - 1 && (
                <div
                  className="absolute top-0 -right-1 w-2 h-full cursor-col-resize bg-gray-600 opacity-0 hover:opacity-100 transition-opacity z-10"
                  onMouseDown={(e) => {
                    setIsResizing(true);
                    const startX = e.clientX;
                    const startWidth = localColumnWidths[index];
                    
                    const handleMouseMove = (e: MouseEvent) => {
                      const diff = e.clientX - startX;
                      const newWidth = startWidth + (diff / window.innerWidth) * 100;
                      handleColumnResize(index, newWidth);
                    };
                    
                    const handleMouseUp = () => {
                      setIsResizing(false);
                      document.removeEventListener('mousemove', handleMouseMove);
                      document.removeEventListener('mouseup', handleMouseUp);
                    };
                    
                    document.addEventListener('mousemove', handleMouseMove);
                    document.addEventListener('mouseup', handleMouseUp);
                  }}
                />
              )}

              {block ? (
                <BlockContentEditor
                  block={block}
                  isActive={activeBlockId === block.id}
                  isFirst={index === 0}
                  isLast={index === columns - 1}
                  onSelect={onActiveBlockChange}
                  onUpdate={onUpdateBlock}
                  onDelete={onDeleteBlock}
                  onMove={handleMove}
                  onAddBlock={handleAddBlockAtPosition}
                />
              ) : (
                <div className="h-full flex items-center justify-center p-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleAddBlock(index)}
                    className="text-gray-400 hover:text-gray-300 hover:bg-gray-800"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Adicionar Bloco
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Grid Info */}
      <div className="flex justify-between items-center mt-3 pt-2 border-t border-gray-700">
        <div className="text-xs text-gray-500">
          Larguras: {localColumnWidths.map(w => `${w.toFixed(1)}%`).join(', ')}
        </div>
        <div className="text-xs text-gray-500">
          {blocks.filter(Boolean).length}/{columns} células preenchidas
        </div>
      </div>
    </div>
  );
};
