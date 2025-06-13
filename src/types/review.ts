
// ABOUTME: Enhanced review types with proper ID handling and database compatibility
export interface ReviewBlock {
  id: string; // Changed from number to string for consistent handling
  type: string;
  content: any; // Using any for flexible content structure
  sort_index: number;
  visible: boolean;
  meta?: {
    spacing?: {
      top?: number;
      bottom?: number;
      left?: number;
      right?: number;
      margin?: {
        top?: number;
        right?: number;
        bottom?: number;
        left?: number;
      };
      padding?: {
        top?: number;
        right?: number;
        bottom?: number;
        left?: number;
      };
    };
    alignment?: {
      vertical?: 'top' | 'center' | 'bottom';
      horizontal?: 'left' | 'center' | 'right';
    };
    layout?: {
      columns?: number;
      columnWidths?: number[];
      row_id?: string;
      grid_id?: string;
      grid_position?: {
        row: number;
        column: number;
      };
      grid_rows?: number;
      gap?: number;
      rowHeights?: number[];
      position?: number; // Added missing position property
    };
  };
}

export type BlockType = 
  | 'paragraph'
  | 'heading'
  | 'figure'
  | 'table'
  | 'callout'
  | 'number_card'
  | 'reviewer_quote'
  | 'poll'
  | 'citation_list'
  | 'snapshot_card'
  | 'diagram'; // Added diagram type

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

// Add missing diagram-related types
export interface DiagramNode {
  id: string;
  type: 'process' | 'decision' | 'start' | 'end' | 'data';
  label: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
}

export interface DiagramConnection {
  id: string;
  from: string;
  to: string;
  label?: string;
  type?: 'straight' | 'curved';
}

export interface DiagramContent {
  nodes: DiagramNode[];
  connections: DiagramConnection[];
  title?: string;
  description?: string;
  layout?: 'flowchart' | 'mindmap' | 'org-chart';
}

// Add missing snapshot card content type
export interface SnapshotCardContent {
  title: string;
  value: string | number;
  unit?: string;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: number;
  description?: string;
  icon?: string;
  color?: string;
}
