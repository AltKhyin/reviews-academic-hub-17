
// ABOUTME: Component to render a layout row containing multiple columns/elements.
// Each "column" in a LayoutRow can be a BlockElement or another LayoutElement (like a nested grid).
import React from 'react';
import { LayoutElement, ReviewBlock, BlockType, GridPosition, LayoutColumn, LayoutRowDefinition, ElementDefinition } from '@/types/review';
import { SingleBlock } from '../blocks/SingleBlock';
import { LayoutGrid } from './LayoutGrid'; 
import { cn } from '@/lib/utils';
import { Draggable, DraggableProvided, DraggableStateSnapshot } from '@hello-pangea/dnd'; // Import Draggable parts

export interface LayoutRowProps {
  layoutElement: LayoutElement & { type: 'row', columns?: LayoutColumn[] };
  blocks: { [key: string]: ReviewBlock };
  onUpdateBlock: (blockId: string, updates: Partial<ReviewBlock>) => void;
  onDeleteBlock: (blockId: string) => void; // Deletes the block and potentially its LayoutElement
  onMoveElement: (layoutElementId: string, direction: 'up' | 'down') => void; // Moves the LayoutElement itself
  onSelectBlock: (blockId: string | null) => void;
  onAddBlock: (type: BlockType, options: { insertAtIndex?: number; parentElementId?: string; targetPosition?: GridPosition | number; relativeToLayoutElementId?: string; position?: 'above' | 'below' }) => void;
  onAddBlockToGrid: (type: BlockType, gridId: string, position: GridPosition) => void;
  activeBlockId: string | null;
  readonly?: boolean;
  // DND props are typically provided by BlockList if LayoutRow elements are draggable
  index: number; // Index for Draggable
}

export const LayoutRow: React.FC<LayoutRowProps> = ({
  layoutElement,
  blocks,
  onUpdateBlock,
  onDeleteBlock,
  onMoveElement,
  onSelectBlock,
  onAddBlock,
  onAddBlockToGrid,
  activeBlockId,
  readonly,
  index,
}) => {
  const { columns = [], settings } = layoutElement;
  const columnFlexBasis = settings?.columnDistribution === 'even' 
    ? `${100 / Math.max(1, columns.length)}%`
    : undefined;

  // Actions for the row itself, like delete row, move row, add column etc. would go here
  // For now, focusing on rendering content.

  // If the LayoutRow itself is draggable:
  return (
    <Draggable draggableId={layoutElement.id} index={index} isDragDisabled={readonly} type="LAYOUT_ELEMENT">
      {(provided: DraggableProvided, snapshot: DraggableStateSnapshot) => (
        <div 
          ref={provided.innerRef}
          {...provided.draggableProps}
          // {...provided.dragHandleProps} // Drag handle could be specific part of row UI
          className={cn(
            "layout-row flex gap-4 my-2 p-2 border border-gray-800 rounded-lg bg-gray-950/30 relative",
            snapshot.isDragging && "opacity-70 shadow-xl",
            // Add group class for hover effects if needed
          )}
          style={{ ...settings?.style }}
        >
          {!readonly && (
            <div {...provided.dragHandleProps} className="absolute top-1 left-1 p-1 cursor-grab opacity-50 hover:opacity-100 text-gray-500 hover:text-gray-300 z-10 bg-gray-800 rounded-sm">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="12" r="1"/><circle cx="9" cy="5" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="19" r="1"/></svg>
            </div>
          )}
          {columns.map((column, colIndex) => (
            <div 
              key={column.id || `col-${colIndex}`} 
              className="layout-column flex-grow p-1 border border-dashed border-gray-700/50 rounded min-h-[80px] flex flex-col gap-2"
              style={{ flexBasis: columnFlexBasis || column.settings?.width || 'auto', ...column.settings?.style }}
            >
              {column.elements.map((elementDef, elIndex) => {
                // Assuming elementDef is correctly typed as ElementDefinition
                // If elementDef is a LayoutElement of type 'block_container'
                if (elementDef.type === 'block' && elementDef.blockId && blocks[elementDef.blockId]) {
                  // This 'block' ElementDefinition needs to be wrapped as a LayoutElement for SingleBlock
                  const syntheticLayoutElement: LayoutElement & { type: 'block_container', blockId: string } = {
                    id: elementDef.id || `${layoutElement.id}-col${colIndex}-el${elIndex}`, // Ensure an ID for the synthetic element
                    type: 'block_container', // Treat as block_container for SingleBlock
                    blockId: elementDef.blockId,
                    settings: elementDef.settings,
                  };
                  return (
                    <SingleBlock
                      key={elementDef.id || elementDef.blockId} // Use elementDef.id if available
                      layoutElement={syntheticLayoutElement}
                      block={blocks[elementDef.blockId]}
                      index={elIndex} // Index within this column's elements
                      onUpdateBlock={onUpdateBlock}
                      onDeleteBlock={onDeleteBlock} // This deletes the block itself
                      onMoveElement={(elemId, dir) => {
                        // Moving a block within a column is complex, not just up/down in root list.
                        // This needs a new handler: onMoveBlockInColumn(columnId, elementDefId, direction)
                        console.warn("Moving block within column not directly supported by onMoveElement. Element ID:", elemId, "Block ID:", elementDef.blockId);
                        // For now, onMoveElement here would refer to moving the whole LayoutRow if it's the one being moved.
                      }}
                      onSelectBlock={onSelectBlock}
                      activeBlockId={activeBlockId}
                      readonly={readonly}
                      onAddBlock={(type, position, _relativeToId) => {
                        // Adding block relative to another block within this column
                        onAddBlock(type, { parentElementId: column.id, targetPosition: elIndex, position });
                      }}
                    />
                  );
                } else if (elementDef.type === 'grid') {
                  const gridElement = elementDef as LayoutElement & { type: 'grid', rows?: LayoutRowDefinition[] };
                  return (
                    <LayoutGrid
                      key={elementDef.id}
                      layoutElement={gridElement}
                      blocks={blocks}
                      onUpdateBlock={onUpdateBlock}
                      onDeleteBlock={onDeleteBlock}
                      onAddBlockToGrid={onAddBlockToGrid}
                      onActiveBlockChange={onSelectBlock}
                      activeBlockId={activeBlockId}
                      readonly={readonly}
                    />
                  );
                }  else if (elementDef.type === 'row') { // Nested row
                    const nestedRowElement = elementDef as LayoutElement & { type: 'row', columns?: LayoutColumn[] };
                    return (
                        <LayoutRow
                            key={elementDef.id}
                            layoutElement={nestedRowElement}
                            blocks={blocks}
                            onUpdateBlock={onUpdateBlock}
                            onDeleteBlock={onDeleteBlock}
                            onMoveElement={onMoveElement} // This moves the nested row itself if it were top-level
                            onSelectBlock={onSelectBlock}
                            onAddBlock={onAddBlock}
                            onAddBlockToGrid={onAddBlockToGrid}
                            activeBlockId={activeBlockId}
                            readonly={readonly}
                            index={elIndex} // Index if nested rows can be reordered within the column
                        />
                    );
                }
                return <div key={elementDef.id || elIndex} className="text-xs text-red-500 p-1 bg-red-900/20 rounded">Unsupported element: {elementDef.type} (ID: {elementDef.id})</div>;
              })}
              {!readonly && column.elements.length === 0 && (
                 <div className="flex-grow flex items-center justify-center">
                    <button 
                        onClick={() => onAddBlock("text", { parentElementId: column.id, targetPosition: 0 })}
                        className="text-gray-500 hover:text-blue-400 text-xs p-2 rounded border border-dashed border-gray-600 hover:border-blue-500"
                    >
                        + Add Block
                    </button>
                 </div>
              )}
            </div>
          ))}
        </div>
      )}
    </Draggable>
  );
};

