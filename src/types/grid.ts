
// ABOUTME: Grid layout types with string IDs and proper interface definitions
// Provides comprehensive type definitions for grid-based layout systems

export interface GridPosition {
  row: number;
  column: number;
}

export interface GridCell {
  id: string;
  row: number;
  column: number;
  position: number;
  block: {
    id: string;
    type: string;
    content: any;
    visible: boolean;
    sort_index: number;
  } | null;
}

export interface GridRow {
  id: string;
  index: number;
  cells: GridCell[];
  metadata?: {
    height?: number;
    columnWidths?: number[];
  };
}

export interface Grid2DLayout {
  id: string;
  rows: GridRow[];
  columns: number;
  gap: number;
}

export interface GridStateResult {
  grid: Grid2DLayout | null;
  rows: GridRow[];
  addBlock: (gridId: string, position: GridPosition, block: any) => void;
  removeBlock: (gridId: string, position: GridPosition) => void;
  updateGrid: (updates: Partial<Grid2DLayout>) => void;
}
