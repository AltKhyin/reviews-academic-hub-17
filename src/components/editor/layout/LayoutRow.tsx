
// ABOUTME: Layout row component with standardized string ID usage
// Fixed to export LayoutRowData interface and use consistent string IDs

import React from 'react';
import { ReviewBlock } from '@/types/review';
import { Button } from '@/components/ui/button';
import { Trash2, Plus, GripHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface LayoutRowData {
  id: string;
  columns: number;
  blocks: ReviewBlock[];
  style?: {
    gap?: number;
    padding?: number;
    background?: string;
  };
}

interface LayoutRowProps {
  row: LayoutRowData;
  onUpdateRow: (rowId: string, updates: Partial<LayoutRowData>) => void;
  onDeleteRow: (rowId: string) => void;
  onAddBlock: (rowId: string, position: number, blockType: string) => void;
  onUpdateBlock: (blockId: string, updates: Partial<ReviewBlock>) => void;
  onMoveBlock: (blockId: string, direction: 'up' | 'down') => void;
  onDeleteBlock: (blockId: string) => void;
  readonly?: boolean;
}

export const LayoutRow: React.FC<LayoutRowProps> = ({
  row,
  onUpdateRow,
  onDeleteRow,
  onAddBlock,
  onUpdateBlock,
  onMoveBlock,
  onDeleteBlock,
  readonly = false
}) => {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-2', 
    3: 'grid-cols-3',
    4: 'grid-cols-4'
  }[row.columns] || 'grid-cols-1';

  const handleAddBlock = (position: number) => {
    onAddBlock(row.id, position, 'paragraph');
  };

  const handleDeleteRow = () => {
    onDeleteRow(row.id);
  };

  return (
    <div className="layout-row border border-gray-600 rounded-lg p-4 bg-gray-800/30">
      {/* Row Header */}
      {!readonly && (
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-700">
          <div className="flex items-center gap-2">
            <GripHorizontal className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-300">
              Linha {row.columns} coluna(s)
            </span>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDeleteRow}
            className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Row Content Grid */}
      <div className={cn("grid gap-4", gridCols)}>
        {Array.from({ length: row.columns }).map((_, colIndex) => {
          const columnBlocks = row.blocks.filter(block => 
            block.meta?.layout?.column === colIndex
          );

          return (
            <div
              key={colIndex}
              className="layout-column min-h-[100px] border-2 border-dashed border-gray-600 rounded-lg p-3"
            >
              {columnBlocks.length > 0 ? (
                <div className="space-y-3">
                  {columnBlocks.map((block) => (
                    <div
                      key={block.id}
                      className="block-wrapper p-3 bg-gray-700/50 rounded border border-gray-600"
                    >
                      <div className="text-sm text-gray-300 mb-2">
                        Bloco: {block.type}
                      </div>
                      {!readonly && (
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onMoveBlock(block.id, 'up')}
                            className="text-gray-400 hover:text-gray-200"
                          >
                            ↑
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onMoveBlock(block.id, 'down')}
                            className="text-gray-400 hover:text-gray-200"
                          >
                            ↓
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDeleteBlock(block.id)}
                            className="text-red-400 hover:text-red-300"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                !readonly && (
                  <div className="flex items-center justify-center h-full">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleAddBlock(colIndex)}
                      className="text-gray-400 hover:text-gray-200"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Adicionar Bloco
                    </Button>
                  </div>
                )
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
