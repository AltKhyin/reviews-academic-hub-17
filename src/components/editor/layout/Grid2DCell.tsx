
// ABOUTME: Enhanced 2D grid cell with complete string ID support and proper block construction
// Handles individual cell rendering within 2D grid layouts

import React, { useCallback } from 'react';
import { ReviewBlock } from '@/types/review';
import { BlockContentEditor } from '../BlockContentEditor';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { GridPosition } from '@/types/grid';

interface Grid2DCellProps {
  position: GridPosition;
  block?: ReviewBlock;
  activeBlockId: string | null;
  onActiveBlockChange: (blockId: string | null) => void;
  onUpdateBlock: (blockId: string, updates: Partial<ReviewBlock>) => void;
  onDeleteBlock: (blockId: string) => void;
  onAddBlock: (gridId: string, position: GridPosition) => void;
  gridId: string;
  width?: string;
  height?: string;
  minHeight?: number;
}

export const Grid2DCell: React.FC<Grid2DCellProps> = ({
  position,
  block,
  activeBlockId,
  onActiveBlockChange,
  onUpdateBlock,
  onDeleteBlock,
  onAddBlock,
  gridId,
  width = 'auto',
  height = 'auto',
  minHeight = 120
}) => {
  const handleAddBlock = useCallback(() => {
    onAddBlock(gridId, position);
  }, [onAddBlock, gridId, position]);

  const handleMove = useCallback((blockId: string, direction: 'up' | 'down') => {
    // Grid cells don't support individual block movement
    console.log('Grid cell block movement not supported:', { blockId, direction });
  }, []);

  const handleAddBlockAtPosition = useCallback((type: any, pos?: number) => {
    // For grid cells, always add at the current cell position
    onAddBlock(gridId, position);
  }, [onAddBlock, gridId, position]);

  return (
    <div
      className={cn(
        "grid-2d-cell border-2 border-dashed border-gray-600 rounded relative",
        "transition-all duration-200 hover:border-gray-500",
        block && "border-solid border-gray-500 bg-gray-900/20"
      )}
      style={{
        width,
        height,
        minHeight: `${minHeight}px`,
        gridColumn: position.column + 1,
        gridRow: position.row + 1
      }}
    >
      <div className="absolute top-1 left-1 text-xs text-gray-500 font-mono z-10">
        {position.row},{position.column}
      </div>
      
      {block ? (
        <div className="h-full w-full p-2">
          <BlockContentEditor
            block={block}
            isActive={activeBlockId === block.id}
            isFirst={false}
            isLast={false}
            onSelect={onActiveBlockChange}
            onUpdate={onUpdateBlock}
            onDelete={onDeleteBlock}
            onMove={handleMove}
            onAddBlock={handleAddBlockAtPosition}
          />
        </div>
      ) : (
        <div className="h-full w-full flex items-center justify-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleAddBlock}
            className="text-gray-400 hover:text-gray-300 hover:bg-gray-800"
          >
            <Plus className="w-4 h-4 mr-1" />
            Adicionar Bloco
          </Button>
        </div>
      )}
    </div>
  );
};
