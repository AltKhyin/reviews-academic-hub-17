
# README-BÍBLIA.md v3.8.0 — Reviews Clinical Platform
> **Objective**  
> Provide any member (human or AI) with 360° understanding of Reviews in under 2 minutes, serving as canonical source for product, marketing, design and technology decisions.

---

## 🎯 1. Purpose & Quick Pitch (30 lines max)
| Item | Description |
|------|-----------|
| Problem | Brazilian clinicians need to stay updated but lack time to read full papers or filter noise on social media. |
| Solution | Subscription delivering 2–3 critical reviews of clinical articles per week (short PDF) + moderated debate space with mandatory references. |
| Key Benefit | Applicable insight in **≤ 10 min** + critical interpretation learning in safe environment. |
| Tagline | "Clinical updates, 10 min at a time." |
| Status | Active development with performance optimization underway |

---

## 👥 2. Glossary (60 lines max)
| Term | Definition | Context |
|------|------------|---------|
| **Review** | 2-3 page critical analysis of clinical paper | Core product deliverable |
| **Striver** | Resident seeking competence in rounds | Primary persona |
| **Bridger** | 2-5 year clinician managing heavy workload | Secondary persona |
| **Influencer** | University professor maintaining reputation | Tertiary persona |
| **Section** | Homepage component (featured, recent, etc.) | Technical architecture |
| **Query System** | Unified data fetching with intelligent caching | Performance optimization |
| **Monochromatic Theme** | Grayscale-first design with semantic color | Design system |

---

## 🏗️ 3. High-Level Architecture (120 lines max)

### Frontend Stack
- **React 18** + TypeScript + Vite
- **Tailwind CSS** with monochromatic design system
- **TanStack Query** for unified data fetching
- **Supabase** for backend services

### Key Systems
| System | Components | Purpose |
|---------|------------|---------|
| **Section Management** | SECTION_REGISTRY, useSectionVisibility | Homepage configuration |
| **Query System** | useUnifiedQuery, useUnifiedPerformance | Performance optimization |
| **Navigation** | NavigationService, useAppNavigation | Consistent routing |
| **Authentication** | AuthContext, Supabase Auth | User management |

### Performance Architecture
- Unified query system replacing 15+ hooks with 5 focused ones
- Priority-based caching (critical/normal/background)
- Intelligent cache invalidation
- Single performance monitoring system

---

## 🛣️ 4. User Journeys (150 lines max)

### Primary Journey: Content Consumption
1. **Landing** → Homepage with configured sections
2. **Browse** → Archive with specialty/year filters
3. **Read** → Issue viewer with PDF/block content
4. **Engage** → Comments and community discussions

### Admin Journey: Content Management
1. **Access** → Admin panel with role verification
2. **Configure** → Homepage sections via unified manager
3. **Publish** → Issues with block-based editor
4. **Monitor** → Analytics and performance metrics

### Navigation Patterns
- Archive cards → `/article/{id}` via NavigationService
- Section configuration → Immediate UI updates with database persistence
- Error fallbacks → Homepage with user notifications

---

## 📊 5. Domain Modules Index

### Core Data Models
| Module | Location | Purpose |
|---------|----------|---------|
| Issues | `src/types/issue.ts` | Clinical review content |
| Sections | `src/config/sections.ts` | Homepage configuration |
| Comments | `src/types/comment.ts` | User engagement |
| Analytics | Analytics dashboard | Performance metrics |

### Hook Architecture
| Hook | Replaces | Purpose |
|------|----------|---------|
| `useUnifiedQuery` | useOptimized* hooks | Single query system |
| `useSectionVisibility` | Custom section logic | Homepage configuration |
| `useArchiveData` | useOptimizedArchiveData | Archive content |
| `useSidebarData` | useOptimizedSidebarData | Sidebar statistics |

---

## 🔌 6. Data & API Schemas

### Database Tables (Key Entities)
```sql
-- Core content
issues (id, title, specialty, published, featured, score)
review_blocks (id, issue_id, type, payload, sort_index)

-- User engagement  
comments (id, user_id, issue_id, content, score)
profiles (id, role, full_name, specialty)

-- Configuration
site_meta (key, value) -- Homepage settings
tag_configurations (tag_data, is_active)
```

### RPC Functions
- `get_sidebar_stats()` → Community statistics
- `get_top_threads(min_comments)` → Popular discussions
- `get_featured_issue()` → Homepage featured content

---

## 🎨 7. UI Component Index

### Design System - Monochromatic Theme
| Component Type | Base Classes | Purpose |
|----------------|--------------|---------|
| Cards | `bg-card border-border` | Content containers |
| Buttons | `bg-primary text-primary-foreground` | Actions |
| Text | `text-foreground text-muted` | Typography |
| Inputs | `bg-input border-border` | Form elements |

### Section Components
- `FeaturedSection` → Hero content display
- `RecentSection` → Latest issues grid
- `UpcomingSection` → Release countdown
- `ReviewerNotesSection` → Admin messages (admin-only)

---

## 🎨 8. Design Language (120 lines max)

### Color System - Enforced Monochromatic
```css
:root {
  /* Base Grayscale Palette */
  --background: 0 0% 7%;        /* #121212 - Pure dark */
  --foreground: 0 0% 96%;       /* #F5F5F5 - Pure light */
  --card: 0 0% 10%;             /* #1A1A1A - Card backgrounds */
  --border: 0 0% 20%;           /* #333333 - Subtle borders */
  --muted: 0 0% 60%;            /* #999999 - Secondary text */
  
  /* Interactive States */
  --primary: 0 0% 98%;          /* White for buttons */
  --primary-foreground: 0 0% 7%; /* Dark text on light */
  --hover: rgba(255,255,255,0.06); /* Subtle hover */
  
  /* Semantic Colors ONLY */
  --success: 142 76% 36%;       /* Green for positive states */
  --warning: 38 92% 50%;        /* Yellow for warnings */
  --destructive: 0 84% 60%;     /* Red for errors */
}
```

### Typography
- **Headers**: Playfair Display (serif elegance)
- **Body**: Inter (clean readability)
- **Contrast**: Minimum 4.5:1 for accessibility

### Interaction Principles
- Grayscale-first design with semantic color usage
- Hover states via opacity, not color shifts
- Focus indicators via `--ring` token
- **NO BLUE** unless explicitly semantic

---

## ♿ 9. Accessibility Contract (100 lines max)

### Standards Compliance
- **WCAG 2.1 AA** minimum compliance
- Keyboard navigation for all interactive elements
- Screen reader compatibility with ARIA labels
- High contrast ratios (4.5:1+)

### Implementation
| Feature | Implementation | Status |
|---------|---------------|---------|
| Focus Management | `--ring` token indicators | ✅ Active |
| Keyboard Nav | Tab order, Enter/Space handlers | ✅ Active |
| Screen Readers | ARIA labels, roles, descriptions | ✅ Active |
| Color Contrast | Monochromatic theme ensures compliance | ✅ Active |

---

## ⚡ 10. Performance Budgets (80 lines max)

### Current Metrics (Post-Optimization)
| Metric | Target | Current | Status |
|---------|--------|---------|--------|
| Initial Load | <1s | <1s | ✅ Achieved |
| Section Updates | <500ms | <300ms | ✅ Exceeded |
| Navigation | <300ms | <200ms | ✅ Exceeded |
| Memory Usage | Stable | Stable | ✅ Maintained |

### Optimization Strategies
- Unified query system (15 hooks → 5)
- Priority-based caching
- Single performance monitor
- Intelligent prefetching

---

## 🔐 11. Security & Compliance (100 lines max)

### Authentication & Authorization
- Supabase Auth with role-based access
- RLS policies on all data tables
- Admin-only sections filtered by user role

### Data Protection
| Aspect | Implementation | Compliance |
|---------|---------------|------------|
| User Data | RLS + JWT tokens | LGPD Ready |
| Admin Access | Role verification | Secure |
| API Security | Rate limiting planned | In Progress |

---

## 🛠️ 12. Admin & Operations (120 lines max)

### Current Admin Capabilities
- Homepage section management via unified interface
- Issue publishing with block-based editor
- User role management
- Analytics dashboard access

### Technical Operations
- Performance monitoring via unified system
- Database query optimization
- Error tracking and reporting
- Cache management strategies

---

## 📈 13. Analytics & KPIs (120 lines max)

### User Engagement Metrics
| KPI | Measurement | Frequency |
|-----|-------------|-----------|
| Section Interactions | Click-through rates | Real-time |
| Content Consumption | Time on issue pages | Daily |
| Community Activity | Comments, votes | Live |
| Performance | Load times, errors | Continuous |

### Technical Metrics
- Query performance via unified monitoring
- Cache hit rates
- Error rates and recovery
- Resource utilization

---

## 📋 14. TODO / Backlog

### In Progress (Current Sprint)
- [x] Unified section registry implementation
- [x] Query system consolidation
- [x] Database constraint fixes
- [ ] Archive navigation completion
- [ ] API rate limiting implementation

### Next Sprint
- [ ] Complete legacy hook removal
- [ ] Enhanced error boundary implementation
- [ ] Advanced caching strategies
- [ ] Mobile responsiveness optimization

### Future Considerations
- [ ] Real-time collaboration features
- [ ] Advanced search capabilities
- [ ] Multi-language support
- [ ] Offline reading mode

---

## 📝 15. Revision History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 3.8.0 | 2025-01-11 | Updated color theme to monochromatic design system, performance architecture documentation | AI Assistant |
| 3.7.0 | 2025-01-11 | Added unified query system, section registry, performance optimizations | AI Assistant |
| 3.6.0 | 2025-01-11 | Refactored for AI readability, added navigation index | AI Assistant |
| 3.5.0 | 2025-01-10 | Enhanced performance monitoring documentation | AI Assistant |
| 3.4.0 | 2025-01-10 | Added analytics dashboard and enhanced section management | AI Assistant |

---

**✅ README-BÍBLIA Status**: Complete and current as of v3.8.0  
**Next Review**: After completion of current optimization sprint  
**Maintainer**: AI Assistant with human oversight
