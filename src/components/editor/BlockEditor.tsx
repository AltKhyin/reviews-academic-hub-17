
// ABOUTME: Enhanced block editor with integrated multi-block layout system
// Manages both traditional single-block flow and new multi-block layout rows

import React, { useState, useCallback } from 'react';
import { ReviewBlock, BlockType } from '@/types/review';
import { BlockRenderer } from '@/components/review/BlockRenderer';
import { DragHandle } from './DragHandle';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { LayoutGrid } from './layout/LayoutGrid';
import { useLayoutManagement } from '@/hooks/useLayoutManagement';
import { 
  Plus, 
  Eye, 
  EyeOff, 
  Copy, 
  Trash2, 
  ChevronUp, 
  ChevronDown,
  Layers,
  List
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface BlockEditorProps {
  blocks: ReviewBlock[];
  activeBlockId: number | null;
  onActiveBlockChange: (blockId: number | null) => void;
  onUpdateBlock: (blockId: number, updates: Partial<ReviewBlock>) => void;
  onDeleteBlock: (blockId: number) => void;
  onMoveBlock: (blockId: number, direction: 'up' | 'down') => void;
  onAddBlock: (type: BlockType, position?: number) => void;
  onDuplicateBlock: (blockId: number) => void;
  className?: string;
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
  className
}) => {
  const [viewMode, setViewMode] = useState<'linear' | 'layout'>('linear');
  
  // Layout management for multi-block rows
  const {
    rows,
    addRow,
    updateRow,
    deleteRow,
    addBlockToRow,
    moveBlock: moveBlockInLayout,
    removeBlock: removeBlockFromLayout,
    updateBlock: updateBlockInLayout,
    exportBlocks
  } = useLayoutManagement({ 
    initialBlocks: blocks,
    onLayoutChange: (newRows) => {
      // When layout changes, we need to update the parent with new block order
      const exportedBlocks = exportBlocks();
      // This would require a callback to update the parent's block state
      console.log('Layout changed, exported blocks:', exportedBlocks);
    }
  });

  const handleBlockClick = useCallback((blockId: number, event: React.MouseEvent) => {
    // Don't select block if clicking on interactive elements
    const target = event.target as Element;
    const isInteractiveElement = target.closest('.inline-editor-display, .inline-rich-editor-display, input, textarea, button, select');
    
    if (!isInteractiveElement) {
      onActiveBlockChange(activeBlockId === blockId ? null : blockId);
    }
  }, [activeBlockId, onActiveBlockChange]);

  const handleBlockVisibilityToggle = useCallback((blockId: number) => {
    const block = blocks.find(b => b.id === blockId);
    if (block) {
      onUpdateBlock(blockId, { visible: !block.visible });
    }
  }, [blocks, onUpdateBlock]);

  const addBlockBetween = useCallback((position: number, type: BlockType = 'paragraph') => {
    onAddBlock(type, position);
  }, [onAddBlock]);

  // Handle layout-specific operations
  const handleAddBlockToLayout = useCallback((rowId: string, position: number, blockType: string) => {
    // Create a new block and add it to the layout
    const newBlock: ReviewBlock = {
      id: -(Date.now() + Math.random()),
      issue_id: blocks[0]?.issue_id || '',
      sort_index: blocks.length,
      type: blockType as BlockType,
      payload: {},
      meta: {},
      visible: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    addBlockToRow(rowId, position, newBlock);
  }, [blocks, addBlockToRow]);

  // Mode switcher
  const renderModeSelector = () => (
    <div className="flex items-center gap-2 mb-4">
      <Button
        variant={viewMode === 'linear' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => setViewMode('linear')}
        className="flex items-center gap-2"
      >
        <List className="w-4 h-4" />
        Linear
      </Button>
      <Button
        variant={viewMode === 'layout' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => setViewMode('layout')}
        className="flex items-center gap-2"
      >
        <Layers className="w-4 h-4" />
        Layout
      </Button>
    </div>
  );

  // Linear view (original single-block flow)
  const renderLinearView = () => (
    <div className="space-y-4">
      {blocks.map((block, index) => (
        <div key={block.id} className="relative group">
          {/* Add Block Button */}
          <div className="flex justify-center mb-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => addBlockBetween(index)}
              className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-24 text-xs"
              style={{ color: '#9ca3af' }}
            >
              <Plus className="w-3 h-3 mr-1" />
              Adicionar
            </Button>
          </div>

          {/* Block Container */}
          <Card
            className={cn(
              "relative transition-all duration-200 cursor-pointer",
              activeBlockId === block.id 
                ? "ring-2 ring-blue-500 shadow-lg" 
                : "hover:shadow-md",
              !block.visible && "opacity-50"
            )}
            style={{ 
              backgroundColor: '#1a1a1a',
              borderColor: activeBlockId === block.id ? '#3b82f6' : '#2a2a2a'
            }}
            onClick={(e) => handleBlockClick(block.id, e)}
          >
            {/* Block Controls */}
            <div className={cn(
              "absolute -top-2 -right-2 flex items-center gap-1 z-10 transition-opacity",
              activeBlockId === block.id ? "opacity-100" : "opacity-0 group-hover:opacity-100"
            )}>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleBlockVisibilityToggle(block.id);
                }}
                className="h-6 w-6 p-0 bg-gray-800 border border-gray-600"
                title={block.visible ? "Ocultar bloco" : "Mostrar bloco"}
              >
                {block.visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onDuplicateBlock(block.id);
                }}
                className="h-6 w-6 p-0 bg-gray-800 border border-gray-600"
                title="Duplicar bloco"
              >
                <Copy className="w-3 h-3" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteBlock(block.id);
                }}
                className="h-6 w-6 p-0 bg-red-800 border border-red-600 hover:bg-red-700"
                title="Remover bloco"
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>

            {/* Drag Handle */}
            <div className={cn(
              "absolute -left-2 top-1/2 transform -translate-y-1/2 transition-opacity",
              activeBlockId === block.id ? "opacity-100" : "opacity-0 group-hover:opacity-100"
            )}>
              <DragHandle 
                onMoveUp={() => onMoveBlock(block.id, 'up')}
                onMoveDown={() => onMoveBlock(block.id, 'down')}
                canMoveUp={index > 0}
                canMoveDown={index < blocks.length - 1}
              />
            </div>

            {/* Block Content */}
            <div className="p-4">
              <BlockRenderer
                block={block}
                onUpdate={onUpdateBlock}
                readonly={false}
              />
            </div>
          </Card>
        </div>
      ))}

      {/* Final Add Block Button */}
      <div className="flex justify-center pt-4">
        <Button
          variant="outline"
          onClick={() => addBlockBetween(blocks.length)}
          className="flex items-center gap-2"
          style={{ 
            borderColor: '#2a2a2a',
            backgroundColor: '#1a1a1a',
            color: '#ffffff'
          }}
        >
          <Plus className="w-4 h-4" />
          Adicionar Bloco
        </Button>
      </div>
    </div>
  );

  // Layout view (new multi-block system)
  const renderLayoutView = () => (
    <LayoutGrid
      rows={rows}
      onUpdateRow={updateRow}
      onDeleteRow={deleteRow}
      onAddRow={addRow}
      onAddBlock={handleAddBlockToLayout}
      onUpdateBlock={updateBlockInLayout}
      onMoveBlock={moveBlockInLayout}
      onDeleteBlock={removeBlockFromLayout}
      readonly={false}
    />
  );

  return (
    <div className={cn("block-editor h-full", className)}>
      <div 
        className="h-full overflow-y-auto p-6"
        style={{ backgroundColor: '#121212' }}
      >
        {renderModeSelector()}
        
        {viewMode === 'linear' ? renderLinearView() : renderLayoutView()}
        
        {blocks.length === 0 && (
          <div 
            className="border-2 border-dashed rounded-lg p-12 text-center"
            style={{ borderColor: '#2a2a2a', backgroundColor: '#1a1a1a' }}
          >
            <div className="text-4xl mb-4">📝</div>
            <h3 className="text-lg font-medium mb-2" style={{ color: '#ffffff' }}>
              Comece Criando seu Primeiro Bloco
            </h3>
            <p className="mb-6" style={{ color: '#d1d5db' }}>
              Use a paleta de blocos à esquerda para adicionar conteúdo à sua revisão
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
