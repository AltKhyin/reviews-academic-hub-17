// ABOUTME: Toolbar for the native block editor, providing controls for mode, save, undo/redo.
// Assuming this file exists and needs EditorToolbarProps exported.
import React, { Dispatch, SetStateAction } from 'react'; // Added Dispatch, SetStateAction
import { Button } from '@/components/ui/button';
import { Undo, Redo, Save, Eye, Edit, Columns, FileDown, FileUp } from 'lucide-react';
import { ReviewBlock } from '@/types/review'; // Added ReviewBlock

// ... (rest of the imports if any)

export interface EditorToolbarProps {
  editorMode: 'edit' | 'preview' | 'split';
  onModeChange: Dispatch<SetStateAction<'edit' | 'preview' | 'split'>>;
  hasUnsavedChanges: boolean;
  isSaving: boolean;
  lastSaved: Date | null;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onSave: () => void;
  blocks: ReviewBlock[]; // For export functionality
  onImport: (blocks: ReviewBlock[]) => void; // For import functionality
  // Add any other props the toolbar might need
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
  onImport,
}) => {
  const handleExport = () => {
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(blocks, null, 2)
    )}`;
    const link = document.createElement("a");
    link.href = jsonString;
    link.download = "review-blocks.json";
    link.click();
  };

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const imported = JSON.parse(e.target?.result as string) as ReviewBlock[];
          // Basic validation (can be more thorough)
          if (Array.isArray(imported) && imported.every(block => block.id && block.type && block.content !== undefined)) {
            onImport(imported);
          } else {
            alert("Invalid file format.");
          }
        } catch (error) {
          console.error("Failed to parse imported file:", error);
          alert("Failed to import file. Check console for details.");
        }
      };
      reader.readAsText(file);
    }
    // Reset file input to allow importing the same file again
    event.target.value = '';
  };


  return (
    <div className="flex items-center justify-between p-2 border-b border-gray-700 bg-gray-800 text-white">
      <div className="flex items-center gap-2">
        <Button variant={editorMode === 'edit' ? 'secondary' : 'ghost'} size="sm" onClick={() => onModeChange('edit')} title="Modo Edição">
          <Edit className="w-4 h-4 mr-1 sm:mr-2" /> <span className="hidden sm:inline">Editar</span>
        </Button>
        <Button variant={editorMode === 'split' ? 'secondary' : 'ghost'} size="sm" onClick={() => onModeChange('split')} title="Modo Dividido">
          <Columns className="w-4 h-4 mr-1 sm:mr-2" /> <span className="hidden sm:inline">Dividir</span>
        </Button>
        <Button variant={editorMode === 'preview' ? 'secondary' : 'ghost'} size="sm" onClick={() => onModeChange('preview')} title="Modo Visualização">
          <Eye className="w-4 h-4 mr-1 sm:mr-2" /> <span className="hidden sm:inline">Ver</span>
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="file"
          accept=".json"
          onChange={handleFileImport}
          style={{ display: 'none' }}
          id="import-blocks-file"
        />
        <Button variant="outline" size="sm" onClick={() => document.getElementById('import-blocks-file')?.click()} title="Importar Blocos">
            <FileUp className="w-4 h-4 mr-1 sm:mr-2" /> <span className="hidden sm:inline">Importar</span>
        </Button>
        <Button variant="outline" size="sm" onClick={handleExport} title="Exportar Blocos">
            <FileDown className="w-4 h-4 mr-1 sm:mr-2" /> <span className="hidden sm:inline">Exportar</span>
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={onUndo} disabled={!canUndo || isSaving} title="Desfazer">
          <Undo className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={onRedo} disabled={!canRedo || isSaving} title="Refazer">
          <Redo className="w-4 h-4" />
        </Button>
        <Button 
            variant="default" 
            size="sm" 
            onClick={onSave} 
            disabled={isSaving}
            className="bg-blue-600 hover:bg-blue-700 text-white"
            title={isSaving ? "Salvando..." : hasUnsavedChanges ? "Salvar Alterações" : "Salvo"}
        >
          {isSaving ? (
            <>
              <Save className="w-4 h-4 mr-2 animate-spin" /> Salvando...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" /> {hasUnsavedChanges ? 'Salvar' : 'Salvo'}
            </>
          )}
        </Button>
        {lastSaved && !isSaving && (
          <span className="text-xs text-gray-400 hidden md:inline">
            Salvo por último: {lastSaved.toLocaleTimeString()}
          </span>
        )}
      </div>
    </div>
  );
};
