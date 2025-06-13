
// ABOUTME: Grid state management hook for 1D grid layouts
// Manages grid row state and provides computed properties for layout

import { useMemo } from 'react';
import { ReviewBlock } from '@/types/review';
import { GridRow } from '@/types/grid';

export const useGridState = (blocks: ReviewBlock[]) => {
  const rows = useMemo(() => {
    const rowMap = new Map<string, GridRow>();
    
    blocks.forEach(block => {
      const rowId = block.meta?.layout?.row_id;
      if (rowId) {
        if (!rowMap.has(rowId)) {
          rowMap.set(rowId, {
            id: rowId,
            cells: [],
            blocks: [],
            columns: block.meta?.layout?.columns || 1
          });
        }
        
        const row = rowMap.get(rowId)!;
        row.blocks.push(block);
        row.columns = Math.max(row.columns, block.meta?.layout?.columns || 1);
      }
    });
    
    return Array.from(rowMap.values()).sort((a, b) => {
      const aMinSort = Math.min(...a.blocks.map(block => block.sort_index));
      const bMinSort = Math.min(...b.blocks.map(block => block.sort_index));
      return aMinSort - bMinSort;
    });
  }, [blocks]);

  return {
    rows,
    totalRows: rows.length,
    totalBlocks: rows.reduce((sum, row) => sum + row.blocks.length, 0)
  };
};
