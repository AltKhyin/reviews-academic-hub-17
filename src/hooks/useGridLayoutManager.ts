
// ABOUTME: Refactored grid layout manager using focused sub-hooks
// Main grid management coordination with better separation of concerns

import { useCallback } from 'react';
import { ReviewBlock } from '@/types/review';
import { useGridState } from './grid/useGridState';
import { useGridRepair } from './grid/useGridRepair';

interface UseGridLayoutManagerProps {
  blocks: ReviewBlock[];
  onUpdateBlock: (blockId: number, updates: Partial<ReviewBlock>) => void;
  onDeleteBlock: (blockId: number) => void;
}

export const useGridLayoutManager = ({
  blocks,
  onUpdateBlock,
  onDeleteBlock
}: UseGridLayoutManagerProps) => {
  
  const layoutState = useGridState(blocks);
  const { validateLayoutMetadata, repairLayoutMetadata } = useGridRepair({ onUpdateBlock });
  
  const updateColumnWidths = useCallback((rowId: string, updates: { columnWidths: number[] }) => {
    const row = layoutState.rows.find(r => r.id === rowId);
    if (!row) {
      console.error('Row not found for column width update:', rowId);
      return;
    }
    
    console.log('Updating column widths:', { rowId, columnWidths: updates.columnWidths });
    
    row.blocks.forEach(block => {
      onUpdateBlock(block.id, {
        meta: {
          ...block.meta,
          layout: {
            ...block.meta?.layout,
            columnWidths: updates.columnWidths
          }
        }
      });
    });
  }, [layoutState.rows, onUpdateBlock]);
  
  const deleteBlockWithLayoutRepair = useCallback((blockId: number) => {
    console.log('Deleting block with layout repair:', blockId);
    
    const blockToDelete = blocks.find(b => b.id === blockId);
    if (!blockToDelete) {
      console.error('Block not found for deletion:', blockId);
      return;
    }
    
    const layout = blockToDelete.meta?.layout;
    
    if (layout?.row_id) {
      const row = layoutState.rows.find(r => r.id === layout.row_id);
      if (row && row.blocks.length > 1) {
        const remainingBlocks = row.blocks.filter(b => b.id !== blockId);
        
        onDeleteBlock(blockId);
        
        setTimeout(() => {
          repairLayoutMetadata(layout.row_id!, remainingBlocks);
        }, 100);
        
        return;
      }
    }
    
    onDeleteBlock(blockId);
  }, [blocks, layoutState.rows, onDeleteBlock, repairLayoutMetadata]);
  
  const getRowByBlockId = useCallback((blockId: number) => {
    return layoutState.rows.find(row => 
      row.blocks.some(block => block.id === blockId)
    ) || null;
  }, [layoutState.rows]);
  
  const isBlockInGrid = useCallback((blockId: number): boolean => {
    const block = blocks.find(b => b.id === blockId);
    if (!block?.meta?.layout) return false;
    
    const row = getRowByBlockId(blockId);
    return row ? row.columns > 1 : false;
  }, [blocks, getRowByBlockId]);
  
  return {
    layoutState,
    validateLayoutMetadata,
    repairLayoutMetadata,
    updateColumnWidths,
    deleteBlockWithLayoutRepair,
    getRowByBlockId,
    isBlockInGrid
  };
};
