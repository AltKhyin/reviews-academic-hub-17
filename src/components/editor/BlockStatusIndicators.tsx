
// ABOUTME: Visual status indicators for block states
// Shows edit mode, visibility, and interaction states

import React from 'react';
import { cn } from '@/lib/utils';

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
    <div className="absolute top-2 left-2 flex gap-1 z-10">
      {/* Edit Mode Indicator */}
      {editMode && (
        <div className="w-2 h-2 bg-green-500 rounded-full opacity-60" title="Modo de edição" />
      )}
      
      {/* Visibility Indicator */}
      {!isVisible && (
        <div className="w-2 h-2 bg-red-500 rounded-full opacity-60" title="Bloco oculto" />
      )}
      
      {/* Active Indicator */}
      {isActive && (
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" title="Bloco ativo" />
      )}
      
      {/* Drag States */}
      {isDragging && (
        <div className="w-2 h-2 bg-yellow-500 rounded-full opacity-60" title="Arrastando" />
      )}
      
      {draggedOver && (
        <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" title="Zona de drop" />
      )}
    </div>
  );
};
