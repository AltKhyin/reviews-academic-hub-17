
// ABOUTME: Enhanced grid operations hook with comprehensive block management and string ID support
import { useCallback } from 'react';
import { useGridState } from './grid/useGridState';
import { useBlockOperations } from './useBlockOperations';
import { ReviewBlock } from '@/types/review';
import { Grid2DLayout, GridPosition } from '@/types/grid';

interface EnhancedGridOperationsProps {
  blocks: ReviewBlock[];
  onBlocksChange: (blocks: ReviewBlock[]) => void;
  activeBlockId: string;
  onActiveBlockChange: (blockId: string) => void;
  gridLayout?: Grid2DLayout;
}

export const useEnhancedGridOperations = ({
  blocks,
  onBlocksChange,
  activeBlockId,
  onActiveBlockChange,
  gridLayout
}: EnhancedGridOperationsProps) => {
  // Use grid state management
  const gridState = useGridState(gridLayout);

  // Use block operations with proper string ID handling
  const {
    addBlock,
    updateBlock: originalUpdateBlock,
    deleteBlock: originalDeleteBlock,
    moveBlock,
    duplicateBlock
  } = useBlockOperations({
    blocks,
    onBlocksChange,
    activeBlockId,
    onActiveBlockChange
  });

  // Wrap block operations to handle string IDs properly
  const updateBlock = useCallback((blockId: string, updates: Partial<ReviewBlock>) => {
    originalUpdateBlock(blockId, updates);
  }, [originalUpdateBlock]);

  const deleteBlock = useCallback((blockId: string) => {
    originalDeleteBlock(blockId);
  }, [originalDeleteBlock]);

  // Enhanced grid operations
  const addBlockToGrid = useCallback((position: GridPosition, block: ReviewBlock) => {
    // First add the block to the blocks array
    addBlock(block.type, block.content);
    
    // Then add it to the grid layout
    if (gridState.grid) {
      gridState.addBlock(gridState.grid.id, position, block);
    }
  }, [addBlock, gridState]);

  const removeBlockFromGrid = useCallback((position: GridPosition) => {
    if (!gridState.grid) return;

    const row = gridState.grid.rows[position.row];
    if (row && row.cells[position.column] && row.cells[position.column].block) {
      const blockId = row.cells[position.column].block!.id;
      
      // Remove from blocks array
      deleteBlock(blockId);
      
      // Remove from grid layout
      gridState.removeBlock(gridState.grid.id, position);
    }
  }, [deleteBlock, gridState]);

  const moveBlockInGrid = useCallback((fromPosition: GridPosition, toPosition: GridPosition) => {
    if (!gridState.grid) return;

    const fromRow = gridState.grid.rows[fromPosition.row];
    const toRow = gridState.grid.rows[toPosition.row];
    
    if (fromRow && toRow && fromRow.cells[fromPosition.column] && toRow.cells[toPosition.column]) {
      const fromBlock = fromRow.cells[fromPosition.column].block;
      const toBlock = toRow.cells[toPosition.column].block;

      // Swap blocks in grid
      gridState.removeBlock(gridState.grid.id, fromPosition);
      gridState.removeBlock(gridState.grid.id, toPosition);

      if (fromBlock) {
        gridState.addBlock(gridState.grid.id, toPosition, {
          id: fromBlock.id,
          type: fromBlock.type,
          content: fromBlock.content,
          visible: fromBlock.visible,
          sort_index: fromBlock.sort_index
        });
      }

      if (toBlock) {
        gridState.addBlock(gridState.grid.id, fromPosition, {
          id: toBlock.id,
          type: toBlock.type,
          content: toBlock.content,
          visible: toBlock.visible,
          sort_index: toBlock.sort_index
        });
      }
    }
  }, [gridState]);

  const duplicateBlockInGrid = useCallback((position: GridPosition) => {
    if (!gridState.grid) return;

    const row = gridState.grid.rows[position.row];
    if (row && row.cells[position.column] && row.cells[position.column].block) {
      const originalBlockId = row.cells[position.column].block!.id;
      
      // Find original block in blocks array
      const originalBlock = blocks.find(b => b.id === originalBlockId);
      if (originalBlock) {
        // Duplicate in blocks array
        duplicateBlock(originalBlockId);
      }
    }
  }, [blocks, duplicateBlock, gridState]);

  const getBlockAtPosition = useCallback((position: GridPosition): ReviewBlock | null => {
    if (!gridState.grid) return null;

    const row = gridState.grid.rows[position.row];
    if (row && row.cells[position.column] && row.cells[position.column].block) {
      const blockId = row.cells[position.column].block!.id;
      return blocks.find(b => b.id === blockId) || null;
    }
    return null;
  }, [blocks, gridState]);

  const isPositionOccupied = useCallback((position: GridPosition): boolean => {
    if (!gridState.grid) return false;

    const row = gridState.grid.rows[position.row];
    return !!(row && row.cells[position.column] && row.cells[position.column].block);
  }, [gridState]);

  return {
    // Grid state
    gridState,
    
    // Block operations
    addBlock,
    updateBlock,
    deleteBlock,
    moveBlock,
    duplicateBlock,
    
    // Enhanced grid operations
    addBlockToGrid,
    removeBlockFromGrid,
    moveBlockInGrid,
    duplicateBlockInGrid,
    getBlockAtPosition,
    isPositionOccupied,
  };
};
