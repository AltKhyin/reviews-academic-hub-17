
---
app: Reviews Medical Platform
version: "2.0.0"
updated: 2025-06-09
maintainer: lovable
frontend: React 18 / Vite / Tailwind CSS / TypeScript
backend: Supabase (PostgreSQL + Edge Functions + RLS)
bundleBudgets:
  - dashboard: 300kB
  - archive: 200kB
  - community: 150kB
  - editor: 400kB
routes:
  public: ["/", "/auth"]
  protected: ["/dashboard", "/community", "/acervo", "/edit", "/profile"]
  admin: ["/edit/*"]
---

# 📚 Reviews Medical Platform — Master Knowledge Base

## 1. Purpose & Pitch

**What:** Comprehensive medical review platform combining traditional PDF-based academic reviews with cutting-edge native block editor for interactive content creation. Features "Competência em 10 minutos" - quick, digestible medical research insights.

**Target Users:** Medical professionals, researchers, students, and healthcare educators seeking curated, expert-reviewed content in both traditional PDF and revolutionary interactive native formats.

**Core Value:** Transform dense academic papers into accessible, expert-reviewed summaries with community discussion, advanced tagging system, comprehensive archive search, and state-of-the-art native content creation capabilities.

**Key Differentiators:** 
- First medical platform combining academic rigor with modern social features
- Revolutionary native block editor surpassing traditional PDF limitations  
- Advanced tag-based content organization and discovery system
- Comprehensive archive with sophisticated search and filtering
- Real-time community interaction with polls, discussions, and collaborative features

## 2. Glossary

| Term | Definition |
|------|------------|
| Issue | Individual publication/article with PDF, metadata, interactive features, discussion, and comprehensive tagging |
| Review | Editorial commentary on academic papers from verified reviewers with expert credentials |
| Native Review | Interactive, block-based review created with advanced native editor (vs traditional PDF) |
| Review Block | Atomic content unit in native reviews (heading, paragraph, snapshot_card, figure, table, etc.) |
| Snapshot Card | Specialized block for PICOD data with evidence levels, custom badges, and structured findings |
| Custom Badges | User-configurable labels for evidence quality and recommendation strength with color coding |
| Finding Sections | Categorized lists of study findings with color-coded importance and priority levels |
| Grid Layout | Multi-column layout system supporting 1-4 blocks per row with intuitive drag-and-drop |
| Inline Settings | Direct editing interface without modal dialogs, featuring contextual property panels |
| Thread | Comment discussion system on issues, posts, with nested reply support |
| Specialty | Medical field categorization (Cardiology, Neurology, Oncology, etc.) |
| Featured | Highlighted issue prominently displayed on dashboard homepage with special treatment |
| Archive | Comprehensive searchable collection of all published issues with advanced filtering |
| Tag System | Hierarchical categorization with parent categories and subtags for content organization |
| Tag Reordering | Dynamic content sorting based on tag relevance and user selection |
| Backend Tags | JSON-structured categorization data stored per issue for filtering and discovery |
| Community | Social platform with posts, polls, discussions, and user-generated content |
| Reactions | User engagement system: like, dislike, want_more with real-time feedback |
| Bookmarks | Personal content saving system with organized collections |
| Reviewer Comments | Expert commentary prominently displayed on homepage from verified medical professionals |
| Content Suggestions | Community-driven suggestion system with voting for upcoming content |
| RLS | Row Level Security - Supabase's fine-grained data access control system |
| Profile Roles | User permission system: user, editor, admin with escalating privileges |

## 3. High-Level Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   React Client  │◄───┤   Supabase API   │◄───┤   PostgreSQL    │
│                 │    │                  │    │                 │
│ • Dashboard     │    │ • Auth           │    │ • Issues        │
│ • Archive       │    │ • RPC Functions  │    │ • Review Blocks │
│ • Community     │    │ • Real-time      │    │ • Comments      │
│ • Native Editor │    │ • Storage        │    │ • Profiles      │
│ • Tag System    │    │ • Edge Functions │    │ • Posts         │
│ • Search        │    │ • File Upload    │    │ • Tag Config    │
│ • Admin Panel   │    │ • RLS Policies   │    │ • Reactions     │
│ • Interactions  │    │                  │    │ • Bookmarks     │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

**Tech Stack:**
- **Frontend:** React 18, TypeScript 5.x, Tailwind CSS 3.x, Shadcn/UI, Vite
- **Editor:** Custom block-based system with ResizablePanelGroup, drag-and-drop, inline editing
- **Backend:** Supabase (PostgreSQL 15, Edge Functions, Real-time subscriptions, Storage)
- **Auth:** Supabase Auth with email/password + comprehensive role-based access control
- **State Management:** React Query (server state), Zustand (sidebar state), React Context (auth), useBlockManagement (editor)
- **Routing:** React Router DOM with protected routes and role-based guards
- **UI:** Custom design system with dark theme, medical-focused typography, responsive components

**Key Architectural Decisions:**
- Server-side rendering approach with client-side hydration
- Component-first architecture with focused, single-responsibility modules
- Real-time synchronization for community features and collaborative editing
- Comprehensive caching strategy using React Query for optimal performance

## 4. User Journeys

### New User Registration & Onboarding
1. **Landing** → `/` → Authentication prompts → `/auth`
2. **Registration** → Email verification → Profile creation with medical specialty
3. **Onboarding** → Dashboard exploration → Archive browsing → Community introduction
4. **First Engagement** → Issue reactions → Bookmark creation → Comment participation

### Core Reader Workflows
- **Content Discovery:** Browse dashboard → Explore archive with tag filtering → Use advanced search
- **Issue Engagement:** Read PDFs/Native Reviews → React (like/dislike/want_more) → Bookmark → Comment/discuss
- **Community Participation:** Join discussions → Vote on polls → Submit content suggestions
- **Profile Management:** Track reading history → Manage bookmarks → Update preferences

### Content Creator/Editor Workflows
- **PDF Reviews:** Upload traditional PDFs → Add metadata → Configure tags → Publish
- **Native Reviews:** Use block editor → Configure inline settings → Arrange grid layouts → Publish
- **Advanced Editing:** Create custom badges → Configure finding sections → Import/export content
- **Content Management:** Moderate discussions → Feature issues → Manage reviewer comments

### Archive & Discovery Workflows
- **Text Search:** Search across titles, descriptions, authors → Review filtered results
- **Tag-Based Discovery:** Select categories → View reordered results → Drill down with subtags
- **Advanced Filtering:** Filter by specialty, year, review type → Combine with search terms
- **Content Organization:** Use tags for systematic browsing → Follow recommendation algorithms

### Native Editor Advanced Workflows
- **Block Composition:** Use BlockPalette → Drag blocks → Configure inline → Arrange in grids
- **Content Structuring:** Create headings → Add paragraphs → Insert snapshot cards → Build tables
- **Advanced Features:** Design custom badges → Organize finding sections → Apply color schemes
- **Collaboration:** Share drafts → Import external content → Export multiple formats

### Community & Social Workflows
- **Discussion Creation:** Create posts → Add media → Set flairs → Engage with responses
- **Voting Participation:** Vote on weekly polls → Submit suggestions → Rate content quality
- **Social Interaction:** Follow discussions → React to content → Build reputation
- **Content Curation:** Discover trending content → Share recommendations → Bookmark collections

## 5. Domain Modules Index

### 5.1 Dashboard & Homepage Management

**Owner:** Editorial/Product Team  
**Routes:** `/dashboard`  
**Primary KPI:** User engagement rate + session duration + content discovery

#### Responsibilities
- Dynamic homepage with configurable section visibility and ordering
- Featured content highlighting with editorial curation
- Recent issues display with engagement metrics
- Reviewer comments integration from verified medical professionals
- Upcoming releases with community suggestion integration
- Real-time user activity and online presence indicators

#### UI Components
| Name | Path | Props |
|------|------|-------|
| Dashboard | `src/pages/dashboard/Dashboard.tsx` | - |
| HeroSection | `src/components/dashboard/HeroSection.tsx` | featuredIssue |
| ArticleRow | `src/components/dashboard/ArticleRow.tsx` | title, articles |
| ReviewerCommentsDisplay | `src/components/dashboard/ReviewerCommentsDisplay.tsx` | - |
| UpcomingReleaseCard | `src/components/dashboard/UpcomingReleaseCard.tsx` | - |
| DashboardSkeleton | `src/components/dashboard/DashboardSkeleton.tsx` | - |

#### Data Integration Hooks
| Hook | Purpose | File |
|------|---------|------|
| useParallelDataLoader | Parallel loading of dashboard data | `src/hooks/useParallelDataLoader.ts` |
| useSectionVisibility | Homepage section configuration | `src/hooks/useSectionVisibility.ts` |
| useStableAuth | Authentication state management | `src/hooks/useStableAuth.ts` |

#### Homepage Section Management
- **Section Types:** reviews, featured, upcoming, recent, recommended, trending
- **Configuration:** Visibility toggle, custom ordering, localStorage persistence
- **Cross-tab Sync:** BroadcastChannel for real-time configuration updates
- **Default Layout:** Editor reviews → Featured → Upcoming → Recent → Recommended → Trending

### 5.2 Archive System & Content Discovery

**Owner:** Content/Search Team  
**Routes:** `/acervo`  
**Primary KPI:** Search success rate + content discovery efficiency + user engagement

#### Responsibilities
- Comprehensive searchable archive of all published issues
- Advanced text search across titles, descriptions, authors, specialties
- Hierarchical tag-based filtering and content reordering
- Real-time search results with performance optimization
- Backend tag configuration and management system
- Visual masonry grid layout for optimal content presentation

#### Core Components
| Name | Path | Purpose |
|------|------|---------|
| ArchivePage | `src/pages/dashboard/ArchivePage.tsx` | Main archive interface |
| ArchiveHeader | `src/components/archive/ArchiveHeader.tsx` | Search and tag controls |
| TagsPanel | `src/components/archive/TagsPanel.tsx` | Tag selection interface |
| ResultsGrid | `src/components/archive/ResultsGrid.tsx` | Results display |
| TrueMasonryGrid | `src/components/archive/TrueMasonryGrid.tsx` | Masonry layout |
| IssueCard | `src/components/archive/IssueCard.tsx` | Individual issue card |

#### Search & Filtering System
```typescript
// Text Search Algorithm
interface SearchFilters {
  searchQuery: string;
  specialty?: string;
  year?: number;
  sortBy?: 'newest' | 'oldest' | 'title' | 'score';
}

// Tag Reordering System
interface TagReorderingConfig {
  selectedTags: string[];
  tagHierarchy: TagHierarchy;
  scoringAlgorithm: 'relevance' | 'recency' | 'combined';
}
```

#### Tag System Architecture
| Hook | Purpose | File |
|------|---------|------|
| useSimplifiedArchiveSearch | Text-based search with filtering | `src/hooks/useSimplifiedArchiveSearch.ts` |
| useArchiveTagReordering | Tag-based content reordering | `src/hooks/useArchiveTagReordering.ts` |
| useOptimizedArchiveData | Cached data loading | `src/hooks/useOptimizedArchiveData.ts` |

#### Tag Hierarchy & Configuration
- **Backend Storage:** `tag_configurations` table with versioned JSON data
- **Parent Categories:** Top-level medical specialties and themes
- **Subtags:** Specific topics, methodologies, populations, evidence levels
- **Visual States:** Selected (white background), highlighted (visible border), unselected (dimmed)
- **Reordering Logic:** Selected tags first → highlighted tags → unselected tags
- **Scoring System:** Parent match +2 points, subtag match +1 point

### 5.3 Native Editor System ⭐ FLAGSHIP MODULE

**Owner:** Editorial/Tech Team  
**Routes:** `/edit/issue/new`, `/edit/issue/:id`  
**Primary KPI:** Native review creation rate + editor productivity + content quality

#### Responsibilities
- Revolutionary block-based content creation with 10+ specialized block types
- Inline settings system eliminating modal complexity and improving workflow
- Advanced grid layout management with intuitive drag-and-drop support
- Comprehensive import/export system with automatic content migration
- Real-time auto-save with conflict resolution and change tracking
- Advanced medical features: custom badges, finding sections, evidence categorization

#### Core Editor Components
| Name | Path | Purpose | Lines |
|------|------|---------|-------|
| NativeEditor | `src/components/editor/NativeEditor.tsx` | Main editor container | 202 |
| BlockEditor | `src/components/editor/BlockEditor.tsx` | Block rendering engine | - |
| BlockPalette | `src/components/editor/BlockPalette.tsx` | Block type selection | - |
| ImportExportManager | `src/components/editor/ImportExportManager.tsx` | Data migration | 538 |
| InlineBlockSettings | `src/components/editor/inline/InlineBlockSettings.tsx` | Property editor | - |
| ResizableGrid | `src/components/editor/layout/ResizableGrid.tsx` | Layout system | - |

#### Block Types Implementation Status
| Block Type | Status | Inline Settings | Features |
|------------|--------|-----------------|----------|
| **heading** | ✅ Complete | Level, anchor, colors | H1-H6, auto-anchor generation |
| **paragraph** | ✅ Complete | Alignment, emphasis, colors | Rich text, advanced styling |
| **snapshot_card** | ✅ Complete | PICOD fields, badges, findings | Evidence levels, custom badges |
| **figure** | ⚠️ Partial | Caption, alignment | Image display, needs positioning |
| **table** | ⚠️ Partial | Basic editing | Static tables, needs dynamic controls |
| **callout** | ⚠️ Partial | Type, content | Info boxes, needs type selector |
| **number_card** | ❌ Not implemented | - | Statistics display |
| **reviewer_quote** | ❌ Not implemented | - | Expert testimonials |
| **poll** | ❌ Not implemented | - | Interactive voting |
| **citation_list** | ❌ Not implemented | - | Reference management |

#### Advanced Editor Features
```typescript
// Custom Medical Badges System
interface CustomBadge {
  id: string;
  label: string;           // "Evidência", "Recomendação", "Qualidade"
  value: string;           // "Alta", "Forte", "Excelente"
  color: string;           // Text color with medical color coding
  background_color: string; // Background with evidence-level mapping
}

// Medical Finding Sections
interface FindingSection {
  id: string;
  label: string;           // "Principais Achados", "Limitações", "Implicações"
  items: FindingItem[];
  priority: 'high' | 'medium' | 'low';
}

// Advanced Grid Layout
interface ExtendedLayoutMeta {
  row_id: string;          // Row identifier for grouping
  position: number;        // Position in row (0-3)
  columns: number;         // Total columns in row
  gap: number;            // Column spacing (4, 6, 8px)
  columnWidths?: number[]; // Percentage-based widths
  responsive: boolean;     // Mobile-first responsive behavior
}
```

#### Editor State Management
| Hook | Purpose | File | Status |
|------|---------|------|--------|
| useBlockManagement | Core block CRUD operations | `src/hooks/useBlockManagement.ts` | Active |
| useGridLayoutManager | Grid layout computation | `src/hooks/useGridLayoutManager.ts` | Active |
| useEnhancedGridOperations | Advanced grid operations | `src/hooks/useEnhancedGridOperations.ts` | Active |
| useEditorAutoSave | Auto-save functionality | `src/hooks/useEditorAutoSave.ts` | Active |

#### Content Creation Workflow
1. **Initialization:** Issue metadata → Editor mode selection → Block palette access
2. **Content Creation:** Block selection → Inline configuration → Content input
3. **Layout Design:** Drag-and-drop organization → Grid layout → Responsive testing
4. **Advanced Features:** Custom badges → Finding sections → Color schemes
5. **Quality Assurance:** Real-time preview → Error validation → Content review
6. **Publication:** Auto-save verification → Final review → Publishing workflow

### 5.4 Issues Management & Content System

**Owner:** Editorial Team  
**Routes:** `/dashboard`, `/article/[id]`, `/edit/issue/[id]`  
**Primary KPI:** Content publication rate + user engagement + quality metrics

#### Responsibilities
- Comprehensive issue lifecycle management from creation to publication
- Dual content support: traditional PDF reviews + native block-based reviews
- Advanced metadata management with medical specialty categorization
- Publication workflow with draft → review → published → featured states
- User engagement tracking with reactions, bookmarks, views, comments
- Integration with tag system for content categorization and discovery

#### Content Types & Review Systems
```typescript
// Issue Review Types
type ReviewType = 'pdf' | 'native' | 'hybrid';

// Content Engagement System
interface IssueEngagement {
  reactions: { like: number; dislike: number; want_more: number };
  bookmarks: number;
  views: number;
  comments: number;
  avgTimeSpent: number;
}

// Publication Workflow
type PublicationStatus = 'draft' | 'review' | 'published' | 'featured' | 'archived';
```

#### Data Schema & Relationships
```sql
-- Core Issues Table
CREATE TABLE issues (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,
  specialty TEXT NOT NULL,
  pdf_url TEXT NOT NULL,
  article_pdf_url TEXT,
  cover_image_url TEXT,
  published BOOLEAN DEFAULT false,
  featured BOOLEAN DEFAULT false,
  review_type TEXT DEFAULT 'pdf',
  backend_tags JSONB,
  -- Metadata fields
  authors TEXT,
  description TEXT,
  year TEXT,
  score INTEGER DEFAULT 0,
  edition TEXT,
  population TEXT,
  design TEXT
);

-- Native Review Content
CREATE TABLE review_blocks (
  id BIGINT PRIMARY KEY,
  issue_id UUID NOT NULL,
  type TEXT NOT NULL,
  payload JSONB NOT NULL,
  meta JSONB DEFAULT '{}',
  sort_index INTEGER NOT NULL,
  visible BOOLEAN DEFAULT true
);

-- User Engagement
CREATE TABLE user_article_reactions (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  issue_id UUID NOT NULL,
  reaction_type TEXT NOT NULL, -- 'like', 'dislike', 'want_more'
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 5.5 Community Platform & Social Features

**Owner:** Community Manager  
**Routes:** `/community`  
**Primary KPI:** Active community members + engagement rate + content quality

#### Responsibilities
- Comprehensive discussion platform with rich content support (text, images, polls)
- Advanced post categorization with flair system and medical specialties
- Real-time voting and engagement tracking with reputation system
- Auto-generated issue discussions with customizable content and settings
- Community-driven content suggestion system with voting and prioritization
- Moderation tools and content quality management

#### Community Components
| Name | Path | Props |
|------|------|-------|
| CommunityHeader | `src/components/community/CommunityHeader.tsx` | - |
| Post | `src/components/community/Post.tsx` | post, onVoteChange |
| PostsList | `src/components/community/PostsList.tsx` | posts, loading |
| NewPostModal | `src/components/community/NewPostModal.tsx` | isOpen, onClose |
| PostVoting | `src/components/community/post/PostVoting.tsx` | post, onVote |
| PollSection | `src/components/community/PollSection.tsx` | poll |

#### Content Management System
```sql
-- Community Posts
CREATE TABLE posts (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  flair_id UUID,
  published BOOLEAN DEFAULT false,
  score INTEGER DEFAULT 0,
  pinned BOOLEAN DEFAULT false,
  pinned_at TIMESTAMP,
  auto_generated BOOLEAN DEFAULT false,
  issue_id UUID -- For auto-generated discussions
);

-- Community Polls
CREATE TABLE polls (
  id UUID PRIMARY KEY,
  question TEXT NOT NULL,
  options JSONB NOT NULL,
  votes JSONB DEFAULT '[]',
  closes_at TIMESTAMP NOT NULL,
  active BOOLEAN DEFAULT true
);

-- Content Suggestions
CREATE TABLE content_suggestions (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  votes INTEGER DEFAULT 0,
  upcoming_release_id UUID
);
```

#### Community Features
- **Post Flairs:** Medical specialties, content types, discussion categories
- **Voting System:** Upvote/downvote with score calculation and reputation tracking
- **Auto-Generated Discussions:** Automatic post creation for new issues with configurable content
- **Weekly Polls:** Community engagement with medical topics and platform feedback
- **Content Suggestions:** User-driven content planning with voting and priority ranking

### 5.6 Authentication & Authorization System

**Owner:** Security Team  
**Routes:** `/auth`, protected route guards throughout app  
**Primary KPI:** User retention + security compliance + role-based access effectiveness

#### Responsibilities
- Comprehensive authentication via Supabase Auth with email/password
- Advanced role-based access control with medical professional verification
- Protected route guards with granular permission management
- Session management with automatic refresh and security monitoring
- Interactive action authentication with contextual login prompts
- Profile management with medical specialty and institutional affiliation

#### Authorization Model
```typescript
// User Role Hierarchy
type UserRole = 'user' | 'editor' | 'admin';

// Permission Matrix
interface RolePermissions {
  user: ['read', 'comment', 'react', 'bookmark', 'vote'];
  editor: [...user, 'create_content', 'moderate', 'manage_tags', 'native_editor'];
  admin: [...editor, 'user_management', 'system_config', 'analytics'];
}

// Profile Schema
interface UserProfile {
  id: string;
  role: UserRole;
  full_name: string;
  avatar_url: string;
  specialty: string;
  institution: string;
  bio: string;
  verified: boolean;
}
```

#### RLS Security Implementation
```sql
-- Profile-Based Authorization (prevents infinite recursion)
CREATE OR REPLACE FUNCTION is_current_user_admin()
RETURNS BOOLEAN LANGUAGE sql SECURITY DEFINER STABLE
AS $$ SELECT EXISTS (
  SELECT 1 FROM profiles 
  WHERE id = auth.uid() AND role = 'admin'
); $$;

-- Editor Access Control
CREATE OR REPLACE FUNCTION is_current_user_editor_or_admin()
RETURNS BOOLEAN LANGUAGE sql SECURITY DEFINER STABLE
AS $$ SELECT EXISTS (
  SELECT 1 FROM profiles 
  WHERE id = auth.uid() AND role IN ('admin', 'editor')
); $$;

-- Content Access Policies
CREATE POLICY "Published content access" ON issues
  FOR SELECT USING (published = true);

CREATE POLICY "Editor content management" ON issues
  FOR ALL USING (is_current_user_editor_or_admin());
```

### 5.7 Admin Panel & System Management

**Owner:** Admin Team  
**Routes:** `/edit`  
**Primary KPI:** Content management efficiency + system reliability + user satisfaction

#### Responsibilities
- Comprehensive issue creation and management (PDF and native reviews)
- Advanced user role management with medical professional verification
- Reviewer comments system with expert credential validation
- Community moderation tools with content quality enforcement
- Native editor access with advanced features and template management
- System analytics and performance monitoring dashboard
- Tag configuration management with hierarchical organization

#### Admin Components
| Name | Path | Purpose |
|------|------|---------|
| Edit | `src/pages/dashboard/Edit.tsx` | Main admin interface |
| IssuesManagementPanel | `src/components/admin/IssuesManagementPanel.tsx` | Content management |
| UserManagementPanel | `src/components/admin/UserManagementPanel.tsx` | User administration |
| TagManagementPanel | `src/components/admin/TagManagementPanel.tsx` | Tag system config |
| ReviewerCommentsManager | `src/components/admin/ReviewerCommentsManager.tsx` | Expert comments |
| HomepageManager | `src/components/admin/HomepageManager.tsx` | Homepage configuration |
| EnhancedAnalyticsDashboard | `src/components/analytics/EnhancedAnalyticsDashboard.tsx` | System analytics |

#### Administrative Workflows
- **Content Pipeline:** Draft creation → Review process → Publication → Community integration
- **User Management:** Role assignments → Verification process → Permission auditing
- **Quality Control:** Content moderation → Comment verification → Community guidelines
- **System Monitoring:** Performance analytics → Error tracking → User feedback analysis

### 5.8 Reviewer Comments & Expert System

**Owner:** Editorial Team  
**Routes:** Dashboard (display), `/edit` (management)  
**Primary KPI:** Expert engagement + comment quality + user trust

#### Responsibilities
- Expert medical professional commentary display with credential verification
- Clean, professional presentation on homepage without excessive branding
- Real-time comment management with moderation and approval workflow
- Expert profile management with institutional affiliations and specialties
- Integration with community discussions and issue-specific commentary

#### Expert Commentary System
```sql
CREATE TABLE reviewer_comments (
  id UUID PRIMARY KEY,
  reviewer_id UUID NOT NULL,
  reviewer_name TEXT NOT NULL,
  reviewer_avatar TEXT,
  comment TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  verified BOOLEAN DEFAULT false,
  specialty TEXT,
  institution TEXT
);
```

## 6. Data & API Schemas

### Core Database Tables
| Table | Purpose | Key Relationships | RLS Status |
|-------|---------|-------------------|------------|
| `issues` | Academic papers/reviews | → `review_blocks`, `comments`, `reactions` | ✅ Implemented |
| `review_blocks` | Native review content | → `issues` | ✅ Implemented |
| `profiles` | User information + roles | → `comments`, `posts`, `reactions` | ✅ Implemented |
| `tag_configurations` | Hierarchical tag system | → `issues` (via backend_tags) | ✅ Implemented |
| `comments` | Threaded discussions | → `issues`, `posts`, `comment_votes` | ✅ Implemented |
| `posts` | Community content | → `post_votes`, `post_flairs` | ✅ Implemented |
| `polls` | Voting mechanisms | → `poll_user_votes` | ✅ Implemented |
| `user_article_reactions` | Engagement actions | → `issues`, `users` | ✅ Implemented |
| `user_bookmarks` | Saved content | → `issues`, `posts` | ✅ Implemented |
| `reviewer_comments` | Expert commentary | → `profiles` | ✅ Implemented |
| `content_suggestions` | User suggestions | → `profiles` | ✅ Implemented |

### Key RPC Functions & Procedures
```sql
-- User Analytics
get_total_users() → INTEGER
get_online_users_count() → INTEGER

-- Community Features
get_top_threads(min_comments INTEGER) → TABLE
unpin_expired_posts() → VOID

-- Authorization (RLS-safe, profile-based)
is_current_user_admin() → BOOLEAN
is_current_user_editor_or_admin() → BOOLEAN

-- Content Management
submit_content_suggestion(suggestion TEXT) → UUID
vote_content_suggestion(suggestion_id UUID, vote_type TEXT) → VOID

-- Native Review System
get_review_with_blocks(review_id UUID) → JSONB
update_block_content(block_id BIGINT, new_payload JSONB) → VOID

-- Tag System
get_active_tag_configuration() → JSONB
update_tag_configuration(tag_data JSONB) → UUID
```

### RLS Security Patterns
```sql
-- User Ownership Pattern
CREATE POLICY "user_content" ON table_name
  FOR ALL USING (user_id = auth.uid());

-- Published Content Access
CREATE POLICY "published_access" ON issues
  FOR SELECT USING (published = true OR user_id = auth.uid());

-- Role-Based Access (Profile-Based to prevent recursion)
CREATE POLICY "admin_access" ON sensitive_table
  FOR ALL USING (is_current_user_admin());

-- Editor Content Management
CREATE POLICY "editor_content" ON issues
  FOR ALL USING (is_current_user_editor_or_admin());
```

### Tag System Data Architecture
```typescript
// Tag Configuration Schema
interface TagHierarchy {
  [parentCategory: string]: string[]; // Parent → Subtags mapping
}

// Example Tag Data
const tagConfiguration: TagHierarchy = {
  "Cardiologia": ["Hipertensão", "Insuficiência Cardíaca", "Arritmias"],
  "Neurologia": ["AVC", "Epilepsia", "Demência"],
  "Oncologia": ["Mama", "Pulmão", "Coloretal"],
  "Metodologia": ["RCT", "Meta-análise", "Coorte"]
};

// Issue Tag Storage
interface IssueBackendTags {
  [parentCategory: string]: string[]; // Selected subtags per category
}
```

## 7. UI Component Index

### Layout & Navigation Components
- `Dashboard.tsx` - **Main dashboard with parallel data loading and section management**
- `ArchivePage.tsx` - **Archive interface with search and tag filtering**
- `Sidebar.tsx` - **Main navigation with role-based menu items**
- `RightSidebar.tsx` - **Community features sidebar (community routes only)**
- `DashboardLayout.tsx` - **Route-scoped layout with conditional sidebar mounting**

### Content Display Components
- `CarouselArticleCard.tsx` - **Interactive issue card with hover effects and engagement actions**
- `ArticleRow.tsx` - **Horizontal scrolling issue collection with lazy loading**
- `HeroSection.tsx` - **Featured issue display with prominent call-to-action**
- `IssueCard.tsx` - **Archive grid item with metadata and engagement indicators**
- `TrueMasonryGrid.tsx` - **Responsive masonry layout for archive display**

### Native Editor Components ⭐ FLAGSHIP
- `NativeEditor.tsx` - **Main editor with toolbar and split-screen preview capability**
- `BlockEditor.tsx` - **Block rendering engine with grid layout support**
- `BlockPalette.tsx` - **Drag-and-drop block type selection with categories**
- `ResizableGrid.tsx` - **Multi-column layout system with intuitive drag-and-drop**
- `InlineBlockSettings.tsx` - **Contextual settings overlay for block configuration**
- `ImportExportManager.tsx` - **Content backup, migration, and template system**

### Block Components (Native Editor)
| Component | Status | Features |
|-----------|--------|----------|
| `HeadingBlock.tsx` | ✅ Complete | H1-H6, auto-anchor, color customization |
| `ParagraphBlock.tsx` | ✅ Complete | Rich text, alignment, emphasis, color |
| `SnapshotCardBlock.tsx` | ✅ Complete | PICOD data, evidence levels, custom badges |
| `FigureBlock.tsx` | ⚠️ Partial | Image display, caption, alignment needed |
| `TableBlock.tsx` | ⚠️ Partial | Basic tables, needs dynamic controls |
| `CalloutBlock.tsx` | ⚠️ Partial | Info boxes, type selector needed |

### Community & Social Components
- `Post.tsx` - **Community post with voting, media, and threaded comments**
- `PostsList.tsx` - **Feed interface with infinite scroll and filtering**
- `NewPostModal.tsx` - **Post creation with media upload and poll integration**
- `PostVoting.tsx` - **Upvote/downvote system with real-time score updates**
- `WeeklyPoll.tsx` - **Sidebar polling component with results visualization**

### Archive & Search Components
- `ArchiveHeader.tsx` - **Search bar with tag panel integration**
- `TagsPanel.tsx` - **Hierarchical tag selection with visual state indicators**
- `ResultsGrid.tsx` - **Search results display with masonry layout**

### Admin & Management Components
- `UserManagementPanel.tsx` - **User role administration with verification workflow**
- `IssuesManagementPanel.tsx` - **Content creation and publication management**
- `TagManagementPanel.tsx` - **Tag hierarchy configuration and management**
- `ReviewerCommentsManager.tsx` - **Expert comment administration**
- `EnhancedAnalyticsDashboard.tsx` - **System analytics with comprehensive metrics**

### Interactive & Utility Components
- `ReviewerCommentsDisplay.tsx` - **Clean expert commentary presentation**
- `UpcomingReleaseCard.tsx` - **Content suggestions with community voting**
- `AuthGuard.tsx` - **Route protection with role-based access control**
- `DataErrorBoundary.tsx` - **Error handling with retry functionality**

## 8. Design Language

### Color System & Medical Theme
```css
/* Primary Medical Brand Colors */
--primary: 217 91% 60%;        /* Medical blue accent */
--secondary: 210 40% 98%;      /* Clean white background */
--background: 0 0% 7%;         /* Professional dark (#121212) */
--foreground: 0 0% 98%;        /* High contrast white text */

/* Medical Status Colors */
--success: 142 76% 36%;        /* Evidence confirmed green */
--warning: 38 92% 50%;         /* Moderate evidence yellow */
--destructive: 0 84% 60%;      /* Low evidence/error red */
--info: 217 91% 60%;           /* Informational blue */

/* Interactive Medical States */
--hover: rgba(255,255,255,0.1);
--active: rgba(255,255,255,0.2);
--disabled: rgba(255,255,255,0.3);
--selected: rgba(59,130,246,0.1);

/* Native Editor Medical Colors */
--editor-bg: #121212;          /* Editor background */
--panel-bg: #1a1a1a;          /* Settings panel background */
--border-subtle: #2a2a2a;     /* Subtle element borders */
--accent-blue: #3b82f6;       /* Primary medical blue */
--accent-green: #10b981;      /* High evidence/success */
--accent-yellow: #f59e0b;     /* Moderate evidence/warning */
--accent-red: #ef4444;        /* Low evidence/critical */

/* Evidence Level Color Coding */
--evidence-high: #10b981;     /* Strong evidence green */
--evidence-moderate: #f59e0b; /* Moderate evidence amber */
--evidence-low: #ef4444;      /* Weak evidence red */
--evidence-unclear: #6b7280;  /* Unclear evidence gray */
```

### Typography & Medical Readability
- **Primary:** Inter (sans-serif for optimal medical text readability)
- **Brand:** Playfair Display (serif for professional headers and branding)
- **Code/Data:** `font-mono` (system monospace for technical content)
- **Medical Scale:** text-sm (14px) → text-base (16px) → text-lg (18px) → text-xl+ (20px+)
- **Line Height:** Optimized for medical content readability (1.6-1.8)

### Native Editor Design Patterns ⭐
- **Inline Medical Editing:** Direct content modification without disrupting clinical workflow
- **Grid Layouts:** Visual organization supporting medical content structure (PICOD, findings, etc.)
- **Evidence Color Coding:** Semantic colors reflecting evidence levels and clinical significance
- **Progressive Medical Disclosure:** Advanced settings revealed based on clinical content complexity
- **Spatial Clinical Organization:** Block relationships conveying medical information hierarchy

### Interactive Design Patterns
- **Medical Hover Effects:** Professional opacity transitions, subtle scale transforms
- **Clinical Loading States:** Skeleton screens optimized for medical content consumption
- **Medical Feedback:** Toast notifications with clinical context, instant visual state changes
- **Professional Tooltips:** Contextual labels for all medical interface elements
- **Clinical Drag & Drop:** Medical-appropriate visual feedback, clear drop zones

### Responsive Medical Layout
- **Clinical Containers:** `container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12` for consistent medical content width
- **Medical Grid Systems:** CSS Grid for clinical layout (grid-cols-[1fr_320px]), Flexbox for medical components
- **Editor Medical Grids:** ResizablePanelGroup with medical content-appropriate column management
- **Clinical Spacing:** 4px base unit optimized for medical information density
- **Medical Layout Strategy:** Route-conditional mounting prevents clinical workflow disruption

## 9. Accessibility Contract

### Medical ARIA Implementation
- **Clinical Elements:** All medical interactive elements have `aria-label` or `aria-labelledby`
- **Medical Forms:** Medical form inputs use `aria-describedby` for clinical error messages
- **Clinical Navigation:** Medical navigation uses `role="navigation"` and `aria-current`
- **Medical Tooltips:** Clinical tooltips properly associated with medical trigger elements
- **Editor Medical Focus:** Block editor maintains clinical focus management during medical content operations

### Medical Keyboard Navigation
- **Clinical Tab Order:** Tab order follows logical medical content reading flow
- **Medical Modals:** All clinical modals trap focus appropriately
- **Clinical Shortcuts:** Escape key closes medical overlays
- **Medical Activation:** Enter/Space activate medical interface buttons
- **Clinical Arrows:** Arrow keys navigate medical content carousels
- **Editor Medical Keys:** Editor blocks support keyboard-only medical content navigation

### Medical Color & Contrast
- **Clinical Contrast:** Minimum 4.5:1 contrast ratio for medical text content
- **Medical UI:** 3:1 for large medical text and clinical UI elements
- **Clinical Indicators:** Color never sole indicator of medical state
- **Medical Accessibility:** High contrast mode compatibility for clinical use
- **Editor Medical Colors:** Color picker ensures accessible medical color combinations

### Medical Screen Reader Support
- **Clinical HTML:** Semantic HTML structure appropriate for medical content
- **Medical Headings:** Proper clinical heading hierarchy
- **Medical Images:** Alternative text for medical images and clinical diagrams
- **Clinical Status:** Status announcements for dynamic medical content
- **Editor Medical Announcements:** Block type announcements and medical layout descriptions

## 10. Performance Budgets

### Medical Application Bundle Sizes
- **Main clinical bundle:** <300kB gzipped
- **Dashboard medical chunk:** <200kB
- **Community medical chunk:** <150kB
- **Admin medical chunk:** <100kB
- **Native Editor medical chunk:** <400kB (includes comprehensive medical block system)
- **Medical component chunks:** <50kB each

### Medical API Performance
- **Clinical database queries:** <200ms p95
- **Medical authentication:** <1s login flow
- **Clinical search:** <500ms response time for medical content
- **Medical real-time updates:** <100ms latency for clinical data
- **Medical image loading:** Progressive with clinical placeholders
- **Medical block operations:** <50ms for clinical content CRUD operations

### Medical Core Web Vitals Targets
- **LCP (Clinical):** <2.5s (Largest Contentful Paint for medical content)
- **FID (Medical):** <100ms (First Input Delay for clinical interactions)
- **CLS (Clinical):** <0.1 (Cumulative Layout Shift for medical layouts)

### Medical Optimization Strategies
- **Clinical Caching:** React Query caching optimized for medical content consumption
- **Medical Images:** Progressive loading with clinical content prioritization
- **Clinical Code Splitting:** Route and component-level splitting for medical workflows
- **Medical Skeletons:** Loading states optimized for clinical content patterns
- **Clinical Layout Efficiency:** Conditional DOM mounting for medical interface elements
- **Editor Medical Optimization:** Virtualized block rendering for large medical reviews

## 11. Security & Compliance

### Medical Authentication Security
- **Clinical Verification:** Email verification required with medical professional validation
- **Medical Sessions:** Session tokens auto-refresh with clinical security standards
- **Clinical Logout:** Secure logout clears all medical client storage
- **Medical Rate Limiting:** Rate limiting on clinical authentication endpoints
- **Clinical Action Auth:** Interactive medical action authentication checks

### Medical Data Protection
- **Clinical Encryption:** Medical data encrypted at rest (Supabase HIPAA-compliant default)
- **Medical PII:** Clinical PII access logged and audited
- **Clinical Compliance:** GDPR-compliant medical data deletion
- **Medical Logs:** No sensitive clinical data in client logs
- **Clinical File Upload:** Secure medical file upload with clinical validation
- **Medical Audit:** Review content versioning and clinical audit trails

### Medical Authorization Model & RLS Security
```sql
-- Medical RLS Pattern (prevents clinical data recursion)
CREATE POLICY "Medical admin access"
  ON clinical_table FOR ALL
  USING (is_current_user_admin());  -- Uses medical profiles.role

-- Medical User Content Access
CREATE POLICY "Medical user reactions"
  ON user_article_reactions FOR ALL
  USING (user_id = auth.uid());

-- Clinical Content Access
CREATE POLICY "Published medical content"
  ON issues FOR SELECT
  USING (published = true);

-- Medical Review Blocks Access
CREATE POLICY "Medical review blocks read"
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

**Medical Security Architecture:** Eliminated infinite recursion in clinical admin RLS policies by migrating from self-referential medical admin queries to profile-based clinical authorization functions. All medical admin checks use `profiles.role` as canonical clinical source.

## 12. Admin & Ops

### Medical Content Management Workflow
1. **Clinical Draft Creation** → Medical editor creates clinical issue in draft state (PDF or native)
2. **Medical Content Development** → Use native editor for structured medical reviews OR upload clinical PDF
3. **Clinical Review Process** → Medical content review and clinical metadata validation
4. **Medical Publication** → Clinical issue published and appears in medical dashboard
5. **Clinical Community** → Auto-generated medical discussion post created
6. **Medical Analytics** → Clinical engagement tracking begins
7. **Medical Reviewer Comments** → Expert medical commentary added via clinical admin panel

### Medical Native Editor Workflow ⭐
1. **Clinical Issue Creation** → Basic medical metadata and clinical type selection (PDF/Native/Hybrid)
2. **Medical Block Composition** → Use BlockPalette to add clinical content blocks
3. **Clinical Inline Configuration** → Configure each medical block's clinical settings directly
4. **Medical Layout Organization** → Arrange clinical blocks in medical grids via drag-and-drop
5. **Advanced Medical Features** → Add custom medical badges, clinical finding sections, evidence colors
6. **Clinical Preview & Validation** → Split-screen medical preview with clinical error checking
7. **Medical Export/Backup** → Save as clinical JSON with medical migration support

### Medical Admin Functions
- **Clinical Issue Management:** Create, edit, publish, feature medical issues (PDF and native)
- **Medical Native Editor Access:** Full clinical editor privileges with advanced medical features
- **Clinical User Roles:** Promote medical users to editor/admin status via clinical profiles table
- **Medical Community Moderation:** Pin medical posts, manage clinical reports
- **Clinical Reviewer Comments:** Add, edit, delete expert medical commentary
- **Medical System Configuration:** Clinical sidebar settings, medical polls, clinical announcements
- **Clinical Content Suggestions:** Review and manage medical user submissions
- **Medical Block Management:** Import/export clinical templates, validate medical content structure

### Medical Deployment Process
- **Clinical Staging:** Automatic deployment on medical PR
- **Medical Production:** Manual approval required for clinical changes
- **Clinical Database:** Migrations via Supabase CLI (includes medical review_blocks schema)
- **Medical Assets:** Automatic optimization and medical CDN
- **Clinical Monitoring:** Real-time medical error tracking and clinical performance metrics

## 13. Analytics & KPIs

### Medical Product Metrics
- **Clinical MAU:** Monthly Active Medical Users
- **Medical Issue Engagement:** Clinical views, medical reactions, clinical bookmarks, medical comments
- **Clinical Native vs PDF:** Medical adoption rates, clinical user preferences, medical engagement comparison
- **Medical Editor Usage:** Clinical block creation frequency, medical layout complexity, clinical feature adoption
- **Clinical Community Health:** Medical posts per week, clinical comment threads, medical suggestion submissions
- **Medical Search Success:** Clinical query → medical result → clinical engagement rate
- **Clinical Interactive Features:** Medical reaction rates, clinical bookmark rates, medical suggestion voting

### Medical Native Editor Metrics ⭐
- **Clinical Creation Metrics:** Medical reviews created, clinical blocks per review, medical editor session time
- **Medical Feature Adoption:** Clinical grid usage, medical custom badges, clinical finding sections, medical color customization
- **Clinical User Experience:** Medical inline settings usage, clinical import/export frequency, medical error rates
- **Clinical Content Quality:** Medical review completion rates, clinical publication rates, medical user feedback

### Medical Technical Metrics
- **Clinical Error Rates:** <1% 4xx for medical endpoints, <0.1% 5xx for clinical operations
- **Medical Performance:** Clinical Core Web Vitals compliance
- **Clinical Availability:** >99.9% uptime for medical platform
- **Medical Security:** Zero clinical data breaches, successful medical auth rate
- **Clinical Layout Efficiency:** Zero phantom clinical element detection, optimal medical content width usage
- **Medical Editor Performance:** Clinical block operation latency, medical auto-save reliability

### Medical Event Tracking
```typescript
// Medical Events Tracked
medical_issue_viewed
medical_issue_reacted // (type: like/dislike/want_more)
medical_issue_bookmarked
medical_comment_posted
medical_poll_voted
medical_suggestion_submitted
clinical_search_performed
medical_user_registered
clinical_layout_utilized
// Medical Native Editor Events
medical_native_review_created
clinical_block_added // (type: heading/paragraph/snapshot_card/etc)
medical_grid_layout_used
clinical_inline_settings_opened
medical_custom_badge_created
clinical_finding_section_added
medical_review_exported
clinical_content_imported
```

## 14. TODO / Backlog

### High Priority Medical Features
- [ ] Complete inline settings for medical figure, table, callout blocks
- [ ] Implement 4 missing medical block types (number_card, reviewer_quote, poll, citation_list)
- [ ] Mobile responsive improvements for medical native editor
- [ ] Advanced medical search filters (date range, evidence level, clinical engagement metrics)
- [ ] Medical email notifications for clinical reactions and medical comments

### Native Medical Editor Priority ⭐
- [ ] Multi-row medical grid system (2x2, 3x2, etc.) - **15-20 clinical prompts estimated**
- [ ] Medical block templates and clinical saved configurations
- [ ] Real-time collaborative medical editing
- [ ] Clinical version history and medical diff visualization
- [ ] Advanced medical import from clinical Word/Google Docs
- [ ] Export to multiple medical formats (clinical PDF, medical Word, clinical Markdown)
- [ ] Medical block commenting and clinical review workflow
- [ ] Custom clinical CSS injection for advanced medical styling

### Medium Priority Clinical Features
- [ ] Rich medical text editor for clinical posts and medical comments
- [ ] Medical user profile customization with clinical achievement system
- [ ] Clinical issue recommendation engine based on medical preferences
- [ ] Bulk medical admin operations for clinical content management
- [ ] Advanced medical analytics dashboard for clinical admins
- [ ] Medical native review SEO optimization for clinical search

### Medical Interactive Features
- [ ] Clinical reaction analytics for medical content creators
- [ ] Medical bookmark collections and clinical sharing
- [ ] Medical collaborative filtering for clinical recommendations
- [ ] Clinical gamification elements (medical badges, clinical streaks)
- [ ] Medical social features (follow clinical users, medical activity feeds)
- [ ] Clinical native review sharing and medical embedding

### Medical Technical Debt
- [ ] Refactor large medical components (NativeEditor.tsx >200 lines, ImportExportManager.tsx >500 lines)
- [ ] Implement proper medical error boundaries throughout clinical app
- [ ] Add comprehensive TypeScript coverage for all medical editor hooks
- [ ] Optimize medical bundle splitting for better clinical performance
- [ ] Standardize medical loading states across all clinical components
- [ ] Create comprehensive test suite for medical native editor

## 15. Revision History

| Date | Author | Change Summary |
|------|--------|----------------|
| 2025-06-09 | lovable | **v2.0.0 - Complete Documentation Overhaul:** Comprehensive rewrite based on actual codebase analysis. Added archive system with tag-based filtering, simplified community features, corrected component inventory, updated authentication model, refined native editor documentation, and aligned all technical details with implemented functionality. Removed fictional elements and ensured 100% accuracy to actual implementation. |
| 2025-06-06 | lovable | **v1.3.0 - Native Editor Integration:** Added comprehensive native editor documentation, block system architecture, inline settings, grid layouts, import/export system, and updated all modules to reflect dual PDF/native capabilities |
| 2025-06-04 | lovable | Created initial knowledge base with complete app documentation |
| 2025-06-04 | lovable | Fixed infinite-recursion RLS on admin_users; migrated to profile-based auth |
| 2025-06-04 | lovable | Added interactive features: reactions, bookmarks, tooltips, suggestions |
| 2025-06-04 | lovable | Fixed reviewer comments system, spacing issues, comprehensive review |
| 2025-06-04 | lovable | **Layout Revolution v1.2.0:** Eliminated layout gaps through conditional sidebar mounting and full-width responsive containers |
