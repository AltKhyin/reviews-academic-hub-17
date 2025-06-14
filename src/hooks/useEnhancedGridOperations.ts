
// ABOUTME: Enhanced grid operations with optimized merge behavior
// Provides stable grid resizing, merging, splitting, and cross-layout operations

import { useCallback } from 'react';
import { ReviewBlock } from '@/types/review';
import { useGridLayoutManager } from './useGridLayoutManager';

interface UseEnhancedGridOperationsProps {
  blocks: ReviewBlock[];
  onUpdateBlock: (blockId: string, updates: Partial<ReviewBlock>) => void;
  onDeleteBlock: (blockId: string) => void;
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

  // Enhanced column addition that only adds blocks when needed
  const addColumnToGrid = useCallback((rowId: string) => {
    const row = layoutState.rows.find(r => r.id === rowId);
    if (!row) {
      console.error('Row not found for column addition:', rowId);
      return { success: false, error: 'Row not found' };
    }

    if (row.columns >= 6) {
      console.warn('Maximum columns reached:', row.columns);
      return { success: false, error: 'Maximum columns reached' };
    }

    const newColumns = row.columns + 1;
    const newColumnWidths = Array(newColumns).fill(100 / newColumns);

    console.log('Adding column to grid:', { rowId, oldColumns: row.columns, newColumns });

    // Update all existing blocks in the row with new column count and widths
    row.blocks.forEach(block => {
      onUpdateBlock(block.id, {
        meta: {
          ...block.meta,
          layout: {
            ...block.meta?.layout,
            columns: newColumns,
            columnWidths: newColumnWidths
          }
        }
      });
    });

    // Only add a new block if there are gaps in the grid
    const currentPositions = row.blocks.map(b => b.meta?.layout?.position ?? 0);
    const missingPositions = Array.from({ length: newColumns }, (_, i) => i)
      .filter(pos => !currentPositions.includes(pos));

    if (missingPositions.length > 0) {
      const targetPosition = missingPositions[0];
      const lastBlockInRow = row.blocks[row.blocks.length - 1];
      const insertionIndex = lastBlockInRow ? 
        blocks.findIndex(b => b.id === lastBlockInRow.id) + 1 : 
        blocks.length;

      onAddBlock('paragraph', insertionIndex, {
        rowId,
        gridPosition: targetPosition,
        columns: newColumns
      });
    }

    return { success: true, newColumns };
  }, [layoutState.rows, onUpdateBlock, onAddBlock, blocks]);

  // Safe column removal with proper cleanup
  const removeColumnFromGrid = useCallback((rowId: string, columnIndex: number) => {
    const row = layoutState.rows.find(r => r.id === rowId);
    if (!row) {
      console.error('Row not found for column removal:', rowId);
      return { success: false, error: 'Row not found' };
    }

    if (row.columns <= 1) {
      console.error('Cannot remove column: only one column remaining');
      return { success: false, error: 'Cannot remove last column' };
    }

    const newColumns = row.columns - 1;
    const blockToRemove = row.blocks.find(b => (b.meta?.layout?.position ?? 0) === columnIndex);

    console.log('Removing column from grid:', { rowId, columnIndex, newColumns, blockToRemove: blockToRemove?.id });

    // Remove the block at the specified column first
    if (blockToRemove) {
      onDeleteBlock(blockToRemove.id);
    }

    // Update remaining blocks with corrected positions and column count
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

  // Enhanced block merging with content handling
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
    let mergedContent;
    if (leftBlock.type === 'paragraph' && rightBlock.type === 'paragraph') {
      mergedContent = {
        ...leftBlock.content,
        content: `${leftBlock.content.content}<br><br>${rightBlock.content.content}`
      };
    } else {
      // For other types, keep the left block's content
      mergedContent = leftBlock.content;
    }

    // Update the left block with merged content
    onUpdateBlock(leftBlock.id, {
      content: mergedContent
    });

    // Remove the right block
    onDeleteBlock(rightBlock.id);

    return { success: true };
  }, [layoutState.rows, onUpdateBlock, onDeleteBlock]);

  // Optimized merge into grid - no empty blocks created
  const mergeIntoGrid = useCallback((draggedBlockId: string, targetRowId: string, targetPosition?: number) => {
    const draggedBlock = blocks.find(b => b.id === draggedBlockId);
    if (!draggedBlock) {
      console.error('Dragged block not found:', draggedBlockId);
      return { success: false };
    }

    // Check if target is a single block or existing grid
    const targetBlock = blocks.find(b => `single-${b.id}` === targetRowId);
    const targetRow = layoutState.rows.find(r => r.id === targetRowId);
    
    if (targetBlock && !targetRow?.blocks.find(b => b.meta?.layout?.columns && b.meta.layout.columns > 1)) {
      // Merging with a single block - create new 2-column grid
      const finalRowId = `row-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const newColumns = 2;
      const columnWidths = [50, 50];
      
      console.log('Creating new grid by merging single blocks:', { 
        draggedBlockId, 
        targetBlockId: targetBlock.id,
        finalRowId,
        newColumns 
      });

      // Update target block to become position 0 in new grid
      onUpdateBlock(targetBlock.id, {
        meta: {
          ...targetBlock.meta,
          layout: {
            row_id: finalRowId,
            position: 0,
            columns: newColumns,
            gap: 4,
            columnWidths
          }
        }
      });

      // Update dragged block to become position 1 in new grid
      onUpdateBlock(draggedBlockId, {
        meta: {
          ...draggedBlock.meta,
          layout: {
            row_id: finalRowId,
            position: 1,
            columns: newColumns,
            gap: 4,
            columnWidths
          }
        }
      });

      return { success: true };

    } else if (targetRow && targetRow.blocks.length > 0) {
      // Merging with existing grid - add as new column
      const newColumns = targetRow.columns + 1;
      const columnWidths = Array(newColumns).fill(100 / newColumns);
      const finalPosition = targetPosition ?? targetRow.blocks.length;

      console.log('Adding to existing grid:', { 
        draggedBlockId, 
        targetRowId, 
        finalPosition, 
        newColumns 
      });

      // Update dragged block to join target grid
      onUpdateBlock(draggedBlockId, {
        meta: {
          ...draggedBlock.meta,
          layout: {
            row_id: targetRowId,
            position: finalPosition,
            columns: newColumns,
            gap: targetRow.gap || 4,
            columnWidths
          }
        }
      });

      // Update all existing blocks in target row
      targetRow.blocks.forEach((block) => {
        if (block.id !== draggedBlockId) {
          onUpdateBlock(block.id, {
            meta: {
              ...block.meta,
              layout: {
                ...block.meta?.layout,
                columns: newColumns,
                columnWidths
              }
            }
          });
        }
      });

      return { success: true };
    }

    return { success: false };
  }, [blocks, layoutState.rows, onUpdateBlock]);

  // Split a block into two columns
  const splitBlockIntoGrid = useCallback((blockId: string, splitContent: { left: any; right: any }) => {
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
      content: splitContent.left,
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
          content: splitContent.right
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
          .map(b => b.content.content || '')
          .join('<br><br>');

        onUpdateBlock(firstBlock.id, {
          content: { ...firstBlock.content, content: mergedContent },
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
    mergeIntoGrid,
    splitBlockIntoGrid,
    convertGridToSingle,
    reorderGridColumns
  };
};
