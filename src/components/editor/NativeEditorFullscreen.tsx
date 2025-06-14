
// ABOUTME: Fullscreen native editor with enhanced layout and string ID support
// Provides immersive editing experience with proper type safety

import React, { useState, useCallback, useMemo } from 'react';
import { ReviewBlock, BlockType } from '@/types/review';
import { BlockList } from './BlockList';
import { BlockContentEditor } from './BlockContentEditor';
import { BlockTypePalette } from './BlockTypePalette';
import { EditorToolbar } from './EditorToolbar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NativeEditorFullscreenProps {
  blocks: ReviewBlock[];
  onUpdateBlock: (blockId: string, updates: Partial<ReviewBlock>) => void;
  onDeleteBlock: (blockId: string) => void;
  onMoveBlock: (blockId: string, direction: 'up' | 'down') => void;
  onAddBlock: (type: BlockType, position?: number) => void;
  onDuplicateBlock?: (blockId: string) => void;
  activeBlockId: string | null;
  onActiveBlockChange: (blockId: string | null) => void;
  onClose: () => void;
  readonly?: boolean;
}

export const NativeEditorFullscreen: React.FC<NativeEditorFullscreenProps> = ({
  blocks,
  onUpdateBlock,
  onDeleteBlock,
  onMoveBlock,
  onAddBlock,
  onDuplicateBlock,
  activeBlockId,
  onActiveBlockChange,
  onClose,
  readonly = false
}) => {
  const [showPreview, setShowPreview] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Memoized active block for performance
  const activeBlock = useMemo(() => 
    blocks.find(block => block.id === activeBlockId) || null,
    [blocks, activeBlockId]
  );

  const handleMove = useCallback((blockId: string, direction: 'up' | 'down') => {
    onMoveBlock(blockId, direction);
  }, [onMoveBlock]);

  const handleAddBlockAtPosition = useCallback((type: BlockType, position?: number) => {
    onAddBlock(type, position ?? blocks.length);
  }, [onAddBlock, blocks.length]);

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm">
      <div className="h-full flex" style={{ backgroundColor: '#121212' }}>
        {/* Left Sidebar - Block List */}
        <div className={cn(
          "editor-sidebar border-r transition-all duration-200",
          sidebarCollapsed ? "w-12" : "w-80",
          "bg-gray-900/5 border-gray-600"
        )}>
          {!sidebarCollapsed && (
            <div className="h-full flex flex-col">
              {/* Header */}
              <div className="p-4 border-b border-gray-600 flex items-center justify-between">
                <h2 className="font-medium" style={{ color: '#ffffff' }}>
                  Editor
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-300"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              {/* Block Palette */}
              <div className="p-4 border-b border-gray-600">
                <BlockTypePalette 
                  onAddBlock={handleAddBlockAtPosition}
                  compact={true}
                />
              </div>
              
              {/* Block List */}
              <div className="flex-1 overflow-y-auto p-4">
                <BlockList
                  blocks={blocks}
                  activeBlockId={activeBlockId}
                  onActiveBlockChange={onActiveBlockChange}
                  onDeleteBlock={onDeleteBlock}
                  onMoveBlock={handleMove}
                  onAddBlock={handleAddBlockAtPosition}
                  onDuplicateBlock={onDuplicateBlock}
                  compact={true}
                />
              </div>
            </div>
          )}
        </div>

        {/* Main Editor Content */}
        <div className="editor-main flex-1 flex flex-col">
          {/* Toolbar */}
          <EditorToolbar
            onTogglePreview={() => setShowPreview(!showPreview)}
            onToggleFullscreen={onClose}
            onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
            showPreview={showPreview}
            isFullscreen={true}
            sidebarCollapsed={sidebarCollapsed}
          />

          {/* Content Area */}
          <div className="editor-content flex-1 overflow-hidden">
            {showPreview ? (
              // Preview Mode
              <div className="h-full overflow-y-auto p-6 bg-white">
                {blocks.map((block) => (
                  <BlockContentEditor
                    key={block.id}
                    block={block}
                    isActive={false}
                    isFirst={blocks.indexOf(block) === 0}
                    isLast={blocks.indexOf(block) === blocks.length - 1}
                    onSelect={() => {}}
                    onUpdate={() => {}}
                    onDelete={() => {}}
                    onMove={() => {}}
                    onAddBlock={() => {}}
                  />
                ))}
              </div>
            ) : (
              // Edit Mode
              <div className="h-full overflow-y-auto p-6">
                {blocks.length === 0 ? (
                  <Card className="mx-auto max-w-2xl mt-12" style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}>
                    <CardContent className="p-12 text-center">
                      <div className="text-4xl mb-4">📝</div>
                      <h3 className="text-xl font-medium mb-4" style={{ color: '#ffffff' }}>
                        Comece a Escrever
                      </h3>
                      <p className="mb-6" style={{ color: '#d1d5db' }}>
                        Use a paleta à esquerda para adicionar blocos ao seu documento.
                      </p>
                      <Button 
                        onClick={() => handleAddBlockAtPosition('paragraph', 0)}
                        style={{ backgroundColor: '#3b82f6', color: '#ffffff' }}
                      >
                        Adicionar Primeiro Bloco
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="mx-auto max-w-4xl space-y-2">
                    {blocks.map((block, index) => (
                      <BlockContentEditor
                        key={block.id}
                        block={block}
                        isActive={activeBlockId === block.id}
                        isFirst={index === 0}
                        isLast={index === blocks.length - 1}
                        onSelect={onActiveBlockChange}
                        onUpdate={onUpdateBlock}
                        onDelete={onDeleteBlock}
                        onMove={handleMove}
                        onAddBlock={handleAddBlockAtPosition}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
