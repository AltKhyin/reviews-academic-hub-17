
// ABOUTME: Resizable 1D grid component with column width controls
// Provides interactive resizing and layout management for 1D grids

import React from 'react';
import { ReviewBlock } from '@/types/review';
import { SingleBlock } from '../blocks/SingleBlock';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface ResizableGridProps {
  rowId: string;
  blocks: ReviewBlock[];
  columns: number;
  gap: number;
  columnWidths?: number[];
  onUpdateLayout: (rowId: string, updates: { columnWidths: number[] }) => void;
  onAddBlock: (rowId: string, position: number) => void;
  onUpdateBlock: (blockId: string, updates: Partial<ReviewBlock>) => void;
  onDeleteBlock: (blockId: string) => void;
  activeBlockId: string | null;
  onActiveBlockChange: (blockId: string | null) => void;
  dragState: any;
  onDragOver: () => void;
  onDragLeave: () => void;
  onDrop: () => void;
}

export const ResizableGrid: React.FC<ResizableGridProps> = ({
  rowId,
  blocks,
  columns,
  gap,
  columnWidths,
  onUpdateLayout,
  onAddBlock,
  onUpdateBlock,
  onDeleteBlock,
  activeBlockId,
  onActiveBlockChange,
  dragState,
  onDragOver,
  onDragLeave,
  onDrop
}) => {
  const effectiveColumnWidths = columnWidths || Array(columns).fill(100 / columns);

  const handleAddBlock = (position: number) => {
    onAddBlock(rowId, position);
  };

  return (
    <div className="resizable-grid p-3 border border-gray-600 rounded-lg bg-gray-800/10">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-gray-400">
          Grid 1D ({columns} columns)
        </span>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => handleAddBlock(blocks.length)}
          className="h-6 w-6 p-0"
        >
          <Plus className="w-3 h-3" />
        </Button>
      </div>

      <div
        className="grid"
        style={{
          gridTemplateColumns: effectiveColumnWidths.map(w => `${w}%`).join(' '),
          gap: `${gap}px`
        }}
      >
        {blocks.map((block, index) => (
          <div key={block.id} className="grid-item">
            <SingleBlock
              block={block}
              globalIndex={index}
              activeBlockId={activeBlockId}
              dragState={dragState}
              onActiveBlockChange={onActiveBlockChange}
              onUpdateBlock={onUpdateBlock}
              onDeleteBlock={onDeleteBlock}
              onDuplicateBlock={() => {}}
              onConvertToGrid={() => {}}
              onConvertTo2DGrid={() => {}}
              onAddBlockBetween={handleAddBlock}
              onDragStart={() => {}}
              onDragEnd={() => {}}
              onDragOver={() => {}}
              onDragLeave={() => {}}
              onDrop={() => {}}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
