// ABOUTME: Enhanced review types with string IDs for database compatibility and complete type definitions
export type BlockType = 
  | 'text' 
  | 'heading' 
  | 'paragraph'
  | 'image' 
  | 'video' 
  | 'quote' 
  | 'list' 
  | 'code' 
  | 'table' 
  | 'divider' 
  | 'callout' 
  | 'embed' 
  | 'poll' 
  | 'chart' 
  | 'audio'
  | 'file'
  | 'gallery'
  | 'timeline'
  | 'comparison'
  | 'accordion'
  | 'tabs'
  | 'figure'
  | 'number_card'
  | 'reviewer_quote'
  | 'citation_list'
  | 'snapshot_card'
  | 'diagram';

export interface BlockSpacing {
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

export interface SpacingConfig {
  top?: number;
  bottom?: number;
  left?: number;
  right?: number;
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

export interface LayoutConfig {
  columns?: number;
  columnWidths?: number[];
  grid_id?: string;
  grid_position?: { row: number; column: number };
  row_id?: string;
  grid_rows?: number;
  gap?: number;
  rowHeights?: number[];
  position?: number;
}

export interface AlignmentConfig {
  vertical?: 'top' | 'center' | 'bottom';
  horizontal?: 'left' | 'center' | 'right';
}

export interface ReviewBlock {
  id: string;
  type: BlockType;
  content: any;
  sort_index: number;
  visible: boolean;
  meta?: {
    spacing?: SpacingConfig;
    alignment?: AlignmentConfig;
    layout?: LayoutConfig;
  };
}

// Enhanced diagram types with complete interface definitions
export interface DiagramNode {
  id: string;
  type: 'rectangle' | 'rounded-rect' | 'circle' | 'ellipse' | 'diamond' | 'triangle' | 'hexagon';
  position: { x: number; y: number };
  size: { width: number; height: number };
  text: string;
  style: {
    backgroundColor: string;
    borderColor: string;
    textColor: string;
    borderWidth: number;
    borderStyle: 'solid' | 'dashed' | 'dotted';
    fontSize: number;
    fontWeight: 'normal' | 'bold';
    textAlign: 'left' | 'center' | 'right';
    opacity: number;
    borderRadius?: number;
  };
}

export interface DiagramConnection {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
  sourcePoint: 'top' | 'right' | 'bottom' | 'left';
  targetPoint: 'top' | 'right' | 'bottom' | 'left';
  label?: {
    text: string;
    position: number;
    style: {
      backgroundColor: string;
      textColor: string;
      fontSize: number;
    };
  };
  style: {
    strokeColor: string;
    strokeWidth: number;
    strokeStyle: 'solid' | 'dashed' | 'dotted';
    arrowType: 'none' | 'arrow' | 'diamond' | 'double-arrow' | 'circle';
    curved: boolean;
    opacity: number;
  };
}

export interface DiagramCanvas {
  width: number;
  height: number;
  backgroundColor: string;
  gridEnabled: boolean;
  gridSize: number;
  gridColor: string;
  snapToGrid: boolean;
}

export interface DiagramContent {
  title: string;
  description?: string;
  canvas: DiagramCanvas;
  nodes: DiagramNode[];
  connections: DiagramConnection[];
  template?: string;
  exportSettings?: {
    format: 'svg' | 'png' | 'jpg';
    quality: number;
    transparentBackground: boolean;
  };
  accessibility?: {
    altText: string;
    longDescription: string;
  };
}

// Enhanced snapshot card content with complete interface
export interface SnapshotCardContent {
  title: string;
  subtitle?: string;
  description?: string;
  value?: string;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon?: string;
  imageUrl?: string;
  metrics?: Array<{
    label: string;
    value: string | number;
    unit?: string;
  }>;
  timestamp?: string;
  source?: string;
  evidence_level?: 'high' | 'moderate' | 'low' | 'very_low';
  recommendation_strength?: 'strong' | 'conditional' | 'expert_opinion';
  population?: string;
  intervention?: string;
  comparison?: string;
  outcome?: string;
  design?: string;
  key_findings?: string[];
}

export interface EnhancedIssue {
  id: string;
  title: string;
  description?: string;
  authors?: string;
  specialty: string;
  year?: number;
  population?: string;
  review_type: 'native' | 'pdf' | 'mixed';
  article_pdf_url?: string;
  pdf_url?: string;
}
