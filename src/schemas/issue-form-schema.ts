
import { z } from "zod";

export const issueFormSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(3, "O título deve ter pelo menos 3 caracteres"),
  description: z.string().optional(),
  tags: z.string().optional(),
  pdf_url: z.string(),
  article_pdf_url: z.string().optional(),
  cover_image_url: z.string().optional(),
  published: z.boolean().default(false),
  featured: z.boolean().default(false)
});

export type IssueFormValues = {
  id?: string;
  title: string;
  description?: string;
  tags?: string;
  pdf_url: string;
  article_pdf_url?: string;
  cover_image_url?: string;
  published?: boolean;
  featured?: boolean;
};
