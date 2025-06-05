
// ABOUTME: Enhanced block management with integrated grid layout management
// Uses unified grid system for consistent block operations and proper layout handling

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
  
  // Use composition for cleaner separation of concerns
  const { history, historyIndex, canUndo, canRedo, saveToHistory, undo: historyUndo, redo: historyRedo } = useBlockHistory(initialBlocks);
  const { createTempId, reindexBlocks } = useBlockOperations();

  // Internal block update function for grid manager
  const internalUpdateBlock = useCallback((blockId: number, updates: Partial<ReviewBlock>) => {
    console.log('Internal block update:', { blockId, updates });
    
    setBlocks(prevBlocks => {
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

  // Internal block delete function for grid manager
  const internalDeleteBlock = useCallback((blockId: number) => {
    console.log('Internal block delete:', blockId);
    
    setBlocks(prevBlocks => {
      const updatedBlocks = prevBlocks.filter(block => block.id !== blockId);
      const reindexedBlocks = reindexBlocks(updatedBlocks);
      return reindexedBlocks;
    });
    
    if (activeBlockId === blockId) {
      setActiveBlockId(null);
    }
  }, [activeBlockId, reindexBlocks]);

  // Initialize grid layout manager with internal functions
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

  // ENHANCED: Convert block to grid layout using grid manager
  const convertToGrid = useCallback((blockId: number, columns: number) => {
    const blockIndex = blocks.findIndex(b => b.id === blockId);
    const originalBlock = blocks.find(b => b.id === blockId);
    
    if (!originalBlock || blockIndex === -1) {
      console.error('Block not found for grid conversion:', blockId);
      return;
    }

    console.log('Converting block to grid:', { blockId, columns, blockIndex });

    const rowId = `row-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Create the updated original block with layout metadata
    const updatedOriginalBlock = {
      ...originalBlock,
      meta: {
        ...originalBlock.meta,
        layout: {
          row_id: rowId,
          position: 0,
          columns,
          gap: 4
        }
      },
      updated_at: new Date().toISOString()
    };

    // Create additional blocks for remaining columns
    const additionalBlocks: ReviewBlock[] = [];
    for (let i = 1; i < columns; i++) {
      const tempId = createTempId();
      additionalBlocks.push({
        id: tempId,
        issue_id: issueId || '',
        sort_index: blockIndex + i,
        type: 'paragraph',
        payload: getDefaultPayload('paragraph'),
        meta: {
          styles: {},
          conditions: {},
          analytics: {
            track_views: true,
            track_interactions: true
          },
          layout: {
            row_id: rowId,
            position: i,
            columns,
            gap: 4
          }
        },
        visible: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    }

    // Perform batch update
    let updatedBlocks = [...blocks];
    
    // Update the original block
    updatedBlocks[blockIndex] = updatedOriginalBlock;
    
    // Insert additional blocks
    if (additionalBlocks.length > 0) {
      updatedBlocks.splice(blockIndex + 1, 0, ...additionalBlocks);
    }
    
    // Reindex all blocks
    updatedBlocks = reindexBlocks(updatedBlocks);

    console.log('Grid conversion completed:', { 
      rowId, 
      originalBlockId: blockId, 
      additionalBlocksCount: additionalBlocks.length,
      totalBlocks: updatedBlocks.length 
    });

    setBlocks(updatedBlocks);
    saveToHistory(updatedBlocks, blockId);
  }, [blocks, issueId, saveToHistory, createTempId, reindexBlocks]);

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

  // Use grid manager's delete function for proper layout repair
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
