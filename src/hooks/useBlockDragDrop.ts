
// ABOUTME: Manages drag and drop state and logic for block manipulation.
import { useState, useCallback } from 'react';

export interface DragState {
  draggedItemId: string | null;
  dragOverItemId: string | null;
  dropPosition: 'before' | 'after' | 'over' | null; // 'over' for dropping onto a block itself
  isDragging: boolean;
}

interface UseBlockDragDropOptions {
  onMove: (draggedId: string, targetId: string | null, position: 'before' | 'after' | 'over') => void;
}

export const useBlockDragDrop = ({ onMove }: UseBlockDragDropOptions) => {
  const [dragState, setDragState] = useState<DragState>({
    draggedItemId: null,
    dragOverItemId: null,
    dropPosition: null,
    isDragging: false,
  });

  const handleDragStart = useCallback((e: React.DragEvent, itemId: string) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', itemId);
    setDragState({
      draggedItemId: itemId,
      dragOverItemId: null,
      dropPosition: null,
      isDragging: true,
    });
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, targetItemId: string | null, position: 'before' | 'after' | 'over') => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragState.draggedItemId && (dragState.draggedItemId !== targetItemId || position === 'over')) {
      setDragState(prev => ({
        ...prev,
        dragOverItemId: targetItemId,
        dropPosition: position,
      }));
    }
  }, [dragState.draggedItemId]);
  
  // handleDragEnter is often similar to handleDragOver for immediate feedback
  const handleDragEnter = useCallback((e: React.DragEvent, targetItemId: string | null, position: 'before' | 'after' | 'over') => {
    e.preventDefault();
     if (dragState.draggedItemId && (dragState.draggedItemId !== targetItemId || position === 'over')) {
      setDragState(prev => ({
        ...prev,
        dragOverItemId: targetItemId,
        dropPosition: position,
      }));
    }
  }, [dragState.draggedItemId]);


  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!dragState.draggedItemId || dragState.dragOverItemId === undefined || dragState.dropPosition === null) { // dragOverItemId can be null
      // Reset if drop is not valid or not on a registered target
      setDragState({ draggedItemId: null, dragOverItemId: null, dropPosition: null, isDragging: false });
      return;
    }
    
    // Prevent dropping an item onto itself unless it's a specific 'over' action (handled by onMove)
    if (dragState.draggedItemId === dragState.dragOverItemId && dragState.dropPosition !== 'over') {
        setDragState({ draggedItemId: null, dragOverItemId: null, dropPosition: null, isDragging: false });
        return;
    }

    onMove(dragState.draggedItemId, dragState.dragOverItemId, dragState.dropPosition);
    setDragState({
      draggedItemId: null,
      dragOverItemId: null,
      dropPosition: null,
      isDragging: false,
    });
  }, [dragState, onMove]);

  const handleDragEnd = useCallback((e: React.DragEvent) => {
    e.preventDefault(); // Prevent default to avoid issues
    // Reset drag state regardless of drop success, usually after onDrop handles the logic
    setDragState({
      draggedItemId: null,
      dragOverItemId: null,
      dropPosition: null,
      isDragging: false,
    });
  }, []);
  
  const handleDragLeave = useCallback((e: React.DragEvent) => {
    // Only reset if leaving the broader draggable context, not just moving between elements within it
    // This can be tricky. A common approach is to check relatedTarget.
    const editorElement = (e.currentTarget as HTMLElement).closest('.block-editor-droppable-area'); // Add this class to your main droppable container
    if (editorElement && !editorElement.contains(e.relatedTarget as Node)) {
      setDragState(prev => ({ ...prev, dragOverItemId: null, dropPosition: null }));
    } else if (!e.relatedTarget) { // handles leaving the window
        setDragState(prev => ({ ...prev, dragOverItemId: null, dropPosition: null }));
    }
  }, []);


  return {
    dragState,
    handleDragStart,
    handleDragOver,
    handleDragEnter,
    handleDrop,
    handleDragEnd,
    handleDragLeave,
  };
};
