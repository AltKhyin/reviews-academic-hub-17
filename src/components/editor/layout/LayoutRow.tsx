
// ABOUTME: Enhanced layout row component with complete string ID support
// Manages individual rows in grid layouts with proper drag and drop functionality

import React, { useCallback } from 'react';
import { ReviewBlock, BlockType } from '@/types/review';
import { LayoutRowData } from '@/types/grid'; // Import LayoutRowData
import { BlockContentEditor } from '../BlockContentEditor';
import { Button } from '@/components/ui/button';
import { Plus, Grid3X3 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LayoutRowProps {
  row: LayoutRowData; // Changed to accept a single row object
  activeBlockId: string | null;
  onActiveBlockChange: (blockId: string | null) => void;
  onUpdateBlock: (blockId: string, updates: Partial<ReviewBlock>) => void;
  onDeleteBlock: (blockId: string) => void;
  onAddBlock: (rowId: string, position: number, blockType: BlockType) => void; // Expects blockType
  onUpdateRow: (rowId: string, updates: Partial<LayoutRowData>) => void; // Added for consistency if needed
  onDeleteRow: (rowId: string) => void; // Added for consistency if needed
  onMoveBlock: (blockId: string, targetRowId: string, targetPosition: number) => void; // Added for consistency
  readonly?: boolean;
  className?: string;
}

export const LayoutRow: React.FC<LayoutRowProps> = ({
  row, // Destructure from row object
  activeBlockId,
  onActiveBlockChange,
  onUpdateBlock,
  onDeleteBlock,
  onAddBlock,
  // onUpdateRow, // Not used in this version of LayoutRow rendering
  // onDeleteRow, // Not used for rendering cells, but for row management
  // onMoveBlock, // For block movement between rows/positions
  readonly,
  className
}) => {
  const { id: rowId, blocks, columns, columnWidths, gap = 4 } = row;

  const handleMoveWithinRow = useCallback((blockId: string, direction: 'up' | 'down') => {
    // This specific movement ('up'/'down') might imply reordering within the row's blocks array
    // or be handled by a higher-level drag-drop. For now, log.
    console.log('LayoutRow block movement (within row context):', { blockId, direction, rowId });
    // If onMoveBlock is intended for inter-row movement, it's handled by parent.
    // If it's for reordering *within* this ResizableGrid-like structure, logic would be here.
  }, [rowId]);

  const handleAddBlockAtPosition = useCallback((type: BlockType, position?: number) => {
    const targetPosition = position !== undefined ? position : blocks.length;
    onAddBlock(rowId, targetPosition, type);
  }, [onAddBlock, rowId, blocks.length]);

  // Simplified for direct add, assumes a default type or gets type from elsewhere if needed by onAddBlock
  const handleAddBlockToColumn = useCallback((columnIndex: number) => {
    // Defaulting to 'paragraph'. If a type picker is involved, this would change.
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
          const block = blocks[index]; // Assuming blocks array is ordered by column
          
          return (
            <div
              key={`layout-row-cell-${rowId}-${index}`}
              className={cn(
                "grid-item border-2 border-dashed rounded min-h-[120px]",
                block ? "border-gray-700 bg-gray-900/20" : "border-gray-800 hover:border-gray-700",
                "transition-all duration-200",
                activeBlockId && block && activeBlockId === block.id && "ring-2 ring-blue-500 border-blue-500"
              )}
              style={{ borderColor: block ? '#374151' : '#2b3245' }} // Slightly different border for empty/filled
            >
              {block ? (
                <BlockContentEditor
                  block={block}
                  isActive={activeBlockId === block.id}
                  isFirst={index === 0} // This concept might change with complex grids
                  isLast={index === columns - 1} // Ditto
                  onSelect={onActiveBlockChange}
                  onUpdate={onUpdateBlock}
                  onDelete={onDeleteBlock}
                  onMove={handleMoveWithinRow} // For movements specific to BlockContentEditor's context
                  onAddBlock={handleAddBlockAtPosition} // For adding blocks via BlockContentEditor's UI
                  readonly={readonly}
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
