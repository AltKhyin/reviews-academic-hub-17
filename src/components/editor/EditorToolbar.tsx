
// ABOUTME: Toolbar for the native block editor, providing primary block/document actions.
import React from 'react';
import { Button } from '@/components/ui/button';
import { Undo, Redo, Save, Plus } from 'lucide-react';
import { BlockType } from '@/types/review';

export interface EditorToolbarProps {
  onAddBlock: (type: BlockType) => void;
  onSave: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
}

export const EditorToolbar: React.FC<EditorToolbarProps> = ({
  onAddBlock,
  onSave,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
}) => {
  return (
    <div className="flex items-center justify-between p-2 border-b border-gray-700 bg-gray-800 text-white sticky top-0 z-30">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={() => onAddBlock('text')} title="Adicionar Bloco de Texto">
          <Plus className="w-4 h-4 mr-2" /> Adicionar Bloco
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={onUndo} disabled={!canUndo} title="Desfazer">
            <Undo className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onRedo} disabled={!canRedo} title="Refazer">
            <Redo className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="w-px h-6 bg-gray-600" /> 
        
        <Button 
            variant="default" 
            size="sm" 
            onClick={onSave} 
            className="bg-blue-600 hover:bg-blue-700 text-white min-w-[90px]"
            title="Salvar Alterações"
        >
          <Save className="w-4 h-4 mr-2" /> Salvar
        </Button>
      </div>
    </div>
  );
};
