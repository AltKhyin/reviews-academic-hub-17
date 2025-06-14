
// ABOUTME: Component to render a layout row containing multiple columns/elements.
// Each "column" in a LayoutRow can be a BlockElement or another LayoutElement (like a nested grid).
import React from 'react';
import { LayoutElement, ReviewBlock, BlockType, GridPosition, LayoutColumn, AddBlockOptions } from '@/types/review';
import { BlockContentEditor } from '../BlockContentEditor';
import { LayoutGrid } from './LayoutGrid'; 
import { cn } from '@/lib/utils';
import { GripVertical } from 'lucide-react';

export interface LayoutRowProps {
  layoutElement: LayoutElement & { type: 'row', columns?: LayoutColumn[] };
  blocks: { [key: string]: ReviewBlock };
  onUpdateBlock: (blockId: string, updates: Partial<ReviewBlock>) => void;
  onDeleteBlock: (blockId: string) => void;
  onMoveElement: (layoutElementId: string, direction: 'up' | 'down') => void;
  onSelectBlock: (blockId: string | null) => void;
  onAddBlock: (options: Partial<AddBlockOptions> & { type: BlockType }) => void;
  onAddBlockToGrid: (type: BlockType, gridId: string, position: GridPosition) => void;
  activeBlockId: string | null;
  readonly?: boolean;
  index: number;
}

const renderElement = (
  element: LayoutElement,
  props: Omit<LayoutRowProps, 'layoutElement' | 'index'>,
  elementIndex: number
) => {
  const { blocks, activeBlockId, onSelectBlock, onUpdateBlock, onDeleteBlock, onAddBlock, onAddBlockToGrid, readonly } = props;

  switch (element.type) {
    case 'block_container':
      const blockId = (element as any).blockId;
      if (!blockId || !blocks[blockId]) {
        return <div key={element.id} className="text-red-500 p-1">Block not found: {blockId}</div>;
      }
      const block = blocks[blockId];
      // Here we render the content editor directly as it's inside a column, not a draggable list item itself.
      return (
        <BlockContentEditor
          key={element.id}
          block={block}
          isActive={activeBlockId === block.id}
          onSelect={() => onSelectBlock(block.id)}
          onUpdate={onUpdateBlock}
          onDelete={onDeleteBlock}
          onMove={() => { /* Not directly movable */ }}
          onAddBlock={onAddBlock}
          readonly={readonly}
        />
      );

    case 'row':
      return (
        <LayoutRow
          key={element.id}
          layoutElement={element as LayoutElement & { type: 'row' }}
          index={elementIndex}
          {...props}
        />
      );

    case 'grid':
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

    default:
      const unknownElement = element as any;
      return <div key={unknownElement.id || elementIndex} className="text-xs text-yellow-400 p-1">Unsupported element: {unknownElement.type}</div>;
  }
};

export const LayoutRow: React.FC<LayoutRowProps> = (props) => {
  const { layoutElement, readonly } = props;
  const { columns = [], settings } = layoutElement;
  const columnFlexBasis = settings?.columnDistribution === 'even' 
    ? `${100 / Math.max(1, columns.length)}%`
    : undefined;

  return (
    <div 
      className={cn(
        "layout-row flex gap-4 my-2 p-2 border border-gray-800/50 rounded-lg bg-gray-900/20 relative group/row",
      )}
      style={{ ...settings?.style }}
    >
      {/* Drag handle is now managed by the parent Draggable wrapper in BlockList */}
      {!readonly && (
          <div className="absolute top-1/2 -left-8 -translate-y-1/2 p-1 cursor-grab opacity-0 group-hover/row:opacity-100 text-gray-500 hover:text-gray-300 z-10 bg-gray-700/80 rounded-sm transition-opacity"
            aria-label="Move row"
          >
            <GripVertical size={16} />
          </div>
      )}
      {columns.map((column, colIndex) => (
        <div 
          key={column.id || `col-${colIndex}`} 
          className="layout-column flex-1 flex flex-col gap-2 min-w-0" // Added min-w-0 to prevent overflow
          style={{
            flexBasis: column.settings?.width || columnFlexBasis,
            ...column.settings?.style,
          }}
        >
          {column.elements.map((element, elementIndex) => 
            renderElement(element, props, elementIndex)
          )}
        </div>
      ))}
    </div>
  );
};
