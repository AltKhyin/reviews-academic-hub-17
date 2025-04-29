
-- Create payment links table
CREATE TABLE public.payment_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  amount INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  url TEXT NOT NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.payment_links ENABLE ROW LEVEL SECURITY;

-- Only admins can read payment links
CREATE POLICY "Admins can read payment links" ON public.payment_links
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE user_id = auth.uid()
  )
);

-- Only admins can insert payment links
CREATE POLICY "Admins can insert payment links" ON public.payment_links
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE user_id = auth.uid()
  )
);

-- Only admins can update payment links
CREATE POLICY "Admins can update payment links" ON public.payment_links
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE user_id = auth.uid()
  )
);

-- Only admins can delete payment links
CREATE POLICY "Admins can delete payment links" ON public.payment_links
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE user_id = auth.uid()
  )
);
