
// ABOUTME: Enhanced drag and drop functionality for block reordering and grid operations
// Provides comprehensive drag-and-drop state management with proper TypeScript interfaces

import { useState, useRef, useCallback } from 'react';
import { ReviewBlock } from '@/types/review';

export interface DragState {
  draggedBlockId: number | null;
  dragOverRowId: string | null;
  dragOverPosition: number | null;
  draggedFromRowId: string | null;
  dropTargetType: 'block' | 'grid' | null;
  isDragging: boolean;
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
    isDragging: false
  });
  
  const dragItemRef = useRef<number | null>(null);
  const dragOverItemRef = useRef<number | null>(null);

  const handleDragStart = useCallback((e: React.DragEvent, blockId: number) => {
    console.log('Drag start:', blockId);
    dragItemRef.current = blockId;
    setDragState(prev => ({
      ...prev,
      draggedBlockId: blockId,
      isDragging: true
    }));
    
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.currentTarget.outerHTML);
    
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '0.5';
    }
  }, []);

  const handleDragEnd = useCallback((e: React.DragEvent) => {
    console.log('Drag end');
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '1';
    }
    
    // Perform the actual move operation if needed
    if (dragItemRef.current !== null && dragOverItemRef.current !== null && 
        dragItemRef.current !== dragOverItemRef.current) {
      
      const fromIndex = blocks.findIndex(b => b.id === dragItemRef.current);
      const toIndex = blocks.findIndex(b => b.id === dragOverItemRef.current);
      
      if (fromIndex !== -1 && toIndex !== -1) {
        onMoveBlock(fromIndex, toIndex);
      }
    }
    
    setDragState({
      draggedBlockId: null,
      dragOverRowId: null,
      dragOverPosition: null,
      draggedFromRowId: null,
      dropTargetType: null,
      isDragging: false
    });
    dragItemRef.current = null;
    dragOverItemRef.current = null;
  }, [blocks, onMoveBlock]);

  const handleDragOver = useCallback((e: React.DragEvent, blockId?: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    if (blockId && blockId !== dragItemRef.current) {
      dragOverItemRef.current = blockId;
      setDragState(prev => ({
        ...prev,
        dragOverRowId: `single-${blockId}`,
        dropTargetType: 'block'
      }));
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, targetBlockId?: number) => {
    e.preventDefault();
    console.log('Drop:', { draggedBlockId: dragItemRef.current, targetBlockId });
    
    if (dragItemRef.current && targetBlockId && dragItemRef.current !== targetBlockId) {
      const fromIndex = blocks.findIndex(b => b.id === dragItemRef.current);
      const toIndex = blocks.findIndex(b => b.id === targetBlockId);
      
      if (fromIndex !== -1 && toIndex !== -1) {
        onMoveBlock(fromIndex, toIndex);
      }
    }
  }, [blocks, onMoveBlock]);

  return {
    dragState,
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDrop
  };
};
