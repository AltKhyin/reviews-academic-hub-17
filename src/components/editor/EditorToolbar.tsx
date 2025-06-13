
// ABOUTME: Editor toolbar with mode switching and save controls
// Provides editing mode controls and document management

import React from 'react';
import { Button } from '@/components/ui/button';
import { ReviewBlock } from '@/types/review';
import { 
  Save, 
  Undo2, 
  Redo2, 
  Eye, 
  Edit, 
  Columns,
  Upload,
  Clock
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
    <div className="editor-toolbar flex items-center justify-between p-3 border-b bg-gray-900/50" style={{ borderColor: '#2a2a2a' }}>
      <div className="flex items-center gap-2">
        {/* Mode Toggle */}
        <div className="flex border rounded overflow-hidden" style={{ borderColor: '#2a2a2a' }}>
          <Button
            variant={editorMode === 'edit' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onModeChange('edit')}
            className="rounded-none border-0"
          >
            <Edit className="w-4 h-4 mr-1" />
            Editor
          </Button>
          <Button
            variant={editorMode === 'split' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onModeChange('split')}
            className="rounded-none border-0"
          >
            <Columns className="w-4 h-4 mr-1" />
            Dividir
          </Button>
          <Button
            variant={editorMode === 'preview' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onModeChange('preview')}
            className="rounded-none border-0"
          >
            <Eye className="w-4 h-4 mr-1" />
            Preview
          </Button>
        </div>

        {/* Undo/Redo */}
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={onUndo}
            disabled={!canUndo}
            title="Desfazer (Ctrl+Z)"
          >
            <Undo2 className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onRedo}
            disabled={!canRedo}
            title="Refazer (Ctrl+Y)"
          >
            <Redo2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Save Status */}
        {lastSaved && (
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <Clock className="w-3 h-3" />
            Salvo às {lastSaved.toLocaleTimeString()}
          </div>
        )}

        {/* Save Button */}
        <Button
          variant={hasUnsavedChanges ? 'default' : 'ghost'}
          size="sm"
          onClick={onSave}
          disabled={isSaving}
          className={hasUnsavedChanges ? 'bg-blue-600 hover:bg-blue-700' : ''}
        >
          <Save className="w-4 h-4 mr-1" />
          {isSaving ? 'Salvando...' : hasUnsavedChanges ? 'Salvar' : 'Salvo'}
        </Button>
      </div>
    </div>
  );
};
