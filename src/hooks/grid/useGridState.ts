
// ABOUTME: Grid state computation and management
// Handles grid row extraction and layout state calculation

import { useMemo } from 'react';
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

export const useGridState = (blocks: ReviewBlock[]): GridLayoutState => {
  return useMemo(() => {
    const rowsMap = new Map<string, GridRow>();
    const processedBlocks = new Set<number>();
    
    console.log('Computing grid layout from blocks:', blocks.length);
    
    const sortedBlocks = [...blocks].sort((a, b) => a.sort_index - b.sort_index);
    
    sortedBlocks.forEach((block) => {
      if (processedBlocks.has(block.id)) return;
      
      const layout = block.meta?.layout;
      
      if (layout?.row_id && typeof layout.row_id === 'string' && layout.columns) {
        const rowId = layout.row_id;
        
        if (!rowsMap.has(rowId)) {
          rowsMap.set(rowId, {
            id: rowId,
            blocks: [],
            columns: layout.columns,
            gap: layout.gap || 4,
            columnWidths: layout.columnWidths
          });
        }
        
        const row = rowsMap.get(rowId)!;
        row.blocks.push(block);
        processedBlocks.add(block.id);
        
        if (layout.columnWidths && layout.columnWidths.length === layout.columns) {
          row.columnWidths = layout.columnWidths;
        }
        
        if (layout.columns > row.columns) {
          row.columns = layout.columns;
        }
      } else {
        const singleRowId = `single-${block.id}`;
        rowsMap.set(singleRowId, {
          id: singleRowId,
          blocks: [block],
          columns: 1,
          gap: 4
        });
        processedBlocks.add(block.id);
      }
    });
    
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
};
