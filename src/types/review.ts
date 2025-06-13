
// ABOUTME: Enhanced review types with complete 2D grid support and string ID compatibility
// Provides type safety for both 1D and 2D grid layouts

export type BlockType = 
  | 'heading'
  | 'paragraph' 
  | 'list'
  | 'quote'
  | 'code'
  | 'divider'
  | 'figure'
  | 'callout'
  | 'table'
  | 'citation_list'
  | 'poll'
  | 'reviewer_quote'
  | 'snapshot_card'
  | 'number_card';

export interface GridPosition {
  row: number;
  column: number;
}

export interface ReviewBlock {
  id: string; // Changed from number to string for database compatibility
  type: BlockType;
  content: any;
  sort_index: number;
  visible: boolean;
  issue_id?: string;
  created_at: string;
  updated_at: string;
  meta?: {
    layout?: {
      // 1D Grid (row-based) properties
      row_id?: string;
      position?: number;
      columns?: number;
      gap?: number;
      columnWidths?: number[];
      
      // 2D Grid properties
      grid_id?: string;
      grid_position?: GridPosition;
      grid_rows?: number;
      rowHeights?: number[];
    };
    alignment?: {
      horizontal?: 'left' | 'center' | 'right';
      vertical?: 'top' | 'center' | 'bottom';
    };
    spacing?: {
      margin?: number;
      padding?: number;
    };
  };
}

export interface Review {
  id: string;
  title: string;
  content: string;
  issue_id: string;
  user_id: string;
  blocks?: ReviewBlock[];
  created_at: string;
  updated_at: string;
  published: boolean;
}
