
import { z } from "zod";

export const issueFormSchema = z.object({
  title: z.string().min(3, "O título deve ter pelo menos 3 caracteres"),
  description: z.string().optional(),
  tags: z.string().optional(),
  pdf_url: z.string().optional(),
  article_pdf_url: z.string().optional(),
  cover_image_url: z.string().optional(),
  published: z.boolean().default(false)
});

export type IssueFormValues = z.infer<typeof issueFormSchema>;
