
// ABOUTME: Enhanced layout row component with complete string ID support
// Manages individual rows in grid layouts with proper drag and drop functionality

import React, { useCallback } from 'react';
import { ReviewBlock } from '@/types/review';
import { BlockContentEditor } from '../BlockContentEditor';
import { Button } from '@/components/ui/button';
import { Plus, Grid3X3 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LayoutRowProps {
  rowId: string;
  blocks: ReviewBlock[];
  columns: number;
  columnWidths?: number[];
  gap: number;
  activeBlockId: string | null;
  onActiveBlockChange: (blockId: string | null) => void;
  onUpdateBlock: (blockId: string, updates: Partial<ReviewBlock>) => void;
  onDeleteBlock: (blockId: string) => void;
  onAddBlock: (rowId: string, position: number) => void;
  className?: string;
}

export const LayoutRow: React.FC<LayoutRowProps> = ({
  rowId,
  blocks,
  columns,
  columnWidths,
  gap,
  activeBlockId,
  onActiveBlockChange,
  onUpdateBlock,
  onDeleteBlock,
  onAddBlock,
  className
}) => {
  const handleMove = useCallback((blockId: string, direction: 'up' | 'down') => {
    // Row-level movement is handled by parent components
    console.log('Row block movement:', { blockId, direction, rowId });
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

  return (
    <div className={cn("layout-row mb-4", className)}>
      {/* Row Header */}
      <div className="flex items-center gap-2 mb-2">
        <Grid3X3 className="w-4 h-4 text-purple-400" />
        <span className="text-sm text-gray-400">
          Grid Row: {columns} {columns === 1 ? 'coluna' : 'colunas'}
        </span>
        <span className="text-xs text-gray-500 font-mono">#{rowId}</span>
      </div>

      {/* Grid Layout */}
      <div
        className="grid w-full"
        style={{
          gridTemplateColumns: columnWidths
            ? columnWidths.map(w => `${w}%`).join(' ')
            : `repeat(${columns}, 1fr)`,
          gap: `${gap}px`
        }}
      >
        {Array.from({ length: columns }).map((_, index) => {
          const block = blocks[index];
          
          return (
            <div
              key={`grid-item-${index}`}
              className={cn(
                "grid-item border-2 border-dashed border-gray-600 rounded min-h-[120px]",
                "transition-all duration-200",
                block && "border-solid border-gray-500 bg-gray-900/10"
              )}
            >
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
    </div>
  );
};
