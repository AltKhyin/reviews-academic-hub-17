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
  | 'diagram'
  | 'layout_grid' // Added
  | 'grid_2d';    // Added

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
  content: any; // Content can be specific for each block type
  sort_index: number;
  visible: boolean;
  meta?: {
    spacing?: SpacingConfig;
    alignment?: AlignmentConfig;
    layout?: LayoutConfig;
  };
}

export interface DiagramNodeData {
  label: string;
  type: 'rectangle' | 'circle' | 'diamond'; // Original node type for rendering shape/style
  color?: string;
  width?: number;
  height?: number;
  // Add any other custom properties your nodes might need
  [key: string]: any; // To satisfy Record<string, unknown> and allow extensibility
}

export interface DiagramNode { // This is the structure stored in ReviewBlock.content.nodes
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  // The 'data' field will hold specific attributes for rendering and logic.
  data: DiagramNodeData;
}

export interface DiagramEdgeData {
    label?: string;
    // Add any other custom data for edges
    [key: string]: any;
}

export interface DiagramEdge {
  id: string;
  source: string; // node id
  target: string; // node id
  label?: string; // Kept for direct use, but also in data for react-flow
  type: 'straight' | 'curved' | 'step' | 'floating'; 
  style?: any;
  data?: DiagramEdgeData; // For edge labels with FloatingEdge or other custom edge data
}

export interface DiagramContent {
  nodes: Array<DiagramNode>; 
  edges: Array<DiagramEdge>;
  title?: string;
  description?: string;
  canvas?: {
    backgroundColor?: string;
    gridSize?: number;
    zoom?: number;
    offsetX?: number;
    offsetY?: number;
  };
}

export interface SnapshotCardContent {
  title: string;
  description?: string;
  imageUrl?: string;
  metrics?: Array<{
    label: string;
    value: string | number;
    unit?: string;
  }>;
  timestamp?: string;
  source?: string;
  // Added missing properties based on SnapshotCard.tsx errors
  subtitle?: string;
  value?: string | number; // Can be string or number
  change?: string | number; // Can be string or number
  trend?: 'up' | 'down' | 'neutral' | string; // More flexible trend
  icon?: string; // e.g., name of a lucide icon
  evidence_level?: 'high' | 'moderate' | 'low' | 'very_low' | string;
  recommendation_strength?: 'strong' | 'conditional' | 'expert_opinion' | string;
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
