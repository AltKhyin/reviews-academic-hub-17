
// ABOUTME: Displays status information about the editor, like block count.
import React from 'react';

export interface EditorStatusBarProps {
  blockCount: number;
  activeBlockId: string | null; // Corrected type
  // Add other relevant status props
  // className?: string; // Removed if not used directly by this component's outer div
}

export const EditorStatusBar: React.FC<EditorStatusBarProps> = ({
  blockCount,
  activeBlockId,
  // className,
}) => {
  return (
    <div 
      className="h-8 border-t flex items-center justify-between px-4 text-xs flex-shrink-0"
      style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a', color: '#9ca3af' }}
    >
      <span>Total Blocos: {blockCount}</span>
      {activeBlockId && <span>Bloco Ativo: {activeBlockId.substring(0, 8)}...</span>}
      {/* Add more status info here */}
      <span>Modo: Normal</span> 
    </div>
  );
};
