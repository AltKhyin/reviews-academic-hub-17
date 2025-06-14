
-- ABOUTME: Optimized RPC function for archive page statistics and metadata
-- Consolidates multiple archive-related queries into single efficient database call

CREATE OR REPLACE FUNCTION public.get_archive_stats_optimized()
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
    'totalSpecialties', (
      SELECT COUNT(DISTINCT specialty) 
      FROM issues 
      WHERE published = true AND specialty IS NOT NULL
    ),
    'totalYears', (
      SELECT COUNT(DISTINCT year) 
      FROM issues 
      WHERE published = true AND year IS NOT NULL
    ),
    'featuredCount', (
      SELECT COUNT(*) FROM issues WHERE published = true AND featured = true
    ),
    'recentIssuesCount', (
      SELECT COUNT(*) 
      FROM issues 
      WHERE published = true 
        AND created_at > NOW() - INTERVAL '30 days'
    ),
    'specialtiesList', (
      SELECT json_agg(DISTINCT specialty ORDER BY specialty)
      FROM issues 
      WHERE published = true AND specialty IS NOT NULL
    ),
    'yearsList', (
      SELECT json_agg(DISTINCT year ORDER BY year DESC)
      FROM issues 
      WHERE published = true AND year IS NOT NULL
    ),
    'lastUpdated', NOW()
  ) INTO result;
  
  RETURN result;
END;
$$;
