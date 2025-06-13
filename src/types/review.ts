
// ABOUTME: Core review and block type definitions with standardized string IDs
// Updated to resolve editor component type mismatches - ENHANCED: Complete meta interface

export interface ReviewBlock {
  id: string; // Standardized to string across all components
  type: BlockType;
  content: any;
  visible: boolean;
  sort_index: number;
  meta?: {
    layout?: {
      row_id?: string;
      grid_id?: string;
      columns?: number;
      rows?: number;
      grid_rows?: number; // Added for 2D grid support
      gap?: number; // Added for grid spacing
      columnWidths?: number[];
      rowHeights?: number[]; // Added for 2D grid heights
      grid_position?: {
        row: number;
        column: number;
      };
    };
    alignment?: { // Added for block alignment
      vertical?: 'top' | 'center' | 'bottom';
      horizontal?: 'left' | 'center' | 'right';
    };
    spacing?: SpacingConfig; // Added for spacing controls
  };
}

export interface SpacingConfig {
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
  | 'divider'
  | 'list'
  | 'code'
  | 'diagram'; // Added missing diagram block type

export interface Issue {
  id: string;
  title: string;
  search_title?: string;
  cover_image_url?: string;
  specialty?: string;
  published_at?: string;
  created_at: string;
  featured?: boolean;
  published: boolean;
  score?: number;
  authors?: string;
  description?: string;
  pdf_url?: string;
  article_pdf_url?: string;
  real_title?: string;
  real_title_ptbr?: string;
  search_description?: string;
  year?: string;
  design?: string;
  population?: string;
  review_type?: string;
  edition?: string;
  review_content?: any;
  toc_data?: any;
  backend_tags?: any;
}

// Enhanced Issue interface with additional computed properties
export interface EnhancedIssue extends Issue {
  // Additional computed or enhanced fields for the viewer
  content_blocks?: ReviewBlock[];
  table_of_contents?: TableOfContents;
  interaction_data?: {
    is_bookmarked?: boolean;
    user_reaction?: string | null;
    view_count?: number;
  };
}

// Diagram system types
export interface DiagramNode {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'rect' | 'circle' | 'diamond' | 'text';
  label: string;
  color?: string;
  backgroundColor?: string;
}

export interface DiagramConnection {
  id: string;
  sourceId: string;
  targetId: string;
  type: 'arrow' | 'line' | 'dashed';
  label?: string;
  color?: string;
}

export interface DiagramContent {
  nodes: DiagramNode[];
  connections: DiagramConnection[];
  layout: {
    width: number;
    height: number;
    zoom: number;
    pan: { x: number; y: number };
  };
  template?: string;
}

// Snapshot card content type
export interface SnapshotCardContent {
  title: string;
  subtitle?: string;
  value: string | number;
  description?: string;
  trend?: {
    direction: 'up' | 'down' | 'stable';
    percentage?: number;
    period?: string;
  };
  color?: string;
  icon?: string;
}

// Table of Contents structure
export interface TableOfContents {
  sections: TOCSection[];
}

export interface TOCSection {
  id: string;
  title: string;
  level: number;
  anchor?: string;
  subsections?: TOCSection[];
}
