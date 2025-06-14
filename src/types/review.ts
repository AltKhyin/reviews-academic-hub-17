
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

// Added missing content type interfaces
export interface DiagramContent {
  nodes: Array<{
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
    label: string;
    type: 'rectangle' | 'circle' | 'diamond';
    color?: string;
  }>;
  edges: Array<{
    id: string;
    source: string;
    target: string;
    label?: string;
    type: 'straight' | 'curved';
  }>;
  title?: string;
  description?: string;
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
