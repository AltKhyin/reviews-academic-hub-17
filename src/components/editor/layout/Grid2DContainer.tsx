
// ABOUTME: 2D grid container component with proper TypeScript interfaces and string ID support
import React, { useMemo } from 'react';
import { Grid2DRow } from './Grid2DRow';
import { ReviewBlock } from '@/types/review';
import { Grid2DLayout, GridPosition } from '@/types/grid';

export interface Grid2DContainerProps {
  blocks: ReviewBlock[];
  activeBlockId: string;
  onActiveBlockChange: (blockId: string) => void;
  onUpdateBlock: (blockId: string, updates: Partial<ReviewBlock>) => void;
  onDeleteBlock: (blockId: string) => void;
  onDuplicateBlock: (blockId: string) => void;
  onMoveBlock: (blockId: string, direction: 'up' | 'down') => void;
  onAddRow: () => void;
  onRemoveRow: (rowIndex: number) => void;
  onUpdateColumns: (columns: number) => void;
  gridState: {
    grid: Grid2DLayout;
    setGrid: React.Dispatch<React.SetStateAction<Grid2DLayout>>;
    addRow: (gridId: string, position?: number) => void;
    removeRow: (gridId: string, rowIndex: number) => void;
    addBlock: (gridId: string, position: GridPosition, block: ReviewBlock) => void;
    removeBlock: (gridId: string, position: GridPosition) => void;
    updateColumns: (gridId: string, columns: number) => void;
  };
  onDrop: () => void;
}

export const Grid2DContainer: React.FC<Grid2DContainerProps> = ({
  blocks,
  activeBlockId,
  onActiveBlockChange,
  onUpdateBlock,
  onDeleteBlock,
  onDuplicateBlock,
  onMoveBlock,
  onAddRow,
  onRemoveRow,
  onUpdateColumns,
  gridState,
  onDrop
}) => {
  // Create block lookup for efficiency
  const blockLookup = useMemo(() => {
    const lookup = new Map<string, ReviewBlock>();
    blocks.forEach(block => {
      lookup.set(block.id, block);
    });
    return lookup;
  }, [blocks]);

  const handleCellClick = (position: GridPosition) => {
    const row = gridState.grid.rows[position.row];
    if (row && row.cells[position.column] && row.cells[position.column].block) {
      const blockId = row.cells[position.column].block!.id;
      onActiveBlockChange(blockId);
    }
  };

  const handleBlockAdd = (position: GridPosition, block: ReviewBlock) => {
    gridState.addBlock(gridState.grid.id, position, block);
  };

  const handleBlockRemove = (position: GridPosition) => {
    gridState.removeBlock(gridState.grid.id, position);
  };

  return (
    <div className="grid-2d-container p-4 space-y-4">
      {/* Grid controls */}
      <div className="flex items-center justify-between border-b pb-4">
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium">Grid Layout</span>
          <span className="text-xs text-gray-500">
            {gridState.grid.rows.length} rows × {gridState.grid.columns} columns
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={onAddRow}
            className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Add Row
          </button>
          
          <select
            value={gridState.grid.columns}
            onChange={(e) => onUpdateColumns(Number(e.target.value))}
            className="px-2 py-1 text-xs border rounded"
          >
            <option value={1}>1 Column</option>
            <option value={2}>2 Columns</option>
            <option value={3}>3 Columns</option>
            <option value={4}>4 Columns</option>
          </select>
        </div>
      </div>

      {/* Grid rows */}
      <div className="space-y-2">
        {gridState.grid.rows.map((row, rowIndex) => (
          <Grid2DRow
            key={row.id}
            row={row}
            rowIndex={rowIndex}
            blocks={blocks}
            blockLookup={blockLookup}
            activeBlockId={activeBlockId}
            onActiveBlockChange={onActiveBlockChange}
            onUpdateBlock={onUpdateBlock}
            onDeleteBlock={onDeleteBlock}
            onDuplicateBlock={onDuplicateBlock}
            onMoveBlock={onMoveBlock}
            onCellClick={handleCellClick}
            onBlockAdd={handleBlockAdd}
            onBlockRemove={handleBlockRemove}
            onRemoveRow={() => onRemoveRow(rowIndex)}
          />
        ))}
      </div>

      {/* Empty state */}
      {gridState.grid.rows.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>No grid rows yet. Click "Add Row" to get started.</p>
        </div>
      )}
    </div>
  );
};
