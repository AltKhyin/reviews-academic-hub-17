
// ABOUTME: Database optimization utilities and query performance helpers
export const DatabaseOptimizations = {
  // Optimized query builders for common patterns
  buildOptimizedIssuesQuery: (filters: {
    published?: boolean;
    featured?: boolean;
    limit?: number;
    offset?: number;
    includeContent?: boolean;
  } = {}) => {
    const {
      published = true,
      featured,
      limit,
      offset,
      includeContent = false
    } = filters;

    // Minimal field selection for performance
    const baseFields = 'id, title, cover_image_url, specialty, published_at, created_at, featured, published, score';
    const contentFields = 'description, authors, search_title, search_description, year, design';
    
    const selectFields = includeContent ? `${baseFields}, ${contentFields}` : baseFields;
    
    return {
      select: selectFields,
      filters: {
        ...(published !== undefined && { published }),
        ...(featured !== undefined && { featured }),
      },
      orderBy: { column: 'created_at', ascending: false },
      ...(limit && { limit }),
      ...(offset && { offset }),
    };
  },

  // Optimized profile query builder
  buildOptimizedProfileQuery: (userId: string, includeStats = false) => {
    const baseFields = 'id, full_name, avatar_url, role, specialty, bio, institution';
    const statsFields = ''; // Would include computed stats if needed
    
    return {
      select: includeStats ? `${baseFields}, ${statsFields}` : baseFields,
      filters: { id: userId },
      single: true,
    };
  },

  // Query performance helpers
  getQueryComplexityScore: (queryKey: unknown[]): number => {
    let score = 1;
    
    // Add complexity for each filter
    const keyString = JSON.stringify(queryKey);
    if (keyString.includes('filter')) score += 1;
    if (keyString.includes('search')) score += 2;
    if (keyString.includes('aggregate')) score += 3;
    if (keyString.includes('join')) score += 2;
    
    return score;
  },

  // Recommended cache times based on data volatility
  getCacheTimeRecommendation: (dataType: string): { staleTime: number; gcTime: number } => {
    const cacheStrategies = {
      // Static content - cache aggressively
      'issues': { staleTime: 15 * 60 * 1000, gcTime: 60 * 60 * 1000 },
      'profiles': { staleTime: 10 * 60 * 1000, gcTime: 30 * 60 * 1000 },
      
      // Semi-static content
      'sidebar-stats': { staleTime: 5 * 60 * 1000, gcTime: 20 * 60 * 1000 },
      'archive-data': { staleTime: 20 * 60 * 1000, gcTime: 60 * 60 * 1000 },
      
      // Dynamic content - cache moderately
      'comments': { staleTime: 2 * 60 * 1000, gcTime: 10 * 60 * 1000 },
      'posts': { staleTime: 3 * 60 * 1000, gcTime: 15 * 60 * 1000 },
      
      // Real-time content - minimal caching
      'online-users': { staleTime: 30 * 1000, gcTime: 2 * 60 * 1000 },
      'notifications': { staleTime: 1 * 60 * 1000, gcTime: 5 * 60 * 1000 },
      
      // Default fallback
      'default': { staleTime: 5 * 60 * 1000, gcTime: 15 * 60 * 1000 },
    };
    
    return cacheStrategies[dataType] || cacheStrategies.default;
  },

  // Database connection optimization suggestions
  getConnectionOptimizations: () => ({
    // Supabase connection pool recommendations
    poolSize: {
      development: 5,
      staging: 10,
      production: 20,
    },
    
    // Query timeout recommendations
    timeouts: {
      simple: 5000, // 5 seconds
      complex: 15000, // 15 seconds
      analytics: 30000, // 30 seconds
    },
    
    // Batch operation recommendations
    batchSizes: {
      inserts: 100,
      updates: 50,
      deletes: 25,
    },
  }),

  // Performance monitoring query templates
  getPerformanceQueries: () => ({
    // Query to identify slow queries (would need database-side logging)
    slowQueries: `
      SELECT query, calls, total_time, mean_time, max_time
      FROM pg_stat_statements
      WHERE mean_time > 1000
      ORDER BY mean_time DESC
      LIMIT 10;
    `,
    
    // Query to check index usage
    indexUsage: `
      SELECT schemaname, tablename, indexname, idx_tup_read, idx_tup_fetch
      FROM pg_stat_user_indexes
      WHERE idx_tup_read > 0
      ORDER BY idx_tup_read DESC;
    `,
    
    // Query to check table sizes
    tableSizes: `
      SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
      FROM pg_tables
      WHERE schemaname = 'public'
      ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
    `,
  }),

  // Optimized view creation helpers
  createOptimizedOnlineUsersView: () => {
    // Since user_sessions doesn't exist, create a simple fallback
    // This will be a placeholder that can be enhanced when user sessions are implemented
    return `
      CREATE OR REPLACE VIEW public.online_users AS
      SELECT 
        p.id,
        p.full_name,
        p.avatar_url,
        NOW() as last_active,
        'session-' || p.id::text as session_id
      FROM profiles p
      WHERE p.id IS NOT NULL
      LIMIT 10; -- Limit for performance
    `;
  },
};

// Export utility functions
export const createOptimizedQuery = DatabaseOptimizations.buildOptimizedIssuesQuery;
export const getRecommendedCacheTime = DatabaseOptimizations.getCacheTimeRecommendation;
export const getQueryComplexity = DatabaseOptimizations.getQueryComplexityScore;

