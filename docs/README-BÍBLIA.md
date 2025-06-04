
---
app: Reviews
version: "1.0.0"
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

**Core Value:** Transform dense academic papers into accessible, expert-reviewed summaries with community discussion.

## 2. Glossary

| Term | Definition |
|------|------------|
| Issue | Individual publication/article with PDF, metadata, and discussion |
| Review | Editorial commentary on academic papers |
| Thread | Comment discussion on issues or community posts |
| Specialty | Medical field categorization (e.g., Cardiology, Neurology) |
| Featured | Highlighted issue on dashboard homepage |
| Poll | Community voting mechanism in sidebar |
| RLS | Row Level Security - Supabase's data access control |

## 3. High-Level Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   React Client  │◄───┤   Supabase API   │◄───┤   PostgreSQL    │
│                 │    │                  │    │                 │
│ • Dashboard     │    │ • Auth           │    │ • Issues        │
│ • Community     │    │ • RPC Functions  │    │ • Comments      │
│ • Search        │    │ • Real-time      │    │ • Profiles      │
│ • Admin Panel   │    │ • Storage        │    │ • Polls         │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

**Tech Stack:**
- Frontend: React 18, TypeScript, Tailwind CSS, Shadcn/UI
- Backend: Supabase (PostgreSQL 15, Edge Functions)
- Auth: Supabase Auth with email/password
- State: React Query, Zustand (sidebar)
- Routing: React Router DOM

## 4. User Journeys

### New User Flow
1. **Landing** → `/` → Auth prompts → `/auth`
2. **Registration** → Email verification → Profile creation
3. **Onboarding** → Dashboard → First issue view
4. **Engagement** → Comments → Community participation

### Core Usage Patterns
- **Reader:** Browse issues → Read PDFs → Comment/discuss
- **Community Member:** Create posts → Vote on polls → Participate in discussions
- **Editor/Admin:** Manage content → Moderate discussions → Configure settings

## 5. Domain Modules Index

### 5.1 Issues Management

**Owner:** Admin/Editor  
**Routes:** `/dashboard`, `/article/[id]`, `/edit/issue/[id]`  
**Primary KPI:** Weekly issue publications

#### Responsibilities
- PDF-based academic paper reviews
- Metadata management (authors, specialty, scores)
- Publication workflow (draft → published → featured)
- Dual-view mode (article + PDF side-by-side)

#### UI Components
| Name | Path | Props |
|------|------|-------|
| ArticleCard | `src/components/dashboard/ArticleCard.tsx` | issue, variant, featured |
| FeaturedSection | `src/components/dashboard/FeaturedSection.tsx` | issues |
| IssueEditor | `src/pages/dashboard/IssueEditor.tsx` | id (optional) |

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
  score INTEGER DEFAULT 0
);
```

### 5.2 Community System

**Owner:** Community Manager  
**Routes:** `/community`  
**Primary KPI:** Monthly active community members

#### Responsibilities
- Discussion posts with rich content (text, images, polls)
- Post flairs and categorization
- Voting and engagement tracking
- Auto-generated issue discussions

#### UI Components
| Name | Path | Props |
|------|------|-------|
| Post | `src/components/community/Post.tsx` | post, onVote |
| NewPostModal | `src/components/community/NewPostModal.tsx` | isOpen, onClose |
| PostsList | `src/components/community/PostsList.tsx` | posts, loading |

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
```

### 5.3 Sidebar Ecosystem

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

### 5.4 Authentication & Authorization

**Owner:** Security Team  
**Routes:** `/auth`, guards on protected routes  
**Primary KPI:** User retention after signup

#### Responsibilities
- Email/password authentication via Supabase Auth
- Role-based access control (user, editor, admin)
- Protected route guards
- Session management and persistence

#### UI Components
| Name | Path | Props |
|------|------|-------|
| AuthGuard | `src/components/auth/AuthGuard.tsx` | requireAdmin, requireEditor |
| AuthForm | `src/components/auth/AuthForm.tsx` | mode |

#### User Roles
- **User:** Read access, comment, vote
- **Editor:** Content creation, user management
- **Admin:** Full system access, configuration

### 5.5 Search & Discovery

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

### 5.6 Admin Panel

**Owner:** Admin Team  
**Routes:** `/edit`  
**Primary KPI:** Content management efficiency

#### Responsibilities
- Issue creation and editing
- User role management
- Community settings configuration
- Content moderation tools

#### UI Components
| Name | Path | Props |
|------|------|-------|
| Edit | `src/pages/dashboard/Edit.tsx` | - |
| IssuesManagementPanel | `src/components/admin/IssuesManagementPanel.tsx` | - |
| UserManagementPanel | `src/components/admin/UserManagementPanel.tsx` | - |

## 6. Data & API Schemas

### Core Tables
| Table | Purpose | Key Relationships |
|-------|---------|-------------------|
| `issues` | Academic papers/reviews | → `comments`, `external_lectures` |
| `profiles` | User information | → `admin_users`, `comments` |
| `comments` | Threaded discussions | → `comment_votes`, `issues/posts` |
| `posts` | Community content | → `post_votes`, `post_flairs` |
| `polls` | Voting mechanisms | → `poll_user_votes` |

### Key RPC Functions
```sql
-- User statistics
get_total_users() → INTEGER
get_online_users_count() → INTEGER

-- Community features  
get_top_threads(min_comments INTEGER) → TABLE
unpin_expired_posts() → VOID

-- Authorization helpers
is_admin() → BOOLEAN
is_editor() → BOOLEAN
```

### Row Level Security Patterns
- **User Ownership:** `user_id = auth.uid()`
- **Published Content:** `published = true OR user_id = auth.uid()`
- **Admin Only:** `is_admin()` OR `is_editor()`

## 7. UI Component Index

### Layout Components
- `DashboardLayout.tsx` - Main app shell with sidebar
- `Sidebar.tsx` - Main navigation menu
- `RightSidebar.tsx` - Community features sidebar

### Content Components  
- `ArticleCard.tsx` - Issue display card (compact/featured variants)
- `Post.tsx` - Community post with voting
- `CommentSection.tsx` - Threaded comment discussions

### Form Components
- `IssueFormContainer.tsx` - Issue creation/editing
- `CommentForm.tsx` - Comment creation
- `NewPostModal.tsx` - Post creation modal

### Utility Components
- `ErrorBoundary.tsx` - Error handling wrapper
- `AuthGuard.tsx` - Route protection
- `DashboardSkeleton.tsx` - Loading states

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
```

### Typography
- **Primary:** Inter (system fallback)
- **Code:** `font-mono` (system monospace)
- **Scale:** text-sm (14px) → text-base (16px) → text-lg (18px) → text-xl+ (20px+)

### Spacing & Layout
- **Grid:** 12-column responsive grid
- **Containers:** max-w-6xl (dashboard), max-w-4xl (content)
- **Spacing:** 4px base unit (space-1 through space-16)

## 9. Accessibility Contract

### ARIA Implementation
- All interactive elements have `aria-label` or `aria-labelledby`
- Form inputs use `aria-describedby` for error messages
- Navigation uses `role="navigation"` and `aria-current`

### Keyboard Navigation
- Tab order follows logical reading flow
- All modals trap focus
- Escape key closes overlays
- Enter/Space activate buttons

### Color & Contrast
- Minimum 4.5:1 contrast ratio for normal text
- 3:1 for large text and UI elements
- Color never sole indicator of state

## 10. Performance Budgets

### Bundle Sizes
- **Main bundle:** <300kB gzipped
- **Dashboard chunk:** <200kB
- **Community chunk:** <150kB
- **Admin chunk:** <100kB

### API Performance
- **Database queries:** <200ms p95
- **Authentication:** <1s login flow
- **Search:** <500ms response time
- **Real-time updates:** <100ms latency

### Core Web Vitals Targets
- **LCP:** <2.5s
- **FID:** <100ms  
- **CLS:** <0.1

## 11. Security & Compliance

### Authentication Security
- Email verification required for signup
- Session tokens auto-refresh
- Secure logout clears all client storage
- Rate limiting on auth endpoints

### Data Protection
- User data encrypted at rest (Supabase default)
- PII access logged and audited
- GDPR-compliant data deletion
- No sensitive data in client logs

### Authorization Model
```sql
-- Example RLS Policy
CREATE POLICY "Users can edit own comments"
  ON comments FOR UPDATE
  USING (auth.uid() = user_id);
```

## 12. Admin & Ops

### Content Management Workflow
1. **Draft Creation** → Editor creates issue in draft state
2. **Review Process** → Content review and metadata validation  
3. **Publication** → Issue published and appears in dashboard
4. **Community** → Auto-generated discussion post created
5. **Analytics** → Engagement tracking begins

### Key Admin Functions
- **Issue Management:** Create, edit, publish, feature issues
- **User Roles:** Promote users to editor/admin status
- **Community Moderation:** Pin posts, manage reports
- **System Configuration:** Sidebar settings, polls, announcements

### Deployment Process
- **Staging:** Automatic deployment on PR
- **Production:** Manual approval required
- **Database:** Migrations via Supabase CLI
- **Assets:** Automatic optimization and CDN

## 13. Analytics & KPIs

### Product Metrics
- **MAU:** Monthly Active Users
- **Issue Engagement:** Views, comments, time on page
- **Community Health:** Posts per week, comment threads
- **Search Success:** Query → result → engagement rate

### Technical Metrics
- **Error Rates:** <1% 4xx, <0.1% 5xx
- **Performance:** Core Web Vitals compliance
- **Availability:** >99.9% uptime
- **Security:** Zero data breaches

### Event Tracking
```typescript
// Key events tracked
- issue_viewed
- comment_posted  
- poll_voted
- search_performed
- user_registered
```

## 14. TODO / Backlog

### High Priority
- [ ] Mobile app responsive improvements
- [ ] Advanced search filters (date range, score)
- [ ] Email notifications for comments
- [ ] Bookmark/save functionality

### Medium Priority  
- [ ] Rich text editor for posts
- [ ] User profile customization
- [ ] Issue recommendation engine
- [ ] Bulk admin operations

### Technical Debt
- [ ] Refactor large components (Dashboard.tsx >400 lines)
- [ ] Implement proper error boundaries
- [ ] Add comprehensive TypeScript coverage
- [ ] Optimize bundle splitting

## 15. Revision History

| Date | Author | Change Summary |
|------|--------|----------------|
| 2025-06-04 | lovable | Created initial knowledge base with complete app documentation |
