
// ABOUTME: Enhanced review types with string IDs for database compatibility and complete type definitions
export type BlockType = 
  | 'text' 
  | 'heading' 
  | 'paragraph' // Added missing type
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
  | 'figure' // Added missing type
  | 'number_card' // Added missing type
  | 'reviewer_quote' // Added missing type
  | 'citation_list' // Added missing type
  | 'snapshot_card'; // Added missing type

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
  grid_position?: number | { row: number; column: number }; // Support both formats
  row_id?: string;
  grid_rows?: number;
  gap?: number;
  rowHeights?: number[];
}

export interface AlignmentConfig {
  vertical?: 'top' | 'center' | 'bottom';
  horizontal?: 'left' | 'center' | 'right';
}

export interface ReviewBlock {
  id: string; // Consistently string for database compatibility
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
