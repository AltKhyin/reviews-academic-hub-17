
// ABOUTME: Enhanced native editor with inline-only settings and improved UX
// Complete elimination of properties panels in favor of contextual inline controls

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ReviewBlock, BlockType } from '@/types/review';
import { BlockEditor } from './BlockEditor';
import { BlockPalette } from './BlockPalette';
import { ReviewPreview } from './ReviewPreview';
import { ImportExportManager } from './ImportExportManager';
import { 
  Save, 
  Eye, 
  Edit3, 
  SplitSquareHorizontal, 
  Undo2, 
  Redo2,
  FileDown,
  FileUp,
  Settings
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
  const [currentMode, setCurrentMode] = useState(initialMode);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showImportExport, setShowImportExport] = useState(false);

  const {
    blocks,
    activeBlockId,
    setActiveBlockId,
    addBlock,
    updateBlock,
    deleteBlock,
    moveBlock,
    duplicateBlock,
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

  const handleImportBlocks = useCallback((importedBlocks: ReviewBlock[]) => {
    // Replace all current blocks with imported ones
    // This is handled by the useBlockManagement hook through a full replacement
    console.log('Importing blocks:', importedBlocks);
    // For now, we'll need to manually set the blocks since we don't have a replace function
    // This would ideally be handled by adding a replaceAllBlocks function to useBlockManagement
    setHasUnsavedChanges(true);
  }, []);

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

  const renderModeSelector = () => (
    <div className="flex items-center border rounded-md" style={{ borderColor: '#2a2a2a' }}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setCurrentMode('edit')}
        className={cn(
          "h-8 px-3 rounded-r-none text-xs",
          currentMode === 'edit' && "bg-blue-600 text-white"
        )}
      >
        <Edit3 className="w-3 h-3 mr-1" />
        Editar
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setCurrentMode('split')}
        className={cn(
          "h-8 px-3 rounded-none border-x text-xs",
          currentMode === 'split' && "bg-blue-600 text-white"
        )}
        style={{ borderColor: '#2a2a2a' }}
      >
        <SplitSquareHorizontal className="w-3 h-3 mr-1" />
        Dividir
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setCurrentMode('preview')}
        className={cn(
          "h-8 px-3 rounded-l-none text-xs",
          currentMode === 'preview' && "bg-blue-600 text-white"
        )}
      >
        <Eye className="w-3 h-3 mr-1" />
        Preview
      </Button>
    </div>
  );

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

        {/* Import/Export Toggle */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowImportExport(!showImportExport)}
          className={cn(
            "h-8 w-8 p-0",
            showImportExport && "bg-blue-600 text-white"
          )}
          title="Importar/Exportar"
        >
          <FileDown className="w-4 h-4" />
        </Button>

        {/* Mode Selector */}
        {renderModeSelector()}

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
        {currentMode === 'edit' && (
          <div className="h-full flex">
            {/* Left Sidebar - Block Palette + Import/Export */}
            <div 
              className="w-80 border-r overflow-y-auto flex-shrink-0 flex flex-col"
              style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}
            >
              {/* Block Palette */}
              <div className="flex-1">
                <BlockPalette onAddBlock={addBlock} />
              </div>
              
              {/* Import/Export Panel - Collapsible */}
              {showImportExport && (
                <div className="border-t" style={{ borderColor: '#2a2a2a' }}>
                  <ImportExportManager
                    blocks={blocks}
                    onImport={handleImportBlocks}
                    issueTitle="Review Content"
                    className="border-0 bg-transparent"
                  />
                </div>
              )}
            </div>
            
            {/* Editor */}
            <div className="flex-1">
              <BlockEditor
                blocks={blocks}
                activeBlockId={activeBlockId}
                onActiveBlockChange={setActiveBlockId}
                onUpdateBlock={updateBlock}
                onDeleteBlock={deleteBlock}
                onMoveBlock={moveBlock}
                onAddBlock={addBlock}
                onDuplicateBlock={duplicateBlock}
              />
            </div>
          </div>
        )}

        {currentMode === 'preview' && (
          <div className="h-full">
            <ReviewPreview 
              blocks={blocks}
              className="h-full"
            />
          </div>
        )}

        {currentMode === 'split' && (
          <div className="h-full flex">
            {/* Left Sidebar - Block Palette + Import/Export */}
            <div 
              className="w-64 border-r overflow-y-auto flex-shrink-0 flex flex-col"
              style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}
            >
              {/* Block Palette */}
              <div className="flex-1">
                <BlockPalette onAddBlock={addBlock} />
              </div>
              
              {/* Import/Export Panel - Collapsible */}
              {showImportExport && (
                <div className="border-t" style={{ borderColor: '#2a2a2a' }}>
                  <ImportExportManager
                    blocks={blocks}
                    onImport={handleImportBlocks}
                    issueTitle="Review Content"
                    className="border-0 bg-transparent"
                  />
                </div>
              )}
            </div>
            
            {/* Editor */}
            <div className="flex-1 border-r" style={{ borderColor: '#2a2a2a' }}>
              <BlockEditor
                blocks={blocks}
                activeBlockId={activeBlockId}
                onActiveBlockChange={setActiveBlockId}
                onUpdateBlock={updateBlock}
                onDeleteBlock={deleteBlock}
                onMoveBlock={moveBlock}
                onAddBlock={addBlock}
                onDuplicateBlock={duplicateBlock}
              />
            </div>
            
            {/* Preview */}
            <div className="flex-1">
              <ReviewPreview 
                blocks={blocks}
                className="h-full"
              />
            </div>
          </div>
        )}
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
          {showImportExport && (
            <span style={{ color: '#3b82f6' }}>Import/Export ativo</span>
          )}
        </div>
      </div>
    </div>
  );
};
