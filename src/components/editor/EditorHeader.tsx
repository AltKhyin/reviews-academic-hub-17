
// ABOUTME: Editor header with mode controls and save functionality
// Simplified without theme customization features

import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Save, X, Edit3, Eye, SplitSquareHorizontal, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EditorHeaderProps {
  blocksCount: number;
  lastSaved?: Date | null;
  editorMode: 'edit' | 'preview' | 'split';
  onModeChange: (mode: 'edit' | 'preview' | 'split') => void;
  showThemeCustomizer: boolean;
  onToggleThemeCustomizer: () => void;
  onSave: () => void;
  onCancel: () => void;
  isSaving: boolean;
}

const editorModes = [
  { key: 'edit', label: 'Editar', icon: Edit3 },
  { key: 'preview', label: 'Visualizar', icon: Eye },
  { key: 'split', label: 'Dividido', icon: SplitSquareHorizontal }
];

export const EditorHeader: React.FC<EditorHeaderProps> = ({
  blocksCount,
  lastSaved,
  editorMode,
  onModeChange,
  onSave,
  onCancel,
  isSaving
}) => {
  const formatLastSaved = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Agora mesmo';
    if (minutes === 1) return 'Há 1 minuto';
    if (minutes < 60) return `Há ${minutes} minutos`;
    
    return date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div 
      className="flex items-center justify-between p-4 border-b editor-header"
      style={{ 
        backgroundColor: 'var(--editor-primary-bg)',
        borderColor: 'var(--editor-primary-border)'
      }}
    >
      {/* Left Section - Info */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold" style={{ color: 'var(--editor-primary-text)' }}>
            Editor Nativo
          </h2>
          <Badge variant="outline" style={{ color: 'var(--editor-muted-text)' }}>
            {blocksCount} {blocksCount === 1 ? 'bloco' : 'blocos'}
          </Badge>
        </div>
        
        {lastSaved && (
          <div className="flex items-center gap-1 text-sm" style={{ color: 'var(--editor-muted-text)' }}>
            <Clock className="w-4 h-4" />
            <span>Salvo {formatLastSaved(lastSaved)}</span>
          </div>
        )}
      </div>

      {/* Center Section - Mode Switcher */}
      <div 
        className="flex items-center rounded-lg p-1"
        style={{ backgroundColor: 'var(--editor-secondary-bg)' }}
      >
        {editorModes.map((mode) => {
          const Icon = mode.icon;
          const isActive = editorMode === mode.key;
          
          return (
            <Button
              key={mode.key}
              variant={isActive ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onModeChange(mode.key as any)}
              className={cn(
                "flex items-center gap-2 transition-all",
                isActive && "shadow-sm"
              )}
              style={{
                backgroundColor: isActive ? 'var(--editor-button-primary)' : 'transparent',
                color: isActive ? '#ffffff' : 'var(--editor-primary-text)'
              }}
            >
              <Icon className="w-4 h-4" />
              {mode.label}
            </Button>
          );
        })}
      </div>

      {/* Right Section - Actions */}
      <div className="flex items-center gap-2">
        <Button
          onClick={onSave}
          disabled={isSaving}
          size="sm"
          style={{ 
            backgroundColor: 'var(--editor-success-color)',
            color: '#ffffff'
          }}
          className="hover:opacity-90"
        >
          <Save className="w-4 h-4 mr-2" />
          {isSaving ? 'Salvando...' : 'Salvar'}
        </Button>
        
        <Button
          onClick={onCancel}
          variant="ghost"
          size="sm"
          style={{ color: 'var(--editor-muted-text)' }}
          className="hover:bg-[var(--editor-hover-bg)]"
        >
          <X className="w-4 h-4 mr-2" />
          Cancelar
        </Button>
      </div>
    </div>
  );
};
