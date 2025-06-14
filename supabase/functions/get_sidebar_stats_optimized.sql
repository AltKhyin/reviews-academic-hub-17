
-- ABOUTME: Optimized RPC function that consolidates all sidebar statistics into single database call
-- Replaces multiple individual queries with efficient JOIN operations

CREATE OR REPLACE FUNCTION public.get_sidebar_stats_optimized()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'totalPublishedIssues', (
      SELECT COUNT(*) FROM issues WHERE published = true
    ),
    'totalActiveUsers', (
      SELECT COUNT(DISTINCT user_id) 
      FROM posts 
      WHERE created_at > NOW() - INTERVAL '30 days'
    ),
    'totalCommunityPosts', (
      SELECT COUNT(*) FROM posts WHERE published = true
    ),
    'featuredIssueId', (
      SELECT id FROM issues 
      WHERE published = true AND featured = true 
      ORDER BY score DESC 
      LIMIT 1
    )
  ) INTO result;
  
  RETURN result;
END;
$$;
