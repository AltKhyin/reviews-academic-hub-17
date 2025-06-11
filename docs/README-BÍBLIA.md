
# README-BÍBLIA.md — REVISTA MÉDICA PLATFORM
# Version 3.6.0 · 2025-06-11
#
# ── PERMA‑BLOCK ───────────────────────────────────────────────────────────────────────────────
# SELF‑CHECK sentinel — On every reasoning loop verify THIS PERMA‑BLOCK exists **verbatim**.
# If absent ⇒ STOP and reload this KB or ask the user to re‑inject. Never proceed without it.
# ─────────────────────────────────────────────────────────────────────────────────────────────

================================================================================================
1. PURPOSE & PITCH — Medical journal review platform [30 lines max]
================================================================================================
RevistaMédica is a comprehensive platform for medical professionals to access, review,
and discuss medical literature. The platform provides:

• **Content Management**: PDF-based medical reviews with structured blocks
• **Community Features**: Discussion threads, polls, and expert commentary  
• **Performance Optimization**: Advanced caching, RPC functions, and materialized views
• **Admin Tools**: Content management, user permissions, and analytics
• **Mobile-First Design**: Responsive UI optimized for medical professionals

**Core Value**: Streamlined access to peer-reviewed medical content with intelligent 
performance optimization and robust community features.

**Tech Stack**: React + TypeScript + Supabase + TanStack Query + Tailwind CSS

================================================================================================
2. GLOSSARY — Key terms [60 lines max]  
================================================================================================
**Issue**: Medical journal edition containing multiple articles/reviews
**Block**: Structured content component (text, image, poll, etc.) within reviews
**RPC**: Remote Procedure Call - optimized database functions
**Materialized View**: Pre-computed database views for performance
**Archive**: Historical collection of published issues
**Specialty**: Medical field categorization (cardiology, neurology, etc.)
**Featured**: Highlighted content promoted on homepage
**Poll**: Interactive voting component within reviews
**Thread**: Discussion topic in community section
**Flair**: Category tag for community posts
**Score**: Voting-based ranking system for content
**Profile**: User account with role-based permissions
**Reviewer**: Expert providing commentary and analysis
**Tag Configuration**: Hierarchical content categorization system
**Performance Hooks**: React hooks for monitoring and optimization
**Section Visibility**: Configurable homepage layout management
**Background Sync**: Automated data prefetching and cache optimization

================================================================================================
3. HIGH-LEVEL ARCHITECTURE — System overview [120 lines max]
================================================================================================
```
┌─────────────────────┐    ┌─────────────────────┐    ┌─────────────────────┐
│   FRONTEND LAYER    │    │   OPTIMIZATION      │    │   DATABASE LAYER    │
│                     │    │   MIDDLEWARE        │    │                     │
│ ┌─ App.tsx         │    │ ┌─ Performance       │    │ ┌─ Supabase         │
│ ├─ Dashboard       │    │ │   Monitoring       │    │ ├─ RPC Functions    │
│ ├─ Archive         │    │ ├─ Query Cache       │    │ ├─ Materialized     │
│ ├─ ArticleViewer   │    │ ├─ Background Sync   │    │ │   Views           │
│ ├─ Community       │    │ ├─ Error Tracking    │    │ ├─ Row Level        │
│ └─ Admin Tools     │    │ └─ Intelligent       │    │ │   Security        │
│                     │    │     Prefetch        │    │ └─ Real-time        │
└─────────────────────┘    └─────────────────────┘    │     Subscriptions   │
          │                          │                 └─────────────────────┘
          └──────────────────────────┼─────────────────────────────│
                                     │                             │
┌─────────────────────┐    ┌─────────────────────┐    ┌─────────────────────┐
│   HOOK ECOSYSTEM    │    │   DATA FLOW         │    │   CACHING STRATEGY  │
│                     │    │                     │    │                     │
│ ┌─ useOptimized*    │    │ User Action         │    │ ┌─ Query Dedup      │
│ ├─ useParallel*     │    │       ↓             │    │ ├─ Stale-While-     │
│ ├─ usePerformance*  │    │ Hook Processing     │    │ │   Revalidate      │
│ ├─ useBackground*   │    │       ↓             │    │ ├─ Background       │
│ ├─ useError*        │    │ RPC/Direct Query    │    │ │   Refresh         │
│ └─ useIntelligent*  │    │       ↓             │    │ └─ Materialized     │
│                     │    │ Cache Update        │    │     View Sync       │
└─────────────────────┘    │       ↓             │    └─────────────────────┘
                           │ UI Re-render        │
                           └─────────────────────┘
```

**Component Architecture**:
- **Pages**: Route-level components with lazy loading
- **Layouts**: Shared layout components (DashboardLayout)  
- **UI Components**: Reusable Shadcn/UI components
- **Hooks**: Data fetching and state management layer
- **Contexts**: Global state (Auth, Theme)

**Performance Architecture**:
- **L1 Cache**: React Query with deduplication
- **L2 Cache**: Browser localStorage for user preferences
- **L3 Cache**: Materialized views in PostgreSQL
- **Background Workers**: Prefetching and sync operations

================================================================================================
4. USER JOURNEYS — Key workflows [150 lines max]
================================================================================================
**Journey 1: Medical Professional Reading Review**
1. Land on homepage → See featured issue + recent content
2. Click issue → Navigate to ArticleViewer 
3. Read structured blocks → Interactive polls, images, text
4. React to content → Like, bookmark, comment
5. Share insights → Community discussion

**Journey 2: Admin Content Management**  
1. Login with admin credentials → Access admin dashboard
2. Create new issue → Upload PDF, add metadata
3. Structure content → Add blocks (text, images, polls)
4. Configure visibility → Set featured status, publication date
5. Publish → Content goes live with notifications

**Journey 3: Community Engagement**
1. Browse community → See trending discussions
2. Create post → Add title, content, flair
3. Engage with others → Vote, comment, bookmark
4. Participate in polls → Voice opinions on medical topics
5. Build reputation → Earn recognition through quality contributions

**Journey 4: Archive Research**
1. Access archive → Browse by specialty, year, search
2. Apply filters → Narrow down by tags, authors
3. View results → Paginated list with metadata
4. Export/Save → Bookmark for later reference
5. Cross-reference → Link to related content

**Journey 5: Performance Monitoring (Admin)**
1. Access performance dashboard → Real-time metrics
2. Review optimization status → Cache hit rates, query performance  
3. Trigger manual optimization → Background sync, cache cleanup
4. Monitor error rates → Track and resolve issues
5. Generate reports → Performance insights and recommendations

================================================================================================
5. DOMAIN MODULES INDEX — Core business logic [∞ lines]
================================================================================================
## Authentication & Authorization
- **AuthContext**: Global authentication state management
- **useAuth**: Authentication hook with user permissions
- **useStableAuth**: Stable session management without state flickers
- **RLS Policies**: Row-level security for data access control

## Content Management  
- **useOptimizedIssues**: High-performance issue fetching with RPC
- **useOptimizedFeaturedIssue**: Featured content with aggressive caching
- **useReviewBlocks**: Structured content management
- **useArchiveData**: Archive browsing with search and filters
- **useOptimizedArchiveData**: Performance-optimized archive queries

## Performance Optimization
- **usePerformanceOptimizer**: Central performance coordination
- **usePerformanceMonitoring**: Real-time performance metrics
- **useOptimizedQueryClient**: Query cache optimization and cleanup
- **useBackgroundSync**: Automated prefetching and synchronization
- **useRPCPerformanceMonitoring**: Database function performance tracking
- **useMaterializedViewsOptimization**: View health and refresh management

## User Interactions
- **useOptimizedUserInteractions**: Batched user actions (reactions, bookmarks)
- **useParallelDataLoader**: Coordinated data loading for homepage
- **useIntelligentPrefetch**: Behavior-based route prefetching
- **useErrorTracking**: Error monitoring and aggregation

## Community Features
- **useCommunityPosts**: Forum-style discussions
- **usePolls**: Interactive voting within content
- **useComments**: Threaded discussions
- **useVoting**: Upvote/downvote system

## Admin & Configuration
- **useSectionVisibility**: Homepage layout management
- **useUpcomingReleaseSettings**: Release scheduling and configuration
- **useAdminPermissions**: Role-based access control
- **useContentModeration**: Content review and approval workflows

## Search & Discovery
- **useSimplifiedArchiveSearch**: Text-based content search
- **useTagConfiguration**: Hierarchical content categorization
- **useContentRecommendations**: AI-driven content suggestions

================================================================================================
6. DATA & API SCHEMAS — Database structure [∞ lines]
================================================================================================
## Core Tables

**issues** (Medical journal editions)
```sql
- id: uuid (PK)
- title: text (required)
- cover_image_url: text
- pdf_url: text (required)  
- specialty: text (required)
- published: boolean (default: false)
- featured: boolean (default: false)
- score: integer (voting-based ranking)
- review_content: jsonb (structured blocks)
- toc_data: jsonb (table of contents)
- backend_tags: jsonb (categorization)
- authors: text
- year: text
- description: text
- created_at/updated_at: timestamp
- published_at: timestamp
```

**profiles** (User accounts)
```sql
- id: uuid (PK, linked to auth.users)
- full_name: text
- avatar_url: text  
- role: text (user|admin)
- specialty: text
- bio: text
- institution: text
- created_at/updated_at: timestamp
```

**review_blocks** (Structured content)
```sql
- id: bigint (PK)
- issue_id: uuid (FK to issues)
- type: text (text|image|poll|video)
- payload: jsonb (block-specific data)
- sort_index: integer (ordering)
- visible: boolean (default: true)
- meta: jsonb (additional metadata)
```

**posts** (Community discussions)
```sql
- id: uuid (PK)
- user_id: uuid (FK to profiles)
- title: text (required)
- content: text
- published: boolean
- score: integer (voting)
- flair_id: uuid (categorization)
- pinned: boolean
- created_at/updated_at: timestamp
```

## Optimization Tables

**site_meta** (Configuration storage)
```sql
- id: uuid (PK)
- key: text (unique identifier)
- value: jsonb (configuration data)
- created_at/updated_at: timestamp
```

**materialized views**
```sql
- mv_published_issues_archive: Pre-computed archive data
- mv_community_stats: Aggregated community metrics
- mv_popular_content: Trending content calculations
```

## Performance RPC Functions
- `get_optimized_issues()`: High-performance issue fetching
- `get_featured_issue()`: Featured content retrieval
- `get_sidebar_stats()`: Aggregated sidebar statistics
- `get_query_performance_stats()`: Database performance metrics
- `get_materialized_view_health()`: View status monitoring
- `refresh_materialized_views()`: Manual view refresh

================================================================================================
7. UI COMPONENT INDEX — Design system [∞ lines]
================================================================================================
## Layout Components
- **DashboardLayout**: Main application shell with navigation
- **AuthLayout**: Authentication pages wrapper
- **PageLoader**: Loading states with Suspense boundaries

## Content Display
- **ArticleViewer**: PDF viewer with structured blocks
- **ReviewBlock**: Individual content block renderer
- **IssueCard**: Issue preview in grids and lists
- **FeaturedCarousel**: Homepage featured content slider

## Community Components  
- **PostCard**: Community post display
- **CommentThread**: Threaded discussion component
- **PollComponent**: Interactive voting interface
- **UserProfileCard**: User information display

## Performance Components
- **PerformanceDashboard**: Real-time metrics display
- **PerformanceMonitor**: Development performance overlay
- **OptimizedAppProvider**: Performance wrapper for app
- **QueryOptimizationProvider**: Query performance enhancements

## Admin Components
- **HomepageManager**: Section visibility management
- **HomepageSectionsManager**: Homepage layout configuration
- **ContentModerationPanel**: Content review interface
- **AnalyticsDashboard**: Platform usage metrics

## Form Components (Shadcn/UI)
- **Button**: Primary action component
- **Input**: Text input with validation
- **Select**: Dropdown selection
- **Card**: Content container
- **Badge**: Status/category indicators
- **Toast**: Notification system

## Navigation
- **Sidebar**: Main navigation menu
- **Breadcrumbs**: Page hierarchy navigation
- **Pagination**: Content pagination controls
- **SearchBar**: Global search interface

================================================================================================
8. DESIGN LANGUAGE — Visual standards [120 lines max]
================================================================================================
## Color Palette
**Primary**: Blue gradient (#1e40af → #3b82f6)
**Secondary**: Slate (#64748b)
**Accent**: Emerald (#10b981)  
**Background**: White/Gray-50 (#f8fafc)
**Surface**: White with subtle borders
**Text**: Gray-900 (#111827) primary, Gray-600 (#4b5563) secondary

## Typography
**Headings**: Inter font family, weights 600-700
**Body**: Inter font family, weight 400-500  
**Code**: JetBrains Mono, weight 400
**Scale**: text-xs (12px) → text-4xl (36px)

## Spacing System (Tailwind)
**Micro**: p-1, p-2 (4px, 8px)
**Small**: p-3, p-4 (12px, 16px)
**Medium**: p-6, p-8 (24px, 32px)  
**Large**: p-12, p-16 (48px, 64px)

## Component Standards
**Cards**: Rounded corners (rounded-lg), subtle shadow, white background
**Buttons**: Rounded (rounded-md), clear hover states, focus rings
**Inputs**: Border focus states, proper labels, error indicators
**Layout**: Max-width containers, consistent gutters, responsive breakpoints

## Interaction Patterns
**Loading**: Skeleton loaders, spinner for long operations
**Feedback**: Toast notifications, inline validation messages
**Navigation**: Breadcrumbs, clear active states, back buttons
**Micro-interactions**: Smooth transitions, hover effects, focus indicators

## Responsive Breakpoints
**Mobile**: < 640px (sm)
**Tablet**: 640px - 1024px (md/lg)  
**Desktop**: > 1024px (xl/2xl)
**Content**: Max-width 1200px centered

## Accessibility Standards
**Contrast**: WCAG AA compliant color ratios
**Focus**: Visible focus indicators on all interactive elements
**Screen Readers**: Proper ARIA labels, semantic HTML
**Keyboard**: Full keyboard navigation support

================================================================================================
9. ACCESSIBILITY CONTRACT — A11y standards [100 lines max]
================================================================================================
## Compliance Level: WCAG 2.1 AA

**Keyboard Navigation**
- All interactive elements accessible via Tab/Shift+Tab
- Escape key closes modals, dropdowns
- Arrow keys for menu navigation
- Enter/Space for button activation

**Screen Reader Support**  
- Semantic HTML5 elements (article, nav, main, section)
- ARIA labels for dynamic content
- ARIA live regions for status updates
- Proper heading hierarchy (h1 → h6)

**Visual Accessibility**
- Color contrast ratio ≥ 4.5:1 for normal text
- Color contrast ratio ≥ 3:1 for large text
- No color-only information conveyance  
- Focus indicators with 2px outline
- Minimum touch target 44x44px

**Content Accessibility**
- Alt text for all meaningful images
- Captions for video content
- Descriptive link text (no "click here")
- Form labels explicitly associated with inputs
- Error messages linked to form fields

**Dynamic Content**
- Loading states announced to screen readers
- Route changes announced
- Form validation feedback immediate
- Status updates in live regions

**Testing Requirements**
- Automated testing with axe-core
- Manual keyboard testing
- Screen reader testing (NVDA/VoiceOver)
- Color blindness simulation testing

================================================================================================
10. PERFORMANCE BUDGETS — Optimization targets [80 lines max]
================================================================================================
## Core Web Vitals Targets
**Largest Contentful Paint (LCP)**: < 2.5s
**First Input Delay (FID)**: < 100ms  
**Cumulative Layout Shift (CLS)**: < 0.1
**First Contentful Paint (FCP)**: < 1.8s

## Bundle Size Limits
**Main Bundle**: < 500KB gzipped
**Route Chunks**: < 200KB each gzipped
**Vendor Chunks**: < 300KB gzipped
**CSS Bundle**: < 50KB gzipped

## Runtime Performance
**Memory Usage**: < 100MB baseline, < 200MB peak
**Query Response**: < 500ms average
**Cache Hit Rate**: > 85%
**Error Rate**: < 1%

## Database Performance  
**RPC Function Execution**: < 200ms average
**Materialized View Refresh**: < 30s
**Complex Queries**: < 1s
**Connection Pool**: < 20 active connections

## Network Optimization
**Image Optimization**: WebP format, responsive sizes
**Font Loading**: Preload critical fonts, font-display: swap
**Resource Hints**: Preconnect to external domains
**Critical Resource Priority**: Above-fold content first

## Monitoring Strategy
**Real User Monitoring**: Core Web Vitals tracking
**Synthetic Testing**: Lighthouse CI in pipeline  
**Performance Budgets**: Bundle size enforcement
**Error Tracking**: Automatic error reporting and alerting

================================================================================================
11. SECURITY & COMPLIANCE — Safety measures [100 lines max]
================================================================================================
## Authentication Security
**Row Level Security (RLS)**: Enabled on all user-facing tables
**JWT Tokens**: Secure token handling with refresh mechanism
**Session Management**: Automatic logout after inactivity
**Password Policy**: Minimum 8 characters, complexity requirements

## Data Protection
**GDPR Compliance**: Right to deletion, data export
**PII Handling**: Minimal collection, encrypted storage
**Data Retention**: Automatic cleanup of old data
**Audit Logging**: User action tracking for sensitive operations

## API Security  
**Rate Limiting**: Implemented on all public endpoints
**Input Validation**: Server-side validation for all inputs
**SQL Injection Prevention**: Parameterized queries, RPC functions
**XSS Protection**: Content sanitization, CSP headers

## Infrastructure Security
**Database Security**: Connection encryption, backup encryption
**CDN Security**: HTTPS enforcement, security headers
**Environment Separation**: Dev/staging/production isolation
**Secret Management**: Environment variables, no hardcoded secrets

## Content Security
**File Upload Validation**: Type checking, size limits, virus scanning
**Content Moderation**: Automated and manual review processes
**User Permissions**: Role-based access control (RBAC)
**Data Sanitization**: HTML/script tag removal in user content

## Monitoring & Response
**Security Headers**: HSTS, CSP, X-Frame-Options
**Vulnerability Scanning**: Automated dependency checks
**Incident Response**: Defined procedures for security breaches
**Backup Strategy**: Automated daily backups with encryption

================================================================================================
12. ADMIN & OPS — Platform management [120 lines max]
================================================================================================
## Admin Dashboard Features
**User Management**: View/edit user profiles, role assignment
**Content Moderation**: Review flagged content, approve/reject submissions
**Analytics Overview**: Traffic, engagement, performance metrics
**System Health**: Database status, error rates, performance monitoring

## Content Management Workflow
**Issue Creation**: Upload PDF → Add metadata → Structure content blocks
**Review Process**: Draft → Review → Approval → Publication
**Featured Content**: Homepage spotlight management
**Archive Organization**: Categorization, tagging, search optimization

## Performance Management
**Query Optimization**: RPC function monitoring and tuning
**Cache Management**: Manual cache invalidation, warming
**Background Jobs**: Automated cleanup, optimization tasks
**Resource Monitoring**: Database connections, memory usage

## User Support Operations
**Support Tickets**: Integrated help desk functionality
**Community Moderation**: Flag review, user warnings/bans
**Content Reports**: Automated flagging system
**User Analytics**: Engagement patterns, feature usage

## System Maintenance
**Database Maintenance**: Index optimization, vacuum operations
**Backup Management**: Automated backups, restore testing
**Security Updates**: Dependency updates, vulnerability patches
**Performance Tuning**: Query optimization, cache tuning

## Operational Metrics
**Uptime Monitoring**: 99.9% availability target
**Response Time**: API response monitoring
**Error Tracking**: Automated error reporting and alerting
**Capacity Planning**: Resource usage forecasting

## Admin Tools Access
**Role-Based Access**: Admin/Editor/Moderator permissions
**Audit Logging**: All admin actions tracked
**Multi-Factor Authentication**: Required for admin accounts
**Session Management**: Automatic logout, concurrent session limits

================================================================================================
13. ANALYTICS & KPIs — Measurement framework [120 lines max]
================================================================================================
## Content Performance Metrics
**Issue Engagement**: Views, time spent, completion rates
**Popular Content**: Most viewed, most shared, trending topics
**Search Analytics**: Query frequency, result relevance
**Download Metrics**: PDF downloads, content access patterns

## User Engagement KPIs
**Daily Active Users (DAU)**: Unique daily visitors
**Monthly Active Users (MAU)**: Monthly engagement tracking
**Session Duration**: Average time on platform
**Return Visitor Rate**: User retention measurement
**Feature Adoption**: New feature usage rates

## Community Health Metrics
**Discussion Participation**: Comments, posts, replies
**Content Quality**: Voting patterns, moderation actions
**User Growth**: Registration rates, activation funnels
**Community Sentiment**: Positive/negative interaction ratios

## Technical Performance KPIs
**Page Load Times**: Core Web Vitals tracking
**API Response Times**: Backend performance monitoring
**Error Rates**: Application stability metrics
**Cache Performance**: Hit rates, miss patterns
**Database Performance**: Query execution times, connection usage

## Business Intelligence
**Content ROI**: High-performing content identification
**User Journey Analysis**: Path through platform features
**Conversion Funnels**: Registration to active user pipeline
**Feature Usage Heatmaps**: UI interaction patterns

## Reporting & Dashboards
**Real-time Dashboards**: Live metrics for operations team
**Weekly Reports**: Automated summary emails
**Monthly Analytics**: Comprehensive performance review
**Custom Reports**: Ad-hoc analysis capabilities

## Data Collection Strategy
**Privacy-First Analytics**: GDPR compliant tracking
**Event Tracking**: User interaction monitoring
**Performance Monitoring**: Real User Monitoring (RUM)
**A/B Testing Framework**: Feature variation testing

================================================================================================
14. TODO / BACKLOG — Development priorities [live]
================================================================================================
## High Priority (Current Sprint)
- ✅ Complete performance optimization hooks implementation
- ✅ Fix section visibility management bugs  
- ✅ Implement comprehensive error tracking
- ✅ Add materialized view optimization
- ✅ Create intelligent prefetching system

## Medium Priority (Next Sprint)
- [ ] Implement advanced search with Elasticsearch
- [ ] Add real-time notification system
- [ ] Create mobile app with React Native
- [ ] Implement AI-powered content recommendations
- [ ] Add video content support

## Low Priority (Future Releases)
- [ ] Multi-language support (i18n)
- [ ] Advanced analytics dashboard
- [ ] API rate limiting enhancements
- [ ] Social media integration
- [ ] Advanced content export features

## Technical Debt
- [ ] Refactor large hook files (>200 lines)
- [ ] Implement comprehensive testing suite
- [ ] Optimize bundle splitting strategy
- [ ] Database query optimization review
- [ ] Legacy code cleanup

## Feature Requests (User-Driven)
- [ ] Dark mode theme support
- [ ] Advanced filtering in archive
- [ ] Bookmark collections/folders
- [ ] Enhanced PDF annotation tools
- [ ] Integration with medical databases

## Infrastructure Improvements
- [ ] CDN implementation for static assets
- [ ] Database read replicas for scaling
- [ ] Advanced monitoring and alerting
- [ ] Automated backup testing
- [ ] Container orchestration setup

================================================================================================
15. REVISION HISTORY — Document evolution [live]
================================================================================================
| Version | Date       | Changes                                    | Author      |
|---------|------------|-------------------------------------------|-------------|
| 3.6.0   | 2025-06-11 | Complete performance optimization overhaul | AI Assistant |
|         |            | - Added all missing optimization hooks    |             |
|         |            | - Fixed section visibility management     |             |
|         |            | - Implemented error tracking system       |             |
|         |            | - Added materialized view optimization    |             |
|         |            | - Created intelligent prefetching         |             |
|         |            | - Fixed type safety issues throughout     |             |
| 3.5.0   | 2025-06-11 | Enhanced optimization documentation        | AI Assistant |
|         |            | - Updated performance monitoring section  |             |
|         |            | - Added comprehensive hook documentation  |             |
|         |            | - Refined architecture descriptions       |             |
| 3.0.0   | 2025-06-10 | Major optimization implementation          | AI Assistant |
|         |            | - Performance monitoring integration      |             |
|         |            | - RPC function optimization              |             |
|         |            | - Query caching improvements             |             |
| 2.0.0   | 2025-06-09 | Community features implementation          | AI Assistant |
|         |            | - Forum-style discussions                |             |
|         |            | - User voting and reactions               |             |
|         |            | - Enhanced moderation tools               |             |
| 1.0.0   | 2025-06-08 | Initial platform implementation            | AI Assistant |
|         |            | - Core medical content management         |             |
|         |            | - User authentication and profiles        |             |
|         |            | - Basic performance optimization           |             |

---
**DOCUMENTATION STANDARDS**: This file follows semantic versioning and requires updates
for any architectural changes, new features, or performance modifications.
