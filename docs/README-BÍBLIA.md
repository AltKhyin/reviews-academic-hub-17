
---
app: Reviews
version: "1.3.0"
updated: 2025-06-06
maintainer: lovable
frontend: React 18 / Vite / Tailwind CSS / TypeScript
backend: Supabase (PostgreSQL + Edge Functions)
bundleBudgets:
  - dashboard: 300kB
  - sidebar: 40kB
  - search: 80kB
  - native_editor: 400kB
routes:
  public: ["/", "/auth"]
  protected: ["/dashboard", "/community", "/search", "/edit", "/profile"]
  editor: ["/edit/issue/new", "/edit/issue/:id"]
---

# 📚 Reviews.app — Master Knowledge Base

## 1. Purpose & Pitch

**What:** Academic journal review platform focused on "Competência em 10 minutos" - quick, digestible medical research insights with revolutionary native block editor.

**Target Users:** Medical professionals, researchers, students seeking curated, expert-reviewed content in both traditional PDF and interactive native formats.

**Core Value:** Transform dense academic papers into accessible, expert-reviewed summaries with community discussion, interactive engagement features, and cutting-edge native content creation capabilities.

**Key Differentiator:** First medical review platform combining academic rigor with modern social features AND a native block editor for creating interactive, structured, and semantically rich review content that surpasses traditional PDF limitations.

## 2. Glossary

| Term | Definition |
|------|------------|
| Issue | Individual publication/article with PDF, metadata, interactive features, and discussion |
| Review | Editorial commentary on academic papers from verified reviewers |
| Native Review | Interactive, block-based review created with the native editor (vs traditional PDF) |
| Review Block | Atomic content unit in native reviews (heading, paragraph, snapshot_card, etc.) |
| Snapshot Card | Specialized block for PICOD data with evidence levels and findings |
| Custom Badges | User-configurable labels for evidence quality and recommendation strength |
| Finding Sections | Categorized lists of study findings with color-coded importance |
| Grid Layout | Multi-column layout system supporting 1-4 blocks per row with drag-and-drop |
| Inline Settings | Direct editing interface without modal dialogs or side panels |
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
│ • Community     │    │ • RPC Functions  │    │ • Review Blocks │
│ • Search        │    │ • Real-time      │    │ • Comments      │
│ • Admin Panel   │    │ • Storage        │    │ • Profiles      │
│ • Native Editor │    │ • Edge Functions │    │ • Polls         │
│ • Interactions  │    │ • File Upload    │    │ • Reactions     │
│ • Bookmarks     │    │                  │    │ • Bookmarks     │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

**Tech Stack:**
- Frontend: React 18, TypeScript, Tailwind CSS, Shadcn/UI
- Editor: Custom block-based system with ResizablePanelGroup, drag-and-drop
- Backend: Supabase (PostgreSQL 15, Edge Functions, Real-time)
- Auth: Supabase Auth with email/password + role-based access
- State: React Query (data), Zustand (sidebar), React Context (auth), useBlockManagement (editor)
- Routing: React Router DOM
- UI: Custom design system with dark theme, serif typography, interactive components

## 4. User Journeys

### New User Flow
1. **Landing** → `/` → Auth prompts → `/auth`
2. **Registration** → Email verification → Profile creation
3. **Onboarding** → Dashboard → First issue view → Interactive tutorial
4. **Engagement** → Reactions → Bookmarks → Comments → Community participation

### Core Usage Patterns
- **Reader:** Browse issues → React (like/dislike/want_more) → Bookmark → Read PDFs/Native Reviews → Comment/discuss
- **Content Creator/Editor:** Create native reviews → Configure blocks → Use inline settings → Layout in grids → Publish
- **Community Member:** Create posts → Vote on polls → Participate in discussions → Submit content suggestions
- **Editor/Admin:** Manage content → Add reviewer comments → Moderate discussions → Configure settings

### Native Editor Workflows
- **Creating Reviews:** Use block palette → Drag blocks → Configure inline → Arrange in grids → Save/export
- **Editing Content:** Click blocks → Use inline settings → Adjust colors/alignment → Manage layouts
- **Advanced Features:** Create custom badges → Configure finding sections → Import/export content
- **Collaboration:** Share drafts → Import from external sources → Use templates

### Interaction Flows
- **Article Engagement:** Hover → See action buttons → Click → Immediate visual feedback → Toast confirmation
- **Suggestion Submission:** Type suggestion → Submit → Real-time addition to suggestion list → Vote
- **Bookmark Management:** Click bookmark → Instant visual state change → Access via profile
- **Native Editing:** Select block → Inline settings appear → Direct modification → Auto-save

## 5. Domain Modules Index

### 5.1 Issues Management

**Owner:** Admin/Editor  
**Routes:** `/dashboard`, `/article/[id]`, `/edit/issue/[id]`  
**Primary KPI:** Weekly issue publications + user engagement metrics + native review adoption

#### Responsibilities
- PDF-based academic paper reviews with interactive features
- **NEW:** Native block-based reviews with advanced layouts and inline editing
- Metadata management (authors, specialty, scores, reactions)
- Publication workflow (draft → published → featured)
- Dual-view mode (article + PDF side-by-side OR native editor)
- User engagement tracking (reactions, bookmarks, views)
- Review type management (PDF vs Native vs Hybrid)

#### UI Components
| Name | Path | Props |
|------|------|-------|
| CarouselArticleCard | `src/components/dashboard/CarouselArticleCard.tsx` | issue, className |
| ArticleRow | `src/components/dashboard/ArticleRow.tsx` | title, articles |
| HeroSection | `src/components/dashboard/HeroSection.tsx` | featuredIssue |
| IssueEditor | `src/pages/dashboard/IssueEditor.tsx` | id (optional) |
| **NativeEditor** | `src/components/editor/NativeEditor.tsx` | issueId, initialBlocks, onSave |
| **BlockEditor** | `src/components/editor/BlockEditor.tsx` | blocks, onUpdateBlock |
| **BlockPalette** | `src/components/editor/BlockPalette.tsx` | onBlockAdd |

#### Interactive Features
- **Hover Actions:** Tooltips on action buttons, specialty tag hiding
- **Reactions System:** Like, dislike, want_more with real-time updates
- **Bookmark System:** Save/unsave with immediate visual feedback
- **Authentication Guards:** Login prompts for unauthenticated users
- **Native Editing:** Inline block configuration, grid layouts, drag-and-drop organization

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
  description TEXT,
  review_type TEXT DEFAULT 'pdf' -- 'pdf', 'native', 'hybrid'
);

CREATE TABLE review_blocks (
  id BIGINT PRIMARY KEY,
  issue_id UUID NOT NULL,
  type TEXT NOT NULL,
  payload JSONB NOT NULL,   -- Stores block content
  meta JSONB DEFAULT '{}',  -- Includes layout metadata
  sort_index INTEGER NOT NULL,
  visible BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Existing tables remain the same
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

### 5.2 Native Editor System ✨ NEW MODULE

**Owner:** Editorial/Tech Team  
**Routes:** `/edit/issue/new`, `/edit/issue/:id` (content tab)  
**Primary KPI:** Native review creation rate + editor usability + content quality

#### Responsibilities
- Block-based content creation with 10+ block types
- Inline settings system eliminating modal complexity
- Grid layout management with drag-and-drop support
- Import/export system with automatic migration
- Real-time auto-save and change tracking
- Advanced features: custom badges, finding sections, color management

#### Core Components
| Name | Path | Purpose |
|------|------|---------|
| **NativeEditor** | `src/components/editor/NativeEditor.tsx` | Main editor container (202 lines) |
| **BlockEditor** | `src/components/editor/BlockEditor.tsx` | Block rendering and layout |
| **BlockPalette** | `src/components/editor/BlockPalette.tsx` | Block type selection |
| **ImportExportManager** | `src/components/editor/ImportExportManager.tsx` | Data import/export (538 lines) |
| **ResizableGrid** | `src/components/editor/layout/ResizableGrid.tsx` | Grid layout system |
| **InlineBlockSettings** | `src/components/editor/inline/InlineBlockSettings.tsx` | Inline configuration |

#### Block Types & Status
| Block Type | Status | Inline Settings | Features |
|------------|--------|-----------------|----------|
| **heading** | ✅ Complete | Level, anchor, colors | H1-H6, auto-anchor |
| **paragraph** | ✅ Complete | Alignment, emphasis, colors | Rich text, styling |
| **snapshot_card** | ✅ Complete | PICOD fields, badges, findings | Evidence levels, custom badges |
| **figure** | ⚠️ Partial | Caption only | Image display, needs alignment |
| **table** | ⚠️ Partial | Basic editing | Static tables, needs controls |
| **callout** | ⚠️ Partial | Type, content | Info boxes, needs type selector |
| **number_card** | ❌ Not implemented | - | Statistics display |
| **reviewer_quote** | ❌ Not implemented | - | Expert testimonials |
| **poll** | ❌ Not implemented | - | Interactive voting |
| **citation_list** | ❌ Not implemented | - | Reference management |

#### Advanced Features
```typescript
// Custom Badges System
interface CustomBadge {
  id: string;
  label: string;      // "Evidência", "Recomendação"
  value: string;      // "Alta", "Forte"
  color: string;      // Text color
  background_color: string; // Background color
}

// Finding Sections System
interface FindingSection {
  id: string;
  label: string;      // "Principais Achados"
  items: FindingItem[];
}

interface FindingItem {
  id: string;
  text: string;       // Finding description
  color: string;      // Indicator color
}

// Grid Layout System
interface ExtendedLayoutMeta {
  row_id: string;     // Row identifier
  position: number;   // Position in row (0-3)
  columns: number;    // Total columns in row
  gap: number;        // Column spacing
  columnWidths?: number[]; // Width percentages
}
```

#### State Management Hooks
| Hook | Purpose | File |
|------|---------|------|
| **useBlockManagement** | Core block CRUD operations | `src/hooks/useBlockManagement.ts` |
| **useGridLayoutManager** | Grid layout computation | `src/hooks/useGridLayoutManager.ts` |
| **useEnhancedGridOperations** | Advanced grid operations | `src/hooks/useEnhancedGridOperations.ts` |
| **useEditorAutoSave** | Auto-save functionality | `src/hooks/useEditorAutoSave.ts` |

#### Data Flow
1. **Creation:** BlockPalette → addBlock() → ReviewBlock created
2. **Editing:** InlineSettings → updateBlock() → content/meta updated
3. **Layout:** DragDrop → gridOperations → layout metadata synced
4. **Persistence:** AutoSave → Supabase → review_blocks table
5. **Loading:** Supabase → payload→content mapping → ReviewBlock[]

### 5.3 Community System

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

### 5.4 Reviewer Comments System

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

### 5.5 Sidebar Ecosystem

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

### 5.6 Authentication & Authorization

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
- **Editor:** Content creation, reviewer comments, user management, native editor access  
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

### 5.7 Search & Discovery

**Owner:** Product Team  
**Routes:** `/search`  
**Primary KPI:** Search success rate

#### Responsibilities
- Full-text search across issues (PDF and native)
- Filter by specialty, year, authors, review type
- Search result ranking and relevance
- Search history and suggestions
- Native review content indexing

#### UI Components
| Name | Path | Props |
|------|------|-------|
| SearchPage | `src/pages/dashboard/SearchPage.tsx` | - |
| SearchResultCard | `src/components/search/SearchResultCard.tsx` | issue |

### 5.8 Admin Panel

**Owner:** Admin Team  
**Routes:** `/edit`  
**Primary KPI:** Content management efficiency

#### Responsibilities
- Issue creation and editing (both PDF and native)
- User role management
- Reviewer comments management
- Community settings configuration
- Content moderation tools
- Native editor access and advanced features

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
| `issues` | Academic papers/reviews | → `review_blocks`, `comments`, `reactions`, `bookmarks` |
| `review_blocks` | **NEW:** Native review content blocks | → `issues` |
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

-- **NEW:** Native review functions
get_review_with_blocks(review_id UUID) → JSONB
```

### Row Level Security Patterns
- **User Ownership:** `user_id = auth.uid()`
- **Published Content:** `published = true OR user_id = auth.uid()`
- **Admin Only:** `is_current_user_admin()` OR `is_current_user_editor_or_admin()`
- **Reactions & Bookmarks:** User-scoped with proper cascade deletes
- **Review Blocks:** Editor/admin creation, public read for published reviews

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

### **Native Editor Components ✨ NEW**
- `NativeEditor.tsx` - Main editor with toolbar and split-screen capability
- `BlockEditor.tsx` - Block rendering with grid layout support  
- `BlockPalette.tsx` - Drag-and-drop block type selection
- `ResizableGrid.tsx` - Multi-column layout with drag-and-drop
- `InlineBlockSettings.tsx` - Settings overlay for blocks
- `InlineTextEditor.tsx` - Direct text editing component
- `InlineColorPicker.tsx` - Color selection for blocks
- `InlineAlignmentControls.tsx` - Text alignment controls
- `CustomBadgesManager.tsx` - Badge creation and management
- `FindingSectionsManager.tsx` - Findings organization
- `ImportExportManager.tsx` - Content backup and migration

### **Block Components**
- `HeadingBlock.tsx` - Headers with anchor generation
- `ParagraphBlock.tsx` - Rich text paragraphs
- `SnapshotCardBlock.tsx` - PICOD evidence summary cards
- `FigureBlock.tsx` - Image display with captions
- `TableBlock.tsx` - Data tables with sorting
- `CalloutBlock.tsx` - Information highlights
- `NumberCard.tsx` - Statistical displays (not implemented)
- `ReviewerQuote.tsx` - Expert testimonials (not implemented)
- `PollBlock.tsx` - Interactive polls (not implemented)
- `CitationListBlock.tsx` - Reference lists (not implemented)

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
/* Primary Brand Colors — Monochrome only */
--primary: 0 0% 100%;          /* White as default "accent" (for text/icons/buttons) */
--secondary: 0 0% 12%;         /* Card/side menu background (#1f1f1f) */
--background: 0 0% 7%;         /* Main background (#121212) */
--foreground: 0 0% 96%;        /* Primary text (#f5f5f5) */

/* Status Colors — Semantic only, used sparingly */
--success: 142 76% 36%;        /* Keep green for "online" indicators etc */
--warning: 38 92% 50%;         /* Reserved for alerts/tooltips if necessary */
--destructive: 0 84% 60%;      /* For delete/danger zones */

/* Interactive States — Grayscale transparency only */
--hover: rgba(255, 255, 255, 0.06);    /* Subtle highlight on hover */
--active: rgba(255, 255, 255, 0.12);   /* Slightly stronger for pressed state */
--disabled: rgba(255, 255, 255, 0.24); /* Muted elements */

/* **NEW:** Editor-specific colors */
--editor-bg: #121212;        /* Editor background */
--panel-bg: #1a1a1a;        /* Panel background */
--border-subtle: #2a2a2a;   /* Subtle borders */
--accent-blue: #3b82f6;     /* Blue accents */
--accent-green: #10b981;    /* Success/evidence */
--accent-yellow: #f59e0b;   /* Warning/moderate */
--accent-red: #ef4444;      /* Error/low evidence */
```

### Typography
- **Primary:** Inter (sans-serif for body text)
- **Brand:** Playfair Display (serif for logo and headings)
- **Code:** `font-mono` (system monospace)
- **Scale:** text-sm (14px) → text-base (16px) → text-lg (18px) → text-xl+ (20px+)

### **Native Editor Design Patterns ✨ NEW**
- **Inline Editing:** Direct content modification without modals
- **Grid Layouts:** Visual column organization with drag-and-drop
- **Color Coding:** Semantic colors for evidence levels and findings
- **Progressive Disclosure:** Advanced settings revealed on demand
- **Spatial Organization:** Block relationships conveyed through layout

### Interactive Design Patterns
- **Hover Effects:** Opacity transitions, scale transforms, color shifts
- **Loading States:** Skeleton screens, spinner animations
- **Feedback:** Toast notifications, instant visual state changes
- **Tooltips:** Contextual labels for all interactive elements
- **Drag & Drop:** Visual feedback, drop zones, smooth transitions

### Spacing & Layout
- **Responsive Containers:** `container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12` for consistent full-width layouts
- **Grid Systems:** CSS Grid for community layout (grid-cols-[1fr_320px]), Flexbox for others
- **Editor Grids:** ResizablePanelGroup with dynamic column management
- **Spacing:** 4px base unit (space-1 through space-16)
- **Layout Strategy:** Route-conditional mounting prevents ghost elements and layout gaps

## 9. Accessibility Contract

### ARIA Implementation
- All interactive elements have `aria-label` or `aria-labelledby`
- Form inputs use `aria-describedby` for error messages
- Navigation uses `role="navigation"` and `aria-current`
- Tooltips properly associated with trigger elements
- **NEW:** Block editor maintains focus management during drag operations

### Keyboard Navigation
- Tab order follows logical reading flow
- All modals trap focus
- Escape key closes overlays
- Enter/Space activate buttons
- Arrow keys navigate carousels
- **NEW:** Editor blocks support keyboard-only navigation and editing

### Color & Contrast
- Minimum 4.5:1 contrast ratio for normal text
- 3:1 for large text and UI elements
- Color never sole indicator of state
- High contrast mode compatibility
- **NEW:** Editor color picker ensures accessible color combinations

### Screen Reader Support
- Semantic HTML structure
- Proper heading hierarchy
- Alternative text for images
- Status announcements for dynamic content
- **NEW:** Block type announcements and layout descriptions

## 10. Performance Budgets

### Bundle Sizes
- **Main bundle:** <300kB gzipped
- **Dashboard chunk:** <200kB
- **Community chunk:** <150kB
- **Admin chunk:** <100kB
- **Native Editor chunk:** <400kB (NEW - includes block system)
- **Component chunks:** <50kB each

### API Performance
- **Database queries:** <200ms p95
- **Authentication:** <1s login flow
- **Search:** <500ms response time
- **Real-time updates:** <100ms latency
- **Image loading:** Progressive with placeholders
- **Block operations:** <50ms for CRUD operations (NEW)

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
- **Editor Optimization:** Virtualized block rendering for large reviews (NEW)

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
- **NEW:** Review content versioning and audit trails

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

-- **NEW:** Review blocks access
CREATE POLICY "Review blocks read access"
  ON review_blocks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM issues 
      WHERE id = review_blocks.issue_id 
      AND published = true
    )
    OR is_current_user_editor_or_admin()
  );
```

**Key Security Fix (v1.1.0):** Eliminated infinite recursion in admin RLS policies by migrating from self-referential `admin_users` queries to profile-based authorization functions. All admin checks now use `profiles.role` as canonical source.

## 12. Admin & Ops

### Content Management Workflow
1. **Draft Creation** → Editor creates issue in draft state (PDF or native)
2. **Content Development** → Use native editor for structured reviews OR upload PDF
3. **Review Process** → Content review and metadata validation  
4. **Publication** → Issue published and appears in dashboard
5. **Community** → Auto-generated discussion post created
6. **Analytics** → Engagement tracking begins
7. **Reviewer Comments** → Expert commentary added via admin panel

### Native Editor Workflow ✨ NEW
1. **Issue Creation** → Basic metadata and type selection (PDF/Native/Hybrid)
2. **Block Composition** → Use BlockPalette to add content blocks
3. **Inline Configuration** → Configure each block's settings directly
4. **Layout Organization** → Arrange blocks in grids via drag-and-drop
5. **Advanced Features** → Add custom badges, finding sections, colors
6. **Preview & Validation** → Split-screen preview with error checking
7. **Export/Backup** → Save as JSON with migration support

### Key Admin Functions
- **Issue Management:** Create, edit, publish, feature issues (PDF and native)
- **Native Editor Access:** Full editor privileges with advanced features
- **User Roles:** Promote users to editor/admin status via profiles table
- **Community Moderation:** Pin posts, manage reports
- **Reviewer Comments:** Add, edit, delete expert commentary
- **System Configuration:** Sidebar settings, polls, announcements
- **Content Suggestions:** Review and manage user submissions
- **Block Management:** Import/export templates, validate content structure

### Deployment Process
- **Staging:** Automatic deployment on PR
- **Production:** Manual approval required
- **Database:** Migrations via Supabase CLI (includes review_blocks schema)
- **Assets:** Automatic optimization and CDN
- **Monitoring:** Real-time error tracking and performance metrics

## 13. Analytics & KPIs

### Product Metrics
- **MAU:** Monthly Active Users
- **Issue Engagement:** Views, reactions, bookmarks, comments, time on page
- **Native vs PDF:** Adoption rates, user preferences, engagement comparison (NEW)
- **Editor Usage:** Block creation frequency, layout complexity, feature adoption (NEW)
- **Community Health:** Posts per week, comment threads, suggestion submissions
- **Search Success:** Query → result → engagement rate
- **Interactive Features:** Reaction rates, bookmark rates, suggestion voting
- **Layout Performance:** Full-width utilization metrics, sidebar engagement rates

### **Native Editor Metrics ✨ NEW**
- **Creation Metrics:** Reviews created, blocks per review, editor session time
- **Feature Adoption:** Grid usage, custom badges, finding sections, color customization
- **User Experience:** Inline settings usage, import/export frequency, error rates
- **Content Quality:** Review completion rates, publication rates, user feedback

### Technical Metrics
- **Error Rates:** <1% 4xx, <0.1% 5xx
- **Performance:** Core Web Vitals compliance
- **Availability:** >99.9% uptime
- **Security:** Zero data breaches, successful auth rate
- **Layout Efficiency:** Zero phantom element detection, optimal content width usage
- **Editor Performance:** Block operation latency, auto-save reliability (NEW)

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
- layout_width_utilized
// **NEW:** Native editor events
- native_review_created
- block_added (type: heading/paragraph/etc)
- grid_layout_used
- inline_settings_opened
- custom_badge_created
- finding_section_added
- review_exported
- content_imported
```

### User Engagement Metrics
- **Session Duration:** Average time spent per visit
- **Feature Adoption:** % users using reactions, bookmarks, suggestions, native editor
- **Content Quality:** Ratio of positive to negative reactions
- **Community Growth:** New users per week, retention rates
- **Layout UX:** Full-width vs constrained layout user satisfaction
- **Editor UX:** Native vs PDF creation preferences, editor tool usage

## 14. TODO / Backlog

### High Priority
- [ ] Complete inline settings for figure, table, callout blocks
- [ ] Implement 4 missing block types (number_card, reviewer_quote, poll, citation_list)
- [ ] Mobile app responsive improvements for native editor
- [ ] Advanced search filters (date range, score, engagement metrics, review type)
- [ ] Email notifications for reactions and comments

### **Native Editor Priority ✨**
- [ ] Multi-row grid system (2x2, 3x2, etc.) - **15-20 prompts estimated**
- [ ] Block templates and saved configurations
- [ ] Real-time collaborative editing
- [ ] Version history and diff visualization
- [ ] Advanced import from Word/Google Docs
- [ ] Export to multiple formats (PDF, Word, Markdown)
- [ ] Block commenting and review workflow
- [ ] Custom CSS injection for advanced styling

### Medium Priority  
- [ ] Rich text editor for posts and comments
- [ ] User profile customization and achievement system
- [ ] Issue recommendation engine based on user preferences
- [ ] Bulk admin operations for content management
- [ ] Advanced analytics dashboard for admins
- [ ] Native review SEO optimization

### Interactive Features
- [ ] Reaction analytics for content creators
- [ ] Bookmark collections and sharing
- [ ] Collaborative filtering for recommendations
- [ ] Gamification elements (badges, streaks)
- [ ] Social features (follow users, activity feeds)
- [ ] Native review sharing and embedding

### Technical Debt
- [ ] Refactor large components (NativeEditor.tsx >200 lines, ImportExportManager.tsx >500 lines)
- [ ] Implement proper error boundaries throughout app
- [ ] Add comprehensive TypeScript coverage for all editor hooks
- [ ] Optimize bundle splitting for better performance
- [ ] Standardize loading states across all components
- [ ] Create comprehensive test suite for native editor

## 15. Revision History

| Date | Author | Change Summary |
|------|--------|----------------|
| 2025-06-06 | lovable | **v1.3.0 - Native Editor Integration:** Added comprehensive native editor documentation, block system architecture, inline settings, grid layouts, import/export system, and updated all modules to reflect dual PDF/native capabilities |
| 2025-06-04 | lovable | Created initial knowledge base with complete app documentation |
| 2025-06-04 | lovable | Fixed infinite-recursion RLS on admin_users; migrated to profile-based auth |
| 2025-06-04 | lovable | Added interactive features: reactions, bookmarks, tooltips, suggestions |
| 2025-06-04 | lovable | Fixed reviewer comments system, spacing issues, comprehensive review |
| 2025-06-04 | lovable | **Layout Revolution v1.2.0:** Eliminated layout gaps through conditional sidebar mounting and full-width responsive containers |
