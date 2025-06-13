
# README-BÍBLIA ARCHITECTURE v1.3.0

> **SYSTEM ARCHITECTURE & DATA FLOWS** | Last Updated: 2025-06-13

---

## 3. HIGH-LEVEL ARCHITECTURE (120 lines max)

### **Frontend Architecture (React + TypeScript)**
```
src/
├── components/           # UI components organized by feature
│   ├── review/          # Native review rendering system
│   ├── archive/         # Issue browsing and search
│   ├── community/       # Posts and discussions
│   ├── performance/     # Performance monitoring components
│   └── optimization/    # Query optimization providers
├── hooks/               # Custom React hooks
│   ├── useUnifiedQuery.ts      # Enhanced query system with deduplication
│   ├── useAPIRateLimit.ts      # Rate limiting with user feedback
│   ├── usePerformanceOptimizer.ts  # Performance monitoring and optimization
│   ├── useIntelligentPrefetch.ts   # Behavior-based prefetching
│   └── useNativeReview.ts      # Review data with analytics
├── utils/               # Performance and utility functions
│   ├── commentFetch.ts         # Optimized comment fetching
│   ├── commentOrganize.ts      # Comment tree organization
│   ├── performanceHelpers.ts   # Performance profiling tools
│   └── throttle.ts            # Function throttling utilities
└── lib/                # Core application logic
    └── queryClient.ts          # Enhanced TanStack Query configuration
```

### **Database Architecture (Supabase PostgreSQL)**
```sql
-- Core Content Tables
issues              # Medical reviews (published content)
review_blocks       # Structured review components
review_analytics    # Performance and usage tracking

-- Community Tables  
posts               # User discussions
comments            # Threaded conversations
post_votes          # Community engagement

-- Performance Tables
materialized_views  # Pre-computed complex queries
indexes             # Strategic query optimization
```

### **Performance Optimization Layer**
```typescript
// Query Performance Stack
┌─────────────────────────────────────┐
│ Intelligent Prefetching             │ ← Behavior-based data loading
├─────────────────────────────────────┤
│ Unified Query System                │ ← Request deduplication + caching
├─────────────────────────────────────┤
│ Strategic Database Indexes          │ ← N+1 query elimination
├─────────────────────────────────────┤
│ Materialized Views                  │ ← Complex query pre-computation
└─────────────────────────────────────┘
```

### **Data Flow Pattern**
1. **User Request** → Rate limiting check → Query cache check
2. **Cache Miss** → Database query (optimized with indexes)
3. **Response** → Cache storage → Performance metrics recording
4. **Background** → Intelligent prefetching based on user patterns

### **Security Model**
- **Row Level Security (RLS)** on all user-related tables
- **Role-based permissions** (user, admin)
- **Rate limiting** on all API endpoints
- **Input validation** at both client and database levels

---

## 6. DATA & API SCHEMAS

### **Core Database Schema (Optimized)**
```sql
-- Issues (Medical Reviews) - Optimized with strategic indexes
issues (
  id uuid PRIMARY KEY,
  title text NOT NULL,
  published boolean DEFAULT false,
  featured boolean DEFAULT false,
  specialty text, -- Indexed for fast filtering
  year text,      -- Indexed for archive queries
  score integer,  -- Indexed for ranking
  -- Performance indexes:
  -- idx_issues_published_featured_score
  -- idx_issues_specialty_published_score
  -- idx_issues_year_published_score
)

-- Review Blocks - Native review components
review_blocks (
  id bigint PRIMARY KEY,
  issue_id uuid REFERENCES issues(id),
  type text NOT NULL,
  payload jsonb NOT NULL,
  sort_index integer NOT NULL,
  visible boolean DEFAULT true,
  -- Performance index: idx_review_blocks_issue_visible_sort
)

-- Comments - Optimized for tree operations
comments (
  id uuid PRIMARY KEY,
  user_id uuid NOT NULL,
  parent_id uuid REFERENCES comments(id),
  content text NOT NULL,
  score integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  -- Performance indexes:
  -- idx_comments_issue_id_created_at
  -- idx_comments_parent_id
  -- idx_comments_user_id_created_at
)
```

### **Performance Monitoring Schema**
```sql
-- Analytics for performance tracking
review_analytics (
  id uuid PRIMARY KEY,
  issue_id uuid,
  user_id uuid,
  event_type text NOT NULL,
  event_data jsonb,
  session_id text,
  created_at timestamptz DEFAULT now(),
  -- Performance indexes:
  -- idx_review_analytics_issue_event_created
  -- idx_review_analytics_session_created
)

-- Materialized views for complex queries
mv_published_issues_archive AS (
  SELECT id, title, specialty, year, score, created_at
  FROM issues WHERE published = true
  ORDER BY created_at DESC
)
```

### **API Performance Patterns**
```typescript
// Unified Query Pattern with Deduplication
const { data, isLoading } = useUnifiedQuery(
  ['key', params],
  queryFn,
  {
    priority: 'critical',        // Affects caching strategy
    enableMonitoring: true,      // Performance tracking
    rateLimit: {                 // Built-in rate limiting
      endpoint: 'api-name',
      maxRequests: 10,
      windowMs: 60000
    }
  }
);

// Performance-Optimized RPC Calls
const { data } = useQuery({
  queryKey: ['rpc', 'function-name'],
  queryFn: createPerformanceQueryWrapper(
    ['rpc', 'function-name'],
    () => supabase.rpc('optimized_function')
  ),
  staleTime: 10 * 60 * 1000,     // Extended cache time
  gcTime: 30 * 60 * 1000         // Memory management
});
```

