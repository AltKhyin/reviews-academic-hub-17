
// ABOUTME: Component to render a layout row containing multiple columns/elements.
// Each "column" in a LayoutRow can be a BlockElement or another LayoutElement (like a nested grid).
import React from 'react';
import { LayoutElement, ReviewBlock, BlockType, GridPosition } from '@/types/review'; // GridPosition for onAddBlockToGrid
import { SingleBlock } from '../blocks/SingleBlock';
import { LayoutGrid } from './LayoutGrid'; // For nested grids
import { cn } from '@/lib/utils';
import { DraggableProvided } from '@hello-pangea/dnd'; // If rows are draggable

export interface LayoutRowProps {
  layoutElement: LayoutElement & { type: 'row' };
  blocks: { [key: string]: ReviewBlock };
  onUpdateBlock: (blockId: string, updates: Partial<ReviewBlock>) => void;
  onDeleteBlock: (blockId: string) => void;
  onMoveBlock: (blockId: string, direction: 'up' | 'down') => void; // If blocks within a row column are movable
  onSelectBlock: (blockId: string | null) => void;
  onAddBlock: (type: BlockType, position?: 'above' | 'below' | number, parentLayoutId?: string, columnIndex?: number) => void;
  onAddBlockToGrid: (type: BlockType, gridId: string, position: GridPosition) => void; // For grids within rows
  activeBlockId: string | null;
  readonly?: boolean;
  // DND props if the row itself or its columns are draggable/droppable targets
  draggableProvided?: DraggableProvided; // If the whole row is draggable
  isDragging?: boolean; // Visual feedback for dragging
}

export const LayoutRow: React.FC<LayoutRowProps> = ({
  layoutElement,
  blocks,
  onUpdateBlock,
  onDeleteBlock,
  onMoveBlock, // For blocks within a simple column
  onSelectBlock,
  onAddBlock, // For adding blocks to a column in the row
  onAddBlockToGrid, // Specifically for grids nested in this row
  activeBlockId,
  readonly,
  draggableProvided,
  isDragging,
}) => {
  const { columns = [], settings } = layoutElement;
  const columnFlexBasis = settings?.columnDistribution === 'even' 
    ? `${100 / Math.max(1, columns.length)}%`
    : undefined; // undefined will let flex-grow handle it or use custom styles

  return (
    <div 
      ref={draggableProvided?.innerRef}
      {...draggableProvided?.draggableProps}
      {...draggableProvided?.dragHandleProps} // Assuming row drag handle is this div
      className={cn(
        "layout-row flex gap-4 my-4 p-2 border border-gray-800 rounded-lg bg-gray-950/30",
        isDragging && "opacity-50 shadow-xl"
      )}
      style={{ ...settings?.style }} // Apply custom styles from layout settings
    >
      {columns.map((column, colIndex) => (
        <div 
          key={column.id || `col-${colIndex}`} 
          className="layout-column flex-grow p-1 border border-dashed border-gray-700/50 rounded min-h-[80px] flex flex-col gap-2" // Added min-h and gap
          style={{ flexBasis: columnFlexBasis || column.settings?.width || 'auto', ...column.settings?.style }}
        >
          {column.elements.map((element, elIndex) => {
            if (element.type === 'block' && element.blockId && blocks[element.blockId]) {
              return (
                <SingleBlock
                  key={element.blockId}
                  block={blocks[element.blockId]}
                  index={elIndex} // This index is local to the column's elements
                  onUpdateBlock={onUpdateBlock}
                  onDeleteBlock={onDeleteBlock}
                  onMoveBlock={(blockId, dir) => onMoveBlock(blockId, dir)} // Assuming move within this column context
                  onSelectBlock={onSelectBlock}
                  activeBlockId={activeBlockId}
                  readonly={readonly}
                  onAddBlock={(type, pos) => onAddBlock(type, pos, column.id, colIndex)} // Pass column context
                />
              );
            } else if (element.type === 'grid') {
              return (
                <LayoutGrid
                  key={element.id}
                  layoutElement={element as LayoutElement & { type: 'grid' }}
                  blocks={blocks}
                  onUpdateBlock={onUpdateBlock}
                  onDeleteBlock={onDeleteBlock}
                  onAddBlockToGrid={onAddBlockToGrid}
                  onActiveBlockChange={onSelectBlock}
                  activeBlockId={activeBlockId}
                  readonly={readonly}
                />
              );
            }
            // Add rendering for other LayoutElement types if they can be nested in columns
            return <div key={element.id || elIndex} className="text-xs text-red-500">Unsupported element type in column: {element.type}</div>;
          })}
          {!readonly && column.elements.length === 0 && (
             <div className="flex-grow flex items-center justify-center">
                <button 
                    onClick={() => onAddBlock(BlockType.TEXT, undefined, column.id, colIndex)}
                    className="text-gray-500 hover:text-blue-400 text-xs p-2 rounded border border-dashed border-gray-600 hover:border-blue-500"
                >
                    + Add Block to Column
                </button>
             </div>
          )}
        </div>
      ))}
    </div>
  );
};

