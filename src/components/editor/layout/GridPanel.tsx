
// ABOUTME: Grid panel with drag & drop support and string ID consistency
// Fixed to use standardized string IDs throughout the component

import React, { useState, useCallback } from 'react';
import { ReviewBlock } from '@/types/review';
import { LayoutRowData } from '@/types/grid';
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

  // Convert to LayoutRowData format
  const layoutRows: LayoutRowData[] = Object.entries(groupedBlocks).map(([rowId, rowBlocks]) => {
    const firstBlock = rowBlocks[0];
    const columns = firstBlock?.meta?.layout?.columns || Math.max(1, rowBlocks.length);
    
    return {
      id: rowId,
      blocks: rowBlocks,
      columns: columns,
      columnWidths: firstBlock?.meta?.layout?.columnWidths
    };
  });

  const handleRowActivation = useCallback((rowId: string | null) => {
    setActiveRowId(rowId);
  }, []);

  const handleUpdateRow = useCallback((rowId: string, updates: Partial<LayoutRowData>) => {
    console.log('Updating row:', { rowId, updates });
    // Update all blocks in the row with the new configuration
    const rowBlocks = groupedBlocks[rowId] || [];
    rowBlocks.forEach(block => {
      onUpdateBlock(block.id, {
        meta: {
          ...block.meta,
          layout: {
            ...block.meta?.layout,
            ...updates
          }
        }
      });
    });
  }, [groupedBlocks, onUpdateBlock]);

  const handleDeleteRow = useCallback((rowId: string) => {
    console.log('Deleting row:', rowId);
    const rowBlocks = groupedBlocks[rowId] || [];
    rowBlocks.forEach(block => {
      onDeleteBlock(block.id);
    });
  }, [groupedBlocks, onDeleteBlock]);

  const handleAddBlockToRow = useCallback((rowId: string, position: number, blockType: string) => {
    console.log('Adding block to row:', { rowId, position, blockType });
    onAddBlock(blockType, position);
  }, [onAddBlock]);

  return (
    <div className="grid-panel space-y-6">
      {/* Grid Controls */}
      <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg border border-gray-600">
        <div className="flex items-center gap-2">
          <Grid3X3 className="w-5 h-5 text-blue-500" />
          <span className="text-sm text-gray-300">
            {layoutRows.length} linha(s) de layout
          </span>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => console.log('Add new row')}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Nova Linha
        </Button>
      </div>

      {/* Layout Rows */}
      <div className="space-y-6">
        {layoutRows.map((row, index) => (
          <LayoutRow
            key={row.id}
            row={row}
            onUpdateRow={handleUpdateRow}
            onDeleteRow={handleDeleteRow}
            onAddBlock={handleAddBlockToRow}
            onUpdateBlock={onUpdateBlock}
            onMoveBlock={onMoveBlock}
            onDeleteBlock={onDeleteBlock}
            readonly={false}
          />
        ))}
      </div>

      {/* Empty State */}
      {layoutRows.length === 0 && (
        <div className="text-center py-12 border-2 border-dashed border-gray-600 rounded-lg">
          <div className="text-gray-400">
            <Grid3X3 className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">Nenhum layout em grid</h3>
            <p className="text-sm mb-4">Crie layouts em grid para organizar seus blocos</p>
            <Button
              onClick={() => console.log('Create first grid')}
              className="mx-auto"
            >
              <Plus className="w-4 h-4 mr-2" />
              Criar Primeiro Grid
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
