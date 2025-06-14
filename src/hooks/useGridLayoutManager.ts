
// ABOUTME: Refactored grid layout manager using focused sub-hooks
// Main grid management coordination with better separation of concerns

import { useCallback } from 'react';
import { ReviewBlock } from '@/types/review';
import { useGridState } from './grid/useGridState';
import { useGridRepair } from './grid/useGridRepair';

interface UseGridLayoutManagerProps {
  blocks: ReviewBlock[];
  onUpdateBlock: (blockId: string, updates: Partial<ReviewBlock>) => void;
  onDeleteBlock: (blockId: string) => void;
}

export const useGridLayoutManager = ({
  blocks,
  onUpdateBlock,
  onDeleteBlock
}: UseGridLayoutManagerProps) => {
  
  const layoutState = useGridState();
  const { repairGrid, validateGridIntegrity } = useGridRepair();
  
  const updateColumnWidths = useCallback((rowId: string, updates: { columnWidths: number[] }) => {
    const row = layoutState.rows.find(r => r.id === rowId);
    if (!row) {
      console.error('Row not found for column width update:', rowId);
      return;
    }
    
    console.log('Updating column widths:', { rowId, columnWidths: updates.columnWidths });
    
    row.cells.forEach(cell => {
      if (cell.block) {
        onUpdateBlock(cell.block.id, {
          meta: {
            layout: {
              columnWidths: updates.columnWidths
            }
          }
        });
      }
    });
  }, [layoutState.rows, onUpdateBlock]);
  
  const deleteBlockWithLayoutRepair = useCallback((blockId: string) => {
    console.log('Deleting block with layout repair:', blockId);
    
    const blockToDelete = blocks.find(b => b.id === blockId);
    if (!blockToDelete) {
      console.error('Block not found for deletion:', blockId);
      return;
    }
    
    const layout = blockToDelete.meta?.layout;
    
    if (layout?.row_id && layoutState.grid) {
      const row = layoutState.rows.find(r => r.id === layout.row_id);
      if (row && row.cells.length > 1) {
        const remainingBlocks = row.cells
          .filter(cell => cell.block && cell.block.id !== blockId)
          .map(cell => cell.block!)
          .map(block => ({
            id: block.id,
            type: block.type as any,
            content: block.content,
            visible: block.visible,
            sort_index: block.sort_index
          }));
        
        onDeleteBlock(blockId);
        
        setTimeout(() => {
          if (layoutState.grid) {
            const repairedGrid = repairGrid(layoutState.grid, remainingBlocks);
            layoutState.updateGrid(repairedGrid);
          }
        }, 100);
        
        return;
      }
    }
    
    onDeleteBlock(blockId);
  }, [blocks, layoutState, onDeleteBlock, repairGrid]);
  
  const getRowByBlockId = useCallback((blockId: string) => {
    return layoutState.rows.find(row => 
      row.cells.some(cell => cell.block && cell.block.id === blockId)
    ) || null;
  }, [layoutState.rows]);
  
  const isBlockInGrid = useCallback((blockId: string): boolean => {
    const block = blocks.find(b => b.id === blockId);
    if (!block?.meta?.layout) return false;
    
    const row = getRowByBlockId(blockId);
    return row ? row.cells.length > 1 : false;
  }, [blocks, getRowByBlockId]);
  
  return {
    layoutState,
    validateGridIntegrity: (grid: any, blocks: ReviewBlock[]) => validateGridIntegrity(grid, blocks),
    repairGrid: (grid: any, blocks: ReviewBlock[]) => repairGrid(grid, blocks),
    updateColumnWidths,
    deleteBlockWithLayoutRepair,
    getRowByBlockId,
    isBlockInGrid
  };
};
