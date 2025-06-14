
// ABOUTME: Grid layout types with string IDs and proper interface definitions
// Provides comprehensive type definitions for grid-based layout systems

export interface GridPosition {
  row: number;
  column: number;
}

export interface GridCell {
  id: string;
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
  cells: GridCell[];
}

export interface Grid2DLayout {
  id: string;
  rows: GridRow[];
  columns: number;
  gap: number;
}
