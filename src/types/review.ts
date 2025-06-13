
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
  | 'diagram'
  | 'quote'
  | 'divider';

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

// Enhanced DiagramNode with all required properties
export interface DiagramNode {
  id: string;
  type: 'process' | 'decision' | 'start' | 'end' | 'data';
  label: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  // Additional properties for enhanced functionality
  position?: {
    x: number;
    y: number;
  };
  size?: {
    width: number;
    height: number;
  };
  text?: string;
  style?: {
    backgroundColor: string;
    borderColor: string;
    textColor: string;
    borderWidth: number;
    borderRadius: number;
    fontSize: number;
    fontWeight: string;
    opacity: number;
  };
}

// Enhanced DiagramConnection with all required properties
export interface DiagramConnection {
  id: string;
  from: string;
  to: string;
  label?: string;
  type?: 'straight' | 'curved';
  // Additional properties for enhanced functionality
  sourceNodeId?: string;
  targetNodeId?: string;
}

// Enhanced DiagramContent with canvas support
export interface DiagramContent {
  nodes: DiagramNode[];
  connections: DiagramConnection[];
  title?: string;
  description?: string;
  layout?: 'flowchart' | 'mindmap' | 'org-chart';
  // Canvas configuration
  canvas?: {
    width: number;
    height: number;
    backgroundColor: string;
    gridEnabled: boolean;
    gridSize: number;
    gridColor: string;
    snapToGrid: boolean;
  };
}

// Complete SnapshotCardContent with all PICOD framework properties
export interface SnapshotCardContent {
  title: string;
  subtitle?: string;
  value: string | number;
  unit?: string;
  trend?: 'up' | 'down' | 'stable' | 'neutral';
  change?: number;
  trendValue?: number;
  description?: string;
  icon?: string;
  color?: string;
  // PICOD Framework properties
  population?: string;
  intervention?: string;
  comparison?: string;
  outcome?: string;
  design?: string;
  // Evidence and recommendation properties
  evidence_level?: 'high' | 'moderate' | 'low' | 'very_low';
  recommendation_strength?: 'strong' | 'conditional' | 'expert_opinion';
  key_findings?: string[];
  // Styling properties
  background_color?: string;
  border_color?: string;
  accent_color?: string;
  text_color?: string;
}
