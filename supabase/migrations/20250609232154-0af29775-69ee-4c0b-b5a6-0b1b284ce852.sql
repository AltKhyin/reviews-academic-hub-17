
-- Materialized Views Infrastructure for Performance Optimization

-- 1. Create materialized view for published issues archive
CREATE MATERIALIZED VIEW mv_published_issues_archive AS
SELECT 
  id, title, cover_image_url, specialty, authors, year, 
  published_at, score, description, featured, created_at
FROM issues 
WHERE published = true
ORDER BY created_at DESC;

-- Add indexes for performance
CREATE UNIQUE INDEX ON mv_published_issues_archive (id);
CREATE INDEX ON mv_published_issues_archive (specialty, year, score DESC);
CREATE INDEX ON mv_published_issues_archive (featured, created_at DESC);

-- 2. Create materialized view for community stats
CREATE MATERIALIZED VIEW mv_community_stats AS
SELECT 
  (SELECT COUNT(*) FROM profiles) as total_users,
  (SELECT COUNT(*) FROM posts WHERE published = true) as total_posts,
  (SELECT COUNT(*) FROM comments) as total_comments,
  (SELECT COUNT(*) FROM issues WHERE published = true) as total_issues,
  (SELECT COUNT(*) FROM online_users WHERE last_active > NOW() - INTERVAL '15 minutes') as online_users,
  NOW() as last_updated;

-- 3. Function to create materialized views if they don't exist
CREATE OR REPLACE FUNCTION create_materialized_view_if_not_exists()
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  -- Check and create mv_published_issues_archive if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_matviews WHERE matviewname = 'mv_published_issues_archive'
  ) THEN
    EXECUTE '
      CREATE MATERIALIZED VIEW mv_published_issues_archive AS
      SELECT id, title, cover_image_url, specialty, authors, year, 
             published_at, score, description, featured, created_at
      FROM issues WHERE published = true ORDER BY created_at DESC
    ';
    
    EXECUTE 'CREATE UNIQUE INDEX ON mv_published_issues_archive (id)';
    EXECUTE 'CREATE INDEX ON mv_published_issues_archive (specialty, year, score DESC)';
  END IF;

  -- Check and create mv_community_stats if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_matviews WHERE matviewname = 'mv_community_stats'
  ) THEN
    EXECUTE '
      CREATE MATERIALIZED VIEW mv_community_stats AS
      SELECT 
        (SELECT COUNT(*) FROM profiles) as total_users,
        (SELECT COUNT(*) FROM posts WHERE published = true) as total_posts,
        (SELECT COUNT(*) FROM comments) as total_comments,
        (SELECT COUNT(*) FROM issues WHERE published = true) as total_issues,
        (SELECT COUNT(*) FROM online_users WHERE last_active > NOW() - INTERVAL ''15 minutes'') as online_users,
        NOW() as last_updated
    ';
  END IF;
END;
$$;

-- 4. Function to refresh materialized views
CREATE OR REPLACE FUNCTION refresh_materialized_views()
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_published_issues_archive;
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_community_stats;
END;
$$;

-- 5. Function to get materialized view health
CREATE OR REPLACE FUNCTION get_materialized_view_health()
RETURNS TABLE(
  view_name text,
  size text,
  last_refresh timestamp with time zone,
  is_stale boolean
) LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
  SELECT 
    mv.matviewname::text as view_name,
    pg_size_pretty(pg_total_relation_size(mv.oid))::text as size,
    COALESCE(
      (SELECT last_refresh FROM pg_stat_user_tables WHERE relname = mv.matviewname),
      NOW() - INTERVAL '1 hour'
    ) as last_refresh,
    (COALESCE(
      (SELECT last_refresh FROM pg_stat_user_tables WHERE relname = mv.matviewname),
      NOW() - INTERVAL '1 hour'
    ) < NOW() - INTERVAL '5 minutes') as is_stale
  FROM pg_matviews mv
  WHERE mv.schemaname = 'public';
END;
$$;

-- 6. Initialize materialized views
SELECT create_materialized_view_if_not_exists();
