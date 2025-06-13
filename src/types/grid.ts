
// ABOUTME: Grid position and layout type definitions
// Fixed to support string IDs consistently - ENHANCED: Complete grid interfaces

export interface GridPosition {
  row: number;
  column: number;
}

export interface GridCell {
  id: string;
  block?: ReviewBlock;
  position: GridPosition;
}

export interface GridRow {
  id: string;
  cells: GridCell[];
  blocks: ReviewBlock[];
  columns: number;
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

export interface Grid2DLayout {
  id: string;
  columns: number;
  rows: GridRow[]; // Changed from number to GridRow[] to match usage
  gap: number;
  columnWidths?: number[];
  rowHeights?: number[];
  blocks: Array<{
    block: ReviewBlock;
    position: GridPosition;
  }>;
}

// Import ReviewBlock type for circular dependency resolution
import type { ReviewBlock } from './review';
