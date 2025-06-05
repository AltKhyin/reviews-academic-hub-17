
// ABOUTME: Simplified native editor with unified interface and improved UX
// Single-view editor with integrated layout controls and better performance

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { ReviewBlock, BlockType } from '@/types/review';
import { BlockEditor } from './BlockEditor';
import { BlockPalette } from './BlockPalette';
import { ReviewPreview } from './ReviewPreview';
import { ImportExportManager } from './ImportExportManager';
import { 
  Save, 
  Eye, 
  Undo2, 
  Redo2,
  SplitSquareHorizontal,
  Edit3
} from 'lucide-react';
import { useEditorAutoSave } from '@/hooks/useEditorAutoSave';
import { useBlockManagement } from '@/hooks/useBlockManagement';
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
    history,
    historyIndex,
    setActiveBlockId,
    addBlock,
    updateBlock,
    deleteBlock,
    moveBlock,
    duplicateBlock,
    convertToGrid,
    mergeBlockIntoGrid,
    undo,
    redo,
    canUndo,
    canRedo
  } = useBlockManagement({ initialBlocks, issueId });

  // Auto-save functionality
  const { handleSave, isSaving, lastSaved } = useEditorAutoSave({
    data: blocks,
    onSave: onSave ? async (data) => { onSave(data); } : undefined,
    interval: 30000, // 30 seconds
    enabled: !!issueId
  });

  // Track changes
  useEffect(() => {
    const hasChanges = JSON.stringify(blocks) !== JSON.stringify(initialBlocks);
    setHasUnsavedChanges(hasChanges);
  }, [blocks, initialBlocks]);

  const handleManualSave = useCallback(() => {
    if (onSave) {
      onSave(blocks);
      setHasUnsavedChanges(false);
    }
  }, [blocks, onSave]);

  const handleImport = useCallback((importedBlocks: ReviewBlock[]) => {
    console.log('Importing blocks:', importedBlocks);
    // Clear existing blocks and import new ones
    importedBlocks.forEach((block, index) => {
      if (index === 0) {
        // Clear existing blocks first
        addBlock(block.type, 0);
        updateBlock(blocks[0]?.id || 0, block);
      } else {
        addBlock(block.type, index);
        const newBlockId = -(Date.now() + Math.random() + index);
        updateBlock(newBlockId, { ...block, id: newBlockId });
      }
    });
  }, [addBlock, updateBlock, blocks]);

  const handleKeyboardShortcuts = useCallback((e: KeyboardEvent) => {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 's':
          e.preventDefault();
          handleManualSave();
          break;
        case 'z':
          if (e.shiftKey) {
            e.preventDefault();
            redo();
          } else {
            e.preventDefault();
            undo();
          }
          break;
        case 'y':
          e.preventDefault();
          redo();
          break;
      }
    }
  }, [handleManualSave, undo, redo]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyboardShortcuts);
    return () => document.removeEventListener('keydown', handleKeyboardShortcuts);
  }, [handleKeyboardShortcuts]);

  const renderToolbar = () => (
    <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: '#2a2a2a' }}>
      <div className="flex items-center gap-3">
        <h1 className="text-lg font-semibold" style={{ color: '#ffffff' }}>
          Editor Nativo
        </h1>
        
        {/* Save Status */}
        <div className="flex items-center gap-2 text-xs" style={{ color: '#9ca3af' }}>
          {hasUnsavedChanges && (
            <span style={{ color: '#f59e0b' }}>● Não salvo</span>
          )}
          {isSaving && (
            <span style={{ color: '#3b82f6' }}>Salvando...</span>
          )}
          {!isSaving && lastSaved && (
            <span>Salvo {lastSaved.toLocaleTimeString()}</span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Import/Export */}
        <ImportExportManager
          blocks={blocks}
          onImport={handleImport}
        />

        {/* Undo/Redo */}
        <Button
          variant="ghost"
          size="sm"
          onClick={undo}
          disabled={!canUndo}
          className="h-8 w-8 p-0"
          title="Desfazer (Ctrl+Z)"
        >
          <Undo2 className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={redo}
          disabled={!canRedo}
          className="h-8 w-8 p-0"
          title="Refazer (Ctrl+Shift+Z)"
        >
          <Redo2 className="w-4 h-4" />
        </Button>

        {/* Mode Switcher - Working Controls */}
        <div 
          className="flex items-center rounded-lg p-1 mr-2"
          style={{ backgroundColor: '#2a2a2a' }}
        >
          <Button
            variant={editorMode === 'edit' ? "default" : "ghost"}
            size="sm"
            onClick={() => setEditorMode('edit')}
            className="flex items-center gap-2"
          >
            <Edit3 className="w-4 h-4" />
            Editar
          </Button>
          <Button
            variant={editorMode === 'split' ? "default" : "ghost"}
            size="sm"
            onClick={() => setEditorMode('split')}
            className="flex items-center gap-2"
          >
            <SplitSquareHorizontal className="w-4 h-4" />
            Dividir
          </Button>
          <Button
            variant={editorMode === 'preview' ? "default" : "ghost"}
            size="sm"
            onClick={() => setEditorMode('preview')}
            className="flex items-center gap-2"
          >
            <Eye className="w-4 h-4" />
            Preview
          </Button>
        </div>

        {/* Save Button */}
        <Button
          onClick={handleManualSave}
          disabled={!hasUnsavedChanges}
          className="flex items-center gap-2"
          size="sm"
        >
          <Save className="w-4 h-4" />
          Salvar
        </Button>
      </div>
    </div>
  );

  return (
    <div className={cn("native-editor h-full flex flex-col", className)}>
      {renderToolbar()}
      
      <div className="flex-1 overflow-hidden">
        <div className="h-full flex">
          {/* Block Palette - Only show in edit mode */}
          {(editorMode === 'edit' || editorMode === 'split') && (
            <div 
              className="w-64 border-r overflow-y-auto flex-shrink-0"
              style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}
            >
              <BlockPalette onAddBlock={addBlock} />
            </div>
          )}
          
          {/* Editor - Only show in edit and split modes */}
          {(editorMode === 'edit' || editorMode === 'split') && (
            <div className={cn("flex-1", editorMode === 'split' && "border-r")} style={{ borderColor: '#2a2a2a' }}>
              <BlockEditor
                blocks={blocks}
                activeBlockId={activeBlockId}
                onActiveBlockChange={setActiveBlockId}
                onUpdateBlock={updateBlock}
                onDeleteBlock={deleteBlock}
                onMoveBlock={moveBlock}
                onAddBlock={addBlock}
                onDuplicateBlock={duplicateBlock}
                onConvertToGrid={convertToGrid}
                onMergeBlockIntoGrid={mergeBlockIntoGrid}
              />
            </div>
          )}
          
          {/* Preview - Show in preview and split modes */}
          {(editorMode === 'preview' || editorMode === 'split') && (
            <div className="flex-1">
              <ReviewPreview 
                blocks={blocks}
                className="h-full"
              />
            </div>
          )}
        </div>
      </div>

      {/* Status Bar */}
      <div 
        className="px-4 py-2 border-t flex items-center justify-between text-xs"
        style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a', color: '#9ca3af' }}
      >
        <div className="flex items-center gap-4">
          <span>{blocks.length} blocos</span>
          <span>Bloco ativo: {activeBlockId ? `#${activeBlockId}` : 'Nenhum'}</span>
        </div>
        
        <div className="flex items-center gap-4">
          <span>Ctrl+S para salvar</span>
          <span>Ctrl+Z para desfazer</span>
          <span>Arrastar para reordenar</span>
        </div>
      </div>
    </div>
  );
};
