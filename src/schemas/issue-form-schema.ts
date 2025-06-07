
import { z } from "zod";

export const issueFormSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1, "O título é obrigatório"),
  description: z.string().optional(),
  tags: z.string().optional(),
  pdf_url: z.string().optional(),
  article_pdf_url: z.string().optional(),
  cover_image_url: z.string().optional(),
  published: z.boolean().default(false),
  featured: z.boolean().default(false),
  // Search engine optimization fields
  authors: z.string().optional(),
  search_title: z.string().optional(),
  real_title: z.string().optional(),
  real_title_ptbr: z.string().optional(),
  search_description: z.string().optional(),
  year: z.string().optional(), 
  design: z.string().optional(),
  score: z.number().optional().default(0),
  population: z.string().optional(),
  // Backend-only fields for recommendation system
  backend_tags: z.string().optional() // Will store JSON string
});

export type IssueFormValues = {
  id?: string;
  title: string;
  description?: string;
  tags?: string;
  pdf_url?: string;
  article_pdf_url?: string;
  cover_image_url?: string;
  published?: boolean;
  featured?: boolean;
  authors?: string;
  search_title?: string;
  real_title?: string;
  real_title_ptbr?: string;
  search_description?: string;
  year?: string;
  design?: string;
  score?: number;
  population?: string;
  backend_tags?: string; // JSON string for hierarchical tags
};
