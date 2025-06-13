
// ABOUTME: Layout row component for grid system with string ID consistency
// Fixed to use standardized string IDs and proper interface alignment

import React, { useCallback, useState } from 'react';
import { ReviewBlock } from '@/types/review';
import { BlockRenderer } from '@/components/review/BlockRenderer';
import { Button } from '@/components/ui/button';
import { 
  Plus, 
  Minus, 
  GripHorizontal, 
  Settings, 
  Eye, 
  EyeOff 
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface LayoutRowProps {
  rowId: string;
  blocks: ReviewBlock[];
  rowIndex: number;
  isActive: boolean;
  onActivate: (rowId: string | null) => void;
  onUpdateBlock: (blockId: string, updates: Partial<ReviewBlock>) => void;
  onDeleteBlock: (blockId: string) => void;
  onMoveBlock: (blockId: string, direction: 'up' | 'down') => void;
  onAddRowAbove: (rowId: string, rowIndex: number) => void;
  onAddRowBelow: (rowId: string, rowIndex: number) => void;
  onRemoveRow: (rowId: string, rowIndex: number) => void;
  dragState: any;
  onDragStart: (blockId: string) => void;
  onDragOver: (e: React.DragEvent, targetId: string, position?: number, targetType?: string) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (draggedBlockId: string, targetRowId: string, targetPosition?: number, dropType?: string) => void;
}

export const LayoutRow: React.FC<LayoutRowProps> = ({
  rowId,
  blocks,
  rowIndex,
  isActive,
  onActivate,
  onUpdateBlock,
  onDeleteBlock,
  onMoveBlock,
  onAddRowAbove,
  onAddRowBelow,
  onRemoveRow,
  dragState,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop
}) => {
  const [showControls, setShowControls] = useState(false);
  const [columnWidths, setColumnWidths] = useState<number[]>([]);

  // Get layout metadata from first block
  const layout = blocks[0]?.meta?.layout;
  const columns = layout?.columns || blocks.length;
  const currentColumnWidths = layout?.columnWidths || Array(columns).fill(100 / columns);

  const handleRowClick = useCallback(() => {
    onActivate(isActive ? null : rowId);
  }, [isActive, rowId, onActivate]);

  const handleBlockUpdate = useCallback((blockId: string, updates: Partial<ReviewBlock>) => {
    onUpdateBlock(blockId, updates);
  }, [onUpdateBlock]);

  const handleColumnWidthChange = useCallback((index: number, width: number) => {
    const newWidths = [...currentColumnWidths];
    newWidths[index] = width;
    
    // Update all blocks in this row with new column widths
    blocks.forEach(block => {
      onUpdateBlock(block.id, {
        meta: {
          ...block.meta,
          layout: {
            ...block.meta?.layout,
            columnWidths: newWidths
          }
        }
      });
    });
  }, [blocks, currentColumnWidths, onUpdateBlock]);

  const handleDragStart = useCallback((blockId: string) => {
    onDragStart(blockId);
  }, [onDragStart]);

  const handleDragOver = useCallback((e: React.DragEvent, position?: number) => {
    e.preventDefault();
    onDragOver(e, rowId, position, 'grid');
  }, [onDragOver, rowId]);

  const handleDrop = useCallback((e: React.DragEvent, position?: number) => {
    e.preventDefault();
    const draggedBlockId = e.dataTransfer.getData('text/plain');
    
    if (draggedBlockId && draggedBlockId !== rowId) {
      onDrop(draggedBlockId, rowId, position, 'merge');
    }
  }, [onDrop, rowId]);

  const isDraggedOver = dragState?.dragOverRowId === rowId;

  return (
    <div
      className={cn(
        "layout-row group relative border rounded-lg transition-all duration-200",
        isActive ? "border-blue-500 bg-blue-500/10" : "border-gray-600 hover:border-gray-500",
        isDraggedOver && "border-green-500 bg-green-500/10"
      )}
      onClick={handleRowClick}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      {/* Row Controls */}
      <div className={cn(
        "absolute -left-12 top-1/2 transform -translate-y-1/2 flex flex-col items-center gap-1 z-10 transition-opacity",
        showControls ? "opacity-100" : "opacity-0"
      )}>
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onAddRowAbove(rowId, rowIndex);
          }}
          className="h-6 w-8 p-0 bg-gray-800 border border-gray-600 hover:bg-blue-700"
          title="Adicionar linha acima"
        >
          <Plus className="w-3 h-3" />
        </Button>

        <div
          className="h-6 w-8 flex items-center justify-center bg-gray-800 border border-gray-600 rounded cursor-move hover:bg-gray-700"
          title="Arrastar linha"
        >
          <GripHorizontal className="w-3 h-3 text-gray-400" />
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onRemoveRow(rowId, rowIndex);
          }}
          className="h-6 w-8 p-0 bg-red-800 border border-red-600 hover:bg-red-700"
          title="Remover linha"
        >
          <Minus className="w-3 h-3" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onAddRowBelow(rowId, rowIndex);
          }}
          className="h-6 w-8 p-0 bg-gray-800 border border-gray-600 hover:bg-blue-700"
          title="Adicionar linha abaixo"
        >
          <Plus className="w-3 h-3" />
        </Button>
      </div>

      {/* Row Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-white">
            Grid Row {rowIndex + 1}
          </span>
          <span className="text-xs text-gray-400">
            {columns} coluna(s) • {blocks.length} bloco(s)
          </span>
        </div>
        
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            title="Configurações da linha"
          >
            <Settings className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {/* Grid Content */}
      <div
        className="grid gap-2 p-3"
        style={{
          gridTemplateColumns: currentColumnWidths.map(w => `${w}%`).join(' ')
        }}
        onDragOver={handleDragOver}
        onDragLeave={onDragLeave}
        onDrop={handleDrop}
      >
        {blocks.map((block, index) => (
          <div
            key={block.id}
            className="relative group"
            draggable
            onDragStart={() => handleDragStart(block.id)}
          >
            <BlockRenderer
              block={block}
              onUpdate={(updates) => handleBlockUpdate(block.id, updates)}
              readonly={false}
            />
            
            {/* Column Width Control */}
            {isActive && (
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                <input
                  type="range"
                  min="10"
                  max="90"
                  value={currentColumnWidths[index]}
                  onChange={(e) => handleColumnWidthChange(index, parseInt(e.target.value))}
                  className="w-20 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                  title={`Largura: ${currentColumnWidths[index]}%`}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Drop Zone Indicator */}
      {isDraggedOver && (
        <div className="absolute inset-0 border-2 border-green-500 rounded-lg bg-green-500/20 flex items-center justify-center z-20">
          <div className="text-green-400 font-medium">
            ↓ Soltar bloco na linha ↓
          </div>
        </div>
      )}
    </div>
  );
};
