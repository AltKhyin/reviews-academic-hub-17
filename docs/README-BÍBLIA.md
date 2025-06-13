
# README-BÍBLIA v1.1.0

> **Canonical Repository Documentation**  
> Complete context in 2 minutes for any AI or human developer  
> Last Updated: 2025-06-13 | Performance Optimization Phase

---

## 1. Purpose & Pitch

**MedReviews** is a comprehensive medical literature review platform that transforms complex medical research into accessible, structured content for healthcare professionals. The platform specializes in evidence-based medicine delivery through interactive reviews, community discussions, and expert annotations.

**Core Value Proposition:**
- **Structured Reviews**: Convert dense medical papers into digestible, interactive content
- **Expert Curation**: Medical professionals review and annotate research
- **Community Engagement**: Healthcare professionals discuss findings and clinical applications
- **Evidence Accessibility**: Make medical research more accessible to practicing clinicians

**Target Audience:** Healthcare professionals, medical students, researchers, and clinical decision-makers seeking evidence-based medical information.

**Competitive Advantage:** Combines expert curation with community interaction, creating a comprehensive knowledge base that bridges research and clinical practice.

---

## 2. Glossary

| Term | Definition |
|------|------------|
| **Issue** | A complete medical literature review with structured content blocks |
| **Review Block** | Modular content component (text, image, poll, etc.) within an issue |
| **Native Review** | Structured, interactive content format (vs. PDF-only) |
| **Enhanced Article Viewer** | Multi-mode viewer supporting native, PDF, and dual view modes |
| **Entity Type** | Classification system: 'issue', 'article', 'post' |
| **RLS** | Row Level Security - Postgres security model |
| **Comment Tree** | Hierarchical comment system with replies and voting |
| **Rate Limiting** | API request throttling to prevent abuse |
| **Query Deduplication** | Intelligent caching to prevent redundant database calls |
| **Optimistic Updates** | UI updates before server confirmation for better UX |
| **Analytics Events** | User interaction tracking for engagement analysis |
| **Performance Monitoring** | Real-time application performance tracking |

---

## 3. High-Level Architecture

**Frontend Architecture:**
```
React + TypeScript + Vite
├── Tailwind CSS (styling)
├── Shadcn/UI (component library)
├── React Query (state management & caching)
├── React Router (navigation)
└── Supabase Client (API integration)
```

**Backend Architecture:**
```
Supabase (PostgreSQL + Edge Functions)
├── Authentication (RLS-based security)
├── Database (PostgreSQL with optimized indexes)
├── Storage (file management)
├── Edge Functions (custom logic)
└── Real-time subscriptions
```

**Data Flow:**
1. **User Authentication** → Supabase Auth → Profile Creation
2. **Content Consumption** → Optimized Queries → Cached Results
3. **User Interactions** → Rate-Limited APIs → Database Updates
4. **Real-time Updates** → Supabase Subscriptions → UI Refresh

**Performance Optimizations:**
- **Query Deduplication**: Prevents redundant API calls
- **Intelligent Caching**: Multi-layer caching with TTL
- **Rate Limiting**: Per-endpoint request throttling
- **Batch Operations**: Optimized database transactions
- **Component Optimization**: React.memo and useMemo usage

---

## 4. User Journeys

### Primary User Journey: Content Consumption
1. **Landing** → Browse featured issues or search archive
2. **Discovery** → Preview issue metadata and description
3. **Consumption** → Read native review with interactive elements
4. **Engagement** → Comment, vote on polls, bookmark content
5. **Community** → Participate in discussions and vote on content

### Secondary User Journey: Community Participation
1. **Authentication** → Sign up/login via Supabase Auth
2. **Profile Setup** → Complete medical professional profile
3. **Content Interaction** → Comment on reviews, vote on polls
4. **Discussion Participation** → Contribute to community discussions
5. **Content Curation** → Bookmark and organize relevant content

### Admin Journey: Content Management
1. **Admin Access** → Role-based authentication
2. **Content Creation** → Create and structure review blocks
3. **Community Moderation** → Manage comments and user interactions
4. **Analytics Review** → Monitor engagement and performance metrics
5. **Platform Optimization** → Review performance data and optimize

---

## 5. Domain Modules Index

### Core Content System
- **Issues Management** (`src/components/issues/`)
  - Issue creation, editing, and publishing
  - Metadata management (specialty, year, population)
  - Content structuring and organization

- **Review System** (`src/components/review/`)
  - Native review viewer with multiple modes
  - Block-based content rendering
  - Interactive elements (polls, media, text)

### User Interaction System
- **Comments System** (`src/hooks/comments/`)
  - Hierarchical comment threads
  - Voting and scoring mechanisms
  - Real-time updates and notifications

- **Community Features** (`src/components/community/`)
  - User profiles and authentication
  - Discussion forums and threads
  - Content bookmarking and curation

### Performance & Infrastructure
- **Query Optimization** (`src/hooks/`)
  - Unified query system with caching
  - Rate limiting and request deduplication
  - Performance monitoring and analytics

- **Database Layer** (Supabase)
  - Optimized indexes for common queries
  - RLS policies for data security
  - Efficient data fetching patterns

---

## 6. Data & API Schemas

### Core Entities

**Issues Table:**
```sql
issues {
  id: uuid (PK)
  title: text
  description: text
  specialty: text (indexed)
  year: text
  population: text
  review_type: text ('pdf' | 'native')
  published: boolean (indexed)
  featured: boolean (indexed)
  score: integer (indexed)
  created_at: timestamp
  updated_at: timestamp
}
```

**Review Blocks Table:**
```sql
review_blocks {
  id: bigint (PK)
  issue_id: uuid (FK, indexed)
  type: text
  payload: jsonb
  sort_index: integer
  visible: boolean (indexed)
  created_at: timestamp
}
```

**Comments Table:**
```sql
comments {
  id: uuid (PK)
  user_id: uuid (FK, indexed)
  issue_id: uuid (FK, indexed)
  parent_id: uuid (FK, indexed)
  content: text
  score: integer (indexed)
  created_at: timestamp (indexed)
  updated_at: timestamp
}
```

### API Endpoints (Rate Limited)

**Core Content APIs:**
- `GET /api/issues` - List issues with pagination (20 req/min)
- `GET /api/issues/:id` - Get issue details (30 req/min)
- `GET /api/review-blocks/:issueId` - Get review blocks (10 req/min)

**Interactive APIs:**
- `POST /api/comments` - Create comment (5 req/min)
- `POST /api/votes` - Vote on content (10 req/min)
- `GET /api/comments/:entityId` - Get comments (20 req/min)

---

## 7. UI Component Index

### Core Components

**Article/Issue Viewers:**
- `EnhancedArticleViewer` - Multi-mode content viewer
- `NativeReviewViewer` - Structured review display
- `PDFViewer` - PDF document renderer
- `ViewModeSwitcher` - Mode selection controls

**Review Content:**
- `BlockRenderer` - Dynamic block content renderer
- `ReviewPollBlock` - Interactive poll component
- `ReviewTextBlock` - Rich text content display
- `ReviewImageBlock` - Image content with captions

**Community Features:**
- `CommentTree` - Hierarchical comment display
- `CommentForm` - Comment creation interface
- `VotingControls` - Upvote/downvote interface
- `UserProfile` - User information display

### Shared Components
- `Button`, `Card`, `Badge` - UI primitives from Shadcn
- `LoadingSpinner` - Loading state indicator
- `ErrorBoundary` - Error handling wrapper
- `Toast` - User feedback system

---

## 8. Design Language

**Color Palette:**
- Primary: Blue (#3B82F6) - Trust, medical professionalism
- Secondary: Gray (#6B7280) - Content, neutral information
- Success: Green (#10B981) - Positive actions, success states
- Warning: Yellow (#F59E0B) - Attention, caution states
- Error: Red (#EF4444) - Errors, critical information

**Typography:**
- Headers: Inter, semi-bold weights
- Body: Inter, regular weight
- Code: JetBrains Mono, monospace

**Spacing System:**
- Base unit: 4px (0.25rem)
- Component spacing: 8px, 16px, 24px, 32px
- Layout spacing: 48px, 64px, 96px

**Interactive Elements:**
- Hover states with 200ms transitions
- Focus rings for accessibility
- Loading states with skeleton screens
- Error states with recovery options

---

## 9. Accessibility Contract

**WCAG 2.1 AA Compliance:**
- Keyboard navigation support for all interactive elements
- Screen reader compatibility with ARIA labels
- Color contrast ratios meeting 4.5:1 minimum
- Focus management for modal dialogs and navigation

**Implementation Standards:**
- Semantic HTML structure throughout
- Alternative text for all images and media
- Descriptive link text and button labels
- Form validation with clear error messages

**Testing Requirements:**
- Automated accessibility testing in CI/CD
- Manual testing with screen readers
- Keyboard-only navigation testing
- Color blindness simulation testing

---

## 10. Performance Budgets

**Loading Performance:**
- Initial page load: <2 seconds on 3G connection
- Time to Interactive (TTI): <3 seconds
- Largest Contentful Paint (LCP): <2.5 seconds
- First Input Delay (FID): <100ms

**Bundle Size Limits:**
- Initial JavaScript bundle: <500KB gzipped
- CSS bundle: <100KB gzipped
- Total page weight: <1MB including images

**Runtime Performance:**
- Component re-renders: <50ms per interaction
- Memory usage: <100MB sustained
- Database query response: <100ms average
- API endpoint response: <200ms average

**Monitoring Implementation:**
- Real-time performance monitoring
- Core Web Vitals tracking
- Bundle size monitoring in CI/CD
- Database query performance alerts

---

## 11. Security & Compliance

**Authentication & Authorization:**
- Supabase Auth with role-based access control
- Row Level Security (RLS) policies on all tables
- JWT token management with automatic refresh
- Session management with secure cookies

**Data Protection:**
- Input validation and sanitization
- SQL injection prevention through parameterized queries
- XSS protection with content security policies
- Rate limiting on all API endpoints

**Compliance Preparation:**
- GDPR-ready data handling procedures
- Data retention and deletion policies
- Audit logging for sensitive operations
- User consent management system

**Security Monitoring:**
- Failed login attempt tracking
- Suspicious activity detection
- Security event logging
- Regular security assessment procedures

---

## 12. Admin & Ops

**Content Management:**
- Admin dashboard for content creation and editing
- Review workflow for quality assurance
- Bulk operations for content management
- Analytics dashboard for engagement metrics

**User Management:**
- Role assignment and permission management
- User activity monitoring and moderation
- Community guidelines enforcement tools
- Automated spam and abuse detection

**System Operations:**
- Database backup and recovery procedures
- Performance monitoring and alerting
- Error tracking and resolution workflows
- Deployment and rollback procedures

**Monitoring & Alerting:**
- Application performance monitoring (APM)
- Database performance monitoring
- User experience analytics
- System health checks and alerts

---

## 13. Analytics & KPIs

**Engagement Metrics:**
- Daily/Monthly Active Users (DAU/MAU)
- Content consumption patterns and duration
- Community interaction rates (comments, votes)
- User retention and return visit patterns

**Content Performance:**
- Most popular issues and specialties
- Review completion rates
- Interactive element engagement (polls, comments)
- Content sharing and bookmarking rates

**Technical Performance:**
- Page load times and Core Web Vitals
- API response times and error rates
- Database query performance metrics
- User experience satisfaction scores

**Business Intelligence:**
- User journey analysis and conversion funnels
- Feature adoption and usage patterns
- Community growth and engagement trends
- Content quality and relevance metrics

---

## 14. TODO / Backlog

### Phase 1: Performance Optimization (In Progress)
- [x] Database index optimization
- [x] Query deduplication system
- [x] Rate limiting implementation
- [ ] Bundle size optimization
- [ ] Memory leak prevention
- [ ] Error handling standardization

### Phase 2: Code Quality & Architecture
- [ ] Component refactoring and size reduction
- [ ] State management optimization
- [ ] Code organization and documentation
- [ ] Testing infrastructure setup
- [ ] CI/CD pipeline improvements

### Phase 3: Security & Advanced Features
- [ ] Comprehensive security audit
- [ ] Advanced monitoring and observability
- [ ] Testing framework implementation
- [ ] Performance regression testing
- [ ] Security vulnerability assessment

### Future Enhancements
- [ ] Mobile application development
- [ ] Advance search and filtering
- [ ] AI-powered content recommendations
- [ ] Integration with medical databases
- [ ] Multi-language support

---

## 15. Revision History

| Version | Date | Changes | Author |
|---------|------|---------|---------|
| 1.0.0 | 2025-06-13 | Initial documentation creation | System |
| 1.1.0 | 2025-06-13 | Performance optimization phase updates | System |

### Version 1.1.0 Changes:
- Added performance optimization architecture details
- Documented new query system and caching layer
- Updated API rate limiting specifications
- Enhanced component architecture documentation
- Added performance budgets and monitoring details
- Expanded technical debt and optimization roadmap

---

**End of README-BÍBLIA v1.1.0**
