
// ABOUTME: Editor toolbar with mode switching and action buttons
// Centralized toolbar component for the native editor

import React from 'react';
import { Button } from '@/components/ui/button';
import { ImportExportManager } from './ImportExportManager';
import { ReviewBlock } from '@/types/review';
import { 
  Save, 
  Eye, 
  Undo2, 
  Redo2,
  SplitSquareHorizontal,
  Edit3
} from 'lucide-react';

interface EditorToolbarProps {
  editorMode: 'edit' | 'preview' | 'split';
  onModeChange: (mode: 'edit' | 'preview' | 'split') => void;
  hasUnsavedChanges: boolean;
  isSaving: boolean;
  lastSaved?: Date;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onSave: () => void;
  blocks: ReviewBlock[];
  onImport: (blocks: ReviewBlock[]) => void;
}

export const EditorToolbar: React.FC<EditorToolbarProps> = ({
  editorMode,
  onModeChange,
  hasUnsavedChanges,
  isSaving,
  lastSaved,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onSave,
  blocks,
  onImport
}) => {
  return (
    <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: '#2a2a2a' }}>
      <div className="flex items-center gap-3">
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
          onImport={onImport}
        />

        {/* Undo/Redo */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onUndo}
          disabled={!canUndo}
          className="h-8 w-8 p-0"
          title="Desfazer (Ctrl+Z)"
        >
          <Undo2 className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onRedo}
          disabled={!canRedo}
          className="h-8 w-8 p-0"
          title="Refazer (Ctrl+Shift+Z)"
        >
          <Redo2 className="w-4 h-4" />
        </Button>

        {/* Mode Switcher */}
        <div 
          className="flex items-center rounded-lg p-1 mr-2"
          style={{ backgroundColor: '#2a2a2a' }}
        >
          <Button
            variant={editorMode === 'edit' ? "default" : "ghost"}
            size="sm"
            onClick={() => onModeChange('edit')}
            className="flex items-center gap-2"
          >
            <Edit3 className="w-4 h-4" />
            Editar
          </Button>
          <Button
            variant={editorMode === 'split' ? "default" : "ghost"}
            size="sm"
            onClick={() => onModeChange('split')}
            className="flex items-center gap-2"
          >
            <SplitSquareHorizontal className="w-4 h-4" />
            Dividir
          </Button>
          <Button
            variant={editorMode === 'preview' ? "default" : "ghost"}
            size="sm"
            onClick={() => onModeChange('preview')}
            className="flex items-center gap-2"
          >
            <Eye className="w-4 h-4" />
            Preview
          </Button>
        </div>

        {/* Save Button */}
        <Button
          onClick={onSave}
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
};
