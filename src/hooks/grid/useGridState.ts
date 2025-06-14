
// ABOUTME: Grid state management with proper typing and integration
import { useState, useCallback, useMemo } from 'react';
import { Grid2DLayout, GridPosition, GridStateResult } from '@/types/grid';
import { ReviewBlock } from '@/types/review';

export const useGridState = (initialLayout?: Grid2DLayout): GridStateResult => {
  const [grid, setGrid] = useState<Grid2DLayout | null>(initialLayout || null);

  const addBlock = useCallback((gridId: string, position: GridPosition, block: ReviewBlock) => {
    if (!grid || grid.id !== gridId) return;
    
    const newRows = [...grid.rows];
    const row = newRows[position.row];
    
    if (row && row.cells[position.column]) {
      row.cells[position.column] = {
        ...row.cells[position.column],
        block: {
          id: block.id,
          type: block.type,
          content: block.content,
          visible: block.visible,
          sort_index: block.sort_index
        }
      };
      
      setGrid(prev => prev ? { ...prev, rows: newRows } : null);
    }
  }, [grid]);

  const removeBlock = useCallback((gridId: string, position: GridPosition) => {
    if (!grid || grid.id !== gridId) return;
    
    const newRows = [...grid.rows];
    const row = newRows[position.row];
    
    if (row && row.cells[position.column]) {
      row.cells[position.column] = {
        ...row.cells[position.column],
        block: null
      };
      
      setGrid(prev => prev ? { ...prev, rows: newRows } : null);
    }
  }, [grid]);

  const updateGrid = useCallback((updates: Partial<Grid2DLayout>) => {
    setGrid(prev => prev ? { ...prev, ...updates } : null);
  }, []);

  const rows = useMemo(() => grid?.rows || [], [grid]);

  return {
    grid,
    rows,
    addBlock,
    removeBlock,
    updateGrid
  };
};
