
// ABOUTME: Enhanced review and block types with improved diagram support
// Fixed diagram interfaces and added missing properties - UPDATED: Added missing content property and block types

export type BlockType = 
  | 'paragraph' 
  | 'heading' 
  | 'list' 
  | 'quote' 
  | 'code' 
  | 'image' 
  | 'video' 
  | 'audio' 
  | 'table' 
  | 'separator'
  | 'callout'
  | 'diagram'
  | 'poll'
  | 'chart'
  | 'figure'
  | 'number_card'
  | 'citation_list'
  | 'snapshot_card'
  | 'reviewer_quote'
  | 'divider';

export interface SpacingConfig {
  margin?: {
    top?: number;
    bottom?: number;
    left?: number;
    right?: number;
  };
  padding?: {
    top?: number;
    bottom?: number;
    left?: number;
    right?: number;
  };
}

export interface ReviewBlock {
  id: string;
  type: BlockType;
  content: any; // Added missing content property
  payload: any;
  sort_index: number;
  visible?: boolean;
  meta?: {
    layout?: {
      row_id?: string;
      position?: number;
      columns?: number;
      columnWidths?: number[];
      gap?: number;
      grid_id?: string;
      grid_position?: {
        row: number;
        column: number;
      };
      grid_rows?: number; // Added missing grid_rows
      rowHeights?: number[]; // Added missing rowHeights
    };
    alignment?: {
      vertical?: 'top' | 'center' | 'bottom'; // Added missing alignment
    };
    spacing?: SpacingConfig; // Added missing spacing
  };
}

export interface DiagramNodeStyle {
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
  borderRadius?: number;
  borderStyle?: 'solid' | 'dashed' | 'dotted';
  textColor?: string;
  fontSize?: number;
  fontWeight?: string;
  textAlign?: 'left' | 'center' | 'right';
  opacity?: number;
}

export interface DiagramNode {
  id: string;
  type: 'rectangle' | 'rounded-rect' | 'circle' | 'ellipse' | 'diamond' | 'triangle' | 'hexagon';
  position: { x: number; y: number };
  size: { width: number; height: number };
  text: string;
  style: DiagramNodeStyle;
}

export interface DiagramConnection {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
  sourcePoint: string;
  targetPoint: string;
  style: {
    strokeColor: string;
    strokeWidth: number;
    strokeStyle: 'solid' | 'dashed' | 'dotted';
    opacity: number;
  };
}

export interface DiagramContent {
  title?: string;
  nodes: DiagramNode[];
  connections: DiagramConnection[];
  canvas: {
    width: number;
    height: number;
    backgroundColor: string;
    gridEnabled: boolean;
    gridSize: number;
    gridColor: string;
    snapToGrid: boolean;
  };
}
