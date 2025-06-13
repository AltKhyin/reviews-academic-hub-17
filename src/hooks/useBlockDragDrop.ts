
// ABOUTME: Hook for handling block drag and drop operations - UPDATED: String IDs
// Manages drag state and provides handlers for block reordering

import { useState, useCallback } from 'react';

interface DragState {
  draggedIndex: number | null;
  draggedOver: number | null;
  isDragging: boolean;
}

export const useBlockDragDrop = (onMoveBlock: (blockId: string, direction: 'up' | 'down') => void) => {
  const [dragState, setDragState] = useState<DragState>({
    draggedIndex: null,
    draggedOver: null,
    isDragging: false
  });

  const handleDragStart = useCallback((e: React.DragEvent, index: number) => {
    setDragState({
      draggedIndex: index,
      draggedOver: null,
      isDragging: true
    });
    
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
  }, []);

  const handleDragEnd = useCallback((e: React.DragEvent, blocks: any[]) => {
    const draggedIndex = dragState.draggedIndex;
    const draggedOver = dragState.draggedOver;
    
    if (draggedIndex !== null && draggedOver !== null && draggedIndex !== draggedOver) {
      const draggedBlock = blocks[draggedIndex];
      if (draggedBlock) {
        const direction = draggedOver > draggedIndex ? 'down' : 'up';
        const steps = Math.abs(draggedOver - draggedIndex);
        
        // Move block step by step to reach target position
        for (let i = 0; i < steps; i++) {
          onMoveBlock(draggedBlock.id, direction);
        }
      }
    }
    
    setDragState({
      draggedIndex: null,
      draggedOver: null,
      isDragging: false
    });
  }, [dragState.draggedIndex, dragState.draggedOver, onMoveBlock]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const handleDragEnter = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragState(prev => ({
      ...prev,
      draggedOver: index
    }));
  }, []);

  return {
    dragState,
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDragEnter
  };
};
