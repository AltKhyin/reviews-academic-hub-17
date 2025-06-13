
// ABOUTME: Editor status bar with block count and keyboard shortcuts
// Shows editor status and helpful shortcuts at the bottom

import React from 'react';

interface EditorStatusBarProps {
  blockCount: number;
  activeBlockId: number | null;
}

export const EditorStatusBar: React.FC<EditorStatusBarProps> = ({
  blockCount,
  activeBlockId
}) => {
  return (
    <div 
      className="px-4 py-2 border-t flex items-center justify-between text-xs"
      style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a', color: '#9ca3af' }}
    >
      <div className="flex items-center gap-4">
        <span>{blockCount} blocos</span>
        <span>Bloco ativo: {activeBlockId ? `#${activeBlockId}` : 'Nenhum'}</span>
      </div>
      
      <div className="flex items-center gap-4">
        <span>Ctrl+S para salvar</span>
        <span>Ctrl+Z para desfazer</span>
        <span>Arrastar para reordenar</span>
      </div>
    </div>
  );
};
