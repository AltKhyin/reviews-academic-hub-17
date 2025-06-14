
// ABOUTME: 2D grid row component with proper event handling and TypeScript interfaces
import React from 'react';
import { Grid2DCell } from './Grid2DCell';
import { ReviewBlock } from '@/types/review';
import { GridRow, GridPosition } from '@/types/grid';

interface Grid2DRowProps {
  row: GridRow;
  rowIndex: number;
  blocks: ReviewBlock[];
  blockLookup: Map<string, ReviewBlock>;
  activeBlockId: string;
  onActiveBlockChange: (blockId: string) => void;
  onUpdateBlock: (blockId: string, updates: Partial<ReviewBlock>) => void;
  onDeleteBlock: (blockId: string) => void;
  onDuplicateBlock: (blockId: string) => void;
  onMoveBlock: (blockId: string, direction: 'up' | 'down') => void;
  onCellClick: (position: GridPosition) => void;
  onBlockAdd: (position: GridPosition, block: ReviewBlock) => void;
  onBlockRemove: (position: GridPosition) => void;
  onRemoveRow: () => void;
}

export const Grid2DRow: React.FC<Grid2DRowProps> = ({
  row,
  rowIndex,
  blocks,
  blockLookup,
  activeBlockId,
  onActiveBlockChange,
  onUpdateBlock,
  onDeleteBlock,
  onDuplicateBlock,
  onMoveBlock,
  onCellClick,
  onBlockAdd,
  onBlockRemove,
  onRemoveRow
}) => {
  const handleCellClick = (cellPosition: number) => {
    const position: GridPosition = {
      row: rowIndex,
      column: cellPosition
    };
    onCellClick(position);
  };

  const handleBlockAdd = (cellPosition: number, block: ReviewBlock) => {
    const position: GridPosition = {
      row: rowIndex,
      column: cellPosition
    };
    onBlockAdd(position, block);
  };

  const handleBlockRemove = (cellPosition: number) => {
    const position: GridPosition = {
      row: rowIndex,
      column: cellPosition
    };
    onBlockRemove(position);
  };

  return (
    <div className="grid-row border border-gray-200 rounded-lg overflow-hidden">
      {/* Row header */}
      <div className="flex items-center justify-between bg-gray-50 px-3 py-2 text-sm">
        <span className="font-medium">Row {rowIndex + 1}</span>
        <button
          onClick={onRemoveRow}
          className="text-red-500 hover:text-red-700 text-xs"
        >
          Remove Row
        </button>
      </div>

      {/* Row cells */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 p-2">
        {row.cells.map((cell, cellIndex) => {
          const block = cell.block ? blockLookup.get(cell.block.id) : null;
          
          return (
            <Grid2DCell
              key={cell.id}
              cell={cell}
              cellIndex={cellIndex}
              block={block}
              isActive={activeBlockId === cell.block?.id}
              onActiveBlockChange={onActiveBlockChange}
              onUpdateBlock={onUpdateBlock}
              onDeleteBlock={onDeleteBlock}
              onDuplicateBlock={onDuplicateBlock}
              onMoveBlock={onMoveBlock}
              onCellClick={() => handleCellClick(cellIndex)}
              onBlockAdd={(block) => handleBlockAdd(cellIndex, block)}
              onBlockRemove={() => handleBlockRemove(cellIndex)}
            />
          );
        })}
      </div>
    </div>
  );
};
