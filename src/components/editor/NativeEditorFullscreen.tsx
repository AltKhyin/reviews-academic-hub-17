
// ABOUTME: Fullscreen native editor with immersive editing experience and string ID support
// Provides dedicated workspace for complex review creation

import React, { useCallback, useEffect, useState } from 'react'; // Added useState
import { ReviewBlock, BlockType } from '@/types/review'; // Added BlockType
import { BlockEditor } from './BlockEditor';
import { BlockPalette } from './BlockPalette';
import { ReviewPreview } from './ReviewPreview';
import { EditorToolbar } from './EditorToolbar';
import { EditorStatusBar } from './EditorStatusBar';
// import { Button } from '@/components/ui/button'; // Already imported below
// import { X, Minimize2 } from 'lucide-react'; // X not used, Minimize2 used
import { useBlockManagement } from '@/hooks/useBlockManagement';
import { useEditorAutoSave } from '@/hooks/useEditorAutoSave';
import { useEditorKeyboardShortcuts } from './hooks/useEditorKeyboardShortcuts';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button'; // Ensure this is the correct Button
import { Minimize2 } from 'lucide-react'; // Ensure this is correctly imported
import { GridPosition } from '@/types/grid'; // Added

interface NativeEditorFullscreenProps {
  issueId?: string;
  initialBlocks?: ReviewBlock[]; // Should be current blocks when entering fullscreen
  onSave?: (blocks: ReviewBlock[]) => void; // Propagated save handler
  onClose: () => void;
  mode?: 'edit' | 'preview' | 'split'; // Initial mode for fullscreen
}

export const NativeEditorFullscreen: React.FC<NativeEditorFullscreenProps> = ({
  issueId,
  initialBlocks = [], // These are the blocks *at the moment fullscreen was entered*
  onSave, // This is the main onSave from NativeEditor
  onClose,
  mode: initialMode = 'split'
}) => {
  const [editorMode, setEditorMode] = useState<'edit' | 'preview' | 'split'>(initialMode);
  // Fullscreen editor manages its own "hasUnsavedChanges" relative to its initial state.
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const {
    blocks, // These blocks are managed by this instance of useBlockManagement
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
  } = useBlockManagement({ initialBlocks, issueId }); // Initialize with blocks from parent

  // Auto-save specific to fullscreen editor's changes
  const { handleSave: triggerAutoSave, isSaving, lastSaved } = useEditorAutoSave({
    data: blocks, // Save current fullscreen blocks
    onSave: onSave ? async (dataToSave) => { onSave(dataToSave); } : undefined,
    interval: 30000,
    enabled: !!issueId && !!onSave
  });

  const handleManualSave = useCallback(() => {
    if (onSave) {
      onSave(blocks); // Save the current state of blocks from this fullscreen editor
      setHasUnsavedChanges(false);
    }
    triggerAutoSave();
  }, [blocks, onSave, triggerAutoSave]);

  useEditorKeyboardShortcuts({
    onSave: handleManualSave,
    onUndo: undo,
    onRedo: redo
  });

  // Track unsaved changes relative to when fullscreen was entered
  useEffect(() => {
    const changed = JSON.stringify(blocks) !== JSON.stringify(initialBlocks);
    setHasUnsavedChanges(changed);
  }, [blocks, initialBlocks]);

  const handleAddBlock = useCallback((type: BlockType, position?: number): string => {
    const newBlockId = addBlock(type, position);
    console.log('Block added in fullscreen editor:', { type, position, newBlockId });
    return newBlockId;
  }, [addBlock]);

  const handleBlockUpdate = useCallback((blockId: string, updates: Partial<ReviewBlock>) => {
    updateBlock(blockId, updates);
  }, [updateBlock]);

  const handleBlockDelete = useCallback((blockId: string) => {
    deleteBlock(blockId);
  }, [deleteBlock]);

  const handleBlockMove = useCallback((blockId: string, direction: 'up' | 'down') => {
    moveBlock(blockId, direction);
  }, [moveBlock]);

  const handleDuplicateBlock = useCallback((blockId: string) => {
    duplicateBlock(blockId);
  }, [duplicateBlock]);
  
  const handleConvertToGrid = useCallback((blockId: string, columns: number) => {
    convertToGrid(blockId, columns);
  }, [convertToGrid]);

  const handleConvertTo2DGrid = useCallback((blockId: string, columns: number, rows: number) => {
    convertTo2DGrid(blockId, columns, rows);
  }, [convertTo2DGrid]);

  const handleMergeBlockIntoGrid = useCallback((draggedBlockId: string, targetRowId: string, targetPosition?: number) => {
    mergeBlockIntoGrid(draggedBlockId, targetRowId, targetPosition);
  }, [mergeBlockIntoGrid]);

  const handlePlaceBlockIn2DGrid = useCallback((blockId: string, gridId: string, position: GridPosition) => {
    placeBlockIn2DGrid(blockId, gridId, position);
  }, [placeBlockIn2DGrid]);

  const handleImport = useCallback((importedBlocks: ReviewBlock[]) => {
    console.log('Importing blocks in fullscreen:', importedBlocks);
    let currentPos = blocks.length;
    importedBlocks.forEach((block) => {
      const newId = addBlock(block.type, currentPos++);
      updateBlock(newId, { ...block, id: newId });
    });
  }, [addBlock, updateBlock, blocks.length]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        // Before closing, consider prompting if there are unsaved changes
        // or automatically save. For now, just close.
        if (hasUnsavedChanges && onSave) {
          // Optionally save before closing on Escape if changes exist
          // onSave(blocks); 
        }
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose, blocks, hasUnsavedChanges, onSave]); // Added dependencies

  return (
    <div 
      className="fixed inset-0 z-[100] bg-background flex flex-col" // Increased z-index
      style={{ backgroundColor: '#121212' }}
    >
      <div 
        className="h-14 border-b flex items-center justify-between px-4 flex-shrink-0"
        style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}
      >
        <h2 className="text-lg font-semibold" style={{ color: '#ffffff' }}>
          Editor de Revisão Nativa - Fullscreen
        </h2>
        <Button
          onClick={onClose} // Consider save prompt here if hasUnsavedChanges
          variant="ghost"
          size="sm"
          className="text-gray-300 hover:text-white"
        >
          <Minimize2 className="w-4 h-4 mr-2" />
          Sair do Fullscreen
        </Button>
      </div>

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
        className="flex-shrink-0"
      />
      
      <div className="flex flex-1 overflow-hidden"> {/* Main content area takes remaining space and handles overflow */}
        {(editorMode === 'edit' || editorMode === 'split') && (
          <div 
            className="w-64 border-r overflow-y-auto flex-shrink-0"
            style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}
          >
            <BlockPalette onBlockAdd={handleAddBlock} />
          </div>
        )}
        
        {(editorMode === 'edit' || editorMode === 'split') && (
          <div 
            className={cn(
              "flex-1 px-2 overflow-visible-force", // Editor needs to be able to show popups/dropdowns
              editorMode === 'split' && "border-r"
            )} 
            style={{ borderColor: '#2a2a2a', backgroundColor: '#121212' }}
          >
            <BlockEditor
              blocks={blocks}
              activeBlockId={activeBlockId}
              onActiveBlockChange={setActiveBlockId}
              onUpdateBlock={handleBlockUpdate}
              onDeleteBlock={handleBlockDelete}
              onMoveBlock={handleBlockMove}
              onAddBlock={handleAddBlock}
              onDuplicateBlock={handleDuplicateBlock}
              onConvertToGrid={handleConvertToGrid}
              onConvertTo2DGrid={handleConvertTo2DGrid}
              onMergeBlockIntoGrid={handleMergeBlockIntoGrid}
              onPlaceBlockIn2DGrid={handlePlaceBlockIn2DGrid}
            />
          </div>
        )}
        
        {(editorMode === 'preview' || editorMode === 'split') && (
          <div className="flex-1 px-2 overflow-y-auto" style={{ backgroundColor: '#121212' }}>
            <ReviewPreview 
              blocks={blocks}
              className="h-full"
            />
          </div>
        )}
      </div>

      <EditorStatusBar
        blockCount={blocks.length}
        activeBlockId={activeBlockId} // activeBlockId is string | null
        className="flex-shrink-0"
      />
    </div>
  );
};
