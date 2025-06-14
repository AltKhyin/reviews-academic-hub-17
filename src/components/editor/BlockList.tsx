
// ABOUTME: Block list component with drag-drop reordering and comprehensive block management
import React from 'react';
import { ReviewBlock, BlockType } from '@/types/review';

export interface BlockListProps {
  blocks: ReviewBlock[];
  activeBlockId: string;
  onActiveBlockChange: (blockId: string) => void;
  onDeleteBlock: (blockId: string) => void;
  onDuplicateBlock?: (blockId: string) => void;
  onMoveBlock: (blockId: string, direction: 'up' | 'down') => void;
  onAddBlock: (type: BlockType, position?: number) => void;
  compact?: boolean;
}

export const BlockList: React.FC<BlockListProps> = ({
  blocks,
  activeBlockId,
  onActiveBlockChange,
  onDeleteBlock,
  onDuplicateBlock,
  onMoveBlock,
  onAddBlock,
  compact = false
}) => {
  
  return (
    <div className="block-list space-y-2">
      {blocks.map((block, index) => (
        <div
          key={block.id}
          className={`block-item p-3 border rounded-lg cursor-pointer transition-colors ${
            activeBlockId === block.id 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-200 hover:border-gray-300'
          }`}
          onClick={() => onActiveBlockChange(block.id)}
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-900">
                {block.type.charAt(0).toUpperCase() + block.type.slice(1)}
              </div>
              <div className="text-xs text-gray-500 truncate">
                {block.content?.text || block.content?.title || 'Empty block'}
              </div>
            </div>
            
            <div className="flex items-center space-x-1">
              {/* Move buttons */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onMoveBlock(block.id, 'up');
                }}
                disabled={index === 0}
                className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
              >
                ↑
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onMoveBlock(block.id, 'down');
                }}
                disabled={index === blocks.length - 1}
                className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
              >
                ↓
              </button>
              
              {/* Duplicate button */}
              {onDuplicateBlock && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDuplicateBlock(block.id);
                  }}
                  className="p-1 text-gray-400 hover:text-gray-600"
                >
                  ⧉
                </button>
              )}
              
              {/* Delete button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteBlock(block.id);
                }}
                className="p-1 text-red-400 hover:text-red-600"
              >
                ×
              </button>
            </div>
          </div>
        </div>
      ))}
      
      {blocks.length === 0 && (
        <div className="text-center text-gray-500 py-8">
          No blocks yet. Add a block to get started.
        </div>
      )}
    </div>
  );
};
