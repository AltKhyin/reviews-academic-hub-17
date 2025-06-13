
// ABOUTME: Block management hook with standardized string ID support
// Fixed to resolve editor component type mismatches

import { useState, useCallback } from 'react';
import { ReviewBlock, BlockType } from '@/types/review';

interface UseBlockManagementProps {
  initialBlocks?: ReviewBlock[];
  issueId?: string;
}

export const useBlockManagement = ({ initialBlocks = [] }: UseBlockManagementProps) => {
  const [blocks, setBlocks] = useState<ReviewBlock[]>(initialBlocks);
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null);
  const [history, setHistory] = useState<ReviewBlock[][]>([initialBlocks]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const generateBlockId = useCallback((): string => {
    return `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  const addBlock = useCallback((type: BlockType, position?: number): string => {
    const newBlockId = generateBlockId();
    const newBlock: ReviewBlock = {
      id: newBlockId,
      type,
      content: {},
      visible: true,
      sort_index: position !== undefined ? position : blocks.length
    };

    setBlocks(prev => {
      const newBlocks = [...prev];
      if (position !== undefined) {
        newBlocks.splice(position, 0, newBlock);
        // Update sort_index for all blocks after insertion
        newBlocks.forEach((block, index) => {
          block.sort_index = index;
        });
      } else {
        newBlocks.push(newBlock);
      }
      return newBlocks;
    });

    return newBlockId;
  }, [blocks.length, generateBlockId]);

  const updateBlock = useCallback((blockId: string, updates: Partial<ReviewBlock>) => {
    setBlocks(prev => prev.map(block => 
      block.id === blockId ? { ...block, ...updates } : block
    ));
  }, []);

  const deleteBlock = useCallback((blockId: string) => {
    setBlocks(prev => {
      const filtered = prev.filter(block => block.id !== blockId);
      // Update sort_index after deletion
      return filtered.map((block, index) => ({
        ...block,
        sort_index: index
      }));
    });
    
    if (activeBlockId === blockId) {
      setActiveBlockId(null);
    }
  }, [activeBlockId]);

  const moveBlock = useCallback((blockId: string, direction: 'up' | 'down') => {
    setBlocks(prev => {
      const blockIndex = prev.findIndex(b => b.id === blockId);
      if (blockIndex === -1) return prev;

      const newBlocks = [...prev];
      const targetIndex = direction === 'up' ? blockIndex - 1 : blockIndex + 1;

      if (targetIndex < 0 || targetIndex >= newBlocks.length) return prev;

      // Swap blocks
      [newBlocks[blockIndex], newBlocks[targetIndex]] = [newBlocks[targetIndex], newBlocks[blockIndex]];
      
      // Update sort_index
      newBlocks.forEach((block, index) => {
        block.sort_index = index;
      });

      return newBlocks;
    });
  }, []);

  const duplicateBlock = useCallback((blockId: string): string => {
    const blockToDuplicate = blocks.find(b => b.id === blockId);
    if (!blockToDuplicate) return '';

    const newBlockId = generateBlockId();
    const duplicatedBlock: ReviewBlock = {
      ...blockToDuplicate,
      id: newBlockId,
      sort_index: blockToDuplicate.sort_index + 1
    };

    setBlocks(prev => {
      const newBlocks = [...prev];
      const insertIndex = blockToDuplicate.sort_index + 1;
      newBlocks.splice(insertIndex, 0, duplicatedBlock);
      
      // Update sort_index for blocks after insertion
      newBlocks.forEach((block, index) => {
        block.sort_index = index;
      });

      return newBlocks;
    });

    return newBlockId;
  }, [blocks, generateBlockId]);

  const convertToGrid = useCallback((blockId: string, columns: number) => {
    const rowId = `row_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    updateBlock(blockId, {
      meta: {
        layout: {
          row_id: rowId,
          columns,
          columnWidths: Array(columns).fill(100 / columns)
        }
      }
    });
  }, [updateBlock]);

  const convertTo2DGrid = useCallback((blockId: string, columns: number, rows: number) => {
    const gridId = `grid_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    updateBlock(blockId, {
      meta: {
        layout: {
          grid_id: gridId,
          columns,
          rows,
          grid_position: { row: 0, column: 0 }
        }
      }
    });
  }, [updateBlock]);

  const mergeBlockIntoGrid = useCallback((draggedBlockId: string, targetRowId: string, targetPosition?: number) => {
    const targetBlocks = blocks.filter(b => b.meta?.layout?.row_id === targetRowId);
    if (targetBlocks.length === 0) return;

    const targetLayout = targetBlocks[0].meta?.layout;
    if (!targetLayout) return;

    updateBlock(draggedBlockId, {
      meta: {
        layout: {
          row_id: targetRowId,
          columns: targetLayout.columns,
          columnWidths: targetLayout.columnWidths
        }
      }
    });
  }, [blocks, updateBlock]);

  const placeBlockIn2DGrid = useCallback((blockId: string, gridId: string, position: { row: number; column: number }) => {
    updateBlock(blockId, {
      meta: {
        layout: {
          grid_id: gridId,
          grid_position: position
        }
      }
    });
  }, [updateBlock]);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setBlocks(history[newIndex]);
    }
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setBlocks(history[newIndex]);
    }
  }, [history, historyIndex]);

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  return {
    blocks,
    activeBlockId,
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
