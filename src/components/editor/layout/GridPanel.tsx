
// ABOUTME: Enhanced grid panel component with proper string ID support
// Provides grid visualization and management controls

import React from 'react';
import { ReviewBlock } from '@/types/review';
import { Button } from '@/components/ui/button';
import { Grid3X3, Plus, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GridPanelProps {
  blocks: ReviewBlock[];
  rowId: string;
  columns: number;
  activeBlockId: string | null;
  onAddBlock: (rowId: string, position: number) => void;
  onUpdateBlock: (blockId: string, updates: Partial<ReviewBlock>) => void;
  onDeleteBlock: (blockId: string) => void;
  onActiveBlockChange: (blockId: string | null) => void;
}

export const GridPanel: React.FC<GridPanelProps> = ({
  blocks,
  rowId,
  columns,
  activeBlockId,
  onAddBlock,
  onUpdateBlock,
  onDeleteBlock,
  onActiveBlockChange
}) => {
  const handleBlockClick = (blockId: string) => {
    onActiveBlockChange(blockId);
  };

  const handleAddBlock = (position: number) => {
    onAddBlock(rowId, position);
  };

  const handleDeleteBlock = (blockId: string) => {
    onDeleteBlock(blockId);
  };

  return (
    <div className="grid-panel border border-gray-600 rounded-lg p-4 mb-4 bg-gray-900/10">
      {/* Grid Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Grid3X3 className="w-4 h-4 text-purple-400" />
          <span className="text-sm font-medium text-gray-300">
            Grid: {columns} colunas
          </span>
          <span className="text-xs text-gray-500">#{rowId}</span>
        </div>
      </div>

      {/* Grid Layout */}
      <div
        className="grid gap-4"
        style={{
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
        }}
      >
        {Array.from({ length: columns }).map((_, index) => {
          const block = blocks[index];
          
          return (
            <div
              key={`grid-cell-${index}`}
              className={cn(
                "grid-cell border-2 border-dashed border-gray-600 rounded p-2 min-h-[120px]",
                "transition-all duration-200 hover:border-gray-500",
                block && "border-solid border-gray-500 bg-gray-900/20",
                activeBlockId === block?.id && "ring-2 ring-blue-500"
              )}
            >
              {block ? (
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-500 font-mono">
                      #{block.id}
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteBlock(block.id)}
                      className="w-6 h-6 p-0 text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                  
                  <div 
                    className="flex-1 cursor-pointer rounded p-2 hover:bg-gray-800/50"
                    onClick={() => handleBlockClick(block.id)}
                  >
                    <div className="text-xs text-gray-400 mb-1">
                      {block.type}
                    </div>
                    <div className="text-sm text-gray-200 truncate">
                      {typeof block.content === 'string' 
                        ? block.content 
                        : block.content?.text || block.content?.title || 'Conteúdo do bloco'
                      }
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleAddBlock(index)}
                    className="text-gray-400 hover:text-gray-300 hover:bg-gray-800"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Adicionar
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
