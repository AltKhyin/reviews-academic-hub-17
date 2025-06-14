
// ABOUTME: Core block operations with comprehensive CRUD functionality and string ID support
// Provides complete block manipulation functions used across the editor

import { useCallback } from 'react';
import { ReviewBlock, BlockType } from '@/types/review';

interface UseBlockOperationsProps {
  blocks: ReviewBlock[];
  onBlocksChange: (blocks: ReviewBlock[]) => void;
  activeBlockId: string;
  onActiveBlockChange: (blockId: string) => void;
}

export const useBlockOperations = ({
  blocks,
  onBlocksChange,
  activeBlockId,
  onActiveBlockChange
}: UseBlockOperationsProps) => {
  
  const createTempId = useCallback((): string => {
    return `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  const reindexBlocks = useCallback((blocks: ReviewBlock[]): ReviewBlock[] => {
    return blocks.map((block, index) => ({
      ...block,
      sort_index: index
    }));
  }, []);

  const findBlockIndex = useCallback((blocks: ReviewBlock[], blockId: string): number => {
    return blocks.findIndex(block => block.id === blockId);
  }, []);

  const validateLayoutMetadata = useCallback((block: ReviewBlock): boolean => {
    const layout = block.meta?.layout;
    if (!layout) return true; // Single blocks are valid
    
    return !!(layout.row_id && 
             typeof layout.position === 'number' && 
             typeof layout.columns === 'number' && 
             layout.columns > 0);
  }, []);

  const addBlock = useCallback((type: BlockType, content: any = {}, position?: number) => {
    const newBlock: ReviewBlock = {
      id: createTempId(),
      type,
      content,
      sort_index: position ?? blocks.length,
      visible: true,
      meta: {}
    };

    const newBlocks = [...blocks];
    if (position !== undefined) {
      newBlocks.splice(position, 0, newBlock);
    } else {
      newBlocks.push(newBlock);
    }

    const reindexedBlocks = reindexBlocks(newBlocks);
    onBlocksChange(reindexedBlocks);
    onActiveBlockChange(newBlock.id);

    return newBlock;
  }, [blocks, onBlocksChange, onActiveBlockChange, createTempId, reindexBlocks]);

  const updateBlock = useCallback((blockId: string, updates: Partial<ReviewBlock>) => {
    const updatedBlocks = blocks.map(block => 
      block.id === blockId ? { ...block, ...updates } : block
    );
    onBlocksChange(updatedBlocks);
  }, [blocks, onBlocksChange]);

  const deleteBlock = useCallback((blockId: string) => {
    const filteredBlocks = blocks.filter(block => block.id !== blockId);
    const reindexedBlocks = reindexBlocks(filteredBlocks);
    onBlocksChange(reindexedBlocks);
    
    if (activeBlockId === blockId) {
      const newActiveIndex = Math.max(0, findBlockIndex(blocks, blockId) - 1);
      const newActiveBlock = reindexedBlocks[newActiveIndex];
      onActiveBlockChange(newActiveBlock?.id || '');
    }
  }, [blocks, onBlocksChange, activeBlockId, onActiveBlockChange, findBlockIndex, reindexBlocks]);

  const moveBlock = useCallback((blockId: string, direction: 'up' | 'down') => {
    const currentIndex = findBlockIndex(blocks, blockId);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= blocks.length) return;

    const newBlocks = [...blocks];
    const [movedBlock] = newBlocks.splice(currentIndex, 1);
    newBlocks.splice(newIndex, 0, movedBlock);

    const reindexedBlocks = reindexBlocks(newBlocks);
    onBlocksChange(reindexedBlocks);
  }, [blocks, onBlocksChange, findBlockIndex, reindexBlocks]);

  const duplicateBlock = useCallback((blockId: string) => {
    const blockToDuplicate = blocks.find(block => block.id === blockId);
    if (!blockToDuplicate) return;

    const duplicatedBlock: ReviewBlock = {
      ...blockToDuplicate,
      id: createTempId(),
      sort_index: blockToDuplicate.sort_index + 1
    };

    const currentIndex = findBlockIndex(blocks, blockId);
    const newBlocks = [...blocks];
    newBlocks.splice(currentIndex + 1, 0, duplicatedBlock);

    const reindexedBlocks = reindexBlocks(newBlocks);
    onBlocksChange(reindexedBlocks);
    onActiveBlockChange(duplicatedBlock.id);

    return duplicatedBlock;
  }, [blocks, onBlocksChange, onActiveBlockChange, createTempId, findBlockIndex, reindexBlocks]);

  return {
    // Core utilities
    createTempId,
    reindexBlocks,
    findBlockIndex,
    validateLayoutMetadata,
    
    // CRUD operations
    addBlock,
    updateBlock,
    deleteBlock,
    moveBlock,
    duplicateBlock
  };
};
