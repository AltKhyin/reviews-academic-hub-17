
// ABOUTME: Grid panel with drag & drop support and string ID consistency
// Fixed to use standardized string IDs throughout the component

import React, { useState, useCallback } from 'react';
import { ReviewBlock } from '@/types/review';
import { GridPosition } from '@/types/grid';
import { LayoutRow } from './LayoutRow';
import { Button } from '@/components/ui/button';
import { Grid3X3, Plus } from 'lucide-react';

interface GridPanelProps {
  blocks: ReviewBlock[];
  onUpdateBlock: (blockId: string, updates: Partial<ReviewBlock>) => void;
  onDeleteBlock: (blockId: string) => void;
  onAddBlock: (type: any, position?: number) => string;
  onMoveBlock: (blockId: string, direction: 'up' | 'down') => void;
  dragState: any;
  onDragStart: (blockId: string) => void;
  onDragOver: (e: React.DragEvent, targetId: string, position?: number, targetType?: string) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, targetId: string, position?: number, dropType?: string) => void;
  onDragEnd: () => void;
}

export const GridPanel: React.FC<GridPanelProps> = ({
  blocks,
  onUpdateBlock,
  onDeleteBlock,
  onAddBlock,
  onMoveBlock,
  dragState,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  onDragEnd
}) => {
  const [activeRowId, setActiveRowId] = useState<string | null>(null);

  // Group blocks by row_id
  const groupedBlocks = blocks.reduce((acc, block) => {
    const rowId = block.meta?.layout?.row_id;
    if (rowId) {
      if (!acc[rowId]) {
        acc[rowId] = [];
      }
      acc[rowId].push(block);
    }
    return acc;
  }, {} as Record<string, ReviewBlock[]>);

  const handleRowActivation = useCallback((rowId: string | null) => {
    setActiveRowId(rowId);
  }, []);

  const handleAddRowAbove = useCallback((rowId: string, rowIndex: number) => {
    console.log('Adding row above:', { rowId, rowIndex });
    // Implementation for adding row above
  }, []);

  const handleAddRowBelow = useCallback((rowId: string, rowIndex: number) => {
    console.log('Adding row below:', { rowId, rowIndex });
    // Implementation for adding row below
  }, []);

  const handleRemoveRow = useCallback((rowId: string, rowIndex: number) => {
    console.log('Removing row:', { rowId, rowIndex });
    // Implementation for removing row
  }, []);

  const handleBlockDrop = useCallback((
    draggedBlockId: string,
    targetRowId: string,
    targetPosition?: number,
    dropType?: string
  ) => {
    const event = new CustomEvent('dragEvent') as any;
    onDrop(event, targetRowId, targetPosition, dropType);
  }, [onDrop]);

  if (Object.keys(groupedBlocks).length === 0) {
    return (
      <div className="grid-panel-empty text-center py-8 text-gray-400">
        <Grid3X3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>Nenhum layout em grid encontrado.</p>
        <p className="text-sm mt-2">Arraste blocos para criar layouts em grade.</p>
      </div>
    );
  }

  return (
    <div className="grid-panel space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Layouts em Grid</h3>
        <span className="text-sm text-gray-400">
          {Object.keys(groupedBlocks).length} linha(s)
        </span>
      </div>

      {Object.entries(groupedBlocks).map(([rowId, rowBlocks], index) => (
        <LayoutRow
          key={rowId}
          rowId={rowId}
          blocks={rowBlocks}
          rowIndex={index}
          isActive={activeRowId === rowId}
          onActivate={handleRowActivation}
          onUpdateBlock={onUpdateBlock}
          onDeleteBlock={onDeleteBlock}
          onMoveBlock={onMoveBlock}
          onAddRowAbove={handleAddRowAbove}
          onAddRowBelow={handleAddRowBelow}
          onRemoveRow={handleRemoveRow}
          dragState={dragState}
          onDragStart={onDragStart}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={handleBlockDrop}
        />
      ))}

      <div className="text-center">
        <Button
          onClick={() => onAddBlock('paragraph')}
          variant="outline"
          size="sm"
          className="border-dashed"
        >
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Novo Layout
        </Button>
      </div>
    </div>
  );
};
