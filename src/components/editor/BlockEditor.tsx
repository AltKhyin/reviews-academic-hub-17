
// ABOUTME: Enhanced block editor with properties panel completely removed
// All block settings are now handled inline within each block component

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Layout, Plus } from 'lucide-react';
import { ReviewBlock, BlockType } from '@/types/review';
import { BlockContentEditor } from './BlockContentEditor';
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
  // Fix: Reset active block if it was deleted
  useEffect(() => {
    if (activeBlockId && !blocks.find(block => block.id === activeBlockId)) {
      const newActiveId = blocks.length > 0 ? blocks[0].id : null;
      onActiveBlockChange(newActiveId);
    }
  }, [blocks, activeBlockId, onActiveBlockChange]);

  const handleBlockDelete = (blockId: number) => {
    if (blockId === activeBlockId) {
      const blockIndex = blocks.findIndex(b => b.id === blockId);
      let newActiveId = null;
      
      if (blocks.length > 1) {
        if (blockIndex < blocks.length - 1) {
          newActiveId = blocks[blockIndex + 1].id;
        } else if (blockIndex > 0) {
          newActiveId = blocks[blockIndex - 1].id;
        }
      }
      
      onActiveBlockChange(newActiveId);
    }
    
    onDeleteBlock(blockId);
  };

  // Enhanced block movement with proper drag-and-drop support
  const handleMoveBlock = (blockId: number, direction: 'up' | 'down') => {
    const currentIndex = blocks.findIndex(b => b.id === blockId);
    if (currentIndex === -1) return;

    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= blocks.length) return;

    onMoveBlock(blockId, direction);
  };

  return (
    <div className={cn("block-editor w-full h-full", compact && "text-sm")}>
      {/* Single Full-Width Content Area */}
      <div className="w-full h-full overflow-y-auto">
        <div className="p-6 space-y-6 max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Layout className="w-5 h-5" style={{ color: '#3b82f6' }} />
              <h2 className="text-xl font-semibold" style={{ color: '#ffffff' }}>
                Editor de Conteúdo
              </h2>
              <div 
                className="text-sm px-2 py-1 rounded"
                style={{ backgroundColor: '#3b82f6', color: '#ffffff' }}
              >
                {blocks.length} blocos
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onAddBlock('paragraph')}
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Adicionar Parágrafo
              </Button>
            </div>
          </div>

          {/* Block List - Full Width */}
          <div className="space-y-6">
            {blocks.length === 0 ? (
              <Card 
                className="border-2 border-dashed text-center py-12"
                style={{ 
                  backgroundColor: '#1a1a1a',
                  borderColor: '#2a2a2a'
                }}
              >
                <CardContent>
                  <div className="space-y-4">
                    <div className="mx-auto w-12 h-12 rounded-full flex items-center justify-center"
                         style={{ backgroundColor: '#3b82f6' }}>
                      <Plus className="w-6 h-6" style={{ color: '#ffffff' }} />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2" style={{ color: '#ffffff' }}>
                        Nenhum bloco adicionado
                      </h3>
                      <p className="text-sm" style={{ color: '#9ca3af' }}>
                        Use o botão "Adicionar Parágrafo" acima ou a paleta à esquerda para adicionar blocos
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              blocks.map((block, index) => (
                <div key={block.id} className="relative">
                  <BlockContentEditor
                    block={block}
                    isActive={activeBlockId === block.id}
                    isFirst={index === 0}
                    isLast={index === blocks.length - 1}
                    onSelect={onActiveBlockChange}
                    onUpdate={onUpdateBlock}
                    onDelete={handleBlockDelete}
                    onDuplicate={onDuplicateBlock}
                    onMove={handleMoveBlock}
                    onAddBlock={onAddBlock}
                  />
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
