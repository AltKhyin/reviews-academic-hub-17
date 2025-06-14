
// ABOUTME: Core block operations utilities
// Provides common block manipulation functions used across the editor

import { useCallback } from 'react';
import { ReviewBlock } from '@/types/review';

export const useBlockOperations = () => {
  const createTempId = useCallback((): number => {
    return -(Date.now() + Math.random());
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

  return {
    createTempId,
    reindexBlocks,
    findBlockIndex,
    validateLayoutMetadata
  };
};
