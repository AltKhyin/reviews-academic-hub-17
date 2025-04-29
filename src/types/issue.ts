
export interface Issue {
  id: string;
  title: string;
  description?: string | null;
  specialty: string;
  pdf_url: string;
  article_pdf_url?: string | null;
  cover_image_url?: string | null;
  published: boolean;
  published_at?: string | null;
  created_at: string;
  updated_at: string;
  featured: boolean | null;
  // New fields
  authors?: string | null;
  search_title?: string | null;
  real_title?: string | null;
  real_title_ptbr?: string | null;
  search_description?: string | null;
  year?: string | null;
  design?: string | null;
  score?: number | null;
  population?: string | null;
  views?: number | null; // Add view count field
}

export type FormIssueValues = {
  title: string;
  description?: string;
  tags?: string;
  pdf_url: string;
  article_pdf_url?: string;
  cover_image_url?: string;
  published?: boolean;
  // New fields
  authors?: string;
  search_title?: string;
  real_title?: string;
  real_title_ptbr?: string;
  search_description?: string;
  year?: string;
  design?: string;
  score?: number;
  population?: string;
};

export interface UserProfile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  role: 'user' | 'editor' | 'admin';
  bio?: string | null;
  specialty?: string | null;
  institution?: string | null;
}

export interface Comment {
  id: string;
  content: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  article_id?: string;
  issue_id?: string;
  post_id?: string;
  parent_id?: string;
  score: number;
  profiles?: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
  } | null;
  userVote?: 1 | -1 | 0;
  replies?: Comment[];
}

export interface CommentVote {
  user_id: string;
  comment_id: string;
  value: 1 | -1;
}

export interface ExternalLecture {
  id: string;
  title: string;
  description?: string;
  thumbnail_url: string;
  external_url: string;
  issue_id: string;
}

export type ReviewStatus = 'draft' | 'in_review' | 'approved' | 'rejected';

export interface ArticleReviewData {
  id: string;
  article_id: string;
  reviewer_id: string;
  status: ReviewStatus;
  comments: string | null;
  created_at: string;
  updated_at: string;
  reviewer?: UserProfile;
}

export interface IssueView {
  id: string;
  issue_id: string;
  user_id?: string | null;
  created_at: string;
  client_ip?: string | null;
}
