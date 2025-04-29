
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
}

export type FormIssueValues = {
  title: string;
  description?: string;
  tags?: string;
  pdf_url: string;
  article_pdf_url?: string;
  cover_image_url?: string;
  published?: boolean;
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
  score: number;
  parent_id?: string | null;
  profiles?: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
  };
  replies?: Comment[];
  userVote?: 1 | -1 | 0;
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
