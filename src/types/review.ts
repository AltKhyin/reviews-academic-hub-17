
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
    };
    alignment?: {
      vertical?: 'top' | 'center' | 'bottom';
      horizontal?: 'left' | 'center' | 'right';
    };
    layout?: {
      columns?: number;
      columnWidths?: number[];
    };
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
