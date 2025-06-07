
-- Add backend_tags column to issues table for recommendation system
ALTER TABLE public.issues 
ADD COLUMN backend_tags text;

-- Add comment to document the purpose
COMMENT ON COLUMN public.issues.backend_tags IS 'Internal tags for recommendation algorithms - never displayed to users';
