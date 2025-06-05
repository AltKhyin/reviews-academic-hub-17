
// ABOUTME: Enhanced block management with robust layout support and grid operations
// Comprehensive block manipulation with proper layout metadata handling

import { useCallback, useState } from 'react';
import { ReviewBlock, BlockType } from '@/types/review';
import { getDefaultPayload } from '@/utils/blockDefaults';
import { useBlockHistory } from './useBlockHistory';
import { useBlockOperations } from './useBlockOperations';

interface UseBlockManagementOptions {
  initialBlocks: ReviewBlock[];
  issueId?: string;
}

export const useBlockManagement = ({ initialBlocks, issueId }: UseBlockManagementOptions) => {
  const [blocks, setBlocks] = useState<ReviewBlock[]>(initialBlocks);
  const [activeBlockId, setActiveBlockId] = useState<number | null>(null);
  
  // Use composition for cleaner separation of concerns
  const { history, historyIndex, canUndo, canRedo, saveToHistory, undo, redo } = useBlockHistory(initialBlocks);
  const { createTempId, reindexBlocks } = useBlockOperations();

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

  // NEW: Batch add blocks for grid conversion
  const addBlocksBatch = useCallback((blocksToAdd: Omit<ReviewBlock, 'id' | 'created_at' | 'updated_at'>[], position?: number) => {
    const newBlocks = blocksToAdd.map((blockData, index) => ({
      ...blockData,
      id: createTempId(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      sort_index: (position ?? blocks.length) + index
    }));

    let updatedBlocks = [...blocks];
    
    if (position !== undefined) {
      updatedBlocks.splice(position, 0, ...newBlocks);
      updatedBlocks = reindexBlocks(updatedBlocks);
    } else {
      updatedBlocks.push(...newBlocks);
    }

    console.log('Batch adding blocks:', { 
      count: newBlocks.length,
      position,
      totalBlocks: updatedBlocks.length 
    });

    setBlocks(updatedBlocks);
    setActiveBlockId(newBlocks[0]?.id || null);
    saveToHistory(updatedBlocks, newBlocks[0]?.id || null);
    
    return newBlocks;
  }, [blocks, saveToHistory, createTempId, reindexBlocks]);

  // ENHANCED: Convert block to grid layout with batch operation
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
    const additionalBlocks: Omit<ReviewBlock, 'id' | 'created_at' | 'updated_at'>[] = [];
    for (let i = 1; i < columns; i++) {
      additionalBlocks.push({
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
        visible: true
      });
    }

    // Perform batch update
    let updatedBlocks = [...blocks];
    
    // Update the original block
    updatedBlocks[blockIndex] = updatedOriginalBlock;
    
    // Insert additional blocks
    if (additionalBlocks.length > 0) {
      const newBlocks = additionalBlocks.map((blockData, index) => ({
        ...blockData,
        id: createTempId(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        sort_index: blockIndex + 1 + index
      }));
      
      updatedBlocks.splice(blockIndex + 1, 0, ...newBlocks);
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

  const updateBlock = useCallback((blockId: number, updates: Partial<ReviewBlock>) => {
    console.log('Updating block:', { blockId, updates });
    
    const updatedBlocks = blocks.map(block => 
      block.id === blockId 
        ? { 
            ...block, 
            ...updates, 
            updated_at: new Date().toISOString(),
            meta: updates.meta ? { ...block.meta, ...updates.meta } : block.meta
          }
        : block
    );
    
    setBlocks(updatedBlocks);
    saveToHistory(updatedBlocks, activeBlockId);
  }, [blocks, activeBlockId, saveToHistory]);

  const deleteBlock = useCallback((blockId: number) => {
    const updatedBlocks = blocks.filter(block => block.id !== blockId);
    const reindexedBlocks = reindexBlocks(updatedBlocks);
    
    setBlocks(reindexedBlocks);
    if (activeBlockId === blockId) {
      setActiveBlockId(null);
    }
    saveToHistory(reindexedBlocks, activeBlockId === blockId ? null : activeBlockId);
  }, [blocks, activeBlockId, saveToHistory, reindexBlocks]);

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

  const updateBlockLayout = useCallback((blockId: number, layoutMeta: any) => {
    updateBlock(blockId, {
      meta: {
        layout: layoutMeta
      }
    });
  }, [updateBlock]);

  const removeFromLayout = useCallback((blockId: number) => {
    const block = blocks.find(b => b.id === blockId);
    if (!block || !block.meta?.layout) return;

    const updatedMeta = { ...block.meta };
    delete updatedMeta.layout;

    updateBlock(blockId, { meta: updatedMeta });
  }, [blocks, updateBlock]);

  return {
    blocks,
    activeBlockId,
    history,
    historyIndex,
    setActiveBlockId: setActiveBlock,
    addBlock,
    addBlocksBatch,
    convertToGrid,
    duplicateBlock,
    updateBlock,
    updateBlockLayout,
    removeFromLayout,
    deleteBlock,
    moveBlock,
    undo,
    redo,
    canUndo,
    canRedo
  };
};
