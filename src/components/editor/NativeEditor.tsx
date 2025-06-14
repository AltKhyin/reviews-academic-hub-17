
// ABOUTME: Enhanced native editor with fullscreen capability, improved UX, and string ID support
// Main editor container with fullscreen mode support

import React, { useState, useEffect, useCallback } from 'react';
import { ReviewBlock, BlockType } from '@/types/review'; // Added BlockType
import { BlockEditor } from './BlockEditor';
import { BlockPalette } from './BlockPalette';
import { ReviewPreview } from './ReviewPreview';
import { EditorToolbar } from './EditorToolbar';
import { EditorStatusBar } from './EditorStatusBar';
import { NativeEditorFullscreen } from './NativeEditorFullscreen';
import { useEditorAutoSave } from '@/hooks/useEditorAutoSave';
import { useBlockManagement } from '@/hooks/useBlockManagement';
import { useEditorKeyboardShortcuts } from './hooks/useEditorKeyboardShortcuts';
import { Button } from '@/components/ui/button';
import { Maximize2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { GridPosition } from '@/types/grid'; // Added

interface NativeEditorProps {
  issueId?: string;
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
  // onCancel, // Not used in this component's logic
  mode: initialMode = 'split',
  className
}) => {
  const [editorMode, setEditorMode] = useState<'edit' | 'preview' | 'split'>(initialMode);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

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

  // Auto-save setup
  const { handleSave: triggerAutoSave, isSaving, lastSaved } = useEditorAutoSave({
    data: blocks,
    onSave: onSave ? async (dataToSave) => { onSave(dataToSave); } : undefined,
    interval: 30000, // 30 seconds
    enabled: !!issueId && !!onSave // Only enable if issueId and onSave are provided
  });

  // Manual save handler
  const handleManualSave = useCallback(() => {
    if (onSave) {
      onSave(blocks);
      setHasUnsavedChanges(false); // Reset after manual save
    }
    // Also trigger auto-save logic if needed, or rely on its interval
    triggerAutoSave(); 
  }, [blocks, onSave, triggerAutoSave]);

  // Keyboard shortcuts
  useEditorKeyboardShortcuts({
    onSave: handleManualSave,
    onUndo: undo,
    onRedo: redo
  });

  // Track unsaved changes
  useEffect(() => {
    // Compare current blocks with the initial state or last saved state
    // For simplicity, comparing with initialBlocks. A more robust check might compare with last successfully saved blocks.
    const changed = JSON.stringify(blocks) !== JSON.stringify(initialBlocks);
    setHasUnsavedChanges(changed);
  }, [blocks, initialBlocks]);

  const handleAddBlock = useCallback((type: BlockType, position?: number): string => {
    const newBlockId = addBlock(type, position);
    console.log('Block added in NativeEditor:', { type, position, newBlockId });
    return newBlockId; // addBlock now returns string ID
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
    duplicateBlock(blockId); // duplicateBlock now returns new ID, but not used here
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
    console.log('Importing blocks:', importedBlocks);
    // A more sophisticated import might involve clearing existing blocks or merging.
    // For now, append and re-initialize. This is a destructive import.
    let currentPos = blocks.length;
    importedBlocks.forEach((block) => {
      const newId = addBlock(block.type, currentPos++);
      updateBlock(newId, { ...block, id: newId }); // Ensure imported block uses new ID
    });
  }, [addBlock, updateBlock, blocks.length]);

  useEffect(() => {
    const handleViewModeChange = (event: CustomEvent) => {
      const { mode: newMode } = event.detail;
      if (['edit', 'preview', 'split'].includes(newMode)) {
        setEditorMode(newMode as 'edit' | 'preview' | 'split');
      }
    };
    window.addEventListener('viewModeChange', handleViewModeChange as EventListener);
    return () => window.removeEventListener('viewModeChange', handleViewModeChange as EventListener);
  }, []);

  if (isFullscreen) {
    return (
      <NativeEditorFullscreen
        issueId={issueId}
        initialBlocks={blocks} // Pass current blocks
        onSave={onSave} // Pass save handler
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
        <Button
          onClick={() => setIsFullscreen(true)}
          variant="ghost"
          size="sm"
          className="flex items-center gap-2 text-gray-300 hover:text-white"
          title="Editor Fullscreen"
        >
          <Maximize2 className="w-4 h-4" />
          Fullscreen
        </Button>
      </div>
      
      <div className="flex-1 overflow-hidden">
        <div className="h-full flex">
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
                "flex-1 px-2 overflow-visible-force", // Ensure editor content can overflow if needed for popups etc.
                editorMode === 'split' && "border-r"
              )} 
              style={{ borderColor: '#2a2a2a', backgroundColor: '#121212' }} // Main editor area background
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
            <div className="flex-1 px-2 overflow-y-auto" style={{ backgroundColor: '#121212' }}> {/* Preview area background */}
              <ReviewPreview 
                blocks={blocks}
                className="h-full" // Ensure preview takes full height of its container
              />
            </div>
          )}
        </div>
      </div>

      <EditorStatusBar
        blockCount={blocks.length}
        activeBlockId={activeBlockId} // activeBlockId is string | null
      />
    </div>
  );
};
