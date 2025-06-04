
---
app: Reviews
version: "1.2.0"
updated: 2025-06-04
maintainer: lovable
frontend: React 18 / Vite / Tailwind CSS / TypeScript
backend: Supabase (PostgreSQL + Edge Functions)
bundleBudgets:
  - dashboard: 300kB
  - sidebar: 40kB
  - search: 80kB
routes:
  public: ["/", "/auth"]
  protected: ["/dashboard", "/community", "/search", "/edit", "/profile"]
---

# 📚 Reviews.app — Master Knowledge Base

## 1. Purpose & Pitch

**What:** Academic journal review platform focused on "Competência em 10 minutos" - quick, digestible medical research insights.

**Target Users:** Medical professionals, researchers, students seeking curated, expert-reviewed content.

**Core Value:** Transform dense academic papers into accessible, expert-reviewed summaries with community discussion and interactive engagement features.

**Key Differentiator:** Combines academic rigor with modern social features including reactions, bookmarks, voting, and real-time community interaction.

## 2. Glossary

| Term | Definition |
|------|------------|
| Issue | Individual publication/article with PDF, metadata, interactive features, and discussion |
| Review | Editorial commentary on academic papers from verified reviewers |
| Thread | Comment discussion on issues or community posts |
| Specialty | Medical field categorization (e.g., Cardiology, Neurology) |
| Featured | Highlighted issue prominently displayed on dashboard homepage |
| Poll | Community voting mechanism in sidebar and posts |
| RLS | Row Level Security - Supabase's data access control |
| Reactions | User engagement actions: like, dislike, want_more |
| Bookmarks | Saved content feature for users |
| Reviewer Comments | Expert commentary displayed prominently on homepage |
| Content Suggestions | User-submitted suggestions for upcoming content |

## 3. High-Level Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   React Client  │◄───┤   Supabase API   │◄───┤   PostgreSQL    │
│                 │    │                  │    │                 │
│ • Dashboard     │    │ • Auth           │    │ • Issues        │
│ • Community     │    │ • RPC Functions  │    │ • Comments      │
│ • Search        │    │ • Real-time      │    │ • Profiles      │
│ • Admin Panel   │    │ • Storage        │    │ • Polls         │
│ • Interactions  │    │ • Edge Functions │    │ • Reactions     │
│ • Bookmarks     │    │ • File Upload    │    │ • Bookmarks     │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

**Tech Stack:**
- Frontend: React 18, TypeScript, Tailwind CSS, Shadcn/UI
- Backend: Supabase (PostgreSQL 15, Edge Functions, Real-time)
- Auth: Supabase Auth with email/password + role-based access
- State: React Query (data), Zustand (sidebar), React Context (auth)
- Routing: React Router DOM
- UI: Custom design system with dark theme, serif typography, interactive components

## 4. User Journeys

### New User Flow
1. **Landing** → `/` → Auth prompts → `/auth`
2. **Registration** → Email verification → Profile creation
3. **Onboarding** → Dashboard → First issue view → Interactive tutorial
4. **Engagement** → Reactions → Bookmarks → Comments → Community participation

### Core Usage Patterns
- **Reader:** Browse issues → React (like/dislike/want_more) → Bookmark → Read PDFs → Comment/discuss
- **Community Member:** Create posts → Vote on polls → Participate in discussions → Submit content suggestions
- **Editor/Admin:** Manage content → Add reviewer comments → Moderate discussions → Configure settings

### Interaction Flows
- **Article Engagement:** Hover → See action buttons → Click → Immediate visual feedback → Toast confirmation
- **Suggestion Submission:** Type suggestion → Submit → Real-time addition to suggestion list → Vote
- **Bookmark Management:** Click bookmark → Instant visual state change → Access via profile

## 5. Domain Modules Index

### 5.1 Issues Management

**Owner:** Admin/Editor  
**Routes:** `/dashboard`, `/article/[id]`, `/edit/issue/[id]`  
**Primary KPI:** Weekly issue publications + user engagement metrics

#### Responsibilities
- PDF-based academic paper reviews with interactive features
- Metadata management (authors, specialty, scores, reactions)
- Publication workflow (draft → published → featured)
- Dual-view mode (article + PDF side-by-side)
- User engagement tracking (reactions, bookmarks, views)

#### UI Components
| Name | Path | Props |
|------|------|-------|
| CarouselArticleCard | `src/components/dashboard/CarouselArticleCard.tsx` | issue, className |
| ArticleRow | `src/components/dashboard/ArticleRow.tsx` | title, articles |
| HeroSection | `src/components/dashboard/HeroSection.tsx` | featuredIssue |
| IssueEditor | `src/pages/dashboard/IssueEditor.tsx` | id (optional) |

#### Interactive Features
- **Hover Actions:** Tooltips on action buttons, specialty tag hiding
- **Reactions System:** Like, dislike, want_more with real-time updates
- **Bookmark System:** Save/unsave with immediate visual feedback
- **Authentication Guards:** Login prompts for unauthenticated users

#### Data Schema
```sql
CREATE TABLE issues (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,
  specialty TEXT NOT NULL,
  pdf_url TEXT NOT NULL,
  article_pdf_url TEXT,
  cover_image_url TEXT,
  published BOOLEAN DEFAULT false,
  featured BOOLEAN DEFAULT false,
  authors TEXT,
  score INTEGER DEFAULT 0,
  description TEXT
);

CREATE TABLE reactions (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  content_id UUID NOT NULL,
  content_type TEXT NOT NULL,
  reaction_type TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE bookmarks (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  content_id UUID NOT NULL,
  content_type TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 5.2 Community System

**Owner:** Community Manager  
**Routes:** `/community`  
**Primary KPI:** Monthly active community members + engagement rate

#### Responsibilities
- Discussion posts with rich content (text, images, polls)
- Post flairs and categorization
- Voting and engagement tracking
- Auto-generated issue discussions
- Content suggestion collection and voting

#### UI Components
| Name | Path | Props |
|------|------|-------|
| Post | `src/components/community/Post.tsx` | post, onVoteChange |
| NewPostModal | `src/components/community/NewPostModal.tsx` | isOpen, onClose |
| PostsList | `src/components/community/PostsList.tsx` | posts, loading |
| UpcomingReleaseCard | `src/components/dashboard/UpcomingReleaseCard.tsx` | - |

#### Data Schema
```sql
CREATE TABLE posts (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  flair_id UUID,
  published BOOLEAN DEFAULT false,
  score INTEGER DEFAULT 0,
  pinned BOOLEAN DEFAULT false
);

CREATE TABLE content_suggestions (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  suggestion TEXT NOT NULL,
  votes INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 5.3 Reviewer Comments System

**Owner:** Editorial Team  
**Routes:** Dashboard (display), `/edit` (management)  
**Primary KPI:** Editor engagement and comment quality

#### Responsibilities
- Expert reviewer commentary display on homepage
- Clean, title-free presentation
- Admin/editor management interface
- Real-time updates and moderation

#### UI Components
| Name | Path | Props |
|------|------|-------|
| ReviewerCommentsDisplay | `src/components/dashboard/ReviewerCommentsDisplay.tsx` | - |
| ReviewerCommentsManager | `src/components/admin/ReviewerCommentsManager.tsx` | - |

#### Data Schema
```sql
CREATE TABLE reviewer_comments (
  id UUID PRIMARY KEY,
  reviewer_id UUID NOT NULL,
  reviewer_name TEXT NOT NULL,
  reviewer_avatar TEXT,
  comment TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 5.4 Sidebar Ecosystem

**Owner:** Community/UX Team  
**Routes:** All `/community/*` pages  
**Primary KPI:** Sidebar engagement rate

#### Responsibilities
- Real-time online user display
- Comment highlights carousel
- Weekly polls with voting
- Community rules and resources
- Mini changelog updates

#### UI Components
| Name | Path | Props |
|------|------|-------|
| RightSidebar | `src/components/sidebar/RightSidebar.tsx` | isMobile |
| ActiveAvatars | `src/components/sidebar/components/ActiveAvatars.tsx` | - |
| WeeklyPoll | `src/components/sidebar/components/WeeklyPoll.tsx` | - |

#### State Management
- **Store:** `src/stores/sidebarStore.ts` (Zustand)
- **Data Hook:** `src/hooks/useSidebarData.ts` (React Query)

### 5.5 Authentication & Authorization

**Owner:** Security Team  
**Routes:** `/auth`, guards on protected routes  
**Primary KPI:** User retention after signup

#### Responsibilities
- Email/password authentication via Supabase Auth
- Role-based access control (user, editor, admin)
- Protected route guards
- Session management and persistence
- Interactive action authentication checks

#### UI Components
| Name | Path | Props |
|------|------|-------|
| AuthGuard | `src/components/auth/AuthGuard.tsx` | requireAdmin, requireEditor |
| AuthForm | `src/components/auth/AuthForm.tsx` | mode |

#### User Roles & Authorization Model
- **User:** Read access, comment, vote, react, bookmark
- **Editor:** Content creation, reviewer comments, user management  
- **Admin:** Full system access, configuration, user role management

**CRITICAL:** Role-based authorization uses `profiles.role` as the canonical source of truth. Admin privileges are determined by:
1. `profiles.role = 'admin'` (primary check)
2. `admin_users` table serves as secondary lookup for legacy compatibility
3. All RLS policies use profile-based functions to avoid infinite recursion

#### Authorization Functions
```sql
-- Primary admin check (uses profiles table)
is_current_user_admin() → checks profiles.role = 'admin'

-- Editor check (includes admin)
is_current_user_editor_or_admin() → checks profiles.role IN ('admin', 'editor')

-- Legacy compatibility (maps to profile-based checks)
is_admin() → calls is_current_user_admin()
is_editor() → calls is_current_user_editor_or_admin()
```

### 5.6 Search & Discovery

**Owner:** Product Team  
**Routes:** `/search`  
**Primary KPI:** Search success rate

#### Responsibilities
- Full-text search across issues
- Filter by specialty, year, authors
- Search result ranking and relevance
- Search history and suggestions

#### UI Components
| Name | Path | Props |
|------|------|-------|
| SearchPage | `src/pages/dashboard/SearchPage.tsx` | - |
| SearchResultCard | `src/components/search/SearchResultCard.tsx` | issue |

### 5.7 Admin Panel

**Owner:** Admin Team  
**Routes:** `/edit`  
**Primary KPI:** Content management efficiency

#### Responsibilities
- Issue creation and editing
- User role management
- Reviewer comments management
- Community settings configuration
- Content moderation tools

#### UI Components
| Name | Path | Props |
|------|------|-------|
| Edit | `src/pages/dashboard/Edit.tsx` | - |
| IssuesManagementPanel | `src/components/admin/IssuesManagementPanel.tsx` | - |
| UserManagementPanel | `src/components/admin/UserManagementPanel.tsx` | - |
| ReviewerCommentsManager | `src/components/admin/ReviewerCommentsManager.tsx` | - |

## 6. Data & API Schemas

### Core Tables
| Table | Purpose | Key Relationships |
|-------|---------|-------------------|
| `issues` | Academic papers/reviews | → `comments`, `reactions`, `bookmarks` |
| `profiles` | User information + roles | → `admin_users`, `comments` |
| `comments` | Threaded discussions | → `comment_votes`, `issues/posts` |
| `posts` | Community content | → `post_votes`, `post_flairs` |
| `polls` | Voting mechanisms | → `poll_user_votes` |
| `reactions` | User engagement actions | → `issues`, `posts`, `comments` |
| `bookmarks` | Saved content | → `issues`, `posts` |
| `reviewer_comments` | Expert commentary | → `profiles` |
| `content_suggestions` | User suggestions | → `profiles` |

### Key RPC Functions
```sql
-- User statistics
get_total_users() → INTEGER
get_online_users_count() → INTEGER

-- Community features  
get_top_threads(min_comments INTEGER) → TABLE
unpin_expired_posts() → VOID

-- Authorization helpers (RLS-safe, profile-based)
is_current_user_admin() → BOOLEAN
is_current_user_editor_or_admin() → BOOLEAN

-- Content management
submit_content_suggestion(suggestion TEXT) → UUID
vote_content_suggestion(suggestion_id UUID, vote_type TEXT) → VOID
```

### Row Level Security Patterns
- **User Ownership:** `user_id = auth.uid()`
- **Published Content:** `published = true OR user_id = auth.uid()`
- **Admin Only:** `is_current_user_admin()` OR `is_current_user_editor_or_admin()`
- **Reactions & Bookmarks:** User-scoped with proper cascade deletes

**SECURITY NOTE:** All admin-related RLS policies use profile-based functions (`is_current_user_admin()`) instead of querying `admin_users` directly to prevent infinite recursion errors.

## 7. UI Component Index

### Layout Components
- `DashboardLayout.tsx` - **Route-scoped layout** with conditional sidebar mounting. Sidebar is only mounted on `/community` routes to prevent layout gaps.
- `Sidebar.tsx` - Main navigation menu
- `RightSidebar.tsx` - Community features sidebar (community-only)

### Content Components  
- `CarouselArticleCard.tsx` - Interactive issue card with hover effects and tooltips
- `ArticleRow.tsx` - Horizontal scrolling issue collection
- `HeroSection.tsx` - Featured issue prominent display
- `Post.tsx` - Community post with voting and actions
- `CommentSection.tsx` - Threaded comment discussions

### Interactive Components
- `ReviewerCommentsDisplay.tsx` - Clean expert commentary display
- `UpcomingReleaseCard.tsx` - Content suggestions with voting
- `PostVoting.tsx` - Post upvote/downvote system
- `WeeklyPoll.tsx` - Sidebar polling component

### Form Components
- `IssueFormContainer.tsx` - Issue creation/editing
- `CommentForm.tsx` - Comment creation
- `NewPostModal.tsx` - Post creation modal
- `ReviewerCommentsManager.tsx` - Admin reviewer comment management

### Utility Components
- `ErrorBoundary.tsx` - Error handling wrapper
- `AuthGuard.tsx` - Route protection
- `DashboardSkeleton.tsx` - Loading states
- `Tooltip` - Action button labels on hover

## 8. Design Language

### Color System
```css
/* Primary Brand Colors */
--primary: 217 91% 60%;      /* Blue accent */
--secondary: 210 40% 98%;    /* Light background */
--background: 0 0% 7%;       /* Dark (#121212) */
--foreground: 0 0% 98%;      /* White text */

/* Status Colors */
--success: 142 76% 36%;      /* Green */
--warning: 38 92% 50%;       /* Yellow */
--destructive: 0 84% 60%;    /* Red */

/* Interactive States */
--hover: rgba(255,255,255,0.1);
--active: rgba(255,255,255,0.2);
--disabled: rgba(255,255,255,0.3);
```

### Typography
- **Primary:** Inter (sans-serif for body text)
- **Brand:** Playfair Display (serif for logo and headings)
- **Code:** `font-mono` (system monospace)
- **Scale:** text-sm (14px) → text-base (16px) → text-lg (18px) → text-xl+ (20px+)

### Interactive Design Patterns
- **Hover Effects:** Opacity transitions, scale transforms, color shifts
- **Loading States:** Skeleton screens, spinner animations
- **Feedback:** Toast notifications, instant visual state changes
- **Tooltips:** Contextual labels for all interactive elements

### Spacing & Layout
- **Responsive Containers:** `container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12` for consistent full-width layouts
- **Grid Systems:** CSS Grid for community layout (grid-cols-[1fr_320px]), Flexbox for others
- **Spacing:** 4px base unit (space-1 through space-16)
- **Layout Strategy:** Route-conditional mounting prevents ghost elements and layout gaps

## 9. Accessibility Contract

### ARIA Implementation
- All interactive elements have `aria-label` or `aria-labelledby`
- Form inputs use `aria-describedby` for error messages
- Navigation uses `role="navigation"` and `aria-current`
- Tooltips properly associated with trigger elements

### Keyboard Navigation
- Tab order follows logical reading flow
- All modals trap focus
- Escape key closes overlays
- Enter/Space activate buttons
- Arrow keys navigate carousels

### Color & Contrast
- Minimum 4.5:1 contrast ratio for normal text
- 3:1 for large text and UI elements
- Color never sole indicator of state
- High contrast mode compatibility

### Screen Reader Support
- Semantic HTML structure
- Proper heading hierarchy
- Alternative text for images
- Status announcements for dynamic content

## 10. Performance Budgets

### Bundle Sizes
- **Main bundle:** <300kB gzipped
- **Dashboard chunk:** <200kB
- **Community chunk:** <150kB
- **Admin chunk:** <100kB
- **Component chunks:** <50kB each

### API Performance
- **Database queries:** <200ms p95
- **Authentication:** <1s login flow
- **Search:** <500ms response time
- **Real-time updates:** <100ms latency
- **Image loading:** Progressive with placeholders

### Core Web Vitals Targets
- **LCP:** <2.5s (Largest Contentful Paint)
- **FID:** <100ms (First Input Delay)
- **CLS:** <0.1 (Cumulative Layout Shift)

### Optimization Strategies
- React Query caching and background updates
- Image optimization and lazy loading
- Code splitting at route and component levels
- Skeleton loading states for perceived performance
- **Layout Efficiency:** Conditional DOM mounting eliminates phantom elements

## 11. Security & Compliance

### Authentication Security
- Email verification required for signup
- Session tokens auto-refresh
- Secure logout clears all client storage
- Rate limiting on auth endpoints
- Interactive action authentication checks

### Data Protection
- User data encrypted at rest (Supabase default)
- PII access logged and audited
- GDPR-compliant data deletion
- No sensitive data in client logs
- Secure file upload with validation

### Authorization Model & RLS Security
```sql
-- Fixed RLS pattern (prevents infinite recursion)
CREATE POLICY "Admin access example"
  ON sensitive_table FOR ALL
  USING (is_current_user_admin());  -- Uses profiles.role, not admin_users

-- User content access
CREATE POLICY "User reactions access"
  ON reactions FOR ALL
  USING (user_id = auth.uid());

-- Public content access
CREATE POLICY "Published content access"
  ON issues FOR SELECT
  USING (published = true);
```

**Key Security Fix (v1.1.0):** Eliminated infinite recursion in admin RLS policies by migrating from self-referential `admin_users` queries to profile-based authorization functions. All admin checks now use `profiles.role` as canonical source.

## 12. Admin & Ops

### Content Management Workflow
1. **Draft Creation** → Editor creates issue in draft state
2. **Review Process** → Content review and metadata validation  
3. **Publication** → Issue published and appears in dashboard
4. **Community** → Auto-generated discussion post created
5. **Analytics** → Engagement tracking begins
6. **Reviewer Comments** → Expert commentary added via admin panel

### Key Admin Functions
- **Issue Management:** Create, edit, publish, feature issues
- **User Roles:** Promote users to editor/admin status via profiles table
- **Community Moderation:** Pin posts, manage reports
- **Reviewer Comments:** Add, edit, delete expert commentary
- **System Configuration:** Sidebar settings, polls, announcements
- **Content Suggestions:** Review and manage user submissions

### Deployment Process
- **Staging:** Automatic deployment on PR
- **Production:** Manual approval required
- **Database:** Migrations via Supabase CLI
- **Assets:** Automatic optimization and CDN
- **Monitoring:** Real-time error tracking and performance metrics

## 13. Analytics & KPIs

### Product Metrics
- **MAU:** Monthly Active Users
- **Issue Engagement:** Views, reactions, bookmarks, comments, time on page
- **Community Health:** Posts per week, comment threads, suggestion submissions
- **Search Success:** Query → result → engagement rate
- **Interactive Features:** Reaction rates, bookmark rates, suggestion voting
- **Layout Performance:** Full-width utilization metrics, sidebar engagement rates

### Technical Metrics
- **Error Rates:** <1% 4xx, <0.1% 5xx
- **Performance:** Core Web Vitals compliance
- **Availability:** >99.9% uptime
- **Security:** Zero data breaches, successful auth rate
- **Layout Efficiency:** Zero phantom element detection, optimal content width usage

### Event Tracking
```typescript
// Key events tracked
- issue_viewed
- issue_reacted (type: like/dislike/want_more)
- issue_bookmarked
- comment_posted  
- poll_voted
- suggestion_submitted
- suggestion_voted
- search_performed
- user_registered
- layout_width_utilized // new metric for space utilization
```

### User Engagement Metrics
- **Session Duration:** Average time spent per visit
- **Feature Adoption:** % users using reactions, bookmarks, suggestions
- **Content Quality:** Ratio of positive to negative reactions
- **Community Growth:** New users per week, retention rates
- **Layout UX:** Full-width vs constrained layout user satisfaction

## 14. TODO / Backlog

### High Priority
- [ ] Mobile app responsive improvements for interactive elements
- [ ] Advanced search filters (date range, score, engagement metrics)
- [ ] Email notifications for reactions and comments
- [ ] Enhanced bookmark organization and management
- [ ] Content suggestion workflow automation

### Medium Priority  
- [ ] Rich text editor for posts and comments
- [ ] User profile customization and achievement system
- [ ] Issue recommendation engine based on user preferences
- [ ] Bulk admin operations for content management
- [ ] Advanced analytics dashboard for admins

### Interactive Features
- [ ] Reaction analytics for content creators
- [ ] Bookmark collections and sharing
- [ ] Collaborative filtering for recommendations
- [ ] Gamification elements (badges, streaks)
- [ ] Social features (follow users, activity feeds)

### Technical Debt
- [ ] Refactor large components (Post.tsx >200 lines)
- [ ] Implement proper error boundaries throughout app
- [ ] Add comprehensive TypeScript coverage for interactive hooks
- [ ] Optimize bundle splitting for better performance
- [ ] Standardize loading states across all components

## 15. Revision History

| Date | Author | Change Summary |
|------|--------|----------------|
| 2025-06-04 | lovable | Created initial knowledge base with complete app documentation |
| 2025-06-04 | lovable | Fixed infinite-recursion RLS on admin_users; migrated to profile-based auth |
| 2025-06-04 | lovable | Added interactive features: reactions, bookmarks, tooltips, suggestions |
| 2025-06-04 | lovable | Fixed reviewer comments system, spacing issues, comprehensive review |
| 2025-06-04 | lovable | **Layout Revolution v1.2.0:** Eliminated layout gaps through conditional sidebar mounting and full-width responsive containers |
