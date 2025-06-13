// ABOUTME: Enhanced review and block types with improved diagram support
// Fixed diagram interfaces and added missing properties

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
  | 'chart';

export interface ReviewBlock {
  id: string;
  type: BlockType;
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
    };
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
  textAlign?: 'left' | 'center' | 'right'; // Added textAlign property
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
  sourceNodeId: string; // Fixed property name
  targetNodeId: string; // Fixed property name
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
  title?: string; // Added missing title property
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
