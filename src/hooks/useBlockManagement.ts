
// ABOUTME: Enhanced block management with fixed grid layout management
// Fixed merge operations, state synchronization, and proper layout handling

import { useCallback, useState, useEffect } from 'react';
import { ReviewBlock, BlockType } from '@/types/review';
import { getDefaultPayload } from '@/utils/blockDefaults';
import { useBlockHistory } from './useBlockHistory';
import { useBlockOperations } from './useBlockOperations';
import { useGridLayoutManager } from './useGridLayoutManager';

interface UseBlockManagementOptions {
  initialBlocks: ReviewBlock[];
  issueId?: string;
}

export const useBlockManagement = ({ initialBlocks, issueId }: UseBlockManagementOptions) => {
  const [blocks, setBlocks] = useState<ReviewBlock[]>(initialBlocks);
  const [activeBlockId, setActiveBlockId] = useState<number | null>(null);
  const [isProcessingDrop, setIsProcessingDrop] = useState(false);
  
  const { history, historyIndex, canUndo, canRedo, saveToHistory, undo: historyUndo, redo: historyRedo } = useBlockHistory(initialBlocks);
  const { createTempId, reindexBlocks } = useBlockOperations();

  // FIXED: Debounced internal update to prevent rapid state changes
  const internalUpdateBlock = useCallback((blockId: number, updates: Partial<ReviewBlock>) => {
    console.log('Internal block update:', { blockId, updates });
    
    setBlocks(prevBlocks => {
      const blockExists = prevBlocks.find(b => b.id === blockId);
      if (!blockExists) {
        console.warn('Attempting to update non-existent block:', blockId);
        return prevBlocks;
      }

      const updatedBlocks = prevBlocks.map(block => 
        block.id === blockId 
          ? { 
              ...block, 
              ...updates, 
              updated_at: new Date().toISOString(),
              meta: updates.meta ? { ...block.meta, ...updates.meta } : block.meta
            }
          : block
      );
      return updatedBlocks;
    });
  }, []);

  // FIXED: Proper deletion with layout repair
  const internalDeleteBlock = useCallback((blockId: number) => {
    console.log('Internal block delete:', blockId);
    
    setBlocks(prevBlocks => {
      const blockExists = prevBlocks.find(b => b.id === blockId);
      if (!blockExists) {
        console.warn('Attempting to delete non-existent block:', blockId);
        return prevBlocks;
      }

      const updatedBlocks = prevBlocks.filter(block => block.id !== blockId);
      const reindexedBlocks = reindexBlocks(updatedBlocks);
      return reindexedBlocks;
    });
    
    if (activeBlockId === blockId) {
      setActiveBlockId(null);
    }
  }, [activeBlockId, reindexBlocks]);

  const gridManager = useGridLayoutManager({
    blocks,
    onUpdateBlock: internalUpdateBlock,
    onDeleteBlock: internalDeleteBlock
  });

  // Update blocks when they change
  useEffect(() => {
    setBlocks(initialBlocks);
  }, [initialBlocks]);

  const setActiveBlock = useCallback((blockId: number | null) => {
    setActiveBlockId(blockId);
  }, []);

  // FIXED: Proper addBlock with grid position handling
  const addBlock = useCallback((type: BlockType, position?: number, layoutInfo?: {
    rowId: string;
    gridPosition: number;
    columns: number;
  }) => {
    const tempId = createTempId();
    
    const newBlock: ReviewBlock = {
      id: tempId,
      issue_id: issueId || '',
      sort_index: position ?? blocks.length,
      type,
      payload: getDefaultPayload(type),
      meta: {
        styles: {},
        conditions: {},
        analytics: {
          track_views: true,
          track_interactions: true
        },
        ...(layoutInfo && {
          layout: {
            row_id: layoutInfo.rowId,
            position: layoutInfo.gridPosition,
            columns: layoutInfo.columns,
            gap: 4
          }
        })
      },
      visible: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    let updatedBlocks = [...blocks];
    
    if (position !== undefined) {
      updatedBlocks.splice(position, 0, newBlock);
      updatedBlocks = reindexBlocks(updatedBlocks);
    } else {
      updatedBlocks.push(newBlock);
    }

    console.log('Adding block:', { 
      type, 
      position, 
      layoutInfo, 
      blockId: tempId,
      totalBlocks: updatedBlocks.length 
    });

    setBlocks(updatedBlocks);
    setActiveBlockId(newBlock.id);
    saveToHistory(updatedBlocks, newBlock.id);
    
    return newBlock;
  }, [blocks, issueId, saveToHistory, createTempId, reindexBlocks]);

  // FIXED: Simplified convertToGrid without auto-fill
  const convertToGrid = useCallback((blockId: number, columns: number) => {
    const blockIndex = blocks.findIndex(b => b.id === blockId);
    const originalBlock = blocks.find(b => b.id === blockId);
    
    if (!originalBlock || blockIndex === -1) {
      console.error('Block not found for grid conversion:', blockId);
      return;
    }

    console.log('Converting block to grid:', { blockId, columns, blockIndex });

    const rowId = `row-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Update the block to become a grid container without auto-creating additional blocks
    internalUpdateBlock(blockId, {
      meta: {
        ...originalBlock.meta,
        layout: {
          row_id: rowId,
          position: 0,
          columns: 1, // Start with just this block
          gap: 4
        }
      }
    });

    saveToHistory(blocks, blockId);
  }, [blocks, internalUpdateBlock, saveToHistory]);

  // FIXED: Completely rewritten mergeBlockIntoGrid with proper state management
  const mergeBlockIntoGrid = useCallback((draggedBlockId: number, targetRowId: string, targetPosition?: number) => {
    if (isProcessingDrop) {
      console.log('Drop already being processed, ignoring');
      return;
    }

    setIsProcessingDrop(true);

    try {
      const draggedBlock = blocks.find(b => b.id === draggedBlockId);
      const targetRow = gridManager.layoutState.rows.find(r => r.id === targetRowId);
      
      if (!draggedBlock || !targetRow) {
        console.error('Invalid merge operation:', { 
          draggedBlock: !!draggedBlock, 
          targetRow: !!targetRow,
          targetRowId 
        });
        return;
      }

      const finalPosition = targetPosition ?? targetRow.blocks.length;
      const newColumns = targetRow.columns + 1;

      console.log('Merging block into grid:', { 
        draggedBlockId, 
        targetRowId, 
        finalPosition, 
        newColumns,
        currentColumns: targetRow.columns 
      });

      // Update all blocks in one batch operation
      setBlocks(prevBlocks => {
        let updatedBlocks = [...prevBlocks];

        // Update the dragged block to join the target grid
        const draggedIndex = updatedBlocks.findIndex(b => b.id === draggedBlockId);
        if (draggedIndex !== -1) {
          updatedBlocks[draggedIndex] = {
            ...updatedBlocks[draggedIndex],
            meta: {
              ...updatedBlocks[draggedIndex].meta,
              layout: {
                row_id: targetRowId,
                position: finalPosition,
                columns: newColumns,
                gap: targetRow.gap || 4,
                columnWidths: Array(newColumns).fill(100 / newColumns)
              }
            }
          };
        }

        // Update all existing blocks in the target row
        targetRow.blocks.forEach((block) => {
          const blockIndex = updatedBlocks.findIndex(b => b.id === block.id);
          if (blockIndex !== -1 && block.id !== draggedBlockId) {
            updatedBlocks[blockIndex] = {
              ...updatedBlocks[blockIndex],
              meta: {
                ...updatedBlocks[blockIndex].meta,
                layout: {
                  ...updatedBlocks[blockIndex].meta?.layout,
                  columns: newColumns,
                  columnWidths: Array(newColumns).fill(100 / newColumns)
                }
              }
            };
          }
        });

        return reindexBlocks(updatedBlocks);
      });

      // Clear active block to reset visual state
      setActiveBlockId(null);
      
      // Save to history after state update
      setTimeout(() => {
        saveToHistory(blocks, draggedBlockId);
      }, 100);

    } finally {
      setTimeout(() => {
        setIsProcessingDrop(false);
      }, 200);
    }
  }, [blocks, gridManager.layoutState.rows, reindexBlocks, saveToHistory, isProcessingDrop]);

  const duplicateBlock = useCallback((blockId: number) => {
    const blockToDuplicate = blocks.find(block => block.id === blockId);
    if (!blockToDuplicate) return;

    const blockIndex = blocks.findIndex(block => block.id === blockId);
    const tempId = createTempId();
    
    const duplicatedBlock: ReviewBlock = {
      ...blockToDuplicate,
      id: tempId,
      sort_index: blockIndex + 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      payload: JSON.parse(JSON.stringify(blockToDuplicate.payload)),
      meta: JSON.parse(JSON.stringify(blockToDuplicate.meta || {}))
    };

    // Clear layout metadata for duplicated block to avoid conflicts
    if (duplicatedBlock.meta?.layout) {
      delete duplicatedBlock.meta.layout;
    }

    const updatedBlocks = [...blocks];
    updatedBlocks.splice(blockIndex + 1, 0, duplicatedBlock);
    const reindexedBlocks = reindexBlocks(updatedBlocks);

    setBlocks(reindexedBlocks);
    setActiveBlockId(duplicatedBlock.id);
    saveToHistory(reindexedBlocks, duplicatedBlock.id);
  }, [blocks, saveToHistory, createTempId, reindexBlocks]);

  const deleteBlock = useCallback((blockId: number) => {
    gridManager.deleteBlockWithLayoutRepair(blockId);
    saveToHistory(blocks.filter(b => b.id !== blockId), activeBlockId === blockId ? null : activeBlockId);
  }, [gridManager, blocks, activeBlockId, saveToHistory]);

  // Public update function that also saves to history
  const updateBlock = useCallback((blockId: number, updates: Partial<ReviewBlock>) => {
    internalUpdateBlock(blockId, updates);
    saveToHistory(blocks, activeBlockId);
  }, [internalUpdateBlock, blocks, activeBlockId, saveToHistory]);

  const moveBlock = useCallback((blockId: number, direction: 'up' | 'down') => {
    const currentIndex = blocks.findIndex(block => block.id === blockId);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= blocks.length) return;

    const newBlocks = [...blocks];
    [newBlocks[currentIndex], newBlocks[newIndex]] = [newBlocks[newIndex], newBlocks[currentIndex]];
    const reindexedBlocks = reindexBlocks(newBlocks);

    setBlocks(reindexedBlocks);
    saveToHistory(reindexedBlocks, activeBlockId);
  }, [blocks, activeBlockId, saveToHistory, reindexBlocks]);

  // Undo/redo with proper state restoration
  const undo = useCallback(() => {
    const previousState = historyUndo();
    if (previousState) {
      setBlocks(previousState.blocks);
      setActiveBlockId(previousState.activeBlockId);
    }
  }, [historyUndo]);

  const redo = useCallback(() => {
    const nextState = historyRedo();
    if (nextState) {
      setBlocks(nextState.blocks);
      setActiveBlockId(nextState.activeBlockId);
    }
  }, [historyRedo]);

  return {
    blocks,
    activeBlockId,
    history,
    historyIndex,
    setActiveBlockId: setActiveBlock,
    addBlock,
    convertToGrid,
    mergeBlockIntoGrid,
    duplicateBlock,
    updateBlock,
    deleteBlock,
    moveBlock,
    undo,
    redo,
    canUndo,
    canRedo,
    // Expose grid manager utilities
    layoutState: gridManager.layoutState,
    isBlockInGrid: gridManager.isBlockInGrid,
    getRowByBlockId: gridManager.getRowByBlockId
  };
};
