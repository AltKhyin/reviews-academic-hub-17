
// ABOUTME: Grid 2D utilities with proper type definitions and exports
import { Grid2DLayout, GridRow, GridCell } from '@/types/grid';
import { ReviewBlock } from '@/types/review';

export interface GridBlockMeta {
  spacing?: {
    margin?: { top?: number; bottom?: number; left?: number; right?: number };
    padding?: { top?: number; bottom?: number; left?: number; right?: number };
  };
  alignment?: {
    horizontal?: 'left' | 'center' | 'right';
    vertical?: 'top' | 'center' | 'bottom';
  };
  layout?: {
    columns?: number;
    columnWidths?: number[];
    grid_id?: string;
    grid_position?: { row: number; column: number };
    row_id?: string;
    grid_rows?: number;
    gap?: number;
    rowHeights?: number[];
  };
}

export const createEmptyGrid = (rows: number, columns: number): Grid2DLayout => {
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
};

export const validateGridStructure = (grid: Grid2DLayout): boolean => {
  try {
    // Check basic structure
    if (!grid.rows || !Array.isArray(grid.rows)) return false;
    
    // Check each row
    for (const row of grid.rows) {
      if (!row.cells || !Array.isArray(row.cells)) return false;
      if (row.cells.length !== grid.columns) return false;
      
      // Check each cell
      for (const cell of row.cells) {
        if (typeof cell.row !== 'number' || typeof cell.column !== 'number') return false;
        if (!cell.id) return false;
      }
    }
    
    return true;
  } catch (error) {
    console.error('Grid validation error:', error);
    return false;
  }
};

export const serializeGridForStorage = (grid: Grid2DLayout): string => {
  try {
    return JSON.stringify(grid);
  } catch (error) {
    console.error('Grid serialization error:', error);
    return '{}';
  }
};

export const deserializeGridFromStorage = (data: string): Grid2DLayout | null => {
  try {
    const parsed = JSON.parse(data);
    return validateGridStructure(parsed) ? parsed : null;
  } catch (error) {
    console.error('Grid deserialization error:', error);
    return null;
  }
};

export const addBlockToGrid = (
  grid: Grid2DLayout,
  block: ReviewBlock,
  row: number,
  column: number
): Grid2DLayout => {
  const newGrid = { ...grid };
  
  if (newGrid.rows[row] && newGrid.rows[row].cells[column]) {
    newGrid.rows[row].cells[column] = {
      ...newGrid.rows[row].cells[column],
      block: {
        id: block.id,
        type: block.type,
        content: block.content,
        visible: block.visible,
        sort_index: block.sort_index
      }
    };
  }
  
  return newGrid;
};

export const removeBlockFromGrid = (
  grid: Grid2DLayout,
  row: number,
  column: number
): Grid2DLayout => {
  const newGrid = { ...grid };
  
  if (newGrid.rows[row] && newGrid.rows[row].cells[column]) {
    newGrid.rows[row].cells[column] = {
      ...newGrid.rows[row].cells[column],
      block: null
    };
  }
  
  return newGrid;
};
