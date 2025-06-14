
// ABOUTME: Enhanced native editor with fullscreen capability, improved UX, and string ID support
// Main editor container with fullscreen mode support

import React, { useState, useEffect, useCallback } from 'react';
import { ReviewBlock, BlockType } from '@/types/review';
import { BlockEditor } from './BlockEditor';
import { BlockPalette } from './BlockPalette';
import { ReviewPreview } from './ReviewPreview';
import { EditorToolbar, EditorToolbarProps } from './EditorToolbar'; // Import EditorToolbarProps
import { EditorStatusBar, EditorStatusBarProps } from './EditorStatusBar'; // Import EditorStatusBarProps
import { NativeEditorFullscreen } from './NativeEditorFullscreen';
import { useEditorAutoSave } from '@/hooks/useEditorAutoSave';
import { useBlockManagement } from '@/hooks/useBlockManagement';
import { useEditorKeyboardShortcuts } from './hooks/useEditorKeyboardShortcuts';
import { Button } from '@/components/ui/button';
import { Maximize2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { GridPosition } from '@/types/grid';

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

  const { handleSave: triggerAutoSave, isSaving, lastSaved } = useEditorAutoSave({
    data: blocks,
    onSave: onSave ? async (dataToSave) => { onSave(dataToSave); } : undefined,
    interval: 30000,
    enabled: !!issueId && !!onSave
  });

  const handleManualSave = useCallback(() => {
    if (onSave) {
      onSave(blocks);
      setHasUnsavedChanges(false);
    }
    triggerAutoSave();
  }, [blocks, onSave, triggerAutoSave]);

  useEditorKeyboardShortcuts({
    onSave: handleManualSave,
    onUndo: undo,
    onRedo: redo
  });

  useEffect(() => {
    const changed = JSON.stringify(blocks) !== JSON.stringify(initialBlocks);
    setHasUnsavedChanges(changed);
  }, [blocks, initialBlocks]);

  const handleAddBlock = useCallback((type: BlockType, position?: number): string => {
    const newBlockId = addBlock(type, position);
    return newBlockId;
  }, [addBlock]);

  const handleBlockUpdate = useCallback((blockId: string, updates: Partial<ReviewBlock>) => {
    updateBlock(blockId, updates);
  }, [updateBlock]);

  const handleBlockDelete = useCallback((blockId: string) => {
    deleteBlock(blockId);
  }, [deleteBlock]);

  // Ensure this matches useBlockManagement's moveBlock signature
  const handleBlockMove = useCallback((blockId: string, directionOrIndex: 'up' | 'down' | number) => {
    moveBlock(blockId, directionOrIndex);
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
    let currentPos = blocks.length;
    importedBlocks.forEach((block) => {
      const newId = addBlock(block.type, currentPos++);
      updateBlock(newId, { ...block, id: newId });
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
        initialBlocks={blocks}
        onSave={onSave}
        onClose={() => setIsFullscreen(false)}
        mode={editorMode}
      />
    );
  }
  
  const editorToolbarProps: EditorToolbarProps = {
    editorMode,
    onModeChange: setEditorMode,
    hasUnsavedChanges,
    isSaving,
    lastSaved,
    canUndo,
    canRedo,
    onUndo: undo,
    onRedo: redo,
    onSave: handleManualSave,
    blocks,
    onImport: handleImport,
  };

  const editorStatusBarProps: EditorStatusBarProps = {
      blockCount: blocks.length,
      activeBlockId: activeBlockId, // This is string | null, should be fine for EditorStatusBar
  };


  return (
    <div
      className={cn("native-editor h-full flex flex-col overflow-hidden", className)} // Changed overflow-visible-force to overflow-hidden for main container
      style={{ backgroundColor: '#121212' }}
    >
      <div className="flex items-center justify-between p-1 border-b" style={{ borderColor: '#2a2a2a', backgroundColor: '#161616' }}>
        <EditorToolbar {...editorToolbarProps} />
        <Button
          onClick={() => setIsFullscreen(true)}
          variant="ghost"
          size="sm"
          className="flex items-center gap-2 text-gray-300 hover:text-white ml-auto px-2" // Added ml-auto and reduced padding
          title="Editor Fullscreen"
        >
          <Maximize2 className="w-4 h-4" />
          <span className="hidden sm:inline">Fullscreen</span>
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
                "flex-1 px-2 overflow-y-auto", // Changed from overflow-visible-force
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
                onMoveBlock={handleBlockMove} // This is (blockId: string, directionOrIndex: 'up' | 'down' | number)
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
      </div>
      <EditorStatusBar {...editorStatusBarProps} />
    </div>
  );
};
