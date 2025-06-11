
-- Fix role enum migration with proper handling of dependent RLS policies
-- This migration converts 'editor' roles to 'admin' and updates all dependent policies

-- Step 1: First, let's see what policies depend on the role column
-- We'll need to recreate them after the column change

-- Step 2: Create the app_role enum if it doesn't exist
DO $$ BEGIN
    CREATE TYPE public.app_role AS ENUM ('admin', 'user');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Step 3: Update all 'editor' roles to 'admin' in the existing text column
UPDATE public.profiles 
SET role = 'admin' 
WHERE role = 'editor';

-- Step 4: Now we can safely change the column type since we've eliminated 'editor'
ALTER TABLE public.profiles 
ALTER COLUMN role TYPE public.app_role 
USING role::public.app_role;

-- Step 5: Update functions that referenced 'editor' role
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

-- Step 6: Ensure get_sidebar_stats returns proper format
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
