
// ABOUTME: Editor status bar with document statistics
// Shows block count and current selection status

import React from 'react';

interface EditorStatusBarProps {
  blockCount: number;
  activeBlockId: string | null;
}

export const EditorStatusBar: React.FC<EditorStatusBarProps> = ({
  blockCount,
  activeBlockId
}) => {
  return (
    <div 
      className="editor-status-bar flex items-center justify-between px-4 py-2 text-xs border-t"
      style={{ 
        backgroundColor: '#1a1a1a', 
        borderColor: '#2a2a2a',
        color: '#9ca3af'
      }}
    >
      <div className="flex items-center gap-4">
        <span>{blockCount} {blockCount === 1 ? 'bloco' : 'blocos'}</span>
        {activeBlockId && (
          <span>Bloco ativo: {activeBlockId}</span>
        )}
      </div>
      
      <div className="flex items-center gap-4">
        <span>Editor Nativo v1.0</span>
      </div>
    </div>
  );
};
