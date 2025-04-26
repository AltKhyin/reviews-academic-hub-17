
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
}

export interface FormIssueValues {
  title: string;
  description?: string;
  tags?: string;
  pdf_url?: string;
  article_pdf_url?: string;
  cover_image_url?: string;
  published?: boolean;
}

export interface Article {
  id: string;
  title: string;
  content: string;
  summary?: string | null;
  author_id: string;
  image_url?: string | null;
  published: boolean;
  published_at?: string | null;
  created_at: string;
  updated_at: string;
  profiles?: {
    id: string;
    full_name?: string | null;
    avatar_url?: string | null;
    created_at: string;
    updated_at: string;
  };
  pdf_url?: string;
  article_pdf_url?: string;
}
