
// ABOUTME: Provides adapter functions to bridge the old flat block array data structure
// with the new LayoutElement-based structure for the editor.
import { Review, ReviewBlock, LayoutElement } from '@/types/review';
import { generateId } from './utils';

export interface EditorState {
  elements: LayoutElement[];
  blocks: { [key: string]: ReviewBlock };
}

// Converts the legacy flat array of blocks into the new editor state.
export const transformBlocksToReview = (blocks: ReviewBlock[], initialReviewData: Partial<Review>): Review => {
  const editorBlocks: { [key: string]: ReviewBlock } = {};
  const elements: LayoutElement[] = (blocks || [])
    .sort((a, b) => a.sort_index - b.sort_index)
    .map(block => {
      editorBlocks[block.id] = block;
      return {
        id: generateId(), // LayoutElements need their own unique ID for D&D
        type: 'block_container',
        blockId: block.id,
      };
    });

  return {
    id: initialReviewData.id || generateId(),
    title: initialReviewData.title || 'Nova Revisão',
    elements,
    blocks: editorBlocks,
    version: initialReviewData.version || 1,
    status: initialReviewData.status || 'draft',
    createdAt: initialReviewData.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
};

// Converts the new editor Review object back into a flat array for saving.
export const transformReviewToBlocks = (review: Review): ReviewBlock[] => {
  if (!review || !review.elements || !review.blocks) {
    return [];
  }

  return review.elements
    .map((element, index) => {
      if (element.type === 'block_container' && element.blockId && review.blocks[element.blockId]) {
        const block = review.blocks[element.blockId];
        return {
          ...block,
          sort_index: index, // Re-calculate sort_index based on the new order
        };
      }
      // This simplistic transform doesn't handle nested layouts (rows/grids) yet.
      // It would need to be extended to recursively flatten those structures if they are used.
      return null;
    })
    .filter((block): block is ReviewBlock => block !== null);
};
