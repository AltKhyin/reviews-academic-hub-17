
export interface ArticleData {
  id: string;
  title: string;
  author: string;
  journal: string;
  year: string;
  abstract?: string;
  reviewDate: string;
  reviewedBy: string;
  reviewContent: string;
  pdf_url?: string;
  article_pdf_url?: string;
}
