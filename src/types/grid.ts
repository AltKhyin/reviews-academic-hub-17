
// ABOUTME: Grid position and layout type definitions
// Fixed to support string IDs consistently

export interface GridPosition {
  row: number;
  column: number;
}

export interface Grid2D {
  id: string;
  columns: number;
  rows: number;
  blocks: Array<{
    blockId: string;
    position: GridPosition;
  }>;
}
