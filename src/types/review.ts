
// ABOUTME: Core review and block type definitions with standardized string IDs
// Updated to resolve editor component type mismatches - ENHANCED: Complete meta interface with diagram fixes

export interface ReviewBlock {
  id: string; // Standardized to string across all components
  type: BlockType;
  content: any;
  visible: boolean;
  sort_index: number;
  order?: number; // Added for compatibility
  created_at: string;
  updated_at: string;
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

// Enhanced Issue interface with additional computed properties - FIXED: No circular deps
export interface EnhancedIssue extends Issue {
  content_blocks?: ReviewBlock[];
  table_of_contents?: TableOfContents;
  interaction_data?: {
    is_bookmarked?: boolean;
    user_reaction?: string | null;
    view_count?: number;
  };
}

// Fixed Diagram system types to match actual usage
export interface DiagramNode {
  id: string;
  type: 'rectangle' | 'rounded-rect' | 'circle' | 'ellipse' | 'diamond' | 'triangle' | 'hexagon';
  position: { x: number; y: number };
  size: { width: number; height: number };
  text: string;
  style: {
    backgroundColor?: string;
    borderColor?: string;
    borderWidth?: number;
    borderRadius?: number;
    borderStyle?: 'solid' | 'dashed' | 'dotted';
    textColor?: string;
    fontSize?: number;
    fontWeight?: string;
    opacity?: number;
  };
}

export interface DiagramConnection {
  id: string;
  sourceNodeId: string; // Fixed naming
  targetNodeId: string; // Fixed naming
  sourcePoint: string;
  targetPoint: string;
  style: {
    strokeColor: string;
    strokeWidth: number;
    strokeStyle: 'solid' | 'dashed' | 'dotted';
    arrowType: 'none' | 'arrow' | 'double-arrow' | 'circle' | 'diamond';
    curved: boolean;
    opacity: number;
  };
  label?: {
    text: string;
    position: number;
    style: {
      backgroundColor: string;
      textColor: string;
      fontSize: number;
    };
  };
}

export interface DiagramContent {
  canvas: {
    width: number;
    height: number;
    backgroundColor: string;
    gridEnabled: boolean;
    gridSize: number;
    gridColor: string;
    snapToGrid: boolean;
  };
  nodes: DiagramNode[];
  connections: DiagramConnection[];
  layout?: {
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

// Layout Row Data interface
export interface LayoutRowData {
  id: string;
  blocks: ReviewBlock[];
  columns: number;
  columnWidths?: number[];
}

// Homepage section configuration interface
export interface HomepageSectionConfig {
  visible: boolean;
  order: number;
  title: string;
}

export interface HomepageSectionsConfig {
  [sectionId: string]: HomepageSectionConfig;
}
