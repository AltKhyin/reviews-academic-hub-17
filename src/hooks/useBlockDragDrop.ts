
// ABOUTME: Enhanced drag and drop hook with string ID support
// Handles block reordering with proper TypeScript interfaces

import { useState, useCallback } from 'react';

interface DragState {
  draggedIndex: number | null;
  draggedOver: number | null;
}

export const useBlockDragDrop = (onMove: (blockId: string, direction: 'up' | 'down') => void) => {
  const [dragState, setDragState] = useState<DragState>({
    draggedIndex: null,
    draggedOver: null
  });

  const handleDragStart = useCallback((e: React.DragEvent, index: number) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.currentTarget.outerHTML);
    e.dataTransfer.setData('text/plain', index.toString());
    setDragState(prev => ({ ...prev, draggedIndex: index }));
  }, []);

  const handleDragEnd = useCallback((e: React.DragEvent, blocks: any[]) => {
    setDragState({ draggedIndex: null, draggedOver: null });
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const handleDragEnter = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragState(prev => ({ ...prev, draggedOver: index }));
  }, []);

  return {
    dragState,
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDragEnter
  };
};
