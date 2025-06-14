
// ABOUTME: Individual grid cell component with drag-drop support and proper TypeScript interfaces
import React from 'react';
import { Button } from '@/components/ui/button';
import { ReviewBlock } from '@/types/review';
import { GridCell } from '@/types/grid';
import { Plus, X } from 'lucide-react';

export interface Grid2DCellProps {
  cell: GridCell;
  cellIndex: number;
  block: ReviewBlock | null;
  isActive: boolean;
  onActiveBlockChange: (blockId: string) => void;
  onUpdateBlock: (blockId: string, updates: Partial<ReviewBlock>) => void;
  onDeleteBlock: (blockId: string) => void;
  onDuplicateBlock: (blockId: string) => void;
  onMoveBlock: (blockId: string, direction: 'up' | 'down') => void;
  onCellClick: () => void;
  onBlockAdd: (block: ReviewBlock) => void;
  onBlockRemove: () => void;
}

export const Grid2DCell: React.FC<Grid2DCellProps> = ({
  cell,
  cellIndex,
  block,
  isActive,
  onActiveBlockChange,
  onUpdateBlock,
  onDeleteBlock,
  onDuplicateBlock,
  onMoveBlock,
  onCellClick,
  onBlockAdd,
  onBlockRemove
}) => {
  
  const handleBlockClick = () => {
    if (block) {
      onActiveBlockChange(block.id);
    }
  };

  const handleRemoveBlock = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (block) {
      onDeleteBlock(block.id);
      onBlockRemove();
    }
  };

  return (
    <div 
      className={`grid-cell border-2 border-dashed border-gray-300 rounded-lg p-4 min-h-32 relative ${
        isActive ? 'border-blue-500 bg-blue-50' : 'hover:border-gray-400'
      } ${block ? 'bg-white' : 'bg-gray-50'}`}
      onClick={onCellClick}
    >
      {/* Cell content */}
      {block ? (
        <div 
          className="block-preview cursor-pointer h-full"
          onClick={handleBlockClick}
        >
          {/* Block type indicator */}
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-600 uppercase">
              {block.type}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRemoveBlock}
              className="w-6 h-6 p-0 text-red-500 hover:text-red-700"
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
          
          {/* Block content preview */}
          <div className="text-sm text-gray-800 line-clamp-3">
            {block.content?.text || block.content?.title || 'Empty block'}
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center h-full text-gray-400">
          <div className="text-center">
            <Plus className="w-8 h-8 mx-auto mb-2" />
            <span className="text-sm">Add Block</span>
          </div>
        </div>
      )}
      
      {/* Cell position indicator */}
      <div className="absolute top-1 left-1 text-xs text-gray-400">
        {cellIndex + 1}
      </div>
    </div>
  );
};
