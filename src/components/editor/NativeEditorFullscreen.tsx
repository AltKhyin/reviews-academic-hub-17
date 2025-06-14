
// ABOUTME: Fullscreen native editor with immersive editing experience and string ID support
// Provides dedicated workspace for complex review creation

import React, { useCallback, useEffect, useState, Dispatch, SetStateAction } from 'react';
import { ReviewBlock, BlockType } from '@/types/review';
import { BlockEditor } from './BlockEditor';
import { BlockPalette } from './BlockPalette';
import { ReviewPreview } from './ReviewPreview';
import { EditorToolbar, EditorToolbarProps } from './EditorToolbar'; // Correctly imports EditorToolbarProps
import { EditorStatusBar, EditorStatusBarProps } from './EditorStatusBar'; // Import EditorStatusBarProps
import { useBlockManagement } from '@/hooks/useBlockManagement';
import { useEditorAutoSave } from '@/hooks/useEditorAutoSave';
import { useEditorKeyboardShortcuts } from './hooks/useEditorKeyboardShortcuts';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Minimize2 } from 'lucide-react';
import { GridPosition } from '@/types/grid';

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
  const [editorMode, setEditorMode] = useState<'edit' | 'preview' | 'split'>(initialMode);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const {
    blocks,
    activeBlockId,
    setActiveBlockId,
    addBlock,
    updateBlock,
    deleteBlock,
    moveBlock, // This is (blockId: string, directionOrIndex: "up" | "down" | number) => void;
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

  // Correctly typed to match useBlockManagement's moveBlock
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
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (hasUnsavedChanges && onSave) {
          // onSave(blocks); 
        }
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose, blocks, hasUnsavedChanges, onSave]);

  const editorToolbarProps: EditorToolbarProps = {
    editorMode,
    onModeChange: setEditorMode as Dispatch<SetStateAction<"edit" | "preview" | "split">>,
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
      activeBlockId: activeBlockId,
  };


  return (
    <div
      className="fixed inset-0 z-[100] bg-background flex flex-col"
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
          onClick={onClose}
          variant="ghost"
          size="sm"
          className="text-gray-300 hover:text-white"
        >
          <Minimize2 className="w-4 h-4 mr-2" />
          Sair do Fullscreen
        </Button>
      </div>

      <EditorToolbar {...editorToolbarProps} />

      <div className="flex flex-1 overflow-hidden">
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
              onMoveBlock={handleBlockMove} // Passes the correctly typed function
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
      <EditorStatusBar {...editorStatusBarProps} />
    </div>
  );
};
