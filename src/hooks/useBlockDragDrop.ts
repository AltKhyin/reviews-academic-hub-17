
// ABOUTME: Drag and drop functionality for block reordering
// Provides comprehensive drag-and-drop state management and operations

import { useState, useRef, useCallback } from 'react';

interface DragState {
  draggedIndex: number | null;
  draggedOver: number | null;
  isDragging: boolean;
}

export const useBlockDragDrop = (onMoveBlock: (blockId: number, direction: 'up' | 'down') => void) => {
  const [dragState, setDragState] = useState<DragState>({
    draggedIndex: null,
    draggedOver: null,
    isDragging: false
  });
  
  const dragItemRef = useRef<number | null>(null);
  const dragOverItemRef = useRef<number | null>(null);

  const handleDragStart = useCallback((e: React.DragEvent, index: number) => {
    dragItemRef.current = index;
    setDragState(prev => ({
      ...prev,
      draggedIndex: index,
      isDragging: true
    }));
    
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.currentTarget.outerHTML);
    
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '0.5';
    }
  }, []);

  const handleDragEnd = useCallback((e: React.DragEvent, blocks: any[]) => {
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '1';
    }
    
    if (dragItemRef.current !== null && dragOverItemRef.current !== null && 
        dragItemRef.current !== dragOverItemRef.current) {
      
      const fromIndex = dragItemRef.current;
      const toIndex = dragOverItemRef.current;
      
      if (fromIndex < toIndex) {
        for (let i = fromIndex; i < toIndex; i++) {
          onMoveBlock(blocks[fromIndex].id, 'down');
        }
      } else {
        for (let i = fromIndex; i > toIndex; i--) {
          onMoveBlock(blocks[fromIndex].id, 'up');
        }
      }
    }
    
    setDragState({
      draggedIndex: null,
      draggedOver: null,
      isDragging: false
    });
    dragItemRef.current = null;
    dragOverItemRef.current = null;
  }, [onMoveBlock]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const handleDragEnter = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault();
    dragOverItemRef.current = index;
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
