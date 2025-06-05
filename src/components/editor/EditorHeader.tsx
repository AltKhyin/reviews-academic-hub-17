
// ABOUTME: Header component for the native editor with mode switcher and actions
// Provides toolbar functionality and editor state display

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Layers, 
  Code, 
  Eye, 
  Settings, 
  Save, 
  Palette 
} from 'lucide-react';

interface EditorHeaderProps {
  blocksCount: number;
  lastSaved: Date | null;
  editorMode: 'edit' | 'preview' | 'split';
  onModeChange: (mode: 'edit' | 'preview' | 'split') => void;
  showThemeCustomizer: boolean;
  onToggleThemeCustomizer: () => void;
  onSave: () => void;
  onCancel: () => void;
  isSaving: boolean;
}

export const EditorHeader: React.FC<EditorHeaderProps> = ({
  blocksCount,
  lastSaved,
  editorMode,
  onModeChange,
  showThemeCustomizer,
  onToggleThemeCustomizer,
  onSave,
  onCancel,
  isSaving
}) => {
  return (
    <div className="editor-header">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5" style={{ color: 'var(--editor-accent-text)' }} />
            <h2 className="text-xl font-semibold" style={{ color: 'var(--editor-primary-text)' }}>
              Editor de Revisão Nativa
            </h2>
          </div>
          <Badge 
            variant="outline" 
            style={{
              backgroundColor: 'var(--editor-card-bg)',
              color: 'var(--editor-primary-text)',
              borderColor: 'var(--editor-primary-border)'
            }}
          >
            {blocksCount} {blocksCount === 1 ? 'bloco' : 'blocos'}
          </Badge>
          {lastSaved && (
            <span className="text-xs" style={{ color: 'var(--editor-muted-text)' }}>
              Salvo às {lastSaved.toLocaleTimeString()}
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {/* Mode Switcher */}
          <div 
            className="flex border rounded-lg overflow-hidden"
            style={{
              borderColor: 'var(--editor-primary-border)',
              backgroundColor: 'var(--editor-card-bg)'
            }}
          >
            <Button
              variant={editorMode === 'edit' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onModeChange('edit')}
              className="rounded-none border-0"
              style={{
                backgroundColor: editorMode === 'edit' 
                  ? 'var(--editor-button-primary)' 
                  : 'var(--editor-card-bg)',
                color: 'var(--editor-primary-text)'
              }}
            >
              <Code className="w-4 h-4 mr-1" />
              Editar
            </Button>
            <Button
              variant={editorMode === 'preview' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onModeChange('preview')}
              className="rounded-none border-0"
              style={{
                backgroundColor: editorMode === 'preview' 
                  ? 'var(--editor-button-primary)' 
                  : 'var(--editor-card-bg)',
                color: 'var(--editor-primary-text)'
              }}
            >
              <Eye className="w-4 h-4 mr-1" />
              Visualizar
            </Button>
            <Button
              variant={editorMode === 'split' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onModeChange('split')}
              className="rounded-none border-0"
              style={{
                backgroundColor: editorMode === 'split' 
                  ? 'var(--editor-button-primary)' 
                  : 'var(--editor-card-bg)',
                color: 'var(--editor-primary-text)'
              }}
            >
              <Settings className="w-4 h-4 mr-1" />
              Dividido
            </Button>
          </div>
          
          <Separator 
            orientation="vertical" 
            className="h-6" 
            style={{ borderColor: 'var(--editor-primary-border)' }}
          />
          
          {/* Theme Customizer Toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={onToggleThemeCustomizer}
            style={{
              borderColor: 'var(--editor-primary-border)',
              backgroundColor: showThemeCustomizer 
                ? 'var(--editor-active-bg)' 
                : 'var(--editor-card-bg)',
              color: 'var(--editor-primary-text)'
            }}
          >
            <Palette className="w-4 h-4 mr-1" />
            Tema
          </Button>
          
          {/* Action Buttons */}
          <Button 
            variant="outline" 
            onClick={onCancel}
            style={{
              borderColor: 'var(--editor-primary-border)',
              color: 'var(--editor-primary-text)',
              backgroundColor: 'var(--editor-card-bg)'
            }}
          >
            Cancelar
          </Button>
          <Button 
            onClick={onSave} 
            disabled={isSaving}
            style={{
              backgroundColor: 'var(--editor-button-primary)',
              color: 'var(--editor-primary-text)'
            }}
          >
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </div>
    </div>
  );
};
