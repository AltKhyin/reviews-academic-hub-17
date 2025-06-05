
// ABOUTME: Block management logic with CRUD operations and utilities
// Provides comprehensive block manipulation functionality

import { useCallback, useState } from 'react';
import { ReviewBlock, BlockType } from '@/types/review';
import { getDefaultPayload } from '@/utils/blockDefaults';

interface UseBlockManagementOptions {
  initialBlocks: ReviewBlock[];
  issueId?: string;
}

export const useBlockManagement = ({ initialBlocks, issueId }: UseBlockManagementOptions) => {
  const [blocks, setBlocks] = useState<ReviewBlock[]>(initialBlocks);
  const [activeBlockId, setActiveBlockId] = useState<number | null>(null);

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

    const updatedBlocks = [...blocks];
    if (position !== undefined) {
      updatedBlocks.splice(position, 0, newBlock);
      updatedBlocks.forEach((block, index) => {
        block.sort_index = index;
      });
    } else {
      updatedBlocks.push(newBlock);
    }

    setBlocks(updatedBlocks);
    setActiveBlockId(newBlock.id);
  }, [blocks, issueId]);

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

    const updatedBlocks = [...blocks];
    updatedBlocks.splice(blockIndex + 1, 0, duplicatedBlock);
    
    updatedBlocks.forEach((block, index) => {
      block.sort_index = index;
    });

    setBlocks(updatedBlocks);
    setActiveBlockId(duplicatedBlock.id);
  }, [blocks]);

  const updateBlock = useCallback((blockId: number, updates: Partial<ReviewBlock>) => {
    setBlocks(prev => prev.map(block => 
      block.id === blockId 
        ? { ...block, ...updates, updated_at: new Date().toISOString() }
        : block
    ));
  }, []);

  const deleteBlock = useCallback((blockId: number) => {
    setBlocks(prev => {
      const filtered = prev.filter(block => block.id !== blockId);
      return filtered.map((block, index) => ({
        ...block,
        sort_index: index
      }));
    });
    if (activeBlockId === blockId) {
      setActiveBlockId(null);
    }
  }, [activeBlockId]);

  const moveBlock = useCallback((blockId: number, direction: 'up' | 'down') => {
    setBlocks(prev => {
      const currentIndex = prev.findIndex(block => block.id === blockId);
      if (currentIndex === -1) return prev;

      const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
      if (newIndex < 0 || newIndex >= prev.length) return prev;

      const newBlocks = [...prev];
      [newBlocks[currentIndex], newBlocks[newIndex]] = [newBlocks[newIndex], newBlocks[currentIndex]];
      
      return newBlocks.map((block, index) => ({
        ...block,
        sort_index: index
      }));
    });
  }, []);

  return {
    blocks,
    activeBlockId,
    setActiveBlockId,
    addBlock,
    duplicateBlock,
    updateBlock,
    deleteBlock,
    moveBlock
  };
};
