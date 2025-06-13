// ABOUTME: Fullscreen native editor with immersive editing experience
// Provides dedicated workspace for complex review creation

import React, { useCallback, useEffect } from 'react';
import { ReviewBlock, BlockType } from '@/types/review';
import { BlockEditor } from './BlockEditor';
import { BlockPalette } from './BlockPalette';
import { ReviewPreview } from './ReviewPreview';
import { EditorToolbar } from './EditorToolbar';
import { EditorStatusBar } from './EditorStatusBar';
import { Button } from '@/components/ui/button';
import { X, Minimize2 } from 'lucide-react';
import { useBlockManagement } from '@/hooks/useBlockManagement';
import { useEditorAutoSave } from '@/hooks/useEditorAutoSave';
import { useEditorKeyboardShortcuts } from './hooks/useEditorKeyboardShortcuts';
import { cn } from '@/lib/utils';

interface NativeEditorFullscreenProps {
  issueId?: string;
  initialBlocks?: ReviewBlock[];
  onSave?: (blocks: ReviewBlock[]) => void;
  onClose: () => void;
  mode?: 'edit' | 'preview' | 'split';
}

export const NativeEditorFullscreen: React.FC<NativeEditorFullscreenProps> = ({
  issueId,
  initialBlocks = [],
  onSave,
  onClose,
  mode: initialMode = 'split'
}) => {
  const [editorMode, setEditorMode] = React.useState<'edit' | 'preview' | 'split'>(initialMode);
  const [hasUnsavedChanges, setHasUnsavedChanges] = React.useState(false);

  const {
    blocks,
    activeBlockId,
    setActiveBlockId,
    addBlock,
    updateBlock,
    deleteBlock,
    moveBlock,
    duplicateBlock,
    convertToGrid,
    convertTo2DGrid,
    mergeBlockIntoGrid,
    placeBlockIn2DGrid,
    undo,
    redo,
    canUndo,
    canRedo
  } = useBlockManagement({ initialBlocks, issueId });

  const { handleSave, isSaving, lastSaved } = useEditorAutoSave({
    data: blocks,
    onSave: onSave ? async (data) => { onSave(data); } : undefined,
    interval: 30000,
    enabled: !!issueId
  });

  const handleManualSave = useCallback(() => {
    if (onSave) {
      onSave(blocks);
      setHasUnsavedChanges(false);
    }
  }, [blocks, onSave]);

  useEditorKeyboardShortcuts({
    onSave: handleManualSave,
    onUndo: undo,
    onRedo: redo
  });

  // Track changes
  React.useEffect(() => {
    const hasChanges = JSON.stringify(blocks) !== JSON.stringify(initialBlocks);
    setHasUnsavedChanges(hasChanges);
  }, [blocks, initialBlocks]);

  const handleAddBlock = useCallback((type: BlockType, position?: number): string => {
    const newBlockId = addBlock(type, position);
    console.log('Block added in fullscreen editor:', { type, position, newBlockId });
    return newBlockId;
  }, [addBlock]);

  const handleImport = useCallback((importedBlocks: ReviewBlock[]) => {
    console.log('Importing blocks in fullscreen:', importedBlocks);
    importedBlocks.forEach((block, index) => {
      if (index === 0) {
        const firstBlockId = addBlock(block.type as BlockType, 0);
        updateBlock(firstBlockId, block);
      } else {
        const newBlockId = addBlock(block.type as BlockType, index);
        updateBlock(newBlockId, { ...block, id: newBlockId });
      }
    });
  }, [addBlock, updateBlock]);

  // Handle escape key to close fullscreen
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div 
      className="fixed inset-0 z-50 bg-background"
      style={{ backgroundColor: '#121212' }}
    >
      {/* Header */}
      <div 
        className="h-14 border-b flex items-center justify-between px-4"
        style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}
      >
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold" style={{ color: '#ffffff' }}>
            Editor de Revisão Nativa - Fullscreen
          </h2>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            style={{ color: '#d1d5db' }}
          >
            <Minimize2 className="w-4 h-4 mr-2" />
            Sair do Fullscreen
          </Button>
        </div>
      </div>

      {/* Toolbar */}
      <EditorToolbar
        editorMode={editorMode}
        onModeChange={setEditorMode}
        hasUnsavedChanges={hasUnsavedChanges}
        isSaving={isSaving}
        lastSaved={lastSaved}
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={undo}
        onRedo={redo}
        onSave={handleManualSave}
        blocks={blocks}
        onImport={handleImport}
      />
      
      {/* Main Content */}
      <div className="flex h-[calc(100vh-7rem)]">
        {/* Block Palette */}
        {(editorMode === 'edit' || editorMode === 'split') && (
          <div 
            className="w-64 border-r overflow-y-auto flex-shrink-0"
            style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}
          >
            <BlockPalette onBlockAdd={handleAddBlock} />
          </div>
        )}
        
        {/* Editor */}
        {(editorMode === 'edit' || editorMode === 'split') && (
          <div 
            className={cn(
              "flex-1 px-2 overflow-visible-force",
              editorMode === 'split' && "border-r"
            )} 
            style={{ borderColor: '#2a2a2a' }}
          >
            <BlockEditor
              blocks={blocks}
              activeBlockId={activeBlockId}
              onActiveBlockChange={setActiveBlockId}
              onUpdateBlock={updateBlock}
              onDeleteBlock={deleteBlock}
              onMoveBlock={moveBlock}
              onAddBlock={handleAddBlock}
              onDuplicateBlock={duplicateBlock}
              onConvertToGrid={convertToGrid}
              onConvertTo2DGrid={convertTo2DGrid}
              onMergeBlockIntoGrid={mergeBlockIntoGrid}
              onPlaceBlockIn2DGrid={placeBlockIn2DGrid}
            />
          </div>
        )}
        
        {/* Preview */}
        {(editorMode === 'preview' || editorMode === 'split') && (
          <div className="flex-1 px-2">
            <ReviewPreview 
              blocks={blocks}
              className="h-full"
            />
          </div>
        )}
      </div>

      <EditorStatusBar
        blockCount={blocks.length}
        activeBlockId={activeBlockId}
      />
    </div>
  );
};
