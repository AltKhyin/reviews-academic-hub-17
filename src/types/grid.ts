
// ABOUTME: Grid layout types with string IDs for database compatibility
export interface GridPosition {
  row: number;
  column: number;
}

export interface GridCell {
  id: string;
  block?: {
    id: string;
    type: string;
    content: any;
    visible: boolean;
    meta?: any;
  };
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
