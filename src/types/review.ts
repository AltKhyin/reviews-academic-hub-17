
// ABOUTME: Core review and block type definitions with standardized string IDs
// Updated to resolve editor component type mismatches

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
      columnWidths?: number[];
      grid_position?: {
        row: number;
        column: number;
      };
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
  | 'snapshot_card';

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
