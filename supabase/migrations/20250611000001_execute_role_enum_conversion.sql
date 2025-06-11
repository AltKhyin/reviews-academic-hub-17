
-- Execute the role enum conversion with proper handling of dependent policies
-- This migration converts 'editor' roles to 'admin' and updates all dependent functions

-- Step 1: Create the app_role enum if it doesn't exist
DO $$ BEGIN
    CREATE TYPE public.app_role AS ENUM ('admin', 'user');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Step 2: Update all 'editor' roles to 'admin' in the existing text column
UPDATE public.profiles 
SET role = 'admin' 
WHERE role = 'editor';

-- Step 3: Now we can safely change the column type since we've eliminated 'editor'
ALTER TABLE public.profiles 
ALTER COLUMN role TYPE public.app_role 
USING role::public.app_role;

-- Step 4: Update functions that referenced 'editor' role
CREATE OR REPLACE FUNCTION public.is_current_user_editor_or_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_editor()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- Step 5: Ensure get_sidebar_stats returns proper format
CREATE OR REPLACE FUNCTION public.get_sidebar_stats()
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
AS $$
DECLARE
  result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'totalUsers', COALESCE((SELECT COUNT(*)::integer FROM profiles), 0),
    'onlineUsers', COALESCE((SELECT COUNT(*)::integer FROM online_users WHERE last_active > NOW() - INTERVAL '15 minutes'), 0),
    'totalIssues', COALESCE((SELECT COUNT(*)::integer FROM issues WHERE published = true), 0),
    'totalPosts', COALESCE((SELECT COUNT(*)::integer FROM posts WHERE published = true), 0),
    'totalComments', COALESCE((SELECT COUNT(*)::integer FROM comments), 0)
  ) INTO result;
  
  RETURN result;
END;
$$;
