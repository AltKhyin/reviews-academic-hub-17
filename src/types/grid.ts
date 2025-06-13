
// ABOUTME: Grid layout and positioning types
// Enhanced with proper GridRow interface including blocks - UPDATED: Added readonly property to Grid2DCellProps

export interface GridPosition {
  row: number;
  column: number;
}

export interface GridCell {
  id: string;
  block?: ReviewBlock | null;
  position?: GridPosition;
}

export interface GridRow {
  id: string;
  cells: GridCell[];
  blocks: ReviewBlock[];
}

export interface Grid2DLayout {
  id: string;
  columns: number;
  rows: GridRow[];
  gap?: number;
  columnWidths?: number[];
  rowHeights?: number[];
}

export interface LayoutRowProps {
  row: LayoutRowData;
  onUpdateRow: (rowId: string, updates: Partial<LayoutRowData>) => void;
  onDeleteRow: (rowId: string) => void;
  onAddBlock: (rowId: string, position: number, blockType: string) => void;
  onUpdateBlock: (blockId: string, updates: Partial<ReviewBlock>) => void;
  onMoveBlock: (blockId: string, direction: 'up' | 'down') => void;
  onDeleteBlock: (blockId: string) => void;
  readonly?: boolean;
}

export interface LayoutRowData {
  id: string;
  blocks: ReviewBlock[];
  columns: number;
  columnWidths?: number[];
}

export interface Grid2DCellProps {
  gridId: string;
  position: GridPosition;
  block: ReviewBlock | null;
  activeBlockId?: string | null;
  onActiveBlockChange?: (blockId: string | null) => void;
  onUpdateBlock: (blockId: string, updates: Partial<ReviewBlock>) => void;
  onDeleteBlock: (blockId: string) => void;
  onAddBlock?: (gridId: string, position: GridPosition) => void;
  dragState?: any;
  onDragStart?: (blockId: string) => void;
  onDragOver?: (e: React.DragEvent, targetId: string, position?: number) => void;
  onDragLeave?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent, targetId: string, position?: number) => void;
  onDragEnd?: () => void;
  readonly?: boolean;
}

// Import ReviewBlock from review types
import { ReviewBlock } from './review';
