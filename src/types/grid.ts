
// ABOUTME: Grid layout and positioning types
// Core grid system type definitions

export interface GridPosition {
  row: number;
  column: number;
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
  block: ReviewBlock;
  activeBlockId: string;
  onActiveBlockChange: (blockId: string) => void;
  onUpdateBlock: (blockId: string, updates: Partial<ReviewBlock>) => void;
  onDeleteBlock: (blockId: string) => void;
  onMoveBlock: (blockId: string, direction: 'up' | 'down') => void;
  dragState: any;
  onDragStart: (blockId: string) => void;
  onDragOver: (e: React.DragEvent, targetId: string, position?: number) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, targetId: string, position?: number) => void;
  onDragEnd: () => void;
}

// Import ReviewBlock from review types
import { ReviewBlock } from './review';
