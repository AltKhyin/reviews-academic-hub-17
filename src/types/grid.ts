// ABOUTME: Grid layout types with string IDs for database compatibility
export interface GridPosition {
  row: number;
  column: number;
}

export interface GridCell {
  id: string; // Cell ID should be string
  block?: { // block content is a ReviewBlock, which has string ID
    id: string;
    type: string;
    content: any;
    visible: boolean;
    meta?: any;
    sort_index: number; // Added missing sort_index
  };
  // Adding row and column here if they are direct properties of a cell in some contexts
  // However, grid_position in ReviewBlock.meta.layout is the primary way
  row?: number; 
  column?: number;
}

export interface GridRow {
  id: string;
  cells: GridCell[];
  blocks: Array<{
    id: string;
    type: string;
    content: any;
    visible: boolean;
    meta?: any;
  }>;
  columns: number;
}

export interface Grid2DLayout {
  id: string;
  rows: GridRow[];
  columns: number;
  columnWidths?: number[];
  grid_rows?: number;
  gap?: number;
  rowHeights?: number[];
}
