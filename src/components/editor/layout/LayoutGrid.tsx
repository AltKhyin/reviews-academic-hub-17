// ABOUTME: Renders a 2D grid layout element within the editor.
// Manages cells and the blocks within them.
import React from 'react';
import { LayoutElement, ReviewBlock, BlockType, GridPosition, LayoutRowDefinition } from '@/types/review';
import { BlockContentEditor } from '../BlockContentEditor';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface LayoutGridProps {
  layoutElement: LayoutElement & { type: 'grid', rows?: LayoutRowDefinition[] };
  blocks: { [key: string]: ReviewBlock };
  onUpdateBlock: (blockId: string, updates: Partial<ReviewBlock>) => void;
  onDeleteBlock: (blockId: string) => void;
  onAddBlockToGrid: (type: BlockType, gridId: string, position: GridPosition) => void;
  onActiveBlockChange: (blockId: string | null) => void;
  activeBlockId: string | null;
  readonly?: boolean;
}

export const LayoutGrid: React.FC<LayoutGridProps> = ({
  layoutElement,
  blocks,
  onUpdateBlock,
  onDeleteBlock,
  onAddBlockToGrid,
  onActiveBlockChange,
  activeBlockId,
  readonly,
}) => {
  const { rows = [], settings } = layoutElement;
  const gridTemplateColumns = settings?.columnWidths
    ? settings.columnWidths.map((w: number) => `${w}fr`).join(' ')
    : `repeat(${rows[0]?.cells.length || 1}, 1fr)`;

  return (
    <div
      className="layout-grid my-2 p-2 border border-dashed border-gray-700 rounded-lg"
      style={{
        display: 'grid',
        gridTemplateColumns,
        gap: `${settings?.gap || 16}px`,
        ...settings?.style,
      }}
    >
      {rows.map((row, rowIndex) => (
        <React.Fragment key={row.id}>
          {row.cells.map((cell, colIndex) => {
            const block = cell.blockId ? blocks[cell.blockId] : null;
            const position: GridPosition = { row: rowIndex, column: colIndex };
            
            return (
              <div
                key={cell.id}
                className={cn(
                  "grid-cell min-h-[100px] bg-gray-950/20 rounded-md p-1 flex flex-col justify-center items-center border border-transparent",
                  block && "p-0", // No padding if block exists, it will handle its own
                  !readonly && !block && "border-dashed border-gray-700/50 hover:border-blue-500 hover:bg-gray-900/30",
                )}
                style={{
                  gridColumn: `span ${cell.colSpan || 1}`,
                  gridRow: `span ${cell.rowSpan || 1}`,
                  ...cell.settings?.style,
                }}
                onClick={() => !block && !readonly && onAddBlockToGrid('text', layoutElement.id, position)}
              >
                {block ? (
                  <BlockContentEditor
                    block={block}
                    isActive={activeBlockId === block.id}
                    onSelect={() => onActiveBlockChange(block.id)}
                    onUpdate={onUpdateBlock}
                    onDelete={onDeleteBlock}
                    onMove={() => { /* Move within grid is complex, not handled here */ }}
                    onAddBlock={() => { /* Add within grid is handled by cell click */ }}
                    readonly={readonly}
                  />
                ) : !readonly ? (
                  <Button variant="ghost" size="sm" className="text-gray-500 hover:text-blue-400">
                    <Plus size={16} className="mr-1" />
                    Adicionar Bloco
                  </Button>
                ) : (
                  <div className="text-xs text-gray-600">Célula Vazia</div>
                )}
              </div>
            );
          })}
        </React.Fragment>
      ))}
    </div>
  );
};
