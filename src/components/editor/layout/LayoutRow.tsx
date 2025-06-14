// ABOUTME: Component to render a layout row containing multiple columns/elements.
// Each "column" in a LayoutRow can be a BlockElement or another LayoutElement (like a nested grid).
import React from 'react';
import { LayoutElement, ReviewBlock, BlockType, GridPosition, LayoutColumn, LayoutRowDefinition } from '@/types/review';
import { SingleBlock } from '../blocks/SingleBlock';
import { LayoutGrid } from './LayoutGrid'; 
import { cn } from '@/lib/utils';
import { DraggableProvided } from '@hello-pangea/dnd';

export interface LayoutRowProps {
  layoutElement: LayoutElement & { type: 'row', columns?: LayoutColumn[] }; // Specify columns type
  blocks: { [key: string]: ReviewBlock };
  onUpdateBlock: (blockId: string, updates: Partial<ReviewBlock>) => void;
  onDeleteBlock: (blockId: string) => void;
  onMoveBlock: (blockId: string, direction: 'up' | 'down') => void; 
  onSelectBlock: (blockId: string | null) => void;
  onAddBlock: (type: BlockType, position?: 'above' | 'below' | number, parentLayoutId?: string, columnIndex?: number) => void;
  onAddBlockToGrid: (type: BlockType, gridId: string, position: GridPosition) => void;
  activeBlockId: string | null;
  readonly?: boolean;
  draggableProvided?: DraggableProvided; 
  isDragging?: boolean; 
}

export const LayoutRow: React.FC<LayoutRowProps> = ({
  layoutElement,
  blocks,
  onUpdateBlock,
  onDeleteBlock,
  onMoveBlock,
  onSelectBlock,
  onAddBlock,
  onAddBlockToGrid,
  activeBlockId,
  readonly,
  draggableProvided,
  isDragging,
}) => {
  const { columns = [], settings } = layoutElement;
  const columnFlexBasis = settings?.columnDistribution === 'even' 
    ? `${100 / Math.max(1, columns.length)}%`
    : undefined;

  return (
    <div 
      ref={draggableProvided?.innerRef}
      {...draggableProvided?.draggableProps}
      {...draggableProvided?.dragHandleProps}
      className={cn(
        "layout-row flex gap-4 my-4 p-2 border border-gray-800 rounded-lg bg-gray-950/30",
        isDragging && "opacity-50 shadow-xl"
      )}
      style={{ ...settings?.style }}
    >
      {columns.map((column, colIndex) => (
        <div 
          key={column.id || `col-${colIndex}`} 
          className="layout-column flex-grow p-1 border border-dashed border-gray-700/50 rounded min-h-[80px] flex flex-col gap-2"
          style={{ flexBasis: columnFlexBasis || column.settings?.width || 'auto', ...column.settings?.style }}
        >
          {column.elements.map((element, elIndex) => {
            if (element.type === 'block' && element.blockId && blocks[element.blockId]) {
              return (
                <SingleBlock
                  key={element.blockId}
                  block={blocks[element.blockId]}
                  index={elIndex} 
                  onUpdateBlock={onUpdateBlock}
                  onDeleteBlock={onDeleteBlock}
                  onMoveBlock={(blockId, dir) => onMoveBlock(blockId, dir)} 
                  onSelectBlock={onSelectBlock}
                  activeBlockId={activeBlockId}
                  readonly={readonly}
                  onAddBlock={(type, pos) => onAddBlock(type, pos, column.id, colIndex)} 
                />
              );
            } else if (element.type === 'grid') {
               const gridElement = element as LayoutElement & { type: 'grid', rows?: LayoutRowDefinition[] };
              return (
                <LayoutGrid
                  key={element.id}
                  layoutElement={gridElement}
                  blocks={blocks}
                  onUpdateBlock={onUpdateBlock}
                  onDeleteBlock={onDeleteBlock}
                  onAddBlockToGrid={onAddBlockToGrid}
                  onActiveBlockChange={onSelectBlock} // Assuming this is correct for active block in grid context
                  activeBlockId={activeBlockId}
                  readonly={readonly}
                />
              );
            }
            return <div key={element.id || elIndex} className="text-xs text-red-500">Unsupported element type in column: {element.type}</div>;
          })}
          {!readonly && column.elements.length === 0 && (
             <div className="flex-grow flex items-center justify-center">
                <button 
                    onClick={() => onAddBlock("text", undefined, column.id, colIndex)} // Use "text"
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
