
// ABOUTME: Grid repair utilities with proper GridCell interface compliance
import { useCallback } from 'react';
import { Grid2DLayout, GridCell, GridRow } from '@/types/grid';
import { ReviewBlock } from '@/types/review';

export const useGridRepair = () => {
  const repairGrid = useCallback((grid: Grid2DLayout, blocks: ReviewBlock[]): Grid2DLayout => {
    const repairedRows: GridRow[] = grid.rows.map((row, rowIndex) => {
      const repairedCells: GridCell[] = row.cells.map((cell, colIndex) => ({
        id: cell.id || `cell-${rowIndex}-${colIndex}`,
        row: rowIndex,
        column: colIndex,
        position: colIndex,
        block: cell.block
      }));

      return {
        ...row,
        cells: repairedCells
      };
    });

    return {
      ...grid,
      rows: repairedRows
    };
  }, []);

  const validateGridIntegrity = useCallback((grid: Grid2DLayout, blocks: ReviewBlock[]): boolean => {
    try {
      // Check if all rows have proper cell structure
      for (const row of grid.rows) {
        for (const cell of row.cells) {
          if (!cell.id || typeof cell.row !== 'number' || typeof cell.column !== 'number') {
            return false;
          }
        }
      }
      return true;
    } catch (error) {
      console.error('Grid integrity validation failed:', error);
      return false;
    }
  }, []);

  const generateEmptyGrid = useCallback((rows: number, columns: number): Grid2DLayout => {
    const gridRows: GridRow[] = [];
    
    for (let rowIndex = 0; rowIndex < rows; rowIndex++) {
      const cells: GridCell[] = [];
      
      for (let colIndex = 0; colIndex < columns; colIndex++) {
        cells.push({
          id: `cell-${rowIndex}-${colIndex}`,
          row: rowIndex,
          column: colIndex,
          position: colIndex,
          block: null
        });
      }
      
      gridRows.push({
        id: `row-${rowIndex}`,
        index: rowIndex,
        cells
      });
    }

    return {
      id: `grid-${Date.now()}`,
      rows: gridRows,
      columns,
      gap: 16
    };
  }, []);

  return {
    repairGrid,
    validateGridIntegrity,
    generateEmptyGrid
  };
};
