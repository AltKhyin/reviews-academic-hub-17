
// ABOUTME: Enhanced block management hook with string ID support
// Manages block operations, undo/redo, and grid conversions

import { useState, useCallback, useRef } from 'react';
import { ReviewBlock, BlockType } from '@/types/review';
import { GridPosition } from '@/types/grid';

interface UseBlockManagementProps {
  initialBlocks?: ReviewBlock[];
  issueId?: string;
}

interface BlockManagementState {
  blocks: ReviewBlock[];
  activeBlockId: string | null; // Changed from number to string
  history: ReviewBlock[][];
  historyIndex: number;
}

export const useBlockManagement = ({ 
  initialBlocks = [], 
  issueId 
}: UseBlockManagementProps) => {
  const [state, setState] = useState<BlockManagementState>({
    blocks: initialBlocks,
    activeBlockId: null,
    history: [initialBlocks],
    historyIndex: 0
  });

  const blockIdCounter = useRef(Math.max(...initialBlocks.map(b => parseInt(b.id) || 0), 0) + 1);

  const generateBlockId = useCallback((): string => {
    return (blockIdCounter.current++).toString();
  }, []);

  const addToHistory = useCallback((blocks: ReviewBlock[]) => {
    setState(prev => {
      const newHistory = prev.history.slice(0, prev.historyIndex + 1);
      newHistory.push(blocks);
      return {
        ...prev,
        history: newHistory,
        historyIndex: newHistory.length - 1
      };
    });
  }, []);

  const setActiveBlockId = useCallback((blockId: string | null) => { // Changed from number to string
    setState(prev => ({ ...prev, activeBlockId: blockId }));
  }, []);

  const addBlock = useCallback((type: BlockType, position?: number): string => { // Changed return type from number to string
    const newBlockId = generateBlockId();
    const newBlock: ReviewBlock = {
      id: newBlockId,
      type,
      content: {},
      sort_index: position !== undefined ? position : state.blocks.length,
      visible: true,
      meta: {}
    };

    setState(prev => {
      const newBlocks = [...prev.blocks];
      if (position !== undefined) {
        newBlocks.splice(position, 0, newBlock);
        // Reorder sort_index for blocks after insertion
        for (let i = position + 1; i < newBlocks.length; i++) {
          newBlocks[i] = { ...newBlocks[i], sort_index: i };
        }
      } else {
        newBlocks.push(newBlock);
      }

      addToHistory(newBlocks);
      return {
        ...prev,
        blocks: newBlocks,
        activeBlockId: newBlockId
      };
    });

    return newBlockId;
  }, [state.blocks, generateBlockId, addToHistory]);

  const updateBlock = useCallback((blockId: string, updates: Partial<ReviewBlock>) => { // Changed from number to string
    setState(prev => {
      const newBlocks = prev.blocks.map(block =>
        block.id === blockId ? { ...block, ...updates } : block
      );
      
      addToHistory(newBlocks);
      return {
        ...prev,
        blocks: newBlocks
      };
    });
  }, [addToHistory]);

  const deleteBlock = useCallback((blockId: string) => { // Changed from number to string
    setState(prev => {
      const newBlocks = prev.blocks.filter(block => block.id !== blockId);
      // Reorder sort_index
      const reorderedBlocks = newBlocks.map((block, index) => ({
        ...block,
        sort_index: index
      }));

      addToHistory(reorderedBlocks);
      return {
        ...prev,
        blocks: reorderedBlocks,
        activeBlockId: prev.activeBlockId === blockId ? null : prev.activeBlockId
      };
    });
  }, [addToHistory]);

  const moveBlock = useCallback((blockId: string, direction: 'up' | 'down') => { // Changed from number to string
    setState(prev => {
      const blockIndex = prev.blocks.findIndex(block => block.id === blockId);
      if (blockIndex === -1) return prev;

      const newBlocks = [...prev.blocks];
      const targetIndex = direction === 'up' ? blockIndex - 1 : blockIndex + 1;

      if (targetIndex < 0 || targetIndex >= newBlocks.length) return prev;

      // Swap blocks
      [newBlocks[blockIndex], newBlocks[targetIndex]] = [newBlocks[targetIndex], newBlocks[blockIndex]];
      
      // Update sort_index
      newBlocks.forEach((block, index) => {
        block.sort_index = index;
      });

      addToHistory(newBlocks);
      return {
        ...prev,
        blocks: newBlocks
      };
    });
  }, [addToHistory]);

  const duplicateBlock = useCallback((blockId: string): string => { // Changed from number to string, return type
    const blockToDuplicate = state.blocks.find(block => block.id === blockId);
    if (!blockToDuplicate) return '';

    const newBlockId = generateBlockId();
    const duplicatedBlock: ReviewBlock = {
      ...blockToDuplicate,
      id: newBlockId,
      sort_index: blockToDuplicate.sort_index + 1
    };

    setState(prev => {
      const newBlocks = [...prev.blocks];
      const insertIndex = blockToDuplicate.sort_index + 1;
      newBlocks.splice(insertIndex, 0, duplicatedBlock);
      
      // Reorder sort_index for blocks after insertion
      for (let i = insertIndex + 1; i < newBlocks.length; i++) {
        newBlocks[i] = { ...newBlocks[i], sort_index: i };
      }

      addToHistory(newBlocks);
      return {
        ...prev,
        blocks: newBlocks,
        activeBlockId: newBlockId
      };
    });

    return newBlockId;
  }, [state.blocks, generateBlockId, addToHistory]);

  const convertToGrid = useCallback((blockId: string, columns: number) => { // Changed from number to string
    const block = state.blocks.find(b => b.id === blockId);
    if (!block) return;

    const rowId = `row-${Date.now()}`;
    updateBlock(blockId, {
      meta: {
        ...block.meta,
        layout: {
          ...block.meta?.layout,
          row_id: rowId,
          columns,
          columnWidths: Array(columns).fill(100 / columns),
          gap: 4
        }
      }
    });
  }, [state.blocks, updateBlock]);

  const convertTo2DGrid = useCallback((blockId: string, columns: number, rows: number) => { // Changed from number to string
    const block = state.blocks.find(b => b.id === blockId);
    if (!block) return;

    const gridId = `grid-${Date.now()}`;
    updateBlock(blockId, {
      meta: {
        ...block.meta,
        layout: {
          ...block.meta?.layout,
          grid_id: gridId,
          grid_position: { row: 0, column: 0 },
          columns,
          grid_rows: rows,
          columnWidths: Array(columns).fill(100 / columns),
          rowHeights: Array(rows).fill(120),
          gap: 4
        }
      }
    });
  }, [state.blocks, updateBlock]);

  const mergeBlockIntoGrid = useCallback((draggedBlockId: string, targetRowId: string, targetPosition?: number) => { // Changed from number to string
    const draggedBlock = state.blocks.find(b => b.id === draggedBlockId);
    const targetRow = state.blocks.filter(b => b.meta?.layout?.row_id === targetRowId);
    
    if (!draggedBlock || targetRow.length === 0) return;

    const targetConfig = targetRow[0].meta?.layout;
    if (!targetConfig) return;

    updateBlock(draggedBlockId, {
      meta: {
        ...draggedBlock.meta,
        layout: {
          ...targetConfig,
          row_id: targetRowId
        }
      }
    });
  }, [state.blocks, updateBlock]);

  const placeBlockIn2DGrid = useCallback((blockId: string, gridId: string, position: GridPosition) => { // Changed from number to string
    const block = state.blocks.find(b => b.id === blockId);
    const gridBlocks = state.blocks.filter(b => b.meta?.layout?.grid_id === gridId);
    
    if (!block || gridBlocks.length === 0) return;

    const gridConfig = gridBlocks[0].meta?.layout;
    if (!gridConfig) return;

    updateBlock(blockId, {
      meta: {
        ...block.meta,
        layout: {
          ...gridConfig,
          grid_id: gridId,
          grid_position: position
        }
      }
    });
  }, [state.blocks, updateBlock]);

  const undo = useCallback(() => {
    setState(prev => {
      if (prev.historyIndex > 0) {
        const newIndex = prev.historyIndex - 1;
        return {
          ...prev,
          blocks: prev.history[newIndex],
          historyIndex: newIndex
        };
      }
      return prev;
    });
  }, []);

  const redo = useCallback(() => {
    setState(prev => {
      if (prev.historyIndex < prev.history.length - 1) {
        const newIndex = prev.historyIndex + 1;
        return {
          ...prev,
          blocks: prev.history[newIndex],
          historyIndex: newIndex
        };
      }
      return prev;
    });
  }, []);

  const canUndo = state.historyIndex > 0;
  const canRedo = state.historyIndex < state.history.length - 1;

  return {
    blocks: state.blocks,
    activeBlockId: state.activeBlockId,
    setActiveBlockId,
    addBlock,
    updateBlock,
    deleteBlock,
    moveBlock,
    duplicateBlock,
    convertToGrid,
    convertTo2DGrid,
    mergeBlockIntoGrid,
    placeBlockIn2DGrid,
    undo,
    redo,
    canUndo,
    canRedo
  };
};
