
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
  id: string; // Already string, good.
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

export interface DiagramNode {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  type: 'rectangle' | 'circle' | 'diamond'; // Keep this consistent
  color?: string;
  // Ensure any other properties used by DiagramBlock for nodes are here
}

export interface DiagramEdge { // Renamed from 'connections' if it serves the same purpose
  id: string;
  source: string; // node id
  target: string; // node id
  label?: string;
  type: 'straight' | 'curved' | 'step'; // Example types
  style?: any;
}

export interface DiagramContent {
  nodes: Array<DiagramNode>;
  edges: Array<DiagramEdge>; // Changed from connections if appropriate
  title?: string;
  description?: string;
  canvas?: {
    backgroundColor?: string;
    gridSize?: number;
    zoom?: number;
    offsetX?: number;
    offsetY?: number;
  };
  // If 'connections' is a separate concept from 'edges', define it here.
  // For now, assuming errors pointed to 'edges' being referred to as 'connections'.
  // If DiagramBlock truly uses a separate `connections` array with a different structure, add it here.
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
