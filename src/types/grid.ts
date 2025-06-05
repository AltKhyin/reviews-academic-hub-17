
// ABOUTME: Extended grid layout types for vertical functionality
// Defines data structures for 2D grid layout with rows and cells

import { ReviewBlock } from './review';

export interface GridCell {
  id: string;
  row: number;
  column: number;
  block?: ReviewBlock;
}

export interface GridRow {
  id: string;
  index: number;
  cells: GridCell[];
  height?: number; // Optional height constraint
}

export interface Grid2DLayout {
  id: string;
  rows: GridRow[];
  columns: number;
  gap: number;
  columnWidths?: number[];
  rowHeights?: number[];
}

export interface GridPosition {
  row: number;
  column: number;
}

export interface GridOperationResult {
  success: boolean;
  grid?: Grid2DLayout;
  error?: string;
}

// Helper types for grid operations
export interface GridBlockMeta {
  gridId: string;
  position: GridPosition;
  columns: number;
  rows: number;
  gap: number;
  columnWidths?: number[];
  rowHeights?: number[];
}

// Extended layout metadata for blocks
export interface ExtendedLayoutMeta {
  row_id?: string;
  position?: number;
  columns?: number;
  gap?: number;
  columnWidths?: number[];
  // New vertical properties
  grid_id?: string;
  grid_position?: GridPosition;
  grid_rows?: number;
  rowHeights?: number[];
}
