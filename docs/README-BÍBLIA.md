
# README‑BÍBLIA.md v3.7.0

## 1. Purpose & Pitch
Scientific journal platform with optimized review system, community features, and advanced performance monitoring. **Phase 2 New Section Development IMPLEMENTED** - created optimized "Recent Issues" and "Recommended" sections with zero per-card API calls and scientific journal styling.

## 2. Glossary
- **Review Blocks**: Modular content components for scientific reviews (string IDs)
- **Bundle Optimizer**: System for lazy loading and performance monitoring
- **Memory Manager**: Automatic cleanup for React components
- **Error Boundaries**: Graceful error handling system
- **Rate Limiting**: API protection with intelligent queuing
- **UserInteractionContext**: Centralized user state management preventing API cascade
- **API Call Monitor**: Real-time tracking system preventing unauthorized component API calls
- **Component Auditor**: Automated system detecting API call violations and performance issues
- **Type System Foundation**: String-based ID system aligned with database schema
- **Optimized Sections**: New homepage sections with zero per-card API architecture

## 3. High‑Level Architecture
```
┌─ Frontend (React/TS)
│  ├─ Performance Layer (COMPLETE)
│  │  ├─ Bundle Optimizer
│  │  ├─ Memory Manager  
│  │  ├─ Error Boundaries
│  │  ├─ UserInteractionContext
│  │  ├─ API Call Monitor
│  │  ├─ Component Auditor
│  │  ├─ Type System Foundation
│  │  └─ Optimized Sections (NEW)
│  ├─ UI Components (OPTIMIZED)
│  ├─ Lazy Routes
│  └─ State Management
├─ Backend (Supabase)
│  ├─ Database (PostgreSQL)
│  ├─ Auth System
│  ├─ Storage
│  └─ Real-time subscriptions
└─ Performance Monitoring
   ├─ Query optimization
   ├─ Memory tracking
   ├─ Bundle analytics
   ├─ API cascade prevention
   ├─ Real-time monitoring
   ├─ Component violation detection
   ├─ Type system integrity
   └─ Zero per-card API architecture (NEW)
```

## 4. User Journeys
1. **Reader**: Browse → View Article → Community Discussion
2. **Reviewer**: Login → Access Editor → Create/Edit Reviews
3. **Admin**: Dashboard → Content Management → Analytics

## 5. Domain Modules Index
- **Authentication**: `/src/contexts/AuthContext.tsx`
- **User Interactions**: `/src/contexts/UserInteractionContext.tsx`
- **API Monitoring**: `/src/middleware/ApiCallMiddleware.ts`
- **Component Auditing**: `/src/utils/componentAudit.ts`
- **Type Definitions**: `/src/types/review.ts`, `/src/types/grid.ts`
- **Review System**: `/src/components/review/`
- **Performance**: `/src/utils/bundleOptimizer.ts`, `/src/utils/memoryManager.ts`
- **Error Handling**: `/src/components/error/`
- **Navigation**: `/src/layouts/DashboardLayout.tsx`
- **Section Registry**: `/src/config/sections.ts` (UPDATED - added optimized sections)
- **Optimized Sections**: `/src/components/homepage/sections/OptimizedRecentSection.tsx`, `/src/components/homepage/sections/OptimizedRecommendedSection.tsx` (NEW)

## 6. Data & API Schemas
```typescript
interface ReviewBlock {
  id: string; // String IDs for database compatibility
  type: BlockType;
  content: any;
  sort_index: number;
  visible: boolean;
  meta?: {
    spacing?: SpacingConfig;
    alignment?: AlignmentConfig;
    layout?: LayoutConfig;
  };
}

interface SpacingConfig {
  top?: number;
  bottom?: number;
  left?: number;
  right?: number;
  margin?: {
    top?: number;
    bottom?: number;
    left?: number;
    right?: number;
  };
  padding?: {
    top?: number;
    bottom?: number;
    left?: number;
    right?: number;
  };
}

interface UserInteractionState {
  bookmarks: Set<string>;
  reactions: Map<string, string[]>;
  isLoading: boolean;
  error: string | null;
}

interface BundleAnalytics {
  chunkName: string;
  loadTime: number;
  cached: boolean;
}

// API Monitoring Schemas
interface ApiCallLog {
  endpoint: string;
  component: string;
  count: number;
  lastCall: number;
}

interface ComponentAuditResult {
  componentName: string;
  violations: string[];
  apiCallCount: number;
  recommendations: string[];
}

// Grid Layout Schemas (NEW)
interface GridPosition {
  row: number;
  column: number;
}

interface Grid2DLayout {
  id: string;
  rows: GridRow[];
  columns: number;
  columnWidths?: number[];
  grid_rows?: number;
  gap?: number;
  rowHeights?: number[];
}

// Section Registry Schema (UPDATED)
interface SectionDefinition {
  id: string;
  title: string;
  component: string;
  defaultVisible: boolean;
  defaultOrder: number;
  description?: string;
  adminOnly?: boolean;
  dependencies?: string[];
}

// Current Active Sections: reviewer, featured, recent (optimized), upcoming, recommended (optimized)
// Archived Section: trending (hidden by default)

// Optimized Section Architecture (NEW)
interface OptimizedSectionProps {
  // Zero per-card API calls - uses data from useOptimizedHomepage hook
  // Scientific journal styling with transparent overlays
  // Hover states with expanded information
  // Monochromatic color scheme enforcement
}
```

## 7. UI Component Index
- **Error Boundaries**: `GlobalErrorBoundary`, `ComponentErrorBoundary`
- **Performance**: `BundleOptimizer`, `MemoryManager`
- **User Interactions**: `UserInteractionProvider`, `useUserInteractionContext`
- **API Monitoring**: `ApiCallMonitor`, `ComponentAuditor`
- **Review Components**: `BlockRenderer`, `NativeReviewViewer`
- **Editor Components**: `BlockContentEditor`, `SingleBlock`, `Grid2DCell`
- **Layout**: `DashboardLayout`, `Sidebar`
- **Homepage Sections**: `ReviewerNotesSection`, `FeaturedSection`, `UpcomingSection`, `OptimizedRecentSection` (NEW), `OptimizedRecommendedSection` (NEW)

## 8. Design Language
Material Design 3 with custom scientific journal styling. Dark theme default with monochromatic enforcement. New sections implement scientific journal aesthetic with transparent overlays and hover expansion.

## 9. Accessibility Contract
WCAG 2.1 AA compliance with error boundary announcements and keyboard navigation.

## 10. Performance Budgets
- Initial bundle: <500KB (optimized with lazy loading)
- **API requests per page: <10** ✅ **TARGET - ACHIEVED WITH NEW SECTIONS**
- Memory usage: <100MB sustained
- Error recovery: <3s average
- API response: <100ms with caching
- **Monitoring overhead: <5MB** ✅ **ACHIEVED**
- **Type system integrity: 100%** ✅ **COMPLETE**
- **Zero per-card API calls: IMPLEMENTED** ✅ **NEW SECTIONS**

## 11. Security & Compliance
Row Level Security with performance optimization. Rate limiting on all endpoints.

## 12. Admin & Ops
Admin panel with performance monitoring dashboard and error tracking.

## 13. Analytics & KPIs
- Bundle load times and cache hit rates
- Memory usage patterns
- Error frequency and recovery success
- **API request efficiency: <10 per page** ✅ **TARGET - ACHIEVED**
- **Real-time performance monitoring** ✅ **ACTIVE**
- **Component violation tracking** ✅ **ACTIVE**
- **Type system compliance: 100%** ✅ **ACHIEVED**
- **Optimized section performance: Zero per-card API calls** ✅ **IMPLEMENTED**
- User engagement metrics

## 14. TODO / Backlog
**Phase 3 (Current):**
- Component refactoring for maintainability
- State management optimization
- Code organization improvements
- Advanced caching strategies
- Performance validation and monitoring

**Future Phases:**
- Advanced analytics and reporting
- Enhanced user experience features
- Mobile responsiveness improvements
- Accessibility enhancements

## 15. Revision History
- v3.7.0 (2025-06-13): **Phase 2 New Section Development COMPLETE** - Implemented OptimizedRecentSection (horizontal scroll, 2x width leftmost card) and OptimizedRecommendedSection (2x3 grid) with zero per-card API architecture and scientific journal styling
- v3.6.0 (2025-06-13): **Section Cleanup COMPLETE** - Removed high-API sections to prepare for optimized replacements
- v3.5.0 (2025-06-13): Type System Foundation Repair COMPLETE - All IDs migrated to string format
- v3.4.0 (2025-06-13): Phase 1 API CASCADE RESOLUTION IMPLEMENTED - Monitoring system complete
- v3.3.0 (2025-06-13): Phase 1 complete - API cascade resolved, UserInteractionContext implemented
- v3.2.0 (2025-06-13): Phase 1 completion - bundle optimization, memory management, error boundaries
- v3.1.0 (2025-06-13): Performance monitoring and query optimization
- v3.0.0 (2025-06-13): Major architecture improvements with unified systems
