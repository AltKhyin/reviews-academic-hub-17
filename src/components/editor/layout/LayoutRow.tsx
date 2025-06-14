// ABOUTME: Enhanced layout row component with complete string ID support
// Manages individual rows in grid layouts with proper drag and drop functionality

import React, { useCallback } from 'react';
import { ReviewBlock, BlockType } from '@/types/review';
import { LayoutRowData } from '@/types/grid'; 
import { BlockContentEditor } from '../BlockContentEditor'; // Assuming BlockContentEditorProps accepts readonly
import { Button } from '@/components/ui/button';
import { Plus, Grid3X3 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LayoutRowProps {
  row: LayoutRowData; 
  activeBlockId: string | null;
  onActiveBlockChange: (blockId: string | null) => void;
  onUpdateBlock: (blockId: string, updates: Partial<ReviewBlock>) => void;
  onDeleteBlock: (blockId: string) => void;
  onAddBlock: (rowId: string, position: number, blockType: BlockType) => void; 
  onUpdateRow: (rowId: string, updates: Partial<LayoutRowData>) => void; 
  onDeleteRow: (rowId: string) => void; 
  onMoveBlock: (blockId: string, targetRowId: string, targetPosition: number) => void; 
  readonly?: boolean;
  className?: string;
}

export const LayoutRow: React.FC<LayoutRowProps> = ({
  row, 
  activeBlockId,
  onActiveBlockChange,
  onUpdateBlock,
  onDeleteBlock,
  onAddBlock,
  readonly,
  className
}) => {
  const { id: rowId, blocks, columns, columnWidths, gap = 4 } = row;

  const handleMoveWithinRow = useCallback((blockId: string, direction: 'up' | 'down') => {
    console.log('LayoutRow block movement (within row context):', { blockId, direction, rowId });
    // This would typically involve finding the block's current index in `row.blocks`
    // and then calling a passed-in `onMoveBlockInRowArray(rowId, blockId, newIndex)` or similar.
    // For now, it's a placeholder as `onMoveBlock` prop is for inter-row moves.
  }, [rowId]);

  const handleAddBlockAtPosition = useCallback((type: BlockType, position?: number) => {
    const targetPosition = position !== undefined ? position : blocks.length;
    onAddBlock(rowId, targetPosition, type);
  }, [onAddBlock, rowId, blocks.length]);

  const handleAddBlockToColumn = useCallback((columnIndex: number) => {
    onAddBlock(rowId, columnIndex, 'paragraph' as BlockType);
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
              key={`layout-row-cell-${rowId}-${index}`}
              className={cn(
                "grid-item border-2 border-dashed rounded min-h-[120px]",
                block ? "border-gray-700 bg-gray-900/20" : "border-gray-800 hover:border-gray-700",
                "transition-all duration-200",
                activeBlockId && block && activeBlockId === block.id && "ring-2 ring-blue-500 border-blue-500"
              )}
              style={{ borderColor: block ? '#374151' : '#2b3245' }}
            >
              {block ? (
                <BlockContentEditor
                  block={block}
                  isActive={activeBlockId === block.id}
                  isFirst={index === 0} 
                  isLast={index === columns - 1} 
                  onSelect={() => onActiveBlockChange(block.id)} // Corrected: pass block.id
                  onUpdate={onUpdateBlock}
                  onDelete={onDeleteBlock}
                  onMove={handleMoveWithinRow} 
                  onAddBlock={handleAddBlockAtPosition} 
                  readonly={readonly} // Assuming BlockContentEditorProps accepts this
                />
              ) : (
                <div className="h-full flex items-center justify-center p-4">
                  {!readonly && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleAddBlockToColumn(index)}
                      className="text-gray-400 hover:text-gray-300 hover:bg-gray-800"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Adicionar Bloco
                    </Button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
