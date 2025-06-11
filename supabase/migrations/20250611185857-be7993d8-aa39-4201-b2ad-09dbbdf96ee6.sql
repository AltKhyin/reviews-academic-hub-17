
-- Step 1: Optimize RLS policies with auth.uid() wrapped in subqueries for better performance
-- This addresses the auth_rls_initplan performance issue identified in the diagnostic

-- Profiles table policies optimization
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
FOR SELECT USING (id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
FOR UPDATE USING (id = (SELECT auth.uid()));

-- Admin users table policies optimization
DROP POLICY IF EXISTS "Admin users can view all" ON public.admin_users;
CREATE POLICY "Admin users can view all" ON public.admin_users
FOR SELECT USING (user_id = (SELECT auth.uid()) OR public.is_current_user_admin());

-- Articles table policies optimization
DROP POLICY IF EXISTS "Authors can view their articles" ON public.articles;
CREATE POLICY "Authors can view their articles" ON public.articles
FOR SELECT USING (author_id = (SELECT auth.uid()) OR published = true OR public.is_current_user_admin());

DROP POLICY IF EXISTS "Authors can update their articles" ON public.articles;
CREATE POLICY "Authors can update their articles" ON public.articles
FOR UPDATE USING (author_id = (SELECT auth.uid()) OR public.is_current_user_admin());

DROP POLICY IF EXISTS "Authors can delete their articles" ON public.articles;
CREATE POLICY "Authors can delete their articles" ON public.articles
FOR DELETE USING (author_id = (SELECT auth.uid()) OR public.is_current_user_admin());

-- Comments table policies optimization
DROP POLICY IF EXISTS "Users can view comments" ON public.comments;
CREATE POLICY "Users can view comments" ON public.comments
FOR SELECT USING (true); -- Comments are generally public

DROP POLICY IF EXISTS "Users can create comments" ON public.comments;
CREATE POLICY "Users can create comments" ON public.comments
FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can update own comments" ON public.comments;
CREATE POLICY "Users can update own comments" ON public.comments
FOR UPDATE USING (user_id = (SELECT auth.uid()) OR public.is_current_user_admin());

DROP POLICY IF EXISTS "Users can delete own comments" ON public.comments;
CREATE POLICY "Users can delete own comments" ON public.comments
FOR DELETE USING (user_id = (SELECT auth.uid()) OR public.is_current_user_admin());

-- Posts table policies optimization
DROP POLICY IF EXISTS "Users can view published posts" ON public.posts;
CREATE POLICY "Users can view published posts" ON public.posts
FOR SELECT USING (published = true OR user_id = (SELECT auth.uid()) OR public.is_current_user_admin());

DROP POLICY IF EXISTS "Users can create posts" ON public.posts;
CREATE POLICY "Users can create posts" ON public.posts
FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can update own posts" ON public.posts;
CREATE POLICY "Users can update own posts" ON public.posts
FOR UPDATE USING (user_id = (SELECT auth.uid()) OR public.is_current_user_admin());

DROP POLICY IF EXISTS "Users can delete own posts" ON public.posts;
CREATE POLICY "Users can delete own posts" ON public.posts
FOR DELETE USING (user_id = (SELECT auth.uid()) OR public.is_current_user_admin());

-- User votes policies optimization
DROP POLICY IF EXISTS "Users can view votes" ON public.post_votes;
CREATE POLICY "Users can view votes" ON public.post_votes
FOR SELECT USING (user_id = (SELECT auth.uid()) OR public.is_current_user_admin());

DROP POLICY IF EXISTS "Users can create votes" ON public.post_votes;
CREATE POLICY "Users can create votes" ON public.post_votes
FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can update own votes" ON public.post_votes;
CREATE POLICY "Users can update own votes" ON public.post_votes
FOR UPDATE USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can delete own votes" ON public.post_votes;
CREATE POLICY "Users can delete own votes" ON public.post_votes
FOR DELETE USING (user_id = (SELECT auth.uid()));

-- Comment votes policies optimization
DROP POLICY IF EXISTS "Users can view comment votes" ON public.comment_votes;
CREATE POLICY "Users can view comment votes" ON public.comment_votes
FOR SELECT USING (user_id = (SELECT auth.uid()) OR public.is_current_user_admin());

DROP POLICY IF EXISTS "Users can create comment votes" ON public.comment_votes;
CREATE POLICY "Users can create comment votes" ON public.comment_votes
FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can update own comment votes" ON public.comment_votes;
CREATE POLICY "Users can update own comment votes" ON public.comment_votes
FOR UPDATE USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can delete own comment votes" ON public.comment_votes;
CREATE POLICY "Users can delete own comment votes" ON public.comment_votes
FOR DELETE USING (user_id = (SELECT auth.uid()));

-- Step 2: Create missing foreign key indexes to improve JOIN performance
-- Using regular CREATE INDEX instead of CONCURRENTLY to avoid transaction block issues

CREATE INDEX IF NOT EXISTS idx_articles_author_id 
ON public.articles(author_id);

CREATE INDEX IF NOT EXISTS idx_posts_user_id 
ON public.posts(user_id);

CREATE INDEX IF NOT EXISTS idx_posts_flair_id 
ON public.posts(flair_id);

CREATE INDEX IF NOT EXISTS idx_comments_user_id 
ON public.comments(user_id);

CREATE INDEX IF NOT EXISTS idx_comments_parent_id 
ON public.comments(parent_id);

CREATE INDEX IF NOT EXISTS idx_comments_post_id 
ON public.comments(post_id);

CREATE INDEX IF NOT EXISTS idx_comments_issue_id 
ON public.comments(issue_id);

CREATE INDEX IF NOT EXISTS idx_comment_reports_reporter_id 
ON public.comment_reports(reporter_id);

CREATE INDEX IF NOT EXISTS idx_comment_reports_comment_id 
ON public.comment_reports(comment_id);

CREATE INDEX IF NOT EXISTS idx_post_votes_user_id 
ON public.post_votes(user_id);

CREATE INDEX IF NOT EXISTS idx_post_votes_post_id 
ON public.post_votes(post_id);

CREATE INDEX IF NOT EXISTS idx_comment_votes_user_id 
ON public.comment_votes(user_id);

CREATE INDEX IF NOT EXISTS idx_comment_votes_comment_id 
ON public.comment_votes(comment_id);

CREATE INDEX IF NOT EXISTS idx_user_bookmarks_user_id 
ON public.user_bookmarks(user_id);

CREATE INDEX IF NOT EXISTS idx_user_bookmarks_article_id 
ON public.user_bookmarks(article_id);

CREATE INDEX IF NOT EXISTS idx_user_bookmarks_issue_id 
ON public.user_bookmarks(issue_id);

CREATE INDEX IF NOT EXISTS idx_user_article_reactions_user_id 
ON public.user_article_reactions(user_id);

CREATE INDEX IF NOT EXISTS idx_user_article_reactions_article_id 
ON public.user_article_reactions(article_id);

CREATE INDEX IF NOT EXISTS idx_user_article_reactions_issue_id 
ON public.user_article_reactions(issue_id);

CREATE INDEX IF NOT EXISTS idx_review_blocks_issue_id 
ON public.review_blocks(issue_id);

CREATE INDEX IF NOT EXISTS idx_review_polls_issue_id 
ON public.review_polls(issue_id);

CREATE INDEX IF NOT EXISTS idx_review_polls_block_id 
ON public.review_polls(block_id);

-- Step 3: Security hardening for database functions
-- Fix functions with mutable search paths

ALTER FUNCTION public.get_sidebar_stats() SET search_path = public, extensions;
ALTER FUNCTION public.get_optimized_issues(integer, integer, text, boolean, boolean) SET search_path = public, extensions;
ALTER FUNCTION public.get_featured_issue() SET search_path = public, extensions;
ALTER FUNCTION public.get_review_with_blocks(uuid) SET search_path = public, extensions;
ALTER FUNCTION public.get_query_performance_stats() SET search_path = public, extensions;
ALTER FUNCTION public.get_issues_batch(uuid[]) SET search_path = public, extensions;
ALTER FUNCTION public.get_popular_issues(integer, integer) SET search_path = public, extensions;
ALTER FUNCTION public.get_top_threads(integer) SET search_path = public, extensions;
ALTER FUNCTION public.get_home_settings() SET search_path = public, extensions;

-- Step 4: Remove unused indexes to improve write performance
-- Based on the diagnostic report, these indexes have zero scans

DROP INDEX IF EXISTS public.idx_issues_backend_tags_gin;
DROP INDEX IF EXISTS public.idx_issues_specialty_published_score;
DROP INDEX IF EXISTS public.idx_profiles_updated_at;
