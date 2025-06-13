// ABOUTME: Block content editor with standardized string ID usage
// Fixed to use consistent string IDs throughout the component

import React, { useState, useCallback, useMemo } from 'react';
import { ReviewBlock } from '@/types/review';
import { BlockRenderer } from '@/components/review/BlockRenderer';
import { Button } from '@/components/ui/button';
import { Plus, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BlockContentEditorProps {
  blocks: ReviewBlock[];
  onUpdateBlock: (blockId: string, updates: Partial<ReviewBlock>) => void;
  onAddBlock: (type: string, position?: number) => string;
  onMoveBlock: (blockId: string, direction: 'up' | 'down') => void;
  onDeleteBlock: (blockId: string) => void;
  onDuplicateBlock: (blockId: string) => void;
  readonly?: boolean;
  className?: string;
}

export const BlockContentEditor: React.FC<BlockContentEditorProps> = ({
  blocks,
  onUpdateBlock,
  onAddBlock,
  onMoveBlock,
  onDeleteBlock,
  onDuplicateBlock,
  readonly = false,
  className
}) => {
  const [previewMode, setPreviewMode] = useState(false);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);

  const memoizedBlocks = useMemo(() => {
    return blocks ? [...blocks] : [];
  }, [blocks]);

  const handleBlockSelect = useCallback((blockId: string) => {
    setSelectedBlockId(blockId);
  }, []);

  const handleAddBlock = useCallback((type: string, position?: number) => {
    const newBlockId = onAddBlock(type, position);
    setSelectedBlockId(newBlockId);
  }, [onAddBlock]);

  if (readonly || previewMode) {
    return (
      <div className={cn("block-content-editor-preview space-y-4", className)}>
        {memoizedBlocks.map((block) => (
          <BlockRenderer
            key={block.id}
            block={block}
            readonly={true}
          />
        ))}
      </div>
    );
  }

  return (
    <div className={cn("block-content-editor space-y-4", className)}>
      {/* Editor Controls */}
      <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg border border-gray-600">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-300">
            {memoizedBlocks.length} bloco(s)
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPreviewMode(!previewMode)}
            className="flex items-center gap-2"
          >
            {previewMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {previewMode ? 'Editar' : 'Visualizar'}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleAddBlock('paragraph')}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Adicionar Bloco
          </Button>
        </div>
      </div>

      {/* Block List */}
      <div className="space-y-4">
        {memoizedBlocks.map((block, index) => (
          <div
            key={block.id}
            className={cn(
              "relative border rounded-lg transition-all duration-200",
              selectedBlockId === block.id
                ? "border-blue-500 bg-blue-500/10"
                : "border-gray-600 bg-gray-800/30 hover:border-gray-500"
            )}
            onClick={() => handleBlockSelect(block.id)}
          >
            <BlockRenderer
              block={block}
              readonly={false}
              onUpdate={(updates) => onUpdateBlock(block.id, updates)}
              onMove={(direction) => onMoveBlock(block.id, direction)}
              onDelete={() => onDeleteBlock(block.id)}
              onDuplicate={() => onDuplicateBlock(block.id)}
              isSelected={selectedBlockId === block.id}
            />
          </div>
        ))}
      </div>

      {/* Empty State */}
      {memoizedBlocks.length === 0 && (
        <div className="text-center py-12 border-2 border-dashed border-gray-600 rounded-lg">
          <div className="text-gray-400">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-700 rounded-lg flex items-center justify-center">
              <span className="text-2xl">📝</span>
            </div>
            <h3 className="text-lg font-medium mb-2">Nenhum bloco criado</h3>
            <p className="text-sm mb-4">Comece adicionando seu primeiro bloco de conteúdo</p>
            <Button
              onClick={() => handleAddBlock('paragraph')}
              className="mx-auto"
            >
              <Plus className="w-4 h-4 mr-2" />
              Criar Primeiro Bloco
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
