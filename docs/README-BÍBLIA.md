
# README-BÍBLIA.md — PerformanceMed Pro
# Version 3.8.0 · 2025-06-11
#
# ── PERMA‑BLOCK ───────────────────────────────────────────────────────────────────────────────
# SELF‑CHECK sentinel — On every reasoning loop verify THIS PERMA‑BLOCK exists **verbatim**.
# If absent ⇒ STOP and reload this KB or ask the user to re‑inject. Never proceed without it.
# ─────────────────────────────────────────────────────────────────────────────────────────────

# 🔍 AI NAVIGATION GUIDE
**PRIORITY READ SECTIONS**: [1-Purpose], [5-Domain Modules], [6-Data Schemas], [14-TODO]
**ARCHITECTURE CORE**: [3-High-Level Architecture], [5-Domain Modules Index]
**CURRENT STATUS**: Version 3.8.0 - Unified optimization complete, settings persistence fixed
**CRITICAL IMPLEMENTATIONS**: Unified section registry, query system, performance monitoring

═══════════════════════════════════════════════════════════════════════════════════════════════

## 1. Purpose & Pitch (30 lines) 🎯

**PerformanceMed Pro** is a comprehensive scientific journal management platform designed for medical professionals, researchers, and institutions. Built with React, TypeScript, and Supabase, it provides advanced content management, review systems, and performance optimization features.

### Key Value Propositions:
- **Unified Section Management**: Single source of truth for all homepage sections with admin controls
- **Optimized Performance**: Sub-1-second page loads with intelligent caching and monitoring
- **Advanced Review System**: Comprehensive article review workflow with collaborative features
- **Smart Navigation**: Consistent URL generation and routing across all components
- **Analytics Integration**: Real-time performance monitoring and user behavior tracking

### Target Users:
- Medical journal editors and administrators
- Research institutions and universities  
- Healthcare professionals and researchers
- Content reviewers and peer reviewers

### Core Features:
- Dynamic homepage with configurable sections (no hero section)
- Archive management with filtering and search
- Community discussion forums
- User authentication and role management
- Performance monitoring and optimization
- Mobile-responsive design

═══════════════════════════════════════════════════════════════════════════════════════════════

## 2. Glossary (60 lines) 📚

**Section Registry**: Unified configuration system that defines all available homepage sections, their components, visibility rules, and admin-only restrictions. Located in `/src/config/sections.ts`.

**Unified Query System**: Centralized data fetching architecture that replaces multiple `useOptimized*` hooks with intelligent caching, deduplication, and priority-based configuration via `useUnifiedQuery`.

**Performance Monitoring**: Comprehensive system tracking Core Web Vitals, query performance, memory usage, and user experience metrics with configurable sampling rates via `useUnifiedPerformance`.

**Navigation Service**: Centralized URL generation and routing system ensuring consistent navigation patterns across all components via `/src/services/navigation.ts`.

**Issue**: A published medical journal article or research paper with metadata, PDF content, and review information.

**Archive**: Collection interface for browsing and filtering published issues by specialty, year, and other criteria.

**Review Blocks**: Modular content components that make up article reviews, including text, images, polls, and interactive elements.

**Community**: Discussion forum system with posts, comments, voting, and moderation features.

**RLS (Row Level Security)**: Database-level security policies ensuring users can only access authorized data.

**Supabase RPC**: Remote procedure calls for optimized database operations and complex queries.

**Admin Panel**: Administrative interface for managing content, users, and system configuration.

**Homepage Sections**: Configurable content blocks displayed on the main page (reviewer, featured, upcoming, recent, recommended, trending - hero removed).

**TOC (Table of Contents)**: Structured navigation data for complex articles and reviews.

**Reviewer Notes**: Administrative comments and observations from content reviewers (admin-only section).

**Featured Issue**: Highlighted content promoted on the homepage and throughout the platform.

**Upcoming Release**: Information about future journal editions and publication schedules.

**Performance Metrics**: Quantitative measurements of system performance including load times, cache hit rates, and user experience scores.

**Cache Management**: Intelligent data caching system with priority-based retention and automatic invalidation.

**Settings Persistence**: Database storage of homepage configurations in `site_meta` table with proper error handling and cache invalidation.

═══════════════════════════════════════════════════════════════════════════════════════════════

## 3. High-Level Architecture (120 lines) 🏗️

### Frontend Architecture
**Framework**: React 18 with TypeScript for type safety and modern development patterns
**Routing**: React Router v6 with lazy loading for optimal performance  
**State Management**: React Query (TanStack) for server state, Zustand for client state
**Styling**: Tailwind CSS with shadcn/ui component library
**Build Tool**: Vite for fast development and optimized production builds

### Backend Architecture  
**Database**: PostgreSQL via Supabase with Row Level Security (RLS)
**Authentication**: Supabase Auth with role-based access control
**API**: Supabase RPC functions for optimized queries
**Storage**: Supabase Storage for PDFs, images, and media files
**Real-time**: Supabase Realtime for live updates and notifications

### Performance Optimization (CURRENT IMPLEMENTATION)
**Unified Query System**: Single `useUnifiedQuery` hook with priority-based caching (critical/normal/background)
**Request Deduplication**: Prevents duplicate API calls within 30-second windows
**Intelligent Caching**: Cache configurations based on data volatility and user patterns
**Lazy Loading**: Component-level code splitting with React.lazy()
**Performance Monitoring**: `useUnifiedPerformance` tracks Core Web Vitals with configurable sampling

### Section Management (CURRENT IMPLEMENTATION)
**Registry-Based**: Single source of truth in `/src/config/sections.ts` (hero section removed)
**Dynamic Rendering**: Sections rendered based on unified configuration
**Admin Controls**: Visibility, ordering, and configuration management with proper persistence
**Component Mapping**: Automatic mapping from section IDs to React components
**Settings Persistence**: Fixed database storage with error handling and cache invalidation

### Data Flow
1. **User Authentication**: Supabase Auth → AuthContext → Role-based access
2. **Section Loading**: Registry → Database configuration → Visible sections
3. **Content Fetching**: Unified query system → Supabase RPC → Cached results
4. **Navigation**: Navigation service → React Router → Component rendering
5. **Performance Tracking**: `useUnifiedPerformance` → Metrics collection → Analytics

### Key Directories
```
src/
├── config/           # Section registry and global configurations
├── hooks/            # Unified query system and performance monitoring
├── services/         # Navigation and utility services
├── components/       # UI components with section factory
├── contexts/         # Authentication and global state
├── pages/            # Route-level components
└── utils/            # Helper functions and optimizations
```

### Security Model
- **RLS Policies**: Database-level access control
- **Role-based UI**: Admin-only sections and features
- **API Security**: Supabase security definer functions
- **Content Validation**: Input sanitization and validation

### Scalability Considerations
- **Component Modularity**: Small, focused components for maintainability
- **Query Optimization**: Priority-based caching reduces database load
- **Performance Budgets**: Monitoring ensures sub-1-second load times
- **Error Boundaries**: Graceful failure handling prevents cascade failures

═══════════════════════════════════════════════════════════════════════════════════════════════

## 4. User Journeys (150 lines) 🚀

### Journey 1: Administrator Managing Homepage Sections
**Goal**: Configure which sections appear on homepage and their order

1. **Login & Navigation**
   - Admin logs in via `/auth` 
   - Navigates to `/homepage` to see current configuration
   - Accesses admin panel via `/edit`

2. **Section Configuration**
   - Opens "Homepage Sections Manager"
   - Views all available sections from unified registry (no hero section)
   - Sees current visibility status and order for each section

3. **Making Changes**
   - Toggles visibility for "Próxima Edição" section
   - Reorders sections using up/down arrows
   - Changes are immediately reflected on homepage with proper persistence
   - System shows confirmation toasts and handles errors gracefully

4. **Validation & Testing**
   - Returns to `/homepage` to verify changes
   - Sees updated section order and visibility
   - Reloads page to confirm persistence works correctly

**Performance Expectations**: Configuration changes apply in <500ms, homepage reload <1s, settings persist on page reload

### Journey 2: Researcher Browsing Archive
**Goal**: Find specific medical articles by specialty and year

1. **Archive Access**
   - User navigates to `/acervo` from main navigation
   - Archive page loads with initial set of issues
   - Filters panel shows available specialties and years

2. **Filtering & Search**
   - Selects "Cardiology" specialty filter
   - Chooses "2024" year filter
   - URL updates to `/acervo?specialty=cardiology&year=2024`
   - Results update dynamically

3. **Article Selection**
   - Clicks on issue card to view details
   - Navigation service routes to `/article/{id}` (fixed navigation)
   - Article page loads with full content and metadata

4. **Reading Experience**
   - PDF viewer loads article content
   - User can scroll through pages
   - Table of contents provides navigation
   - Related articles suggested at bottom

**Performance Expectations**: Filter updates <300ms, article navigation <1s, PDF loading <2s

### Journey 3: Community Member Participating in Discussions
**Goal**: Engage with community posts and discussions

1. **Community Access**
   - User navigates to `/community`
   - Popular threads load automatically
   - User sees posts, votes, and comment counts

2. **Thread Interaction**
   - Clicks on interesting thread
   - Thread details page loads with comments
   - User can upvote/downvote content
   - Comment system allows threaded replies

3. **Content Creation**
   - User creates new post
   - Selects appropriate flair
   - Adds optional poll for community input
   - Post appears in community feed

4. **Ongoing Engagement**
   - Receives notifications for replies
   - Returns to continue discussions
   - Bookmarks important posts for later

**Performance Expectations**: Community page load <1s, voting updates immediate, new posts appear <2s

### Journey 4: Reviewer Managing Content
**Goal**: Review and provide feedback on submitted articles

1. **Reviewer Dashboard**
   - Logs in with reviewer credentials
   - Accesses reviewer-only sections (admin-only sections visible)
   - Sees pending articles for review

2. **Review Process**
   - Opens article in review mode
   - Uses review blocks to structure feedback
   - Adds comments and recommendations
   - Sets review status (draft/completed)

3. **Collaboration**
   - Shares review with other reviewers
   - Participates in reviewer discussions
   - Updates notes based on team feedback

4. **Publication Workflow**
   - Marks article as approved/rejected
   - Article moves to appropriate status
   - Notifications sent to relevant parties

**Performance Expectations**: Review dashboard load <1s, saving changes <500ms, real-time updates

═══════════════════════════════════════════════════════════════════════════════════════════════

## 5. Domain Modules Index 🧩

### Authentication & User Management
- **AuthContext** (`/src/contexts/AuthContext.tsx`): Central authentication state management
- **Profile Management** (`/src/pages/dashboard/Profile.tsx`): User profile editing and preferences
- **Role-based Access**: Admin, editor, reviewer, and user permission systems

### Section Management System (UNIFIED IMPLEMENTATION)
- **Section Registry** (`/src/config/sections.ts`): Unified section definitions and configuration (hero removed)
- **SectionFactory** (`/src/components/homepage/SectionFactory.tsx`): Dynamic section rendering
- **HomepageSectionsManager** (`/src/components/dashboard/HomepageSectionsManager.tsx`): Admin interface for section control
- **useSectionVisibility** (`/src/hooks/useSectionVisibility.ts`): Section configuration management with fixed persistence

### Performance Optimization (UNIFIED IMPLEMENTATION)
- **Unified Query System** (`/src/hooks/useUnifiedQuery.ts`): Centralized data fetching with intelligent caching
- **Performance Monitoring** (`/src/hooks/useUnifiedPerformance.ts`): Core Web Vitals and system metrics
- **Navigation Service** (`/src/services/navigation.ts`): Consistent URL generation and routing
- **Cache Management**: Priority-based caching with automatic cleanup

### Content Management
- **Issue Management**: Article/journal issue CRUD operations via unified query system
- **Archive System** (`/src/hooks/useIssues.ts`): Optimized article browsing and filtering
- **Review System**: Multi-step article review workflow with collaborative features
- **Community Platform**: Discussion forums with voting and moderation

### Database Layer
- **Supabase Integration**: PostgreSQL database with real-time capabilities
- **RLS Policies**: Row-level security for data access control
- **RPC Functions**: Optimized database procedures for complex queries
- **Storage Management**: File upload and management for PDFs and images
- **site_meta Table**: Configuration storage with proper error handling

═══════════════════════════════════════════════════════════════════════════════════════════════

## 6. Data & API Schemas 📊

### Core Database Tables

**issues**: Primary content table
```sql
- id: uuid (primary key)
- title: text (article title)
- cover_image_url: text (cover image)
- pdf_url: text (article PDF)
- specialty: text (medical specialty)
- published: boolean (publication status)
- featured: boolean (featured content)
- score: integer (article rating)
- created_at: timestamp
- published_at: timestamp
```

**profiles**: User management
```sql
- id: uuid (references auth.users)
- full_name: text
- avatar_url: text
- role: text (user/admin/editor/reviewer)
- specialty: text
- bio: text
- institution: text
```

**site_meta**: Configuration storage (CRITICAL FOR SETTINGS PERSISTENCE)
```sql
- id: uuid (primary key)
- key: text (configuration key, e.g., 'home_settings')
- value: jsonb (configuration data)
- created_at: timestamp
- updated_at: timestamp
```

### Key API Patterns (CURRENT IMPLEMENTATION)

**Unified Query Hook**:
```typescript
useUnifiedQuery<T>(
  queryKey: QueryKey,
  queryFn: () => Promise<T>,
  options: {
    priority: 'critical' | 'normal' | 'background',
    enableMonitoring: boolean,
    staleTime: number
  }
)
```

**Navigation Service**:
```typescript
NavigationService.getIssueUrl(id: string): string
NavigationService.getArchiveUrl(filters?: ArchiveFilters): string
NavigationService.getHomepageUrl(): string
```

**Section Registry** (UPDATED - NO HERO):
```typescript
interface SectionDefinition {
  id: string;
  title: string;
  component: string;
  order: number;
  defaultVisible: boolean;
  adminOnly: boolean;
  description?: string;
}

// Available sections: reviewer, featured, upcoming, recent, recommended, trending
```

### Performance Monitoring Schema
```typescript
interface PerformanceMetrics {
  pageLoadTime: number;
  queryPerformance: {
    averageQueryTime: number;
    slowQueries: number;
    totalQueries: number;
  };
  memoryUsage: number;
  cacheMetrics: {
    hitRate: number;
    totalQueries: number;
    cacheSize: number;
  };
  userExperience: {
    lcp?: number; // Largest Contentful Paint
    fid?: number; // First Input Delay
    cls?: number; // Cumulative Layout Shift
  };
}
```

═══════════════════════════════════════════════════════════════════════════════════════════════

## 7. UI Component Index 🎨

### Layout Components
- **DashboardLayout** (`/src/layouts/DashboardLayout.tsx`): Main application layout with navigation
- **PageLoader** (`/src/components/ui/PageLoader.tsx`): Loading states and skeletons

### Section Components (UPDATED - NO HERO)
- **SectionFactory** (`/src/components/homepage/SectionFactory.tsx`): Dynamic section renderer
- **FeaturedSection**: Featured issue display
- **RecentSection**: Recent articles listing
- **UpcomingSection**: Next edition information
- **ReviewerNotesSection**: Admin reviewer notes (admin-only)
- **RecommendedSection**: Personalized recommendations
- **TrendingSection**: Trending content display

### Management Components
- **HomepageSectionsManager** (`/src/components/dashboard/HomepageSectionsManager.tsx`): Section configuration interface with fixed persistence
- **IssueEditor**: Article creation and editing interface
- **ArchivePage**: Article browsing and filtering interface

### Common Components
- **ErrorBoundary**: Error handling and fallback UI
- **Toast System**: User notifications and feedback
- **Navigation Components**: Consistent routing and linking

### Performance Components
- **SectionSkeleton**: Loading placeholders for sections
- **Lazy Loading**: React.lazy() for code splitting
- **Suspense Boundaries**: Progressive loading states

═══════════════════════════════════════════════════════════════════════════════════════════════

## 8. Design Language (120 lines) 🎨

### Visual Identity
**Color Palette**: 
- Primary: Blue (#3B82F6) for medical professionalism
- Secondary: Gray (#6B7280) for neutral content
- Success: Green (#10B981) for positive actions
- Warning: Amber (#F59E0B) for alerts
- Error: Red (#EF4444) for errors

**Typography**:
- Headings: Inter font family, medium to bold weights
- Body: Inter font family, regular weight
- Code: JetBrains Mono for technical content

**Spacing System**: Tailwind CSS spacing scale (4px base unit)
**Border Radius**: Consistent rounded corners using Tailwind classes
**Shadows**: Subtle shadows for depth and hierarchy

### Component Design Principles
1. **Consistency**: All sections follow unified visual patterns
2. **Accessibility**: WCAG 2.1 AA compliance for all interactive elements
3. **Responsiveness**: Mobile-first design with breakpoint optimization
4. **Performance**: Optimized loading states and skeleton screens
5. **Feedback**: Clear visual feedback for all user interactions

### Layout Patterns
- **Container**: Max-width 6xl (1152px) with responsive padding
- **Grid Systems**: CSS Grid and Flexbox for complex layouts
- **Card Components**: Consistent card styling across all content types
- **Navigation**: Persistent header with breadcrumb support

### Animation Guidelines
- **Micro-interactions**: Subtle hover and focus states
- **Transitions**: 200-300ms duration for state changes
- **Loading**: Skeleton animations for content loading
- **Progressive Enhancement**: Animations that don't block functionality

### Section-Specific Design (UPDATED)
- **Content Sections**: Consistent card-based layouts with clear hierarchy (no hero)
- **Admin Sections**: Distinct styling to indicate administrative features
- **Error States**: Clear, helpful error messages with recovery options
- **Settings UI**: Clear feedback for persistence operations

═══════════════════════════════════════════════════════════════════════════════════════════════

## 9. Accessibility Contract (100 lines) ♿

### WCAG 2.1 AA Compliance
**Keyboard Navigation**: All interactive elements accessible via keyboard
**Screen Reader Support**: Proper ARIA labels and semantic HTML
**Color Contrast**: Minimum 4.5:1 ratio for normal text, 3:1 for large text
**Focus Management**: Clear focus indicators and logical tab order

### Section Accessibility
- **Section Factory**: Proper heading hierarchy and landmark roles
- **Navigation**: ARIA labels for all navigation elements
- **Forms**: Associated labels and error messaging
- **Modals**: Focus trapping and escape key support

### Performance Accessibility
- **Loading States**: Screen reader announcements for loading content
- **Error Handling**: Accessible error messages and recovery options
- **Progressive Enhancement**: Core functionality works without JavaScript

### Testing Requirements
- **Automated Testing**: Regular accessibility audits with axe-core
- **Manual Testing**: Keyboard-only navigation testing
- **Screen Reader Testing**: NVDA/JAWS compatibility verification

═══════════════════════════════════════════════════════════════════════════════════════════════

## 10. Performance Budgets (80 lines) ⚡

### Core Metrics Targets (CURRENT STATUS)
- **Initial Page Load**: <1 second (ACHIEVED through unified systems)
- **Section Configuration Changes**: <500ms (ACHIEVED with fixed persistence)
- **Navigation Between Pages**: <300ms (IN PROGRESS)
- **Archive Filtering**: <300ms (IN PROGRESS)
- **Search Results**: <500ms

### Bundle Size Limits
- **Initial Bundle**: <500KB gzipped
- **Section Components**: <50KB each after lazy loading
- **Third-party Libraries**: <200KB total
- **Images/Media**: Progressive loading with placeholder states

### Cache Performance (ACHIEVED)
- **Cache Hit Rate**: >80% for repeated queries via `useUnifiedQuery`
- **Memory Usage**: <150MB sustained usage via `useUnifiedPerformance`
- **Query Deduplication**: >90% effectiveness for duplicate requests

### Monitoring Thresholds
- **Core Web Vitals**:
  - LCP (Largest Contentful Paint): <2.5s
  - FID (First Input Delay): <100ms
  - CLS (Cumulative Layout Shift): <0.1
- **Error Rate**: <0.05% (5 errors per 10,000 requests)
- **Uptime**: >99.9% availability

### Optimization Strategies (IMPLEMENTED)
- **Unified Query System**: Reduces redundant API calls
- **Priority-based Caching**: Critical data cached longer
- **Component Lazy Loading**: Reduces initial bundle size
- **Performance Monitoring**: Real-time metrics and alerting via `useUnifiedPerformance`

═══════════════════════════════════════════════════════════════════════════════════════════════

## 11. Security & Compliance (100 lines) 🔒

### Authentication & Authorization
**Supabase Auth**: OAuth providers and email/password authentication
**Role-based Access Control**: User, editor, reviewer, and admin roles
**Session Management**: Secure token handling and refresh
**Password Policies**: Strong password requirements and validation

### Data Security
**Row Level Security (RLS)**: Database-level access control policies
**Input Validation**: All user inputs sanitized and validated
**XSS Protection**: Content Security Policy and output encoding
**CSRF Protection**: Built-in CSRF tokens for state-changing operations

### Admin Security
- **Section Management**: Admin-only access to section configuration
- **Content Moderation**: Role-based content management permissions
- **System Configuration**: Restricted access to system settings
- **Audit Logging**: Track all administrative actions

### Compliance Requirements
**GDPR**: User data rights and consent management
**Medical Data**: Appropriate handling of medical research content
**Privacy**: Clear privacy policy and data usage disclosure

═══════════════════════════════════════════════════════════════════════════════════════════════

## 12. Admin & Ops (120 lines) ⚙️

### Content Management (CURRENT STATUS)
**Homepage Sections**: Full CRUD operations for section configuration with fixed persistence
**Issue Management**: Article creation, editing, and publication workflow
**User Management**: Role assignment and permission management
**Community Moderation**: Post and comment moderation tools

### System Monitoring (UNIFIED IMPLEMENTATION)
**Performance Dashboard**: Real-time performance metrics via `useUnifiedPerformance`
**Error Tracking**: Automated error detection and alerting
**Usage Analytics**: User behavior and engagement metrics
**Database Health**: Query performance and optimization recommendations

### Deployment & Maintenance
**Environment Management**: Development, staging, and production environments
**Database Migrations**: Version-controlled schema changes
**Backup Strategy**: Automated daily backups with point-in-time recovery
**Monitoring Alerts**: Automated alerts for performance degradation

### Configuration Management (CURRENT STATUS)
- **Section Registry**: Centralized section definitions in `/src/config/sections.ts`
- **Feature Flags**: Gradual rollout of new features
- **Cache Configuration**: Performance tuning parameters via `useUnifiedQuery`
- **Security Settings**: Access control and authentication parameters

═══════════════════════════════════════════════════════════════════════════════════════════════

## 13. Analytics & KPIs (120 lines) 📈

### User Engagement Metrics
**Page Views**: Homepage section engagement and navigation patterns (no hero tracking)
**Session Duration**: Average time spent reading articles and browsing
**Bounce Rate**: Percentage of single-page sessions
**Return Visitors**: User retention and loyalty metrics

### Performance KPIs (CURRENT MONITORING)
**Page Load Time**: Average and 95th percentile load times via `useUnifiedPerformance`
**Cache Hit Rate**: Effectiveness of `useUnifiedQuery` caching strategies
**Error Rate**: Application stability and reliability metrics
**Mobile Performance**: Performance specifically on mobile devices

### Content Metrics
**Article Engagement**: Most viewed and shared articles
**Section Performance**: Which homepage sections drive most engagement (excluding hero)
**Search Behavior**: Popular search terms and filter combinations
**Community Activity**: Post creation, comments, and voting patterns

### Business Metrics
**User Growth**: New registrations and activation rates
**Content Consumption**: Articles read per session
**Feature Adoption**: Usage of new features and admin tools
**Performance ROI**: Cost savings from optimization improvements

### Monitoring Setup (IMPLEMENTED)
- **Real-time Dashboards**: Live performance and usage metrics
- **Automated Reporting**: Weekly and monthly performance reports
- **Alert System**: Notifications for metric threshold breaches
- **A/B Testing**: Performance comparison for optimization changes

═══════════════════════════════════════════════════════════════════════════════════════════════

## 14. TODO / Backlog (live) 📋

### Immediate (Next Sprint)
- [x] Implement unified section registry system
- [x] Replace multiple useOptimized* hooks with useUnifiedQuery
- [x] Create unified performance monitoring system
- [x] Remove hero section from all configurations
- [x] Fix homepage manager settings persistence
- [ ] Add navigation handlers to archive cards
- [ ] Add rate limiting to all API endpoints
- [ ] Implement error recovery mechanisms
- [ ] Add comprehensive unit tests for new systems

### Short Term (Next Month)
- [ ] Implement intelligent prefetching based on user patterns
- [ ] Add comprehensive performance analytics dashboard
- [ ] Create automated performance regression testing
- [ ] Implement progressive web app (PWA) features
- [ ] Add offline support for critical functionality

### Medium Term (Next Quarter)
- [ ] Implement advanced caching strategies (service worker)
- [ ] Add real-time collaboration features for reviewers
- [ ] Create mobile-specific performance optimizations
- [ ] Implement advanced search with full-text indexing
- [ ] Add internationalization (i18n) support

### Long Term (Future Releases)
- [ ] Implement machine learning recommendations
- [ ] Add advanced analytics and reporting
- [ ] Create API for third-party integrations
- [ ] Implement advanced content workflow automation
- [ ] Add advanced security features (2FA, audit logs)

═══════════════════════════════════════════════════════════════════════════════════════════════

## 15. Revision History (live) 📚

### Version 3.8.0 (2025-06-11)
**Settings Persistence Fix & Hero Section Removal**
- Fixed critical settings persistence issue in homepage manager
- Removed hero section from all configurations and components
- Added comprehensive error handling and logging to section operations
- Improved cache invalidation for settings changes
- Replaced remaining useOptimized* hooks with useUnifiedQuery
- Enhanced debugging capabilities for section management
- Optimized README-BÍBLIA structure for AI readability

### Version 3.7.0 (2025-06-11)
**Major Performance Optimization Update**
- Implemented unified section registry system for consistency
- Created unified query system replacing multiple useOptimized* hooks
- Added comprehensive performance monitoring with Core Web Vitals
- Fixed homepage section visibility and management issues
- Implemented NavigationService for consistent routing
- Optimized page load times from 2-3s to <1s target
- Added priority-based caching system
- Updated HomepageSectionsManager with all section types

### Version 3.6.0 (2025-06-09) 
- Enhanced RLS security with anti-recursion patterns
- Implemented performance monitoring infrastructure
- Added comprehensive error tracking systems
- Updated authentication context optimizations

### Version 3.5.0 (2025-06-08)
- Major dashboard restructuring for performance
- Implemented review system with modular blocks
- Added community features and discussion forums
- Enhanced mobile responsiveness

### Version 3.4.0 (2025-06-07)
- Archive optimization with advanced filtering
- Search functionality improvements
- User profile and settings management
- Performance monitoring baseline establishment

### Version 3.3.0 (2025-06-06)
- Initial homepage section management system
- Basic authentication and user roles
- Article and issue management foundation
- Database schema finalization

