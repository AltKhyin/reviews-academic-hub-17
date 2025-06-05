// ABOUTME: Enhanced grid operations with fixed column management and improved event handling
// Provides stable grid resizing, merging, splitting, and cross-layout operations

import { useCallback } from 'react';
import { ReviewBlock } from '@/types/review';
import { useGridLayoutManager } from './useGridLayoutManager';

interface UseEnhancedGridOperationsProps {
  blocks: ReviewBlock[];
  onUpdateBlock: (blockId: number, updates: Partial<ReviewBlock>) => void;
  onDeleteBlock: (blockId: number) => void;
  onAddBlock: (type: string, position?: number, layoutInfo?: any) => void;
}

export const useEnhancedGridOperations = ({
  blocks,
  onUpdateBlock,
  onDeleteBlock,
  onAddBlock
}: UseEnhancedGridOperationsProps) => {
  
  const {
    layoutState,
    updateColumnWidths,
    getRowByBlockId,
    isBlockInGrid
  } = useGridLayoutManager({
    blocks,
    onUpdateBlock,
    onDeleteBlock
  });

  // FIXED: Proper column addition with correct position calculation
  const addColumnToGrid = useCallback((rowId: string) => {
    const row = layoutState.rows.find(r => r.id === rowId);
    if (!row) {
      console.error('Row not found for column addition:', rowId);
      return;
    }

    const newColumns = row.columns + 1;
    const newColumnWidths = Array(newColumns).fill(100 / newColumns);

    console.log('Adding column to grid:', { rowId, oldColumns: row.columns, newColumns });

    // Batch update all existing blocks in the row
    const updates = row.blocks.map(block => ({
      blockId: block.id,
      updates: {
        meta: {
          ...block.meta,
          layout: {
            ...block.meta?.layout,
            columns: newColumns,
            columnWidths: newColumnWidths
          }
        }
      }
    }));

    // Apply all updates
    updates.forEach(({ blockId, updates }) => {
      onUpdateBlock(blockId, updates);
    });

    return { success: true, newColumns };
  }, [layoutState.rows, onUpdateBlock]);

  // FIXED: Safe column removal with proper cleanup
  const removeColumnFromGrid = useCallback((rowId: string, columnIndex: number) => {
    const row = layoutState.rows.find(r => r.id === rowId);
    if (!row || row.columns <= 1) {
      console.error('Cannot remove column: row not found or only one column:', { rowId, columns: row?.columns });
      return;
    }

    const newColumns = row.columns - 1;
    const blockToRemove = row.blocks.find(b => (b.meta?.layout?.position ?? 0) === columnIndex);

    console.log('Removing column from grid:', { rowId, columnIndex, newColumns, blockToRemove: blockToRemove?.id });

    // Remove the block at the specified column first
    if (blockToRemove) {
      onDeleteBlock(blockToRemove.id);
    }

    // Update remaining blocks with corrected positions
    const remainingBlocks = row.blocks.filter(b => (b.meta?.layout?.position ?? 0) !== columnIndex);
    const newColumnWidths = Array(newColumns).fill(100 / newColumns);

    remainingBlocks.forEach((block, index) => {
      const currentPosition = block.meta?.layout?.position ?? 0;
      const newPosition = currentPosition > columnIndex ? currentPosition - 1 : currentPosition;
      
      onUpdateBlock(block.id, {
        meta: {
          ...block.meta,
          layout: {
            ...block.meta?.layout,
            position: newPosition,
            columns: newColumns,
            columnWidths: newColumnWidths
          }
        }
      });
    });

    return { success: true, newColumns };
  }, [layoutState.rows, onDeleteBlock, onUpdateBlock]);

  // FIXED: Enhanced block merging with proper content handling
  const mergeGridBlocks = useCallback((rowId: string, leftIndex: number, rightIndex: number) => {
    const row = layoutState.rows.find(r => r.id === rowId);
    if (!row) {
      console.error('Row not found for block merging:', rowId);
      return;
    }

    const leftBlock = row.blocks.find(b => (b.meta?.layout?.position ?? 0) === leftIndex);
    const rightBlock = row.blocks.find(b => (b.meta?.layout?.position ?? 0) === rightIndex);

    if (!leftBlock || !rightBlock) {
      console.error('Blocks not found for merging:', { leftIndex, rightIndex });
      return;
    }

    console.log('Merging grid blocks:', { rowId, leftBlock: leftBlock.id, rightBlock: rightBlock.id });

    // Merge content based on block types
    let mergedPayload;
    if (leftBlock.type === 'paragraph' && rightBlock.type === 'paragraph') {
      mergedPayload = {
        ...leftBlock.payload,
        content: `${leftBlock.payload.content}<br><br>${rightBlock.payload.content}`
      };
    } else {
      // For other types, keep the left block's content
      mergedPayload = leftBlock.payload;
    }

    // Update the left block with merged content
    onUpdateBlock(leftBlock.id, {
      payload: mergedPayload
    });

    // Remove the right block
    onDeleteBlock(rightBlock.id);

    return { success: true };
  }, [layoutState.rows, onUpdateBlock, onDeleteBlock]);

  // Split a block into two columns
  const splitBlockIntoGrid = useCallback((blockId: number, splitContent: { left: any; right: any }) => {
    const block = blocks.find(b => b.id === blockId);
    if (!block || isBlockInGrid(blockId)) {
      console.error('Cannot split block: not found or already in grid:', blockId);
      return;
    }

    const blockIndex = blocks.findIndex(b => b.id === blockId);
    const rowId = `row-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    console.log('Splitting block into grid:', { blockId, rowId });

    // Update the original block to be the left column
    onUpdateBlock(blockId, {
      payload: splitContent.left,
      meta: {
        ...block.meta,
        layout: {
          row_id: rowId,
          position: 0,
          columns: 2,
          gap: 4,
          columnWidths: [50, 50]
        }
      }
    });

    // Add the right column block
    onAddBlock(block.type, blockIndex + 1, {
      rowId,
      gridPosition: 1,
      columns: 2
    });

    // Update the new block with right content
    setTimeout(() => {
      const newBlocks = blocks.filter(b => b.meta?.layout?.row_id === rowId);
      const rightBlock = newBlocks.find(b => (b.meta?.layout?.position ?? 0) === 1);
      if (rightBlock) {
        onUpdateBlock(rightBlock.id, {
          payload: splitContent.right
        });
      }
    }, 100);
  }, [blocks, isBlockInGrid, onUpdateBlock, onAddBlock]);

  // Convert grid to single column
  const convertGridToSingle = useCallback((rowId: string, mergeContent: boolean = false) => {
    const row = layoutState.rows.find(r => r.id === rowId);
    if (!row || row.columns === 1) {
      console.error('Cannot convert grid to single: row not found or already single column:', rowId);
      return;
    }

    console.log('Converting grid to single column:', { rowId, mergeContent });

    if (mergeContent && row.blocks.length > 1) {
      // Merge all blocks into the first one
      const firstBlock = row.blocks[0];
      const otherBlocks = row.blocks.slice(1);

      if (firstBlock.type === 'paragraph') {
        const mergedContent = row.blocks
          .map(b => b.payload.content || '')
          .join('<br><br>');

        onUpdateBlock(firstBlock.id, {
          payload: { ...firstBlock.payload, content: mergedContent },
          meta: {
            ...firstBlock.meta,
            layout: undefined // Remove layout metadata
          }
        });
      } else {
        // Keep first block, remove layout metadata
        onUpdateBlock(firstBlock.id, {
          meta: {
            ...firstBlock.meta,
            layout: undefined
          }
        });
      }

      // Delete other blocks
      otherBlocks.forEach(block => onDeleteBlock(block.id));
    } else {
      // Keep all blocks as separate single-column blocks
      row.blocks.forEach(block => {
        onUpdateBlock(block.id, {
          meta: {
            ...block.meta,
            layout: undefined // Remove layout metadata
          }
        });
      });
    }
  }, [layoutState.rows, onUpdateBlock, onDeleteBlock]);

  // Reorder columns within a grid
  const reorderGridColumns = useCallback((rowId: string, fromIndex: number, toIndex: number) => {
    const row = layoutState.rows.find(r => r.id === rowId);
    if (!row) {
      console.error('Row not found for column reordering:', rowId);
      return;
    }

    console.log('Reordering grid columns:', { rowId, fromIndex, toIndex });

    // Update positions of affected blocks
    row.blocks.forEach(block => {
      const currentPosition = block.meta?.layout?.position ?? 0;
      let newPosition = currentPosition;

      if (currentPosition === fromIndex) {
        newPosition = toIndex;
      } else if (fromIndex < toIndex && currentPosition > fromIndex && currentPosition <= toIndex) {
        newPosition = currentPosition - 1;
      } else if (fromIndex > toIndex && currentPosition >= toIndex && currentPosition < fromIndex) {
        newPosition = currentPosition + 1;
      }

      if (newPosition !== currentPosition) {
        onUpdateBlock(block.id, {
          meta: {
            ...block.meta,
            layout: {
              ...block.meta?.layout,
              position: newPosition
            }
          }
        });
      }
    });
  }, [layoutState.rows, onUpdateBlock]);

  return {
    addColumnToGrid,
    removeColumnFromGrid,
    mergeGridBlocks,
    splitBlockIntoGrid,
    convertGridToSingle,
    reorderGridColumns
  };
};
