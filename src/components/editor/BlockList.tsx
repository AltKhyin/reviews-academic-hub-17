
// ABOUTME: Block list container with drag & drop support and string ID consistency
// Main container for managing multiple blocks in the editor

import React, { useState, useCallback } from 'react';
import { ReviewBlock, BlockType } from '@/types/review';
import { BlockContentEditor } from './BlockContentEditor';
import { Button } from '@/components/ui/button';
import { Plus, Undo, Redo } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BlockListProps {
  blocks: ReviewBlock[];
  activeBlockId: string | null;
  onActiveBlockChange: (blockId: string | null) => void;
  onUpdateBlock: (blockId: string, updates: Partial<ReviewBlock>) => void;
  onDeleteBlock: (blockId: string) => void;
  onAddBlock: (type: BlockType, position?: number) => string;
  onDuplicateBlock?: (blockId: string) => string;
  onMoveBlock: (blockId: string, direction: 'up' | 'down') => void;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  readonly?: boolean;
  className?: string;
}

export const BlockList: React.FC<BlockListProps> = ({
  blocks,
  activeBlockId,
  onActiveBlockChange,
  onUpdateBlock,
  onDeleteBlock,
  onAddBlock,
  onDuplicateBlock,
  onMoveBlock,
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,
  readonly = false,
  className
}) => {
  const [draggedBlockId, setDraggedBlockId] = useState<string | null>(null);

  const handleAddNewBlock = useCallback((type: BlockType = 'paragraph') => {
    const newBlockId = onAddBlock(type);
    // Auto-select the new block
    if (newBlockId && onActiveBlockChange) {
      onActiveBlockChange(newBlockId);
    }
  }, [onAddBlock, onActiveBlockChange]);

  const handleBlockSelect = useCallback((blockId: string) => {
    onActiveBlockChange(activeBlockId === blockId ? null : blockId);
  }, [onActiveBlockChange, activeBlockId]);

  const handleDragStart = useCallback((blockId: string) => {
    setDraggedBlockId(blockId);
  }, []);

  const handleDragEnd = useCallback(() => {
    setDraggedBlockId(null);
  }, []);

  const sortedBlocks = [...blocks].sort((a, b) => a.sort_index - b.sort_index);

  if (readonly && blocks.length === 0) {
    return (
      <div className={cn("text-center py-8 text-gray-400", className)}>
        <p>Nenhum bloco de conteúdo disponível.</p>
      </div>
    );
  }

  return (
    <div className={cn("block-list space-y-4", className)}>
      {/* Header Controls */}
      {!readonly && (
        <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg border border-gray-700">
          <div className="flex items-center gap-2">
            <Button
              onClick={() => handleAddNewBlock('paragraph')}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Bloco
            </Button>
            
            <span className="text-sm text-gray-400">
              {blocks.length} {blocks.length === 1 ? 'bloco' : 'blocos'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {onUndo && (
              <Button
                onClick={onUndo}
                disabled={!canUndo}
                size="sm"
                variant="ghost"
                title="Desfazer"
              >
                <Undo className="w-4 h-4" />
              </Button>
            )}
            
            {onRedo && (
              <Button
                onClick={onRedo}
                disabled={!canRedo}
                size="sm"
                variant="ghost"
                title="Refazer"
              >
                <Redo className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Block List */}
      <div className="space-y-2">
        {sortedBlocks.length === 0 ? (
          <div className="text-center py-8 border-2 border-dashed border-gray-600 rounded-lg">
            <p className="text-gray-400 mb-4">Nenhum bloco adicionado ainda.</p>
            {!readonly && (
              <Button
                onClick={() => handleAddNewBlock('paragraph')}
                size="sm"
                variant="outline"
              >
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Primeiro Bloco
              </Button>
            )}
          </div>
        ) : (
          sortedBlocks.map((block, index) => {
            const isActive = activeBlockId === block.id;
            const isFirst = index === 0;
            const isLast = index === sortedBlocks.length - 1;
            const isDragged = draggedBlockId === block.id;

            return (
              <div
                key={block.id}
                className={cn(
                  "block-item",
                  isDragged && "opacity-50 scale-95",
                  "transition-all duration-200"
                )}
                onDragStart={() => handleDragStart(block.id)}
                onDragEnd={handleDragEnd}
              >
                <BlockContentEditor
                  block={block}
                  isActive={isActive}
                  isFirst={isFirst}
                  isLast={isLast}
                  onSelect={handleBlockSelect}
                  onUpdate={onUpdateBlock}
                  onDelete={onDeleteBlock}
                  onDuplicate={onDuplicateBlock}
                  onMove={onMoveBlock}
                  onAddBlock={onAddBlock}
                />
              </div>
            );
          })
        )}
      </div>

      {/* Footer Add Button */}
      {!readonly && blocks.length > 0 && (
        <div className="flex justify-center pt-4">
          <Button
            onClick={() => handleAddNewBlock('paragraph')}
            size="sm"
            variant="outline"
            className="border-dashed"
          >
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Bloco
          </Button>
        </div>
      )}
    </div>
  );
};
