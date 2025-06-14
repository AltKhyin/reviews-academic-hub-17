
// ABOUTME: Grid state management with proper typing and complete interface implementation
import { useState, useCallback, useMemo } from 'react';
import { Grid2DLayout, GridPosition, GridStateResult, GridRow, GridCell } from '@/types/grid';
import { ReviewBlock } from '@/types/review';

export const useGridState = (initialLayout?: Grid2DLayout): GridStateResult & {
  setGrid: React.Dispatch<React.SetStateAction<Grid2DLayout | null>>;
  addRow: (gridId: string, position?: number) => void;
  removeRow: (gridId: string, rowIndex: number) => void;
  updateColumns: (gridId: string, columns: number) => void;
} => {
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

  const addRow = useCallback((gridId: string, position?: number) => {
    if (!grid || grid.id !== gridId) return;

    const newRowIndex = position ?? grid.rows.length;
    const newCells: GridCell[] = [];
    
    for (let i = 0; i < grid.columns; i++) {
      newCells.push({
        id: `cell-${newRowIndex}-${i}`,
        row: newRowIndex,
        column: i,
        position: i,
        block: null
      });
    }

    const newRow: GridRow = {
      id: `row-${newRowIndex}`,
      index: newRowIndex,
      cells: newCells
    };

    const newRows = [...grid.rows];
    newRows.splice(newRowIndex, 0, newRow);
    
    setGrid(prev => prev ? { ...prev, rows: newRows } : null);
  }, [grid]);

  const removeRow = useCallback((gridId: string, rowIndex: number) => {
    if (!grid || grid.id !== gridId) return;

    const newRows = grid.rows.filter((_, index) => index !== rowIndex);
    setGrid(prev => prev ? { ...prev, rows: newRows } : null);
  }, [grid]);

  const updateColumns = useCallback((gridId: string, columns: number) => {
    if (!grid || grid.id !== gridId) return;

    const newRows = grid.rows.map(row => {
      const newCells: GridCell[] = [];
      
      for (let i = 0; i < columns; i++) {
        if (i < row.cells.length) {
          newCells.push({
            ...row.cells[i],
            column: i,
            position: i
          });
        } else {
          newCells.push({
            id: `cell-${row.index}-${i}`,
            row: row.index,
            column: i,
            position: i,
            block: null
          });
        }
      }

      return {
        ...row,
        cells: newCells
      };
    });

    setGrid(prev => prev ? { ...prev, rows: newRows, columns } : null);
  }, [grid]);

  const rows = useMemo(() => grid?.rows || [], [grid]);

  return {
    grid,
    rows,
    addBlock,
    removeBlock,
    updateGrid,
    setGrid,
    addRow,
    removeRow,
    updateColumns
  };
};
