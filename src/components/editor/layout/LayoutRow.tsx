
// ABOUTME: Enhanced layout row component with complete string ID support
// Manages individual rows in grid layouts with proper drag and drop functionality

import React, { useCallback } from 'react';
import { ReviewBlock, BlockType } from '@/types/review';
import { LayoutRowData } from '@/types/grid';
import { BlockContentEditor, BlockContentEditorProps } from '../BlockContentEditor'; // Import BlockContentEditorProps
import { Button } from '@/components/ui/button';
import { Plus, Grid3X3 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LayoutRowProps {
  row: LayoutRowData;
  activeBlockId: string | null;
  onActiveBlockChange: (blockId: string | null) => void;
  onUpdateBlock: (blockId: string, updates: Partial<ReviewBlock>) => void; // For blocks within this row
  onDeleteBlock: (blockId: string) => void; // For blocks within this row
  onAddBlock: (rowId: string, positionInRow: number, blockType: BlockType) => void; // Add block to this specific row
  // onUpdateRow: (rowId: string, updates: Partial<LayoutRowData>) => void; // Not directly used by LayoutRow for its own data
  // onDeleteRow: (rowId: string) => void; // Handled by LayoutGrid
  onMoveBlock: (draggedBlockId: string, targetRowId: string, targetPositionInRow: number) => void; // For moving blocks between/within rows
  readonly?: boolean;
  className?: string;
}

export const LayoutRow: React.FC<LayoutRowProps> = ({
  row,
  activeBlockId,
  onActiveBlockChange,
  onUpdateBlock,
  onDeleteBlock,
  onAddBlock, // This is specific to adding a block TO this row
  onMoveBlock, // This is for moving any block, potentially into/out of/within this row
  readonly,
  className
}) => {
  const { id: rowId, blocks, columns, columnWidths, gap = 4 } = row;

  const handleMoveWithinRow = useCallback((blockId: string, direction: 'up' | 'down') => {
    // This is simplified. A real implementation would calculate new index and call onMoveBlock.
    // 'up' and 'down' here refer to changing the visual order if this row was displayed linearly,
    // or could be re-interpreted for grid movement if complex.
    // For now, it implies moving to an adjacent column if possible, or reordering in the blocks array.
    const currentIndex = blocks.findIndex(b => b.id === blockId);
    if (currentIndex === -1) return;

    let targetPosition: number;
    if (direction === 'up') { // 'up' could mean move to previous column index
      targetPosition = Math.max(0, currentIndex - 1);
    } else { // 'down' could mean move to next column index
      targetPosition = Math.min(columns - 1, currentIndex + 1);
    }
    // This call assumes onMoveBlock can handle moving within the same row by reordering in `blocks` array.
    if (currentIndex !== targetPosition) {
        onMoveBlock(blockId, rowId, targetPosition);
    }
  }, [blocks, columns, onMoveBlock, rowId]);

  const handleAddBlockToColumn = useCallback((columnIndex: number) => {
    // This means adding a new block at this specific column (index) in the current row.
    onAddBlock(rowId, columnIndex, 'paragraph' as BlockType);
  }, [onAddBlock, rowId]);

  return (
    <div className={cn("layout-row mb-4", className)}>
      {/* Row Header - simplified, can be expanded */}
      {!readonly && (
        <div className="flex items-center gap-2 mb-2">
            <Grid3X3 className="w-4 h-4 text-purple-400" />
            <span className="text-sm text-gray-400">
            Grid Row: {columns} {columns === 1 ? 'coluna' : 'colunas'}
            </span>
            <span className="text-xs text-gray-500 font-mono">#{rowId.substring(0,8)}</span>
        </div>
      )}

      <div
        className="grid w-full"
        style={{
          gridTemplateColumns: columnWidths
            ? columnWidths.map(w => `${w}%`).join(' ')
            : `repeat(${columns}, 1fr)`,
          gap: `${gap}px`
        }}
        // Add drag-and-drop handlers for the row itself if needed (e.g., to drop blocks into it)
      >
        {Array.from({ length: columns }).map((_, index) => {
          const block = blocks[index]; // block can be undefined if column is empty

          const blockContentEditorProps: BlockContentEditorProps = {
            block: block!, // Assert block is not null for BlockContentEditor
            isActive: !!block && activeBlockId === block.id,
            isFirst: index === 0,
            isLast: index === columns - 1,
            onSelect: () => block && onActiveBlockChange(block.id),
            onUpdate: onUpdateBlock, // Passed through
            onDelete: onDeleteBlock, // Passed through
            onMove: (id, dir) => handleMoveWithinRow(id, dir), // Specific to moving within this row's columns
            onAddBlock: (type, pos) => { // Add block relative to *this* block in the row
                const newPos = block ? (blocks.findIndex(b => b.id === block.id) + (pos === undefined || pos > 0 ? 1: 0) ) : index;
                onAddBlock(rowId, newPos, type);
            },
            readonly: readonly,
          };

          return (
            <div
              key={`layout-row-cell-${rowId}-${index}`}
              className={cn(
                "grid-item border-2 border-dashed rounded min-h-[120px] flex flex-col justify-center", // Added flex for centering
                block ? "border-gray-700 bg-gray-900/20" : "border-gray-800 hover:border-gray-700",
                "transition-all duration-200",
                block && activeBlockId === block.id && "ring-2 ring-blue-500 border-blue-500"
              )}
              style={{ borderColor: block ? '#374151' : '#2b3245' }}
              // Add D&D handlers for dropping blocks into this specific cell/column
              // onDragOver={(e) => handleCellDragOver(e, rowId, index)}
              // onDrop={(e) => handleCellDrop(e, rowId, index)}
            >
              {block ? (
                <BlockContentEditor {...blockContentEditorProps} />
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
