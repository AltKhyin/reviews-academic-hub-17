
// ABOUTME: Enhanced drag and drop functionality for block reordering and grid operations
// Provides comprehensive drag-and-drop state management with proper TypeScript interfaces

import { useState, useRef, useCallback } from 'react';
import { ReviewBlock } from '@/types/review';

export interface DragState {
  draggedBlockId: number | null;
  dragOverRowId: string | null;
  dragOverPosition: number | null;
  draggedFromRowId: string | null;
  dropTargetType: 'grid' | 'single' | 'merge' | null;
  isDragging: boolean;
  draggedIndex: number | null;
  draggedOver: number | null;
}

interface UseBlockDragDropProps {
  blocks: ReviewBlock[];
  onMoveBlock: (fromIndex: number, toIndex: number) => void;
  onMergeBlockIntoGrid: (blockId: number, targetRowId: string, position?: number) => void;
}

export const useBlockDragDrop = ({ blocks, onMoveBlock, onMergeBlockIntoGrid }: UseBlockDragDropProps) => {
  const [dragState, setDragState] = useState<DragState>({
    draggedBlockId: null,
    dragOverRowId: null,
    dragOverPosition: null,
    draggedFromRowId: null,
    dropTargetType: null,
    isDragging: false,
    draggedIndex: null,
    draggedOver: null
  });
  
  const dragItemRef = useRef<number | null>(null);
  const dragOverItemRef = useRef<number | null>(null);

  const handleDragStart = useCallback((e: React.DragEvent, blockId: number) => {
    console.log('Drag start:', blockId);
    const blockIndex = blocks.findIndex(b => b.id === blockId);
    dragItemRef.current = blockIndex;
    
    setDragState(prev => ({
      ...prev,
      draggedBlockId: blockId,
      draggedIndex: blockIndex,
      isDragging: true
    }));
    
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.currentTarget.outerHTML);
    
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '0.5';
    }
  }, [blocks]);

  const handleDragEnd = useCallback((e: React.DragEvent) => {
    console.log('Drag end');
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '1';
    }
    
    // Perform the actual move operation if needed
    if (dragItemRef.current !== null && dragOverItemRef.current !== null && 
        dragItemRef.current !== dragOverItemRef.current) {
      onMoveBlock(dragItemRef.current, dragOverItemRef.current);
    }
    
    setDragState({
      draggedBlockId: null,
      dragOverRowId: null,
      dragOverPosition: null,
      draggedFromRowId: null,
      dropTargetType: null,
      isDragging: false,
      draggedIndex: null,
      draggedOver: null
    });
    dragItemRef.current = null;
    dragOverItemRef.current = null;
  }, [onMoveBlock]);

  const handleDragOver = useCallback((e: React.DragEvent, targetRowId?: string, targetPosition?: number, targetType?: 'grid' | 'single' | 'merge') => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    setDragState(prev => ({
      ...prev,
      dragOverRowId: targetRowId || null,
      dragOverPosition: targetPosition || null,
      dropTargetType: targetType || 'single'
    }));
  }, []);

  const handleDragEnter = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (index !== dragItemRef.current) {
      dragOverItemRef.current = index;
      setDragState(prev => ({
        ...prev,
        draggedOver: index
      }));
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, targetRowId?: string, targetPosition?: number, dropType?: 'grid' | 'single' | 'merge') => {
    e.preventDefault();
    console.log('Drop:', { draggedBlockId: dragState.draggedBlockId, targetRowId, targetPosition, dropType });
    
    if (dragItemRef.current !== null && dragOverItemRef.current !== null && 
        dragItemRef.current !== dragOverItemRef.current) {
      onMoveBlock(dragItemRef.current, dragOverItemRef.current);
    }
  }, [dragState.draggedBlockId, onMoveBlock]);

  return {
    dragState,
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDragEnter,
    handleDrop
  };
};
