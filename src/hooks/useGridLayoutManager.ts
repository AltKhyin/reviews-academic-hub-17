// ABOUTME: Unified grid layout management system with proper synchronization
// Handles grid creation, modification, block operations, and metadata consistency

import { useCallback, useMemo } from 'react';
import { ReviewBlock } from '@/types/review';

interface GridRow {
  id: string;
  blocks: ReviewBlock[];
  columns: number;
  gap: number;
  columnWidths?: number[];
}

interface GridLayoutState {
  rows: GridRow[];
  totalBlocks: number;
}

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
  
  // COMPLETELY FIXED: Layout state computation that properly handles grids
  const layoutState: GridLayoutState = useMemo(() => {
    const rowsMap = new Map<string, GridRow>();
    const processedBlocks = new Set<number>();
    
    console.log('Computing grid layout from blocks:', blocks.length);
    
    // Sort blocks by sort_index to maintain order
    const sortedBlocks = [...blocks].sort((a, b) => a.sort_index - b.sort_index);
    
    sortedBlocks.forEach((block) => {
      if (processedBlocks.has(block.id)) return;
      
      const layout = block.meta?.layout;
      
      if (layout?.row_id && typeof layout.row_id === 'string' && layout.columns) {
        // FIXED: Block belongs to a grid row (has layout metadata)
        const rowId = layout.row_id;
        
        if (!rowsMap.has(rowId)) {
          rowsMap.set(rowId, {
            id: rowId,
            blocks: [],
            columns: layout.columns, // Use the block's columns setting
            gap: layout.gap || 4,
            columnWidths: layout.columnWidths
          });
        }
        
        const row = rowsMap.get(rowId)!;
        row.blocks.push(block);
        processedBlocks.add(block.id);
        
        // Update row metadata from latest block
        if (layout.columnWidths && layout.columnWidths.length === layout.columns) {
          row.columnWidths = layout.columnWidths;
        }
        
        // Ensure row columns matches the blocks' column setting
        if (layout.columns > row.columns) {
          row.columns = layout.columns;
        }
      } else {
        // FIXED: Single block row (no grid layout)
        const singleRowId = `single-${block.id}`;
        rowsMap.set(singleRowId, {
          id: singleRowId,
          blocks: [block],
          columns: 1, // Single blocks are always 1 column
          gap: 4
        });
        processedBlocks.add(block.id);
      }
    });
    
    // Convert to array and sort by minimum sort_index
    const rows = Array.from(rowsMap.values())
      .filter(row => row.blocks.length > 0)
      .map(row => ({
        ...row,
        blocks: row.blocks.sort((a, b) => {
          const aPos = a.meta?.layout?.position ?? 0;
          const bPos = b.meta?.layout?.position ?? 0;
          return aPos - bPos;
        })
      }))
      .sort((a, b) => {
        const aMinSort = Math.min(...a.blocks.map(b => b.sort_index));
        const bMinSort = Math.min(...b.blocks.map(b => b.sort_index));
        return aMinSort - bMinSort;
      });
    
    const totalBlocks = rows.reduce((sum, row) => sum + row.blocks.length, 0);
    
    console.log('Grid layout computed:', {
      totalRows: rows.length,
      gridRows: rows.filter(r => r.columns > 1).length,
      singleRows: rows.filter(r => r.columns === 1).length,
      totalBlocks,
      originalBlocks: blocks.length,
      rows: rows.map(r => ({ id: r.id, columns: r.columns, blocksCount: r.blocks.length }))
    });
    
    return { rows, totalBlocks };
  }, [blocks]);
  
  // Validate layout metadata consistency
  const validateLayoutMetadata = useCallback((block: ReviewBlock): boolean => {
    const layout = block.meta?.layout;
    if (!layout) return true; // Single blocks are valid
    
    const isValid = !!(layout.row_id && 
                      typeof layout.position === 'number' && 
                      typeof layout.columns === 'number' && 
                      layout.columns > 0);
    
    if (!isValid) {
      console.warn('Invalid layout metadata detected:', { blockId: block.id, layout });
    }
    
    return isValid;
  }, []);
  
  // Repair layout metadata for corrupted blocks
  const repairLayoutMetadata = useCallback((rowId: string, blocks: ReviewBlock[]) => {
    console.log('Repairing layout metadata for row:', rowId);
    
    blocks.forEach((block, index) => {
      const currentLayout = block.meta?.layout;
      const expectedLayout = {
        row_id: rowId,
        position: index,
        columns: blocks.length,
        gap: currentLayout?.gap || 4,
        columnWidths: currentLayout?.columnWidths
      };
      
      if (!currentLayout || 
          currentLayout.row_id !== expectedLayout.row_id ||
          currentLayout.position !== expectedLayout.position ||
          currentLayout.columns !== expectedLayout.columns) {
        
        console.log('Updating block layout metadata:', { 
          blockId: block.id, 
          oldLayout: currentLayout, 
          newLayout: expectedLayout 
        });
        
        onUpdateBlock(block.id, {
          meta: {
            ...block.meta,
            layout: expectedLayout
          }
        });
      }
    });
  }, [onUpdateBlock]);
  
  // Update column widths for a specific row - FIXED SIGNATURE
  const updateColumnWidths = useCallback((rowId: string, updates: { columnWidths: number[] }) => {
    const row = layoutState.rows.find(r => r.id === rowId);
    if (!row) {
      console.error('Row not found for column width update:', rowId);
      return;
    }
    
    console.log('Updating column widths:', { rowId, columnWidths: updates.columnWidths });
    
    // Update all blocks in the row with new column widths
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
  
  // Delete block with grid-aware logic
  const deleteBlockWithLayoutRepair = useCallback((blockId: number) => {
    console.log('Deleting block with layout repair:', blockId);
    
    const blockToDelete = blocks.find(b => b.id === blockId);
    if (!blockToDelete) {
      console.error('Block not found for deletion:', blockId);
      return;
    }
    
    const layout = blockToDelete.meta?.layout;
    
    if (layout?.row_id) {
      // Block is part of a grid row
      const row = layoutState.rows.find(r => r.id === layout.row_id);
      if (row && row.blocks.length > 1) {
        // Multiple blocks in row - repair remaining blocks
        const remainingBlocks = row.blocks.filter(b => b.id !== blockId);
        
        // Delete the block first
        onDeleteBlock(blockId);
        
        // Then repair the layout metadata for remaining blocks
        setTimeout(() => {
          repairLayoutMetadata(layout.row_id!, remainingBlocks);
        }, 100);
        
        return;
      }
    }
    
    // Single block or last block in grid - just delete normally
    onDeleteBlock(blockId);
  }, [blocks, layoutState.rows, onDeleteBlock, repairLayoutMetadata]);
  
  // Get row by block ID
  const getRowByBlockId = useCallback((blockId: number): GridRow | null => {
    return layoutState.rows.find(row => 
      row.blocks.some(block => block.id === blockId)
    ) || null;
  }, [layoutState.rows]);
  
  // FIXED: Check if block is in a grid (has layout and columns > 1)
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
