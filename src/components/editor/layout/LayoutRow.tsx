
// ABOUTME: Layout row component for organizing blocks in columns
// Provides column-based layout with drag & drop support

import React from 'react';
import { ReviewBlock } from '@/types/review';
import { Button } from '@/components/ui/button';
import { Columns, Trash2, Plus } from 'lucide-react';

export interface LayoutRowData {
  id: string;
  blocks: ReviewBlock[];
  columns: number;
  columnWidths?: number[];
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
  const handleColumnChange = (newColumns: number) => {
    onUpdateRow(row.id, { columns: newColumns });
  };

  const handleDeleteRow = () => {
    onDeleteRow(row.id);
  };

  const handleAddBlock = (position: number) => {
    onAddBlock(row.id, position, 'paragraph');
  };

  return (
    <div className="layout-row border border-gray-600 rounded-lg p-4">
      {/* Row Header */}
      {!readonly && (
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Columns className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-300">
              {row.columns} {row.columns === 1 ? 'coluna' : 'colunas'}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4].map(cols => (
                <Button
                  key={cols}
                  variant={row.columns === cols ? "default" : "ghost"}
                  size="sm"
                  onClick={() => handleColumnChange(cols)}
                  className="h-7 w-7 p-0 text-xs"
                >
                  {cols}
                </Button>
              ))}
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDeleteRow}
              className="h-7 w-7 p-0 text-red-400"
              title="Excluir linha"
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        </div>
      )}

      {/* Columns Grid */}
      <div
        className="grid gap-4"
        style={{
          gridTemplateColumns: row.columnWidths
            ? row.columnWidths.map(w => `${w}%`).join(' ')
            : `repeat(${row.columns}, 1fr)`
        }}
      >
        {Array.from({ length: row.columns }).map((_, colIndex) => {
          const columnBlocks = row.blocks.filter(
            block => block.meta?.layout?.grid_position?.column === colIndex
          );

          return (
            <div
              key={colIndex}
              className="layout-column min-h-[120px] border-2 border-dashed border-gray-600 rounded-lg p-3"
            >
              <div className="text-xs text-gray-400 mb-2">
                Coluna {colIndex + 1}
              </div>
              
              {columnBlocks.length === 0 ? (
                <div className="flex items-center justify-center h-20">
                  {!readonly && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleAddBlock(colIndex)}
                      className="text-gray-400 hover:text-white"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Adicionar Bloco
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  {columnBlocks.map(block => (
                    <div key={block.id} className="p-2 bg-gray-800 rounded border">
                      <div className="text-xs text-gray-400 mb-1">
                        {block.type}
                      </div>
                      <div className="text-sm text-gray-200 truncate">
                        {JSON.stringify(block.content).substring(0, 50)}...
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
