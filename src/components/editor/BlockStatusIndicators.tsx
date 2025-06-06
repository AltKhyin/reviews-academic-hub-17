
// ABOUTME: Status indicators for block states (edit mode, visibility, drag state)
// Extracted from BlockContentEditor for better modularity

import React from 'react';

interface BlockStatusIndicatorsProps {
  editMode: boolean;
  isActive: boolean;
  isVisible: boolean;
  isDragging: boolean;
  draggedOver: boolean;
}

export const BlockStatusIndicators: React.FC<BlockStatusIndicatorsProps> = ({
  editMode,
  isActive,
  isVisible,
  isDragging,
  draggedOver
}) => {
  return (
    <div className="absolute bottom-2 right-2 flex gap-1">
      {editMode && isActive && (
        <div 
          className="text-xs px-1.5 py-0.5 rounded font-medium"
          style={{ backgroundColor: '#10b981', color: '#ffffff' }}
        >
          EDITANDO
        </div>
      )}
      
      {!isVisible && (
        <div 
          className="text-xs px-1.5 py-0.5 rounded font-medium"
          style={{ backgroundColor: '#ef4444', color: '#ffffff' }}
        >
          OCULTO
        </div>
      )}

      {isDragging && (
        <div 
          className="text-xs px-1.5 py-0.5 rounded font-medium"
          style={{ backgroundColor: '#f59e0b', color: '#ffffff' }}
        >
          MOVENDO
        </div>
      )}

      {draggedOver && (
        <div 
          className="text-xs px-1.5 py-0.5 rounded font-medium"
          style={{ backgroundColor: '#10b981', color: '#ffffff' }}
        >
          SOLTAR AQUI
        </div>
      )}
    </div>
  );
};
