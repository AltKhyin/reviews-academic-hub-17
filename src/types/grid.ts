
// ABOUTME: Grid layout types with string IDs for database compatibility
export interface GridPosition {
  row: number;
  column: number;
}

export interface ReviewBlock { // Forward declaration or import from '@/types/review'
  id: string;
  type: any; // Replace 'any' with actual BlockType from review.ts
  content: any;
  sort_index: number;
  visible: boolean;
  meta?: any;
}

export interface GridCell {
  id: string; // cell's unique ID
  row: number; // row index within the grid
  column: number; // column index within the grid
  block?: ReviewBlock; // The actual block in this cell
}

export interface GridRow {
  id: string;
  cells: GridCell[];
  // blocks: Array<ReviewBlock>; // This might be redundant if GridCell.block is the source of truth
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

// Added for LayoutGrid component
export interface LayoutRowData {
  id: string;
  blocks: ReviewBlock[]; // Ensure ReviewBlock is correctly typed/imported
  columns: number;
  columnWidths?: number[];
  gap?: number;
  // Add any other properties that LayoutGrid's row objects might have
}
