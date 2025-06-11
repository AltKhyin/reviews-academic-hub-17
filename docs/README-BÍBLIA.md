
# Scientific Review Platform - README-BÍBLIA
# Version 3.2.0 · 2025-01-11

## 1. Purpose & Pitch (≤30 lines)
Scientific Review Platform is a comprehensive application for managing and reviewing academic content with community features. The platform enables users to view, comment on, and interact with scientific articles and reviews while providing administrative tools for content management.

**Core Value Proposition:**
- Advanced article review system with native and PDF viewing modes
- Community-driven discussions and voting mechanisms  
- Administrative content management interface
- Performance-optimized database layer with RLS security
- Real-time analytics and performance monitoring

**Current Phase:** Database Performance Optimization & Architecture Refinement

## 2. Glossary (60 lines)
| Term | Definition |
|------|------------|
| **Issue** | A scientific article/paper entry in the database with associated review content |
| **Review Blocks** | Modular content components that make up a native review (text, images, polls, etc.) |
| **RLS** | Row-Level Security - PostgreSQL security policies controlling data access |
| **Native Review** | Custom-formatted review content using our block system vs PDF viewing |
| **Enhanced Article Viewer** | Main component for displaying articles with multiple view modes |
| **Performance Optimizer** | System for monitoring and optimizing database/frontend performance |
| **TanStack Query** | React query library used for data fetching and caching |
| **Supabase RPC** | Remote procedure calls to custom database functions |
| **Auth Context** | React context managing user authentication and permissions |
| **Query Keys** | Centralized factory for TanStack Query cache keys |
| **Optimistic Updates** | UI updates before server confirmation for better UX |
| **Code Splitting** | Breaking JavaScript bundles into smaller chunks for faster loading |

## 3. High-Level Architecture (120 lines)
```
┌─────────────────────────────────────────────────────────────────┐
│                     FRONTEND LAYER                             │
├─────────────────────────────────────────────────────────────────┤
│ React Router → App.tsx → Layout → Page Components              │
│                                                                 │
│ Key Components:                                                 │
│ • DashboardLayout (Shell)                                      │
│ • EnhancedArticleViewer (Article display)                      │
│ • Edit (Admin panel with 7 tabs)                              │
│ • Dashboard (Homepage with dynamic sections)                   │
│                                                                 │
│ State Management:                                               │
│ • AuthContext (User authentication & permissions)              │
│ • TanStack Query (Data fetching & caching)                    │
│ • Zustand (Real-time sidebar data)                            │
│                                                                 │
│ Performance Systems:                                            │
│ • useOptimizedQuery (Request deduplication & caching)         │
│ • usePerformanceMonitoring (Real-time metrics)                │
│ • useRPCPerformanceMonitoring (Database call tracking)        │
├─────────────────────────────────────────────────────────────────┤
│                     API/BACKEND LAYER                          │
├─────────────────────────────────────────────────────────────────┤
│ Supabase Client → RLS Policies → Custom Functions             │
│                                                                 │
│ Key RPC Functions:                                              │
│ • get_optimized_issues() - Main issue fetching                │
│ • get_review_with_blocks() - Native review content            │
│ • get_sidebar_stats() - Community statistics                  │
│ • get_query_performance_stats() - Performance monitoring      │
│                                                                 │
│ Security Layer:                                                 │
│ • Row-Level Security (RLS) policies on all tables            │
│ • Role-based access control (admin, user)                     │
│ • Function-level security with SECURITY DEFINER              │
├─────────────────────────────────────────────────────────────────┤
│                     DATABASE LAYER                             │
├─────────────────────────────────────────────────────────────────┤
│ PostgreSQL + Supabase Extensions                               │
│                                                                 │
│ Core Tables:                                                    │
│ • issues (articles/papers)                                     │
│ • review_blocks (native review content)                       │
│ • profiles (user data)                                         │
│ • posts/comments (community features)                         │
│ • review_analytics (performance tracking)                     │
│                                                                 │
│ Performance Features:                                           │
│ • Materialized views for expensive queries                    │
│ • Optimized indexes on foreign keys                           │
│ • Custom aggregation functions                                 │
│ • Query performance monitoring                                 │
└─────────────────────────────────────────────────────────────────┘
```

## 4. User Journeys (150 lines)
### Primary User Flow: Article Reading
```
1. User visits homepage (/)
   → Dashboard component loads
   → useParallelDataLoader fetches multiple data sources
   → Dynamic section rendering based on configuration

2. User clicks article
   → Navigate to /article/:id
   → EnhancedArticleViewer loads
   → Fetch issue data + review blocks
   → Display with view mode controls (native/pdf/dual)

3. User interacts with content
   → Reading mode controls (normal/browser-fullscreen/system-fullscreen)
   → Analytics tracking via review_analytics table
   → Comment system with voting
```

### Admin User Flow: Content Management
```
1. Admin access check
   → AuthContext validates admin role
   → Navigate to /edit
   → 7-tab admin interface loads

2. Content management
   → Issue creation/editing via IssueEditor
   → Review block management
   → User management panel
   → Analytics dashboard

3. Real-time updates
   → Optimistic UI updates
   → Database synchronization
   → Performance monitoring
```

### Performance-Critical Paths:
- Homepage loading: Multiple parallel queries with aggressive caching
- Article viewing: Single RPC call with joined data
- Admin operations: Optimistic updates with rollback mechanisms

## 5. Domain Modules Index (∞)
### Authentication & Authorization (`/src/hooks/`)
- `AuthContext.tsx` - User authentication state management
- Role-based access control with admin/user distinction
- Integrated with Supabase auth system

### Data Fetching & Performance (`/src/hooks/`)
- `useOptimizedQuery.ts` - Central query optimization with deduplication
- `usePerformanceMonitoring.ts` - Real-time performance metrics
- `useRPCPerformanceMonitoring.ts` - Database call performance tracking
- `usePerformanceOptimizer.ts` - Automated performance optimization

### Article Management (`/src/pages/dashboard/`)
- `EnhancedArticleViewer.tsx` - Main article display component
- `ArticleViewer.tsx` - Standard article viewer
- Multiple view modes: native review, PDF, dual-pane
- Reading mode controls with fullscreen support

### Admin Interface (`/src/pages/dashboard/`)
- `Edit.tsx` - Main admin panel with 7 specialized tabs
- `IssueEditor.tsx` - Article creation and editing
- Comprehensive content management tools

### Community Features (`/src/components/`)
- Post/comment system with voting mechanisms
- Real-time user activity tracking
- Community statistics and analytics

## 6. Data & API Schemas (∞)
### Core Database Tables
```sql
-- Issues (Articles/Papers)
issues: {
  id: uuid,
  title: text,
  description: text,
  authors: text, -- NOTE: Schema flaw, should be FK to profiles
  specialty: text,
  published: boolean,
  featured: boolean,
  score: integer,
  article_pdf_url: text,
  review_content: jsonb
}

-- Review Blocks (Native Review Content)
review_blocks: {
  id: bigint,
  issue_id: uuid,
  type: text,
  payload: jsonb,
  sort_index: integer,
  visible: boolean
}

-- User Profiles
profiles: {
  id: uuid,
  full_name: text,
  avatar_url: text,
  role: text, -- 'admin' | 'user'
  specialty: text,
  bio: text,
  institution: text
}
```

### Key RPC Functions
```sql
-- Optimized issue fetching with caching
get_optimized_issues(p_limit, p_offset, p_specialty, p_featured_only, p_include_unpublished)
→ Returns paginated issues with performance optimization

-- Review content with blocks
get_review_with_blocks(review_id)
→ Returns issue with associated review blocks and polls

-- Performance monitoring
get_query_performance_stats()
→ Returns database performance metrics for monitoring
```

## 7. UI Component Index (∞)
### Layout Components
- `DashboardLayout.tsx` - Main application shell
- `Sidebar.tsx` - Navigation and real-time stats
- `UnifiedViewerControls.tsx` - Article viewer controls

### Article Components
- `EnhancedArticleViewer.tsx` - Main article display
- `BlockRenderer.tsx` - Review block rendering
- `ArticleActions.tsx` - Article interaction controls
- `FloatingViewerControls.tsx` - Overlay controls

### Admin Components
- `Edit.tsx` - Main admin interface
- `HomepageManager.tsx` - Homepage configuration
- `IssuesManagementPanel.tsx` - Issue management
- `EnhancedAnalyticsDashboard.tsx` - Performance analytics

### Performance Components
- `PageLoader.tsx` - Loading states for code-split routes
- `DataErrorBoundary.tsx` - Error handling for data fetching
- `QueryOptimizationProvider.tsx` - Performance wrapper

## 8. Design Language (120 lines)
### Visual Design System
- **Color Scheme:** Dark theme with blue accents (#3b82f6)
- **Background:** Dark grays (#121212, #1a1a1a, #2a2a2a)
- **Text:** White primary (#ffffff), light gray secondary (#d1d5db)
- **Components:** Shadcn/ui with custom dark theme adaptations

### Typography
- **Headers:** Bold sans-serif, size scaling for hierarchy
- **Body:** Regular sans-serif for readability
- **Code:** Monospace for technical content

### Interactive Elements
- **Buttons:** Consistent hover states and loading indicators
- **Navigation:** Clear active states and smooth transitions
- **Forms:** Proper validation states and error handling

### Layout Principles
- **Responsive:** Mobile-first approach with breakpoint optimization
- **Grid:** Flexible layouts adapting to content
- **Spacing:** Consistent padding/margins using Tailwind scale
- **Focus:** Clear keyboard navigation and accessibility

### Component States
- **Loading:** Skeleton states and spinners
- **Error:** Clear error messages with retry options
- **Empty:** Helpful empty states with action suggestions

## 9. Accessibility Contract (100 lines)
### Keyboard Navigation
- All interactive elements accessible via keyboard
- Proper focus management in modals and overlays
- Tab order follows logical content flow

### Screen Reader Support
- Semantic HTML structure with proper headings
- ARIA labels for complex components
- Alt text for all meaningful images

### Visual Accessibility
- High contrast ratios meeting WCAG standards
- Scalable text supporting zoom up to 200%
- Clear visual focus indicators

### Motor Accessibility
- Large touch targets (minimum 44px)
- Generous spacing between interactive elements
- Forgiving click/tap areas

## 10. Performance Budgets (80 lines)
### Frontend Performance Targets
- **Initial Bundle:** <500KB gzipped
- **Route Chunks:** <200KB gzipped per route
- **Time to Interactive:** <3 seconds on 3G
- **Core Web Vitals:** LCP <2.5s, FID <100ms, CLS <0.1

### Database Performance Targets
- **Query Response:** P95 <500ms for standard queries
- **RLS Policy Evaluation:** <50ms per policy
- **Index Usage:** >90% index scans vs table scans
- **Connection Pool:** <80% utilization under normal load

### API Performance Targets
- **Response Time:** P95 <1 second
- **Error Rate:** <1% under normal conditions
- **Throughput:** Support 1000+ concurrent users
- **Cache Hit Rate:** >80% for cached queries

## 11. Security & Compliance (100 lines)
### Authentication & Authorization
- **User Authentication:** Supabase Auth with secure session management
- **Role-Based Access:** Admin/user roles with proper permission checks
- **Row-Level Security:** Comprehensive RLS policies on all user-facing tables
- **API Security:** Rate limiting and input validation

### Data Protection
- **Data Encryption:** At rest and in transit
- **Personal Data:** Minimal collection with user consent
- **Data Retention:** Automated cleanup of expired sessions
- **Backup Strategy:** Regular automated backups with testing

### Security Monitoring
- **Performance Monitoring:** Real-time database and application metrics
- **Error Tracking:** Comprehensive error logging and alerting
- **Audit Trails:** User action logging for administrative functions
- **Vulnerability Scanning:** Regular dependency and code security checks

## 12. Admin & Ops (120 lines)
### Database Operations
- **Migration Strategy:** Version-controlled schema changes
- **Performance Monitoring:** Real-time query performance tracking
- **Index Management:** Automated index usage analysis
- **Backup & Recovery:** Automated daily backups with point-in-time recovery

### Application Monitoring
- **Performance Metrics:** Real-time frontend and backend monitoring
- **Error Tracking:** Comprehensive error collection and analysis
- **User Analytics:** Usage patterns and performance impact analysis
- **Alerting:** Automated alerts for performance degradation

### Deployment
- **Environment Management:** Development, staging, production
- **CI/CD Pipeline:** Automated testing and deployment
- **Feature Flags:** Gradual rollout of new features
- **Rollback Strategy:** Quick rollback procedures for issues

## 13. Analytics & KPIs (120 lines)
### Performance KPIs
- **Database Performance:** Query execution times, connection pool usage
- **Frontend Performance:** Bundle sizes, loading times, user experience metrics
- **API Performance:** Response times, error rates, throughput

### User Engagement KPIs
- **Content Consumption:** Article views, reading completion rates
- **Community Engagement:** Comments, votes, user-generated content
- **Admin Efficiency:** Content management workflow metrics

### Business KPIs
- **User Growth:** New registrations, active users, retention rates
- **Content Quality:** User feedback, content rating distributions
- **System Health:** Uptime, error rates, performance stability

## 14. TODO / Backlog (live)
### High Priority (Performance Optimization Phase)
- [ ] Complete RLS policy optimization for all flagged policies
- [ ] Implement missing foreign key indexes
- [ ] Execute schema normalization for issues.authors field
- [ ] Implement route-based code splitting
- [ ] Optimize frontend API client singleton pattern

### Medium Priority
- [ ] Enhanced error boundary implementation
- [ ] Comprehensive test coverage for critical paths
- [ ] Advanced caching strategies for static content
- [ ] Mobile responsiveness improvements

### Low Priority  
- [ ] Advanced analytics dashboard features
- [ ] Real-time collaboration features
- [ ] Advanced search and filtering capabilities
- [ ] Integration with external academic databases

## 15. Revision History (live)
| Version | Date | Changes | Author |
|---------|------|---------|---------|
| 3.2.0 | 2025-01-11 | Added performance optimization implementation phase documentation | System |
| 3.1.0 | 2025-01-09 | Enhanced architecture documentation, added performance monitoring systems | System |
| 3.0.0 | 2025-01-07 | Complete architectural documentation rewrite with current codebase analysis | System |
| 2.0.0 | 2025-01-05 | Major update with database schema and performance analysis | System |
| 1.0.0 | 2025-01-01 | Initial documentation framework | System |

---
**Last Updated:** 2025-01-11  
**Next Review:** 2025-01-25 (Post-Performance Optimization Phase)

