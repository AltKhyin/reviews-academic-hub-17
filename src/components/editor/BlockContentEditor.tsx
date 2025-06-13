
// ABOUTME: Block content editor component for individual block editing
// Handles editing interface for ReviewBlock content

import React from 'react';
import { ReviewBlock, BlockType } from '@/types/review';
import { BlockRenderer } from '@/components/review/BlockRenderer';
import { Button } from '@/components/ui/button';
import { Move, Copy, Trash2 } from 'lucide-react';

interface BlockContentEditorProps {
  block: ReviewBlock;
  isActive: boolean;
  isFirst: boolean;
  isLast: boolean;
  onSelect: (blockId: string) => void;
  onUpdate: (blockId: string, updates: Partial<ReviewBlock>) => void;
  onDelete: (blockId: string) => void;
  onDuplicate?: (blockId: string) => string;
  onMove: (blockId: string, direction: 'up' | 'down') => void;
  onAddBlock?: (type: BlockType, position?: number) => string;
}

export const BlockContentEditor: React.FC<BlockContentEditorProps> = ({
  block,
  isActive,
  isFirst,
  isLast,
  onSelect,
  onUpdate,
  onDelete,
  onDuplicate,
  onMove,
  onAddBlock
}) => {
  const handleSelect = () => {
    onSelect(block.id);
  };

  const handleUpdate = (updates: Partial<ReviewBlock>) => {
    onUpdate(block.id, updates);
  };

  const handleDelete = () => {
    onDelete(block.id);
  };

  const handleDuplicate = () => {
    if (onDuplicate) {
      onDuplicate(block.id);
    }
  };

  const handleMove = (direction: 'up' | 'down') => {
    onMove(block.id, direction);
  };

  return (
    <div
      className={`block-content-editor border rounded-lg p-4 transition-all ${
        isActive ? 'border-blue-500 bg-blue-50/5' : 'border-gray-600 hover:border-gray-500'
      }`}
      onClick={handleSelect}
    >
      {/* Block Controls */}
      {isActive && (
        <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-600">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 uppercase tracking-wide">
              {block.type}
            </span>
            <span className="text-xs text-gray-500">
              #{block.sort_index}
            </span>
          </div>
          
          <div className="flex items-center gap-1">
            {!isFirst && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleMove('up');
                }}
                className="h-7 w-7 p-0"
                title="Mover para cima"
              >
                <Move className="w-3 h-3 rotate-180" />
              </Button>
            )}
            
            {!isLast && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleMove('down');
                }}
                className="h-7 w-7 p-0"
                title="Mover para baixo"
              >
                <Move className="w-3 h-3" />
              </Button>
            )}
            
            {onDuplicate && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDuplicate();
                }}
                className="h-7 w-7 p-0"
                title="Duplicar bloco"
              >
                <Copy className="w-3 h-3" />
              </Button>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleDelete();
              }}
              className="h-7 w-7 p-0 text-red-400 hover:text-red-300"
              title="Excluir bloco"
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        </div>
      )}

      {/* Block Content */}
      <BlockRenderer
        block={block}
        isSelected={isActive}
        onUpdate={handleUpdate}
        readonly={false}
      />
    </div>
  );
};
