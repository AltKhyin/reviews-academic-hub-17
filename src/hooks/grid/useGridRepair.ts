
// ABOUTME: Grid repair and validation hook with string ID support
// Ensures grid data integrity and handles migration from legacy formats

import { useCallback } from 'react';
import { Grid2DLayout, GridRow, GridCell } from '@/types/grid';
import { ReviewBlock } from '@/types/review';

export const useGridRepair = () => {
  const repairGrid = useCallback((grid: Grid2DLayout, blocks: ReviewBlock[]): Grid2DLayout => {
    if (!grid || !grid.rows) {
      // Create new grid structure
      return {
        id: `grid-${Date.now()}`,
        rows: [{
          id: `row-${Date.now()}`,
          cells: Array.from({ length: 2 }, (_, index) => ({
            id: `cell-${Date.now()}-${index}`,
            position: index,
            block: null
          }))
        }],
        columns: 2,
        gap: 16
      };
    }

    // Repair existing grid
    const repairedRows: GridRow[] = grid.rows.map((row, rowIndex) => {
      // Ensure row has proper structure
      if (!row.id) {
        row.id = `row-${Date.now()}-${rowIndex}`;
      }

      if (!row.cells || !Array.isArray(row.cells)) {
        row.cells = Array.from({ length: grid.columns }, (_, index) => ({
          id: `cell-${Date.now()}-${index}`,
          position: index,
          block: null
        }));
      }

      // Repair cells
      const repairedCells: GridCell[] = row.cells.map((cell, cellIndex) => {
        if (!cell.id) {
          cell.id = `cell-${Date.now()}-${cellIndex}`;
        }

        // Ensure position is correct
        cell.position = cellIndex;

        // Validate block reference
        if (cell.block) {
          const blockExists = blocks.find(b => b.id === cell.block?.id);
          if (!blockExists) {
            cell.block = null;
          }
        }

        return cell;
      });

      // Ensure we have the right number of cells
      while (repairedCells.length < grid.columns) {
        repairedCells.push({
          id: `cell-${Date.now()}-${repairedCells.length}`,
          position: repairedCells.length,
          block: null
        });
      }

      // Remove excess cells
      repairedCells.splice(grid.columns);

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
    if (!grid || !grid.rows || !Array.isArray(grid.rows)) {
      return false;
    }

    // Check each row
    for (const row of grid.rows) {
      if (!row.id || !row.cells || !Array.isArray(row.cells)) {
        return false;
      }

      // Check cell count matches columns
      if (row.cells.length !== grid.columns) {
        return false;
      }

      // Check each cell
      for (let i = 0; i < row.cells.length; i++) {
        const cell = row.cells[i];
        if (!cell.id || cell.position !== i) {
          return false;
        }

        // Check block reference if present
        if (cell.block) {
          const blockExists = blocks.find(b => b.id === cell.block?.id);
          if (!blockExists) {
            return false;
          }
        }
      }
    }

    return true;
  }, []);

  return {
    repairGrid,
    validateGridIntegrity
  };
};
