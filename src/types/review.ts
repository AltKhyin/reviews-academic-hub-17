
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
  | 'diagram'; // Added missing diagram type

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
  grid_position?: { row: number; column: number }; // Standardized to object format only
  row_id?: string;
  grid_rows?: number;
  gap?: number;
  rowHeights?: number[];
  position?: number; // Added for backward compatibility
}

export interface AlignmentConfig {
  vertical?: 'top' | 'center' | 'bottom';
  horizontal?: 'left' | 'center' | 'right';
}

export interface ReviewBlock {
  id: string; // Ensure IDs are strings
  type: BlockType;
  content: any; // Kept as any for flexibility, specific blocks will cast
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
  type: 'rectangle' | 'circle' | 'diamond';
  color?: string;
  style?: {
    backgroundColor?: string;
    borderColor?: string;
    textColor?: string;
    borderWidth?: number;
    fontSize?: number;
    fontFamily?: string;
    textAlign?: 'left' | 'center' | 'right'; // More specific
    opacity?: number;
  };
  position?: { x: number; y: number };
  size?: { width: number; height: number };
  text?: string;
}

export interface DiagramEdge {
  id: string;
  source: string; // Node ID
  target: string; // Node ID
  label?: string;
  type: 'straight' | 'curved'; // Simplified, actual lib would have more
  style?: {
    strokeColor?: string;
    strokeWidth?: number;
    arrowhead?: 'default' | 'none'; // Simplified
  };
}

export interface DiagramContent {
  nodes: DiagramNode[];
  edges: DiagramEdge[]; // Changed from connections to edges
  title?: string;
  description?: string;
  canvas?: { // Added canvas based on usage in DiagramBlock
    backgroundColor?: string;
    gridSize?: number;
    zoomLevel?: number;
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
  subtitle?: string;
  value?: string | number;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon?: string; // Icon name or URL from a library like lucide-react
  evidence_level?: string;
  recommendation_strength?: string;
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

