// ABOUTME: Fullscreen native editor with immersive editing experience and string ID support
// Provides dedicated workspace for complex review creation

import React, { useCallback, useEffect } from 'react';
import { ReviewBlock } from '@/types/review';
import { BlockEditor } from './BlockEditor';
import { BlockPalette } from './BlockPalette';
import { ReviewPreview } from './ReviewPreview';
import { EditorToolbar } from './EditorToolbar';
import { EditorStatusBar } from './EditorStatusBar';
import { Button } from '@/components/ui/button';
import { X, Minimize2 } from 'lucide-react';
import { useBlockManagement } from '@/hooks/useBlockManagement'; // Ensure this hook uses string IDs
import { useEditorAutoSave } from '@/hooks/useEditorAutoSave';
import { useEditorKeyboardShortcuts } from './hooks/useEditorKeyboardShortcuts';
import { cn } from '@/lib/utils';

interface NativeEditorFullscreenProps {
  issueId?: string; // string
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
    activeBlockId, // Should be string | null
    setActiveBlockId,
    addBlock, // Returns string
    updateBlock, // Accepts string ID
    deleteBlock, // Accepts string ID
    moveBlock, // Accepts string ID
    duplicateBlock, // Accepts string ID
    convertToGrid, // Accepts string ID
    convertTo2DGrid, // Accepts string ID
    mergeBlockIntoGrid, // Accepts string IDs
    placeBlockIn2DGrid, // Accepts string IDs
    undo,
    redo,
    canUndo,
    canRedo
  } = useBlockManagement({ initialBlocks, issueId }); // Ensure issueId (string) is compatible

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

  const handleAddBlock = useCallback((type: any, position?: number) => {
    const newBlockId = addBlock(type, position); // addBlock returns string
    console.log('Block added in fullscreen editor:', { type, position, newBlockId });
    return newBlockId;
  }, [addBlock]);

  const handleImport = useCallback((importedBlocks: ReviewBlock[]) => {
    console.log('Importing blocks in fullscreen:', importedBlocks);
    importedBlocks.forEach((block, index) => {
      const newBlockData = { ...block, id: String(block.id || Date.now()) }; // Ensure string ID
      if (index === 0) {
        const firstBlockId = addBlock(newBlockData.type, 0); // addBlock returns string
        updateBlock(firstBlockId, newBlockData); // updateBlock takes string ID
      } else {
        const newBlockId = addBlock(newBlockData.type, index); // addBlock returns string
        updateBlock(newBlockId, { ...newBlockData, id: newBlockId }); // updateBlock takes string ID
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
              activeBlockId={activeBlockId} // string | null
              onActiveBlockChange={setActiveBlockId} // (string | null) => void
              onUpdateBlock={updateBlock} // (string, Partial<ReviewBlock>) => void
              onDeleteBlock={deleteBlock} // (string) => void
              onMoveBlock={moveBlock} // (string, 'up' | 'down') => void
              onAddBlock={handleAddBlock} // (BlockType, number?) => string
              onDuplicateBlock={duplicateBlock} // (string) => void
              onConvertToGrid={convertToGrid} // (string, number) => void
              onConvertTo2DGrid={convertTo2DGrid} // (string, number, number) => void
              onMergeBlockIntoGrid={mergeBlockIntoGrid} // (string, string, number?) => void
              onPlaceBlockIn2DGrid={placeBlockIn2DGrid} // (string, string, GridPosition) => void
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
        activeBlockId={activeBlockId} // string | null
      />
    </div>
  );
};
