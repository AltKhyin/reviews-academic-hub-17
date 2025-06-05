
// ABOUTME: Enhanced block management with robust layout support and grid operations
// Comprehensive block manipulation with proper layout metadata handling

import { useCallback, useState } from 'react';
import { ReviewBlock, BlockType } from '@/types/review';
import { getDefaultPayload } from '@/utils/blockDefaults';

interface UseBlockManagementOptions {
  initialBlocks: ReviewBlock[];
  issueId?: string;
}

interface BlockHistoryState {
  blocks: ReviewBlock[];
  activeBlockId: number | null;
}

export const useBlockManagement = ({ initialBlocks, issueId }: UseBlockManagementOptions) => {
  const [blocks, setBlocks] = useState<ReviewBlock[]>(initialBlocks);
  const [activeBlockId, setActiveBlockId] = useState<number | null>(null);
  
  // History management for undo/redo
  const [history, setHistory] = useState<BlockHistoryState[]>([
    { blocks: initialBlocks, activeBlockId: null }
  ]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  // Save current state to history
  const saveToHistory = useCallback((newBlocks: ReviewBlock[], newActiveBlockId: number | null) => {
    const newState: BlockHistoryState = {
      blocks: JSON.parse(JSON.stringify(newBlocks)), // Deep clone
      activeBlockId: newActiveBlockId
    };

    // Remove any future history if we're in the middle
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newState);
    
    // Limit history to last 50 states
    if (newHistory.length > 50) {
      newHistory.shift();
    } else {
      setHistoryIndex(historyIndex + 1);
    }
    
    setHistory(newHistory);
  }, [history, historyIndex]);

  const setActiveBlock = useCallback((blockId: number | null) => {
    setActiveBlockId(blockId);
  }, []);

  const undo = useCallback(() => {
    if (canUndo) {
      const newIndex = historyIndex - 1;
      const state = history[newIndex];
      setBlocks(state.blocks);
      setActiveBlockId(state.activeBlockId);
      setHistoryIndex(newIndex);
    }
  }, [canUndo, historyIndex, history]);

  const redo = useCallback(() => {
    if (canRedo) {
      const newIndex = historyIndex + 1;
      const state = history[newIndex];
      setBlocks(state.blocks);
      setActiveBlockId(state.activeBlockId);
      setHistoryIndex(newIndex);
    }
  }, [canRedo, historyIndex, history]);

  const addBlock = useCallback((type: BlockType, position?: number) => {
    const tempId = -(Date.now() + Math.random());
    
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
        }
      },
      visible: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    let updatedBlocks = [...blocks];
    
    if (position !== undefined) {
      updatedBlocks.splice(position, 0, newBlock);
      // Reindex all blocks after insertion
      updatedBlocks = updatedBlocks.map((block, index) => ({
        ...block,
        sort_index: index
      }));
    } else {
      updatedBlocks.push(newBlock);
    }

    setBlocks(updatedBlocks);
    setActiveBlockId(newBlock.id);
    saveToHistory(updatedBlocks, newBlock.id);
    
    return newBlock;
  }, [blocks, issueId, saveToHistory]);

  const duplicateBlock = useCallback((blockId: number) => {
    const blockToDuplicate = blocks.find(block => block.id === blockId);
    if (!blockToDuplicate) return;

    const blockIndex = blocks.findIndex(block => block.id === blockId);
    const tempId = -(Date.now() + Math.random());
    
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
    
    // Reindex blocks
    const reindexedBlocks = updatedBlocks.map((block, index) => ({
      ...block,
      sort_index: index
    }));

    setBlocks(reindexedBlocks);
    setActiveBlockId(duplicatedBlock.id);
    saveToHistory(reindexedBlocks, duplicatedBlock.id);
  }, [blocks, saveToHistory]);

  const updateBlock = useCallback((blockId: number, updates: Partial<ReviewBlock>) => {
    const updatedBlocks = blocks.map(block => 
      block.id === blockId 
        ? { 
            ...block, 
            ...updates, 
            updated_at: new Date().toISOString(),
            // Properly merge meta object to preserve existing metadata
            meta: updates.meta ? { ...block.meta, ...updates.meta } : block.meta
          }
        : block
    );
    setBlocks(updatedBlocks);
    saveToHistory(updatedBlocks, activeBlockId);
  }, [blocks, activeBlockId, saveToHistory]);

  const deleteBlock = useCallback((blockId: number) => {
    const updatedBlocks = blocks.filter(block => block.id !== blockId);
    const reindexedBlocks = updatedBlocks.map((block, index) => ({
      ...block,
      sort_index: index
    }));
    
    setBlocks(reindexedBlocks);
    if (activeBlockId === blockId) {
      setActiveBlockId(null);
    }
    saveToHistory(reindexedBlocks, activeBlockId === blockId ? null : activeBlockId);
  }, [blocks, activeBlockId, saveToHistory]);

  const moveBlock = useCallback((blockId: number, direction: 'up' | 'down') => {
    const currentIndex = blocks.findIndex(block => block.id === blockId);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= blocks.length) return;

    const newBlocks = [...blocks];
    [newBlocks[currentIndex], newBlocks[newIndex]] = [newBlocks[newIndex], newBlocks[currentIndex]];
    
    // Reindex blocks to maintain consistency
    const reindexedBlocks = newBlocks.map((block, index) => ({
      ...block,
      sort_index: index
    }));

    setBlocks(reindexedBlocks);
    saveToHistory(reindexedBlocks, activeBlockId);
  }, [blocks, activeBlockId, saveToHistory]);

  // New method for updating layout metadata specifically
  const updateBlockLayout = useCallback((blockId: number, layoutMeta: any) => {
    updateBlock(blockId, {
      meta: {
        layout: layoutMeta
      }
    });
  }, [updateBlock]);

  // Method to remove block from layout (convert to single block)
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
