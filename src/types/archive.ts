
// Types for the archive page and tag management system
export interface TagConfiguration {
  id: string;
  tag_data: TagHierarchy;
  created_at: string;
  updated_at: string;
  created_by: string;
  is_active: boolean;
  version: number;
}

export interface TagHierarchy {
  [category: string]: string[];
}

export interface ArchiveIssue {
  id: string;
  title: string;
  authors?: string;
  description?: string;
  specialty: string; // User-facing tags
  backend_tags?: string; // JSON string of TagHierarchy
  published_at: string;
  created_at: string;
  score?: number;
  cover_image_url?: string;
  pdf_url: string;
  year?: string;
  design?: string;
  population?: string;
  search_title?: string;
  search_description?: string;
  featured?: boolean;
}

export interface TagFilterState {
  selectedTags: string[];
  searchQuery: string;
  sortMode: 'relevance' | 'tag_match';
  contextualTags: string[];
}

export interface ArchivePageProps {
  issues: ArchiveIssue[];
  tagConfig: TagHierarchy;
  isLoading: boolean;
}

export interface IssueCardProps {
  issue: ArchiveIssue;
  onClick: (issueId: string) => void;
  tagMatches?: number;
}
