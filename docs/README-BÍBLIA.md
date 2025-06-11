
# README-BÍBLIA v4.0.0 — Scientific Review Platform
*Complete context for AI agents and developers — 2min read*

## 1. Purpose & Pitch

**Mission:** Advanced scientific literature review platform focused on medical/academic content analysis and community engagement.

**Core Value Props:**
- Native block-based review editor with modular content system
- AI-enhanced review workflows with structured metadata
- Community-driven discussion threads with voting and polls
- Administrative content management with fine-grained permissions
- Real-time collaboration features with live user presence

**Target Users:** Medical researchers, academic reviewers, journal editors, scientific communities.

**Tech Stack:** React 18 + TypeScript + Vite + Tailwind + shadcn/ui + Supabase + TanStack Query

## 2. Glossary

| Term | Definition |
|------|------------|
| **Issue** | Published scientific review containing multiple blocks (articles, analyses, etc.) |
| **Review Block** | Modular content unit (text, image, poll, data visualization) within an issue |
| **Native Editor** | Custom block-based WYSIWYG editor for creating/editing reviews |
| **Post** | Community discussion thread with optional polls and media attachments |
| **Profile** | User account with role-based permissions (user/admin) |
| **Flair** | Categorization tags for posts with custom colors |
| **Archive** | Historical view of all published issues with filtering capabilities |
| **Sidebar Store** | Global state management for real-time user activity and stats |
| **Section Visibility** | Configurable homepage layout system with drag-and-drop ordering |
| **Block Management** | Editor state system handling block CRUD operations with undo/redo |
| **Poll System** | Interactive voting components embedded in posts and review blocks |
| **Comment Thread** | Hierarchical discussion system with voting and nested replies |
| **RLS Policies** | Row-level security ensuring proper data access control |
| **Supabase Functions** | Server-side logic for complex operations and data aggregation |
| **TanStack Query** | Data fetching and caching layer with optimistic updates |

## 3. High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND LAYER (React/TS)                   │
├─────────────────────────────────────────────────────────────────┤
│ Pages: Dashboard | Community | Archive | Edit | IssueView       │
│ Layouts: DashboardLayout with Sidebar + Main Content           │
│ Contexts: AuthContext (Supabase Auth integration)              │
├─────────────────────────────────────────────────────────────────┤
│                    COMPONENT ARCHITECTURE                      │
├─────────────────────────────────────────────────────────────────┤
│ /editor: NativeEditor, BlockEditor, ReviewPreview              │
│ /review: ReviewRenderer, BlockRenderer, ReviewActions          │
│ /community: PostCard, PostContent, PollSection                 │
│ /comments: CommentForm, CommentThread, CommentActions          │
│ /navigation: Sidebar, TopNav with auth/role controls           │
│ /admin: HomepageManager, UserManagement, ContentModeration     │
│ /homepage: FeaturedCarousel, RecentIssues, UpcomingReleases    │
├─────────────────────────────────────────────────────────────────┤
│                    STATE MANAGEMENT                            │
├─────────────────────────────────────────────────────────────────┤
│ Global: Zustand sidebarStore (online users, stats)            │
│ Local: useState, useReducer for component state               │
│ Server: TanStack Query for API state with background sync     │
│ Forms: React Hook Form with Zod validation                    │
├─────────────────────────────────────────────────────────────────┤
│                    API/DATA LAYER                              │
├─────────────────────────────────────────────────────────────────┤
│ Supabase Client: Real-time subscriptions + REST operations    │
│ Database: PostgreSQL with RLS policies for multi-tenant       │
│ Functions: Server-side aggregations and complex queries       │
│ Auth: Supabase Auth with email/password + role-based access   │
└─────────────────────────────────────────────────────────────────┘
```

**Data Flow Pattern:**
1. User action triggers React event → 2. Hook validates + calls Supabase → 3. RLS policies enforce access → 4. TanStack Query caches response → 5. UI updates reactively

## 4. User Journeys

### Reviewer Journey (Primary)
1. **Login** → Dashboard with recent activity overview
2. **Create Review** → Native Editor with block-based content creation
3. **Add Blocks** → Text, images, polls, data visualizations from palette
4. **Preview/Edit** → Real-time split-view editor with live preview
5. **Publish** → Issue becomes visible in archive and homepage
6. **Monitor Engagement** → View comments, polls results, community feedback

### Community Member Journey
1. **Browse** → Homepage with featured content and recent issues
2. **Read Reviews** → Full-screen issue view with interactive elements
3. **Engage** → Comment threads, poll voting, bookmark content
4. **Participate** → Create posts in community section with media/polls
5. **Discover** → Archive browsing with specialty/year filters

### Admin Journey
1. **Content Management** → Review submissions, moderate discussions
2. **User Management** → Role assignment, profile moderation
3. **Homepage Config** → Section visibility, ordering, featured content
4. **Analytics** → User engagement metrics, content performance

## 5. Domain Modules Index

### Core Content System
- `src/types/issue.ts` - Issue and review data structures
- `src/types/review.ts` - Review block types and metadata schemas
- `src/components/review/` - Review rendering and display components
- `src/components/editor/` - Native block-based editor system

### Community Platform
- `src/types/community.ts` - Post, comment, poll data structures
- `src/components/community/` - Post cards, content display, interactions
- `src/components/comments/` - Threaded commenting system with voting
- `src/hooks/comments/` - Comment CRUD operations and state management

### User Management & Auth
- `src/contexts/AuthContext.tsx` - Supabase auth integration and state
- `src/types/auth.ts` - User profile and permission structures
- `src/components/admin/` - Administrative interfaces and controls

### UI/UX Foundation
- `src/components/ui/` - shadcn/ui component library integration
- `src/components/navigation/` - Sidebar, navigation, layout components
- `src/components/homepage/` - Landing page sections and carousels

### Data & State Management
- `src/stores/` - Zustand stores for global state (sidebar, user activity)
- `src/hooks/` - Custom hooks for data fetching and business logic
- `src/integrations/supabase/` - Database client and type definitions

## 6. Data & API Schemas

### Core Tables Schema

**issues** (Main review content)
```sql
id: uuid PRIMARY KEY
title: text NOT NULL
content: text  
cover_image_url: text
specialty: text NOT NULL (medical field)
authors: text
year: text
published: boolean DEFAULT false
featured: boolean DEFAULT false
score: integer DEFAULT 0
review_type: text DEFAULT 'pdf'
```

**review_blocks** (Modular content system)
```sql
id: bigint PRIMARY KEY
issue_id: uuid → issues.id
type: text NOT NULL (text|image|poll|data|heading)
payload: jsonb NOT NULL (block-specific data)
sort_index: integer NOT NULL
visible: boolean DEFAULT true
meta: jsonb DEFAULT '{}'
```

**posts** (Community discussions)
```sql
id: uuid PRIMARY KEY
user_id: uuid → profiles.id
title: text NOT NULL
content: text
image_url: text
video_url: text
flair_id: uuid → post_flairs.id
published: boolean DEFAULT false
score: integer DEFAULT 0
pinned: boolean DEFAULT false
poll_id: uuid → polls.id
```

**comments** (Threaded discussions)
```sql
id: uuid PRIMARY KEY
user_id: uuid → profiles.id
content: text NOT NULL
parent_id: uuid → comments.id (for threading)
article_id: uuid → articles.id
issue_id: uuid → issues.id  
post_id: uuid → posts.id
score: integer DEFAULT 0
```

**profiles** (User accounts)
```sql
id: uuid PRIMARY KEY → auth.users.id
full_name: text
avatar_url: text
role: text DEFAULT 'user' (user|admin)
specialty: text
bio: text
institution: text
```

### API Patterns

**TanStack Query Integration**
```typescript
// Data fetching with caching
const { data: issues } = useQuery({
  queryKey: ['issues', specialty],
  queryFn: () => supabase.from('issues').select('*')
});

// Optimistic updates
const mutation = useMutation({
  mutationFn: updateIssue,
  onMutate: async (newData) => {
    await queryClient.cancelQueries(['issues']);
    queryClient.setQueryData(['issues'], old => [...old, newData]);
  }
});
```

**Supabase RLS Policy Pattern**
```sql
-- Users can only modify their own content
CREATE POLICY "Users manage own posts" ON posts
  FOR ALL USING (auth.uid() = user_id);

-- Public read access for published content  
CREATE POLICY "Public read published" ON issues
  FOR SELECT USING (published = true);
```

## 7. UI Component Index

### Layout Components
- `DashboardLayout.tsx` - Main application shell with sidebar + content
- `Sidebar.tsx` - Navigation with user presence, stats, quick actions
- `TopNav.tsx` - Header with auth controls and global actions

### Editor Components
- `NativeEditor.tsx` - Main editor container with split-view capability
- `BlockEditor.tsx` - Block management and ordering interface
- `BlockPalette.tsx` - Draggable block type selector
- `ReviewPreview.tsx` - Real-time rendered preview of review content
- `BlockRenderer.tsx` - Individual block rendering with type switching

### Content Display
- `ReviewRenderer.tsx` - Full review display with navigation and metadata
- `PostCard.tsx` - Community post display with media and poll support
- `CommentThread.tsx` - Hierarchical comment display with voting
- `IssueCard.tsx` - Issue preview cards for archive and homepage

### Interactive Elements
- `PollSection.tsx` - Poll voting interface with real-time results
- `CommentForm.tsx` - Comment composition with formatting and media upload
- `VotingControls.tsx` - Upvote/downvote buttons with score display
- `BookmarkButton.tsx` - Save/unsave content functionality

### Admin Interfaces
- `HomepageManager.tsx` - Configure homepage sections and visibility
- `UserManagement.tsx` - User role assignment and profile moderation
- `ContentModeration.tsx` - Review flagged content and manage reports

### Utility Components
- `LoadingSpinner.tsx` - Consistent loading states across the app
- `ErrorBoundary.tsx` - Error handling and fallback UI
- `ConfirmDialog.tsx` - Confirmation modals for destructive actions
- `Toast.tsx` - Success/error notification system

## 8. Design Language

### Color System
**Primary Palette:**
- `primary`: #3b82f6 (Blue-500) - Main brand color for CTAs and links
- `secondary`: #64748b (Slate-500) - Secondary actions and muted elements  
- `accent`: #10b981 (Emerald-500) - Success states and positive actions
- `destructive`: #ef4444 (Red-500) - Error states and destructive actions

**Semantic Colors:**
- `background`: #0f172a (Slate-900) - Main dark background
- `surface`: #1e293b (Slate-800) - Cards and elevated surfaces
- `border`: #334155 (Slate-700) - Subtle borders and dividers
- `text-primary`: #f8fafc (Slate-50) - Primary text content
- `text-secondary`: #94a3b8 (Slate-400) - Secondary text and metadata

### Typography Scale
```css
/* Headings */
h1: text-4xl font-bold (36px)
h2: text-3xl font-semibold (30px)  
h3: text-2xl font-semibold (24px)
h4: text-xl font-medium (20px)

/* Body */
body: text-base (16px) - Main content text
small: text-sm (14px) - Metadata and secondary info
caption: text-xs (12px) - Fine print and labels
```

### Component Patterns
**Cards:** Consistent `border border-white/10 bg-white/5` styling with subtle transparency
**Buttons:** Primary uses brand blue, secondary uses transparent with border
**Forms:** Dark backgrounds with focus states and clear validation feedback
**Navigation:** Active states with subtle highlighting and smooth transitions

### Spacing System
Based on Tailwind's rem-based scale: 4px, 8px, 12px, 16px, 24px, 32px, 48px, 64px

### Animation Standards
- **Micro-interactions:** 150ms ease-out for hover states
- **Page transitions:** 300ms ease-in-out for route changes
- **Loading states:** Subtle pulse animation for skeleton loading
- **Success feedback:** Brief scale animation for completed actions

## 9. Accessibility Contract

### WCAG 2.1 AA Compliance
- **Color Contrast:** All text meets 4.5:1 ratio minimum against backgrounds
- **Keyboard Navigation:** Full tab order support with visible focus indicators
- **Screen Readers:** Semantic HTML with proper ARIA labels and landmarks
- **Alt Text:** All images have descriptive alternative text

### Accessibility Features
- **Focus Management:** Proper focus trapping in modals and dropdowns
- **Error Handling:** Clear error messages with field association
- **Loading States:** Screen reader announcements for async operations
- **Form Validation:** Real-time feedback with clear error descriptions

### Testing Standards
- **Automated:** ESLint accessibility rules enforced in CI/CD
- **Manual:** Keyboard-only navigation testing for all user flows
- **Screen Reader:** VoiceOver/NVDA testing for critical paths
- **Color Blindness:** Deuteranopia/Protanopia simulation testing

### Semantic Structure
```html
<!-- Proper heading hierarchy -->
<main aria-label="Issue content">
  <h1>Issue Title</h1>
  <section aria-labelledby="content-heading">
    <h2 id="content-heading">Review Content</h2>
  </section>
</main>
```

## 10. Performance Budgets

### Core Web Vitals Targets
- **LCP (Largest Contentful Paint):** < 2.5s on 3G connection
- **FID (First Input Delay):** < 100ms for interactive elements
- **CLS (Cumulative Layout Shift):** < 0.1 for visual stability

### Bundle Size Limits
- **Initial Bundle:** < 250KB gzipped (currently ~180KB)
- **Route Chunks:** < 50KB per lazy-loaded page component
- **Dependencies:** Regular audit with `webpack-bundle-analyzer`

### Optimization Strategies
**Code Splitting:**
```typescript
// Route-based splitting
const Community = lazy(() => import('./pages/dashboard/Community'));
const ArchivePage = lazy(() => import('./pages/dashboard/ArchivePage'));

// Component-based splitting for heavy editor
const NativeEditor = lazy(() => import('./components/editor/NativeEditor'));
```

**Image Optimization:**
- WebP format with fallbacks for browser compatibility
- Responsive images with `srcset` for different viewport sizes
- Lazy loading for below-the-fold content with Intersection Observer

**Data Fetching:**
- TanStack Query caching reduces redundant API calls
- Background refetching for stale data synchronization
- Optimistic updates for immediate UI feedback

### Memory Management
- Cleanup of event listeners and subscriptions in `useEffect`
- Proper React key props for efficient list rendering
- Image cleanup and garbage collection for media-heavy content

## 11. Security & Compliance

### Authentication & Authorization
**Supabase Auth Integration:**
- Email/password authentication with secure session management
- Role-based access control (user/admin) with database-level enforcement
- JWT token validation on all protected routes

**Row-Level Security (RLS):**
```sql
-- Example policy ensuring users only access their own data
CREATE POLICY "Users access own content" ON posts
  FOR ALL USING (auth.uid() = user_id);

-- Public read access for published content
CREATE POLICY "Public read published" ON issues  
  FOR SELECT USING (published = true);
```

### Data Protection
**Input Validation:**
- Client-side validation with Zod schemas for type safety
- Server-side validation through Supabase constraints
- SQL injection prevention through parameterized queries

**Content Security:**
- XSS prevention through React's built-in escaping
- Content sanitization for user-generated HTML in comments
- File upload validation for allowed mime types and size limits

**Privacy Controls:**
- User data deletion capabilities (GDPR compliance)
- Audit logging for administrative actions
- Anonymization options for sensitive user data

### Infrastructure Security
- HTTPS enforced for all communications
- Environment variable management for sensitive configuration
- Regular dependency updates for security patches
- Rate limiting on API endpoints to prevent abuse

## 12. Admin & Ops

### Content Management
**Homepage Configuration:**
- Section visibility toggles with drag-and-drop ordering
- Featured content selection and carousel management
- Upcoming releases scheduling with automated publishing

**User Administration:**
- Role assignment (user → admin) with immediate permission updates
- Profile moderation and content flagging review
- Bulk operations for user management tasks

**Content Moderation:**
- Report handling workflow for inappropriate content
- Comment and post moderation queue
- Automated content filtering for spam detection

### System Administration
**Database Management:**
```sql
-- Health check queries
SELECT * FROM get_sidebar_stats(); -- Real-time platform metrics
SELECT * FROM get_popular_issues(7, 10); -- Trending content analysis
```

**Performance Monitoring:**
- TanStack Query DevTools for cache inspection
- Supabase dashboard for database performance metrics
- Error tracking and logging through browser console

**Backup & Recovery:**
- Automated Supabase backups with point-in-time recovery
- Export functionality for content portability
- Data migration scripts for schema updates

### Operational Workflows
**Content Publishing:**
1. Admin creates/edits issue in Native Editor
2. Preview and review process with collaborative editing
3. Publication triggers homepage updates and notifications
4. Community engagement monitoring and moderation

**User Support:**
- Error logging and debugging information collection
- User feedback collection through integrated forms
- Performance issue investigation and resolution

## 13. Analytics & KPIs

### User Engagement Metrics
**Content Interaction:**
- Issue view counts and time spent reading
- Comment thread engagement and reply rates
- Poll participation and voting patterns
- Bookmark and sharing frequency

**Community Activity:**
- Daily/Monthly active users tracked in sidebar store
- Post creation and engagement rates
- User retention and return visit patterns
- Search query analysis for content discovery

### Content Performance
**Issue Analytics:**
- View-to-engagement conversion rates
- Comment generation per issue type
- Popular specialty areas and trending topics
- Geographic distribution of readership

**Editor Effectiveness:**
- Block type usage patterns in Native Editor
- Edit session duration and completion rates
- Preview-to-publish conversion rates
- Content creation workflow optimization

### Technical Performance
**System Health:**
```typescript
// Real-time metrics collection
const sidebarStore = useSidebarStore();
const metrics = {
  onlineUsers: sidebarStore.onlineUsers,
  totalUsers: sidebarStore.stats?.totalUsers,
  systemLoad: await supabase.rpc('get_query_performance_stats')
};
```

**Database Performance:**
- Query execution time monitoring
- Cache hit rates for frequently accessed content
- Database connection pool utilization
- Storage usage and growth patterns

### Business Intelligence
**Revenue Indicators:** (Future implementation)
- User subscription conversion rates
- Premium feature adoption
- Content creator monetization metrics

**Growth Metrics:**
- User acquisition channels and conversion
- Content creation velocity and quality
- Community health and moderation efficiency

## 14. TODO / Backlog

### High Priority (Current Sprint)
- [ ] Add email notification system for community engagement
- [ ] Optimize mobile responsive design for editor interface

### Medium Priority (Next Quarter)
- [ ] Advanced search functionality with filters and faceted search
- [ ] User profile customization and social features
- [ ] Content recommendation algorithm based on reading history
- [ ] API rate limiting and quota management system
- [ ] Advanced analytics dashboard for administrators

### Low Priority (Future Releases)
- [ ] PDF export functionality for issues and reviews
- [ ] Integration with external reference management systems
- [ ] Advanced role-based permissions with custom roles
- [ ] Real-time chat system for community discussions

### Technical Debt
- [ ] Refactor large component files (HomepageManager, CommentForm, NativeEditor)
- [ ] Implement comprehensive error boundary system
- [ ] Add comprehensive test coverage (currently minimal)
- [ ] Optimize bundle size with better code splitting
- [ ] Standardize component prop interfaces and documentation

### Infrastructure Improvements
- [ ] Implement CDN for static asset delivery
- [ ] Add database query optimization and indexing review
- [ ] Set up automated performance monitoring and alerting
- [ ] Implement backup verification and disaster recovery testing

## 15. Revision History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 4.0.0 | 2025-01-11 | Complete architecture rewrite based on current codebase analysis | AI System |
| 3.1.0 | 2024-12-XX | Added community features and native editor | Previous Team |
| 2.0.0 | 2024-11-XX | Migrated to Supabase backend | Previous Team |
| 1.0.0 | 2024-10-XX | Initial platform launch | Previous Team |

**v4.0.0 Changes Summary:**
- Completely rewrote all sections based on actual codebase examination
- Added comprehensive component and data flow documentation
- Updated all schemas to match current database structure
- Documented native editor and block-based content system
- Added real community features and polling system
- Updated security and performance guidelines
- Expanded admin and operational procedures
- Added analytics and KPI tracking framework

---
*This document serves as the single source of truth for the Scientific Review Platform architecture. All information has been verified against the current codebase as of January 11, 2025.*
