// ABOUTME: Utilities for 2D grid layout management
// Provides functions for creating, manipulating, and validating 2D grids

import { Grid2DLayout, GridRow, GridCell, GridPosition } from '@/types/grid';
import { ReviewBlock } from '@/types/review';

/**
 * Generate unique grid ID
 */
export const generateGridId = (): string => {
  return `grid-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Generate unique row ID
 */
export const generateRowId = (gridId: string, rowIndex: number): string => {
  return `${gridId}-row-${rowIndex}`;
};

/**
 * Generate unique cell ID
 */
export const generateCellId = (gridId: string, row: number, column: number): string => {
  return `${gridId}-cell-${row}-${column}`;
};

/**
 * Create empty grid with specified dimensions
 */
export const createEmptyGrid = (
  columns: number, 
  rows: number = 1, 
  gap: number = 4
): Grid2DLayout => {
  const gridId = generateGridId();
  
  const gridRows: GridRow[] = Array.from({ length: rows }, (_, rowIndex) => ({
    id: generateRowId(gridId, rowIndex),
    columns: columns,
    cells: Array.from({ length: columns }, (_, colIndex) => ({
      id: generateCellId(gridId, rowIndex, colIndex),
      row: rowIndex,
      column: colIndex,
      block: undefined
    }))
  }));

  return {
    id: gridId,
    rows: gridRows,
    columns,
    gap,
    columnWidths: Array(columns).fill(100 / columns),
    rowHeights: Array(rows).fill(100 / rows)
  };
};

/**
 * Add row to existing grid
 */
export const addRowToGrid = (
  grid: Grid2DLayout, 
  position: 'above' | 'below', 
  targetRowIndex: number
): Grid2DLayout => {
  const newRowIndex = position === 'above' ? targetRowIndex : targetRowIndex + 1;
  
  const newRow: GridRow = {
    id: generateRowId(grid.id, newRowIndex),
    columns: grid.columns,
    cells: Array.from({ length: grid.columns }, (_, colIndex) => ({
      id: generateCellId(grid.id, newRowIndex, colIndex),
      row: newRowIndex,
      column: colIndex,
      block: undefined
    }))
  };

  const updatedRows = [...grid.rows];
  updatedRows.splice(newRowIndex, 0, newRow);
  
  // Update row indices for rows after insertion
  updatedRows.forEach((row, index) => {
    row.id = generateRowId(grid.id, index);
    row.cells.forEach((cell, colIndex) => {
      cell.row = index;
      cell.id = generateCellId(grid.id, index, colIndex);
    });
  });

  const newRowCount = updatedRows.length;
  return {
    ...grid,
    rows: updatedRows,
    rowHeights: Array(newRowCount).fill(100 / newRowCount)
  };
};

/**
 * Remove row from grid
 */
export const removeRowFromGrid = (
  grid: Grid2DLayout, 
  rowIndex: number
): Grid2DLayout => {
  if (grid.rows.length <= 1) {
    throw new Error('Cannot remove the last row from grid');
  }

  const updatedRows = grid.rows.filter((_, index) => index !== rowIndex);
  
  // Update row indices
  updatedRows.forEach((row, index) => {
    row.id = generateRowId(grid.id, index);
    row.cells.forEach((cell, colIndex) => {
      cell.row = index;
      cell.id = generateCellId(grid.id, index, colIndex);
    });
  });

  const newRowCount = updatedRows.length;
  return {
    ...grid,
    rows: updatedRows,
    rowHeights: Array(newRowCount).fill(100 / newRowCount)
  };
};

/**
 * Place block in grid cell
 */
export const placeBlockInGrid = (
  grid: Grid2DLayout,
  block: ReviewBlock,
  position: GridPosition
): Grid2DLayout => {
  const { row, column } = position;
  
  if (row >= grid.rows.length || column >= grid.columns) {
    throw new Error('Position outside grid bounds');
  }

  const updatedRows = grid.rows.map((gridRow, rowIndex) => {
    if (rowIndex !== row) return gridRow;
    
    return {
      ...gridRow,
      cells: gridRow.cells.map((cell, colIndex) => {
        if (colIndex !== column) return cell;
        
        return {
          ...cell,
          block: {
            ...block,
            meta: {
              ...block.meta,
              layout: {
                ...block.meta?.layout,
                grid_id: grid.id,
                grid_position: position,
                grid_rows: grid.rows.length,
                columns: grid.columns,
                gap: grid.gap,
                columnWidths: grid.columnWidths,
                rowHeights: grid.rowHeights
              }
            }
          }
        };
      })
    };
  });

  return {
    ...grid,
    rows: updatedRows
  };
};

/**
 * Remove block from grid
 */
export const removeBlockFromGrid = (
  grid: Grid2DLayout,
  position: GridPosition
): Grid2DLayout => {
  const { row, column } = position;
  
  const updatedRows = grid.rows.map((gridRow, rowIndex) => {
    if (rowIndex !== row) return gridRow;
    
    return {
      ...gridRow,
      cells: gridRow.cells.map((cell, colIndex) => {
        if (colIndex !== column) return cell;
        
        return {
          ...cell,
          block: undefined
        };
      })
    };
  });

  return {
    ...grid,
    rows: updatedRows
  };
};

/**
 * Get all blocks from grid in reading order
 */
export const getBlocksFromGrid = (grid: Grid2DLayout): ReviewBlock[] => {
  const blocks: ReviewBlock[] = [];
  
  grid.rows.forEach((row) => {
    row.cells.forEach((cell) => {
      if (cell.block) {
        blocks.push(cell.block);
      }
    });
  });
  
  return blocks;
};

/**
 * Find block position in grid
 */
export const findBlockInGrid = (
  grid: Grid2DLayout, 
  blockId: string
): GridPosition | null => {
  for (const row of grid.rows) {
    for (const cell of row.cells) {
      if (cell.block?.id === blockId) {
        return { row: cell.row, column: cell.column };
      }
    }
  }
  return null;
};

/**
 * Check if grid has any blocks
 */
export const gridHasBlocks = (grid: Grid2DLayout): boolean => {
  return grid.rows.some(row => 
    row.cells.some(cell => cell.block !== undefined)
  );
};

/**
 * Validate grid structure
 */
export const validateGrid = (grid: Grid2DLayout): boolean => {
  // Check row consistency
  if (grid.rows.length === 0) return false;
  
  // Check column consistency
  for (const row of grid.rows) {
    if (row.cells.length !== grid.columns) return false;
  }
  
  // Check cell positions
  for (let rowIndex = 0; rowIndex < grid.rows.length; rowIndex++) {
    const row = grid.rows[rowIndex];
    
    for (let colIndex = 0; colIndex < row.cells.length; colIndex++) {
      const cell = row.cells[colIndex];
      if (cell.row !== rowIndex || cell.column !== colIndex) return false;
    }
  }
  
  return true;
};

/**
 * Convert 1D grid to 2D grid structure
 */
export const convert1DTo2DGrid = (
  blocks: ReviewBlock[],
  columns: number,
  rowId: string
): Grid2DLayout => {
  const grid = createEmptyGrid(columns, 1);
  
  // Place existing blocks in first row
  blocks.forEach((block, index) => {
    if (index < columns) {
      const position: GridPosition = { row: 0, column: index };
      placeBlockInGrid(grid, block, position);
    }
  });
  
  return grid;
};
