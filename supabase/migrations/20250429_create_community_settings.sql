
-- Create the community_settings table
CREATE TABLE IF NOT EXISTS public.community_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  header_image_url TEXT,
  theme_color TEXT,
  description TEXT,
  allow_polls BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add RLS policies
ALTER TABLE public.community_settings ENABLE ROW LEVEL SECURITY;

-- Everyone can view community settings
CREATE POLICY "Everyone can view community settings"
  ON public.community_settings
  FOR SELECT
  USING (TRUE);

-- Only administrators can update community settings
CREATE POLICY "Administrators can update community settings"
  ON public.community_settings
  FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE user_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE user_id = auth.uid()
  ));

-- Only administrators can insert community settings
CREATE POLICY "Administrators can insert community settings"
  ON public.community_settings
  FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE user_id = auth.uid()
  ));

-- Create an index for faster lookups
CREATE INDEX idx_community_settings_id ON public.community_settings(id);

-- Insert default settings if not exist
INSERT INTO public.community_settings (header_image_url, theme_color, description, allow_polls)
VALUES (
  'https://images.unsplash.com/photo-1618044733300-9472054094ee?q=80&w=2942&auto=format&fit=crop',
  '#1e40af',
  'Comunidade científica para discussão de evidências médicas',
  TRUE
)
ON CONFLICT DO NOTHING;
