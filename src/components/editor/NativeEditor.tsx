// ABOUTME: Enhanced native editor with fullscreen capability, improved UX, and string ID support
// Main editor container with fullscreen mode support

import React, { useState, useEffect, useCallback } from 'react';
import { ReviewBlock } from '@/types/review';
import { BlockEditor } from './BlockEditor';
import { BlockPalette } from './BlockPalette';
import { ReviewPreview } from './ReviewPreview';
import { EditorToolbar } from './EditorToolbar';
import { EditorStatusBar } from './EditorStatusBar';
import { NativeEditorFullscreen } from './NativeEditorFullscreen';
import { useEditorAutoSave } from '@/hooks/useEditorAutoSave';
import { useBlockManagement } from '@/hooks/useBlockManagement'; // Ensure this hook uses string IDs
import { useEditorKeyboardShortcuts } from './hooks/useEditorKeyboardShortcuts';
import { Button } from '@/components/ui/button';
import { Maximize2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NativeEditorProps {
  issueId?: string; // string
  initialBlocks?: ReviewBlock[];
  onSave?: (blocks: ReviewBlock[]) => void;
  onCancel?: () => void;
  mode?: 'edit' | 'preview' | 'split';
  className?: string;
}

export const NativeEditor: React.FC<NativeEditorProps> = ({
  issueId,
  initialBlocks = [],
  onSave,
  onCancel,
  mode: initialMode = 'split',
  className
}) => {
  const [editorMode, setEditorMode] = useState<'edit' | 'preview' | 'split'>(initialMode);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const {
    blocks,
    activeBlockId, // Should be string | null
    setActiveBlockId,
    addBlock, // Returns string (new block ID)
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
  useEffect(() => {
    const hasChanges = JSON.stringify(blocks) !== JSON.stringify(initialBlocks);
    setHasUnsavedChanges(hasChanges);
  }, [blocks, initialBlocks]);

  const handleAddBlock = useCallback((type: any, position?: number) => {
    const newBlockId = addBlock(type, position); // addBlock returns string
    console.log('Block added in NativeEditor:', { type, position, newBlockId });
    return newBlockId;
  }, [addBlock]);

  const handleImport = useCallback((importedBlocks: ReviewBlock[]) => {
    console.log('Importing blocks:', importedBlocks);
    importedBlocks.forEach((block, index) => {
      // Assuming imported blocks might have temp numeric IDs or need new string IDs
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

  // Listen for view mode changes from ViewModeSwitcher
  useEffect(() => {
    const handleViewModeChange = (event: CustomEvent) => {
      const { mode } = event.detail;
      if (mode === 'dividir') {
        setEditorMode('split');
      } else if (mode === 'preview') {
        setEditorMode('preview');
      } else {
        setEditorMode('edit');
      }
    };

    window.addEventListener('viewModeChange', handleViewModeChange as EventListener);
    return () => window.removeEventListener('viewModeChange', handleViewModeChange as EventListener);
  }, []);

  if (isFullscreen) {
    return (
      <NativeEditorFullscreen
        issueId={issueId}
        initialBlocks={blocks}
        onSave={onSave}
        onClose={() => setIsFullscreen(false)}
        mode={editorMode}
      />
    );
  }

  return (
    <div 
      className={cn("native-editor h-full flex flex-col overflow-visible-force", className)}
      style={{ backgroundColor: '#121212' }}
    >
      <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: '#2a2a2a' }}>
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
        
        {/* Fullscreen Button */}
        <Button
          onClick={() => setIsFullscreen(true)}
          variant="ghost"
          size="sm"
          className="flex items-center gap-2"
          title="Editor Fullscreen"
        >
          <Maximize2 className="w-4 h-4" />
          Fullscreen
        </Button>
      </div>
      
      <div className="flex-1 overflow-hidden">
        <div className="h-full flex">
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
      </div>

      <EditorStatusBar
        blockCount={blocks.length}
        activeBlockId={activeBlockId} // string | null
      />
    </div>
  );
};
