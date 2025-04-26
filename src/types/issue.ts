
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

export type FormIssueValues = {
  title: string;
  description?: string;
  tags?: string;
  pdf_url?: string;
  article_pdf_url?: string;
  cover_image_url?: string;
  published?: boolean;
};
