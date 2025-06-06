
// ABOUTME: Refactored native editor with extracted hooks and better organization
// Main editor container using focused sub-components and hooks

import React, { useState, useEffect, useCallback } from 'react';
import { ReviewBlock } from '@/types/review';
import { BlockEditor } from './BlockEditor';
import { BlockPalette } from './BlockPalette';
import { ReviewPreview } from './ReviewPreview';
import { EditorToolbar } from './EditorToolbar';
import { EditorStatusBar } from './EditorStatusBar';
import { useEditorAutoSave } from '@/hooks/useEditorAutoSave';
import { useBlockManagement } from '@/hooks/useBlockManagement';
import { useEditorKeyboardShortcuts } from './hooks/useEditorKeyboardShortcuts';
import { cn } from '@/lib/utils';

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
  onCancel,
  mode: initialMode = 'split',
  className
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
  useEffect(() => {
    const hasChanges = JSON.stringify(blocks) !== JSON.stringify(initialBlocks);
    setHasUnsavedChanges(hasChanges);
  }, [blocks, initialBlocks]);

  const handleAddBlock = useCallback((type: any, position?: number) => {
    const newBlockId = addBlock(type, position);
    console.log('Block added in NativeEditor:', { type, position, newBlockId });
    return newBlockId;
  }, [addBlock]);

  const handleImport = useCallback((importedBlocks: ReviewBlock[]) => {
    console.log('Importing blocks:', importedBlocks);
    importedBlocks.forEach((block, index) => {
      if (index === 0) {
        const firstBlockId = addBlock(block.type, 0);
        updateBlock(firstBlockId, block);
      } else {
        const newBlockId = addBlock(block.type, index);
        updateBlock(newBlockId, { ...block, id: newBlockId });
      }
    });
  }, [addBlock, updateBlock]);

  return (
    <div 
      className={cn("native-editor h-full flex flex-col overflow-visible-force", className)}
      style={{ backgroundColor: '#121212' }}
    >
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
      </div>

      <EditorStatusBar
        blockCount={blocks.length}
        activeBlockId={activeBlockId}
      />
    </div>
  );
};
