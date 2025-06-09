
# README-BÍBLIA — reviews.app
**Version 2.1.0** · 2025-06-09  
**Purpose**: Scientific review platform enabling confident decision-making through digestible evidence

---

## 1. Purpose & Pitch (≤30 lines)

**Mission**: Deliver trusted, digestible scientific reviews that give users confidence to act, speak, teach or post — even when they don't fully master methodology or statistics.

**NOT**: A medical documentation platform for verified professionals  
**YES**: An interpretable evidence platform enabling multi-level users to decide, defend, or deliver science-backed points in under 10 minutes.

**Core Value Proposition**:
- Transform complex research into actionable insights
- Build confidence for presentations, posts, and clinical decisions  
- Provide shortcuts to trust and authority without requiring deep statistical literacy
- Create safe spaces for learning and questioning

**Target Outcome**: Users can confidently cite, teach, or apply scientific evidence within 10 minutes of reading our content.

---

## 2. Glossary (60 lines)

| Term | Definition | Context |
|------|------------|---------|
| **Review** | Digestible scientific summary with practical takeaways | Core content type |
| **Snapshot Card** | Key findings block with NNT, outcomes, applicability | Most valuable UI element |
| **Archive (Acervo)** | Searchable collection with tag-based reordering | Main discovery interface |
| **Tag Hierarchy** | Parent categories (Terapia, Diagnóstico) with subtags | Navigation system |
| **Native Editor** | Block-based content creation with preview | Admin content tool |
| **Backend Tags** | JSON-stored hierarchical categorization system | Technical classification |
| **Community Thread** | Discussion space for questions and interpretations | Safe learning environment |
| **User Profile** | Authentication-based personal space | Not verification-based |
| **Featured Issue** | Highlighted review on homepage | Editorial selection |
| **Search Query** | Text-based content discovery | Primary user entry point |
| **Reviewer Comments** | Curated editorial notes | Trust-building element |
| **External Lectures** | Related video/audio content links | Supplementary learning |
| **Specialty Filter** | Loose categorization (not medical specialties) | Content organization |
| **Score** | Engagement-based ranking algorithm | Content prioritization |
| **Published State** | Live vs draft content visibility | Content lifecycle |
| **PDF URL** | Original research document link | Source material access |
| **Article PDF** | Separate research article file | Secondary reference |
| **Cover Image** | Visual content representation | UI enhancement |
| **TOC Data** | Table of contents structure | Navigation aid |
| **Real Title** | Original research paper title | Academic reference |
| **Search Fields** | Optimized content for discovery | Technical implementation |
| **Design Type** | Study methodology classification | Evidence context |
| **Population** | Study participant characteristics | Applicability context |
| **Year** | Publication timeframe | Recency indicator |
| **Authors** | Content creators and researchers | Attribution system |
| **Edition** | Content version or series number | Organizational system |

---

## 3. High-Level Architecture (120 lines)

### Frontend Stack
- **React 18** with TypeScript for type safety
- **Vite** for development and building
- **Tailwind CSS** with semantic color tokens
- **React Router** for client-side navigation
- **React Query** for optimized data fetching
- **Zustand** for client state management

### Authentication & User Management
- **Supabase Auth** with email/password (no verification gates)
- **Profile-based system** (not credential-based)
- **Role system**: user, admin (no medical verification)
- **Optional fields**: specialty, bio, institution

### Data Architecture
```
issues (reviews)
├── content: title, description, authors
├── files: pdf_url, article_pdf_url, cover_image_url  
├── classification: specialty, backend_tags (JSON), year, design
├── state: published, featured, score
└── search: search_title, search_description

tag_configurations
├── tag_data (JSON hierarchy)
├── is_active (current config)
└── version tracking

profiles (users)
├── basic: full_name, avatar_url, bio
├── context: specialty, institution  
└── role: user/admin

comments (community)
├── content: text, threading (parent_id)
├── context: issue_id, post_id, article_id
├── engagement: score, voting
└── moderation: reports, status
```

### Content Management
- **Native Block Editor** with live preview
- **Import/Export** system for content migration
- **Review workflow**: draft → published
- **Media upload** via Supabase Storage
- **External content linking** for lectures/videos

### Discovery & Navigation
- **Tag-based reordering** with scoring algorithm
- **Text search** across titles, descriptions, authors
- **Specialty filtering** (loose categories)
- **Featured content** editorial selection
- **Related content** recommendations

### Performance & Optimization
- **Optimized queries** with React Query caching
- **Parallel data loading** for dashboard sections
- **Virtual scrolling** for large lists
- **Image optimization** and lazy loading
- **Background sync** for user interactions

---

## 4. User Journeys (150 lines)

### Primary Personas & Use Cases

**Ana (Resident/Student)**
- Emotional driver: Fear of failure in rounds/exams
- Journey: Panic → Search → Quick understanding → Confidence
- Key touchpoints: Archive search, Snapshot cards, PDF access
- Success metric: Can speak confidently in 7 minutes

**Carla (Working Clinician)**  
- Emotional driver: Ethical stress over outdated practice
- Journey: Question → Validate → Update → Apply
- Key touchpoints: Search, Community threads, External lectures
- Success metric: Updates practice with confidence

**Bruno (Content Creator)**
- Emotional driver: Avoid saying something wrong publicly
- Journey: Content idea → Research → Cite → Publish
- Key touchpoints: Archive, PDF downloads, Snapshot statistics
- Success metric: Authoritative posts with proper citations

**Daniel (Frustrated Learner)**
- Emotional driver: Deep academic distrust, self-doubt
- Journey: Skepticism → Accessible explanation → Understanding → Trust
- Key touchpoints: Community discussions, Reviewer comments
- Success metric: Finally "gets it" after failed attempts elsewhere

**Edu (Time-starved Decision-maker)**
- Emotional driver: Wants clarity without studying
- Journey: Need → Summary → Decision → Action
- Key touchpoints: Featured content, Snapshot cards
- Success metric: Confident decisions in under 10 minutes

### Critical User Flows

**1. First-time Discovery**
```
Landing → Featured review → Snapshot card → Value recognition → Registration
- Must demonstrate value before asking for commitment
- No verification gates or professional requirements
- Immediate access to core content
```

**2. Archive Exploration**  
```
Search/Browse → Tag selection → Content reordering → Review selection → Deep dive
- Tag hierarchy guides discovery
- Visual state-based ordering (selected → highlighted → unselected)
- Text search complements categorization
```

**3. Content Consumption**
```
Review card → Snapshot card → Full content → PDF access → Community discussion
- Snapshot cards provide immediate value
- Progressive disclosure of complexity
- Safe space for questions and interpretations
```

**4. Community Engagement**
```
Question/doubt → Thread creation → Discussion → Resolution → Knowledge sharing
- Anonymous or named participation
- No judgment for "basic" questions
- Peer learning and support
```

**5. Content Creation (Admin)**
```
Editor → Block composition → Preview → Tag assignment → Publishing → Community activation
- Native block-based editor
- Live preview system
- Hierarchical tag assignment
- Automated community thread creation
```

### Emotional Journey Mapping

**Pre-platform state**: Confused, overwhelmed, lacking confidence
**Entry point**: Specific need (presentation, post, decision)
**First interaction**: Must build trust through immediate value
**Ongoing engagement**: Safe learning environment, progressive mastery
**Success state**: Confident citation and application of evidence

### Failure Points to Avoid
- Medical jargon in interface copy
- Verification requirements that exclude users
- Complex statistical presentations without context
- Intimidating "expert-only" framing
- Bureaucratic language in CTAs

---

## 5. Domain Modules Index

### Archive System (`/acervo`)
```
src/pages/dashboard/ArchivePage.tsx - Main archive interface
src/components/archive/
├── ArchiveHeader.tsx - Search + tag interface
├── TagsPanel.tsx - Hierarchical tag selection
├── ResultsGrid.tsx - Content display grid
└── IssueCard.tsx - Individual review cards

src/hooks/
├── useArchiveTagReordering.ts - Tag-based content scoring
├── useSimplifiedArchiveSearch.ts - Text search + filtering
└── useOptimizedArchiveData.ts - Data fetching layer
```

### Content Management
```
src/pages/dashboard/IssueEditor.tsx - Admin content creation
src/components/editor/ - Block-based editor system
src/components/review/ - Content rendering blocks
src/hooks/useNativeReview.ts - Content management logic
```

### User System
```
src/contexts/OptimizedAuthContext.tsx - Authentication state
src/pages/dashboard/Profile.tsx - User profile management
src/hooks/useStableAuth.ts - Authentication utilities
```

### Community Features  
```
src/pages/dashboard/Community.tsx - Discussion interface
src/components/community/ - Thread and post components
src/hooks/useCommunityPosts.ts - Community data management
```

### Dashboard & Discovery
```
src/pages/dashboard/Dashboard.tsx - Homepage with sections
src/components/dashboard/ - Homepage sections
src/hooks/useParallelDataLoader.ts - Optimized data loading
```

### Search & Navigation
```
src/pages/dashboard/SearchPage.tsx - Global search interface
src/components/search/ - Search components
src/hooks/useSimplifiedArchiveSearch.ts - Search logic
```

---

## 6. Data & API Schemas

### Core Content Schema
```typescript
interface ArchiveIssue {
  id: string;
  title: string; // User-facing title
  real_title?: string; // Original research title
  real_title_ptbr?: string; // Portuguese translation
  authors?: string;
  description?: string;
  specialty: string; // Loose categorization
  backend_tags?: string | TagHierarchy; // JSON hierarchical tags
  published_at: string;
  created_at: string;
  score?: number; // Engagement-based ranking
  cover_image_url?: string;
  pdf_url: string; // Review PDF
  article_pdf_url?: string; // Original research PDF
  year?: string;
  design?: string; // Study methodology
  population?: string; // Study participants
  search_title?: string; // Search optimization
  search_description?: string; // Search optimization
  featured?: boolean;
  review_content?: any; // Block-based content
  toc_data?: any; // Table of contents
}
```

### Tag Hierarchy System
```typescript
interface TagHierarchy {
  [category: string]: string[]; // Parent → Subtags mapping
}

interface TagConfiguration {
  id: string;
  tag_data: TagHierarchy;
  is_active: boolean;
  version: number;
  created_at: string;
  updated_at: string;
  created_by: string;
}

// Example hierarchy:
{
  "Terapia": ["Farmacológica", "Não-farmacológica", "Cirúrgica"],
  "Diagnóstico": ["Screening", "Confirmatório", "Diferencial"],
  "Nutrição": ["Suplementação", "Dietas", "Metabolismo"]
}
```

### User Profile Schema
```typescript
interface UserProfile {
  id: string;
  full_name?: string;
  avatar_url?: string;
  role: 'user' | 'admin';
  specialty?: string; // Self-reported, not verified
  bio?: string;
  institution?: string; // Optional context
  created_at: string;
  updated_at: string;
}
```

### Community Schema
```typescript
interface Comment {
  id: string;
  content: string;
  user_id: string;
  issue_id?: string;
  post_id?: string;
  parent_id?: string; // Threading support
  score: number; // Voting system
  created_at: string;
  updated_at: string;
}

interface CommunityPost {
  id: string;
  title: string;
  content?: string;
  user_id: string;
  issue_id?: string; // Link to review
  published: boolean;
  score: number;
  pinned?: boolean;
  auto_generated?: boolean; // System-created threads
  created_at: string;
}
```

---

## 7. UI Component Index

### Layout & Navigation
```
src/components/navigation/Sidebar.tsx - Main navigation
src/layouts/DashboardLayout.tsx - App shell
src/components/sidebar/RightSidebar.tsx - Contextual info
```

### Archive & Discovery
```
src/components/archive/
├── ArchiveHeader.tsx - Search + tag interface  
├── TagsPanel.tsx - Hierarchical tag selection
├── ResultsGrid.tsx - Masonry grid layout
├── IssueCard.tsx - Content preview cards
└── MasonryGrid.tsx - Optimized grid system
```

### Content Display
```
src/components/review/
├── NativeReviewViewer.tsx - Block-based content
├── BlockRenderer.tsx - Individual block display
└── blocks/ - Specific block types
    ├── SnapshotCard.tsx - Key findings display
    ├── ParagraphBlock.tsx - Text content
    ├── HeadingBlock.tsx - Section headers
    ├── TableBlock.tsx - Data tables
    ├── FigureBlock.tsx - Images and charts
    └── CalloutBlock.tsx - Highlighted information
```

### Forms & Input
```
src/components/ui/ - Shadcn/ui component library
src/components/editor/ - Content creation interface
src/components/auth/ - Authentication forms
```

### Community Features
```
src/components/community/
├── Post.tsx - Individual post display
├── PostsList.tsx - Community feed
├── CommentSection.tsx - Thread discussions
└── NewPostModal.tsx - Content creation
```

### Dashboard Sections
```
src/components/dashboard/
├── HeroSection.tsx - Featured content
├── ArticleRow.tsx - Content carousels
├── ReviewerCommentsDisplay.tsx - Editorial notes
└── UpcomingReleaseCard.tsx - Future content
```

---

## 8. Design Language (120 lines)

### Visual Philosophy
**Monochrome-first, semantic-color only**: The platform uses grayscale by default with color appearing only when it communicates state, priority, or confidence.

### Color System Implementation
```css
/* Core semantic tokens - defined in index.css */
:root {
  --background: 0 0% 7%;           /* #121212 - Primary dark background */
  --foreground: 0 0% 98%;          /* #fafafa - Primary text */
  --muted: 0 0% 15%;              /* #262626 - Secondary backgrounds */
  --muted-foreground: 0 0% 64%;   /* #a3a3a3 - Secondary text */
  --border: 0 0% 15%;             /* #262626 - Element borders */
  --input: 0 0% 15%;              /* #262626 - Form backgrounds */
  --card: 0 0% 4%;                /* #0a0a0a - Card backgrounds */
  --primary: 0 0% 98%;            /* #fafafa - Primary elements */
  --secondary: 0 0% 11%;          /* #1c1c1c - Secondary elements */
  --accent: 0 0% 15%;             /* #262626 - Accent elements */
  --success: 142 76% 36%;         /* #22c55e - Success states */
  --warning: 38 92% 50%;          /* #f59e0b - Warning states */
  --destructive: 0 84% 60%;       /* #ef4444 - Error states */
}
```

### Typography Scale
- **Headings**: font-bold with semantic hierarchy (text-3xl → text-lg)
- **Body text**: font-normal, comfortable line-height (1.6)
- **UI labels**: font-medium for clarity
- **Code/data**: font-mono when appropriate

### Spacing System
- **Layout**: 8px base unit (space-2, space-4, space-8, space-16)
- **Components**: Consistent padding/margin patterns
- **Grids**: CSS Grid with responsive gaps

### Component Patterns
```typescript
// Consistent card pattern
<Card className="bg-card border-border">
  <CardHeader>
    <CardTitle className="text-foreground">Title</CardTitle>
  </CardHeader>
  <CardContent className="text-muted-foreground">
    Content
  </CardContent>
</Card>

// Semantic button variants
<Button variant="default">      // Primary action
<Button variant="secondary">    // Secondary action  
<Button variant="ghost">        // Subtle action
<Button variant="destructive">  // Dangerous action
```

### Interaction States
- **Hover**: Subtle background shift using --accent
- **Active**: Darker background using --secondary
- **Focus**: Ring outline using --ring
- **Disabled**: Reduced opacity, no color change

### Layout Principles
- **Mobile-first**: Responsive design starting from 375px
- **Progressive disclosure**: Complex content revealed on demand
- **Scan-friendly**: Clear visual hierarchy and whitespace
- **Touch-friendly**: 44px minimum touch targets

### Content Presentation
- **Snapshot cards**: Prominent visual treatment for key findings
- **Progressive complexity**: Simple view → detailed view → source
- **Visual emphasis**: Color and typography to guide attention
- **Safe spaces**: Welcoming visual treatment for community areas

---

## 9. Accessibility Contract (100 lines)

### WCAG 2.1 AA Compliance Standards

**Color & Contrast**
- Text contrast ratio ≥ 4.5:1 for normal text
- Text contrast ratio ≥ 3:1 for large text (18px+ or 14px+ bold)
- Color never used as sole information carrier
- Focus indicators clearly visible with 2px outline

**Keyboard Navigation**
- All interactive elements accessible via keyboard
- Logical tab order through content
- Skip links for main content areas
- Escape key closes modals and dropdowns

**Screen Reader Support**
```typescript
// Semantic HTML structure
<main aria-label="Archive content">
  <section aria-labelledby="search-heading">
    <h2 id="search-heading">Search Reviews</h2>
    // Search interface
  </section>
  
  <section aria-labelledby="results-heading">
    <h2 id="results-heading">Search Results</h2>
    <div role="grid" aria-label="Review cards">
      // Results grid
    </div>
  </section>
</main>

// Interactive elements
<button 
  aria-expanded={isExpanded}
  aria-controls="tag-panel"
  aria-describedby="tag-help"
>
  Filter by Category
</button>
```

**Motor Accessibility**
- Minimum 44px touch targets on mobile
- Generous click areas for small elements
- No time-limited interactions
- Alternative interaction methods for complex gestures

**Cognitive Accessibility**
- Clear, consistent navigation patterns
- Helpful error messages with recovery suggestions
- Progressive disclosure to reduce cognitive load
- Consistent terminology throughout interface

**Visual Accessibility**
- Support for high contrast mode
- Respects user's motion preferences (prefers-reduced-motion)
- Scalable text up to 200% without horizontal scrolling
- Clear visual hierarchy and information grouping

### Implementation Patterns
```typescript
// Focus management
const useKeyboardNavigation = () => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isModalOpen) {
        closeModal();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen]);
};

// Announcement system
const announceChange = (message: string) => {
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', 'polite');
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;
  document.body.appendChild(announcement);
  setTimeout(() => document.body.removeChild(announcement), 1000);
};
```

---

## 10. Performance Budgets (80 lines)

### Loading Performance Targets
- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s  
- **Cumulative Layout Shift**: < 0.1
- **First Input Delay**: < 100ms
- **Time to Interactive**: < 3.5s

### Bundle Size Limits
- **Initial JavaScript**: < 250KB gzipped
- **CSS**: < 50KB gzipped
- **Images**: WebP format, < 500KB per image
- **Fonts**: Variable fonts, subset to essential characters

### Runtime Performance
- **Memory usage**: < 50MB for typical user session
- **CPU usage**: < 10% average during normal interaction
- **Network requests**: < 20 per page load
- **Database queries**: < 100ms average response time

### Optimization Strategies
```typescript
// Code splitting by route
const ArchivePage = lazy(() => import('./pages/dashboard/ArchivePage'));
const CommunityPage = lazy(() => import('./pages/dashboard/Community'));

// Image optimization
<img 
  src={optimizedImageUrl}
  loading="lazy"
  width={width}
  height={height}
  alt={descriptiveAlt}
/>

// Query optimization with React Query
const { data } = useQuery({
  queryKey: ['issues', filters],
  queryFn: () => fetchIssues(filters),
  staleTime: 5 * 60 * 1000, // 5 minutes
  cacheTime: 10 * 60 * 1000, // 10 minutes
});
```

### Monitoring & Alerts
- **Real User Monitoring**: Web Vitals tracking
- **Error tracking**: Client-side error reporting
- **Performance alerts**: Automated alerts for metric regressions
- **Usage analytics**: User behavior and engagement metrics

---

## 11. Security & Compliance (100 lines)

### Authentication & Authorization
- **Supabase Auth**: Secure email/password authentication
- **Session management**: HTTP-only cookies with secure flags
- **Role-based access**: user/admin roles with appropriate permissions
- **No credential verification**: Intentionally accessible platform

### Data Protection
- **Personal data**: Minimal collection (name, email, optional bio)
- **Data retention**: User-controlled account deletion
- **Encryption**: At-rest and in-transit encryption via Supabase
- **Backup strategy**: Automated daily backups with 30-day retention

### Content Security
```typescript
// Input sanitization
const sanitizeContent = (content: string) => {
  return DOMPurify.sanitize(content, {
    ALLOWED_TAGS: ['p', 'strong', 'em', 'ul', 'ol', 'li', 'blockquote'],
    ALLOWED_ATTR: ['href', 'target']
  });
};

// SQL injection prevention via Supabase client
const { data, error } = await supabase
  .from('issues')
  .select('*')
  .eq('published', true)
  .textSearch('search_title', searchQuery, {
    type: 'websearch',
    config: 'portuguese'
  });
```

### Privacy by Design
- **Data minimization**: Collect only necessary information
- **Purpose limitation**: Data used only for stated purposes
- **Transparency**: Clear privacy policy and data usage
- **User control**: Account settings and data export options

### Content Moderation
- **Community guidelines**: Clear, enforced standards
- **Reporting system**: User-initiated content reporting
- **Moderation queue**: Admin review of reported content
- **Automated detection**: Basic spam and abuse prevention

### Compliance Framework
- **LGPD compliance**: Brazilian data protection law adherence
- **Academic fair use**: Proper attribution and citation practices
- **Content licensing**: Clear terms for user-generated content
- **Medical disclaimer**: Clear non-medical-advice disclaimers

---

## 12. Admin & Ops (120 lines)

### Content Management Workflow
```
Draft Creation → Block Composition → Preview → Tag Assignment → Review → Publishing → Community Activation
```

### Admin Dashboard Access
- **Route**: `/admin` (admin role required)
- **Features**: User management, content moderation, analytics
- **Permissions**: Content CRUD, user role management, system settings

### Content Creation Process
```typescript
// Native editor workflow
1. Create new issue: IssueEditor.tsx
2. Compose content: BlockEditor.tsx with live preview
3. Assign metadata: title, specialty, backend_tags
4. Upload assets: PDFs, images via Supabase Storage
5. Preview: NativeReviewViewer.tsx render
6. Publish: Update published status and published_at
7. Auto-generate: Community thread creation
```

### Tag Configuration Management
```typescript
// Tag hierarchy updates
const updateTagConfiguration = async (newTagData: TagHierarchy) => {
  await supabase.from('tag_configurations').insert({
    tag_data: newTagData,
    is_active: true,
    version: currentVersion + 1,
    created_by: adminUserId
  });
  
  // Deactivate previous configuration
  await supabase.from('tag_configurations')
    .update({ is_active: false })
    .eq('version', currentVersion);
};
```

### User Management
- **Profile moderation**: Review user-submitted profiles
- **Role assignment**: Promote users to admin status
- **Content oversight**: Monitor community contributions
- **Account issues**: Handle user account problems

### System Monitoring
```typescript
// Performance monitoring
const trackPageLoad = (pageName: string, loadTime: number) => {
  supabase.from('analytics_events').insert({
    event_type: 'page_load',
    page_name: pageName,
    duration: loadTime,
    user_id: currentUser?.id,
    session_id: sessionId
  });
};
```

### Backup & Recovery
- **Database**: Automated daily backups via Supabase
- **Storage**: Asset replication across regions
- **Configuration**: Version-controlled tag configurations
- **Recovery procedures**: Documented restoration processes

### Deployment Pipeline
```yaml
# Simplified deployment flow
1. Code changes pushed to main branch
2. Automated build and test via Lovable
3. Preview deployment for review
4. Production deployment on approval
5. Post-deployment health checks
```

---

## 13. Analytics & KPIs (120 lines)

### User Engagement Metrics
- **Active Users**: Daily/Monthly active user counts
- **Session Duration**: Average time spent per visit
- **Content Consumption**: Reviews read, PDFs downloaded
- **Search Behavior**: Query patterns and success rates
- **Community Participation**: Comments, posts, votes

### Content Performance
- **Review Popularity**: Views, downloads, shares per review
- **Tag Effectiveness**: Click-through rates by tag category
- **Search Success**: Query-to-result conversion rates
- **Featured Content**: Impact of homepage placement

### User Journey Analytics
```typescript
// Event tracking implementation
const trackUserAction = (action: string, context: any) => {
  supabase.from('user_analytics').insert({
    user_id: currentUser?.id,
    action_type: action,
    context_data: context,
    timestamp: new Date().toISOString(),
    session_id: sessionId
  });
};

// Usage examples
trackUserAction('search_query', { query: searchText, results_count: results.length });
trackUserAction('tag_selection', { tag: selectedTag, category: parentCategory });
trackUserAction('content_view', { issue_id: issueId, view_duration: timeSpent });
```

### Success Metrics by Persona
**Ana (Student/Resident)**
- Time from search to confidence: < 7 minutes
- Return rate for exam preparation: > 60%
- PDF downloads per session: 2-3

**Carla (Working Clinician)**
- Practice updates implemented: Tracked via follow-up surveys
- Community question resolution: < 24 hours
- Content sharing to colleagues: > 30% of users

**Bruno (Content Creator)**
- Citation accuracy in social posts: Manual verification
- Content creation time reduction: 50% improvement reported
- Platform attribution in external content: > 80%

**Daniel (Frustrated Learner)**
- Understanding improvement: Self-reported confidence scores
- Platform trust building: Engagement over time
- Learning progression: Basic → intermediate content consumption

**Edu (Time-starved Decision-maker)**
- Decision confidence: Post-use surveys
- Time-to-decision: < 10 minutes target
- Action implementation: Follow-up outcome tracking

### Data Collection Framework
```typescript
interface AnalyticsEvent {
  user_id?: string;
  session_id: string;
  event_type: 'page_view' | 'search' | 'content_interaction' | 'community_action';
  event_data: Record<string, any>;
  timestamp: string;
  user_agent?: string;
  referrer?: string;
}

// Privacy-compliant analytics
const anonymizeData = (eventData: AnalyticsEvent) => {
  return {
    ...eventData,
    user_id: eventData.user_id ? hashUserId(eventData.user_id) : null,
    ip_address: undefined // Never store IP addresses
  };
};
```

### Reporting Dashboard
- **Real-time metrics**: Current active users, trending content
- **Weekly reports**: Engagement summaries, top performing content
- **Monthly analysis**: User growth, feature adoption, retention
- **Quarterly reviews**: Goal achievement, user satisfaction surveys

---

## 14. TODO / Backlog (live)

### High Priority
- [ ] **Mobile responsiveness audit**: Comprehensive mobile UX review
- [ ] **Search performance optimization**: Elasticsearch implementation
- [ ] **Content recommendation engine**: ML-based related content
- [ ] **Accessibility compliance audit**: WCAG 2.1 AA verification
- [ ] **Performance monitoring setup**: Real User Monitoring implementation

### Medium Priority  
- [ ] **Advanced tag analytics**: Tag effectiveness measurement
- [ ] **User onboarding flow**: Guided first-time user experience
- [ ] **Content export features**: PDF compilation, citation export
- [ ] **Community moderation tools**: Enhanced admin capabilities
- [ ] **Multi-language support**: Portuguese content localization

### Low Priority
- [ ] **Dark/light mode toggle**: User preference system
- [ ] **Keyboard shortcuts**: Power user navigation
- [ ] **Advanced search filters**: Date ranges, study types
- [ ] **Social media integration**: Direct sharing capabilities
- [ ] **Email notifications**: Community updates, new content

### Technical Debt
- [ ] **Component library audit**: Consolidate similar components
- [ ] **Performance optimization**: Bundle size reduction
- [ ] **Test coverage improvement**: Unit and integration tests
- [ ] **Documentation updates**: API documentation, component docs
- [ ] **Error handling enhancement**: Better user error experiences

### Research & Discovery
- [ ] **User persona validation**: Quantitative user research
- [ ] **Content effectiveness study**: Learning outcome measurement
- [ ] **Community behavior analysis**: Usage pattern research
- [ ] **Competitor analysis**: Feature gap identification
- [ ] **Technology evaluation**: Next.js migration assessment

---

## 15. Revision History (live)

| Version | Date | Changes | Author |
|---------|------|---------|---------|
| 2.1.0 | 2025-06-09 | Complete rewrite based on Communication & Audience Alignment Report. Corrected platform purpose, audience definition, terminology, and technical documentation. | AI Assistant |
| 2.0.0 | 2025-06-09 | Initial comprehensive documentation of actual codebase state | AI Assistant |
| 1.x.x | Previous | Outdated documentation with incorrect platform framing | Legacy |

### Major Changes in v2.1.0
- **Purpose correction**: From "medical platform" to "scientific review platform for learners"
- **Audience redefinition**: Multi-level users seeking confidence, not verified professionals
- **Terminology alignment**: User-friendly language replacing medical jargon
- **Color system documentation**: Accurate monochrome-first implementation
- **Feature documentation**: Actual tag system, native editor, community features
- **User journey mapping**: Based on real user personas and emotional drivers
- **Technical accuracy**: Reflects actual codebase architecture and implementation

---

**Document Status**: ✅ Current and Accurate  
**Next Review**: 2025-07-09 (Monthly review cycle)  
**Maintainer**: Engineering Team via AI Assistant  
**Source of Truth**: This document reflects the actual platform implementation as of version 2.1.0
