
// ABOUTME: Block editor interface for native reviews with drag-and-drop reordering
// Handles block selection, editing, manipulation, and drag-and-drop functionality

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';
import { ReviewBlock, BlockType } from '@/types/review';
import { BlockPropertyEditor } from './BlockPropertyEditor';
import { BlockList } from './BlockList';
import { cn } from '@/lib/utils';

interface BlockEditorProps {
  blocks: ReviewBlock[];
  activeBlockId: number | null;
  onActiveBlockChange: (blockId: number | null) => void;
  onUpdateBlock: (blockId: number, updates: Partial<ReviewBlock>) => void;
  onDeleteBlock: (blockId: number) => void;
  onMoveBlock: (blockId: number, direction: 'up' | 'down') => void;
  onAddBlock: (type: BlockType, position?: number) => void;
  onDuplicateBlock?: (blockId: number) => void;
  compact?: boolean;
}

export const BlockEditor: React.FC<BlockEditorProps> = ({
  blocks,
  activeBlockId,
  onActiveBlockChange,
  onUpdateBlock,
  onDeleteBlock,
  onMoveBlock,
  onAddBlock,
  onDuplicateBlock,
  compact = false
}) => {
  const [showProperties, setShowProperties] = useState(true);
  const activeBlock = blocks.find(block => block.id === activeBlockId);

  return (
    <div className={cn("block-editor flex h-full", compact && "text-sm")}>
      {/* Block List */}
      <div className={cn("overflow-y-auto border-r", compact ? "flex-1" : "flex-1")} 
           style={{ borderColor: 'var(--editor-primary-border)' }}>
        <div className="p-4">
          <BlockList
            blocks={blocks}
            activeBlockId={activeBlockId}
            onActiveBlockChange={onActiveBlockChange}
            onDeleteBlock={onDeleteBlock}
            onMoveBlock={onMoveBlock}
            onAddBlock={onAddBlock}
            onDuplicateBlock={onDuplicateBlock}
            compact={compact}
          />
        </div>
      </div>

      {/* Properties Panel */}
      {!compact && showProperties && activeBlock && (
        <div 
          className="w-80 border-r properties-panel overflow-y-auto"
          style={{ 
            backgroundColor: 'var(--editor-secondary-bg)',
            borderColor: 'var(--editor-primary-border)'
          }}
        >
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold" style={{ color: 'var(--editor-primary-text)' }}>
                Propriedades
              </h3>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowProperties(false)}
                style={{ color: 'var(--editor-muted-text)' }}
                className="hover:bg-[var(--editor-hover-bg)]"
              >
                <Settings className="w-4 h-4" />
              </Button>
            </div>
            
            <BlockPropertyEditor
              block={activeBlock}
              onUpdate={(updates) => onUpdateBlock(activeBlock.id, updates)}
            />
          </div>
        </div>
      )}

      {/* Show Properties Button */}
      {!compact && !showProperties && (
        <div 
          className="w-12 border-r properties-panel flex items-start justify-center pt-4"
          style={{ borderColor: 'var(--editor-primary-border)' }}
        >
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setShowProperties(true)}
            style={{ color: 'var(--editor-muted-text)' }}
            className="hover:bg-[var(--editor-hover-bg)]"
          >
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
};
