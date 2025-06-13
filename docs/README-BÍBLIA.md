
# README‑BÍBLIA.md v3.3.0

## 1. Purpose & Pitch
Scientific journal platform with optimized review system, community features, and advanced performance monitoring. **Phase 1 performance optimizations COMPLETE** with API cascade resolution achieving target <10 requests per page.

## 2. Glossary
- **Review Blocks**: Modular content components for scientific reviews
- **Bundle Optimizer**: System for lazy loading and performance monitoring
- **Memory Manager**: Automatic cleanup for React components
- **Error Boundaries**: Graceful error handling system
- **Rate Limiting**: API protection with intelligent queuing
- **UserInteractionContext**: Centralized user state management preventing API cascade

## 3. High‑Level Architecture
```
┌─ Frontend (React/TS)
│  ├─ Performance Layer (COMPLETE)
│  │  ├─ Bundle Optimizer
│  │  ├─ Memory Manager  
│  │  ├─ Error Boundaries
│  │  └─ UserInteractionContext (NEW)
│  ├─ UI Components
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
   └─ API cascade prevention (NEW)
```

## 4. User Journeys
1. **Reader**: Browse → View Article → Community Discussion
2. **Reviewer**: Login → Access Editor → Create/Edit Reviews
3. **Admin**: Dashboard → Content Management → Analytics

## 5. Domain Modules Index
- **Authentication**: `/src/contexts/AuthContext.tsx`
- **User Interactions**: `/src/contexts/UserInteractionContext.tsx` (NEW)
- **Review System**: `/src/components/review/`
- **Performance**: `/src/utils/bundleOptimizer.ts`, `/src/utils/memoryManager.ts`
- **Error Handling**: `/src/components/error/`
- **Navigation**: `/src/layouts/DashboardLayout.tsx`

## 6. Data & API Schemas
```typescript
interface ReviewBlock {
  id: string;
  type: string;
  content: any;
  sort_index: number;
  visible: boolean;
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
```

## 7. UI Component Index
- **Error Boundaries**: `GlobalErrorBoundary`, `ComponentErrorBoundary`
- **Performance**: `BundleOptimizer`, `MemoryManager`
- **User Interactions**: `UserInteractionProvider`, `useUserInteractionContext` (NEW)
- **Review Components**: `BlockRenderer`, `NativeReviewViewer`
- **Layout**: `DashboardLayout`, `Sidebar`

## 8. Design Language
Material Design 3 with custom scientific journal styling. Dark theme default.

## 9. Accessibility Contract
WCAG 2.1 AA compliance with error boundary announcements and keyboard navigation.

## 10. Performance Budgets
- Initial bundle: <500KB (optimized with lazy loading)
- **API requests per page: <10** ✅ **ACHIEVED**
- Memory usage: <100MB sustained
- Error recovery: <3s average
- API response: <100ms with caching

## 11. Security & Compliance
Row Level Security with performance optimization. Rate limiting on all endpoints.

## 12. Admin & Ops
Admin panel with performance monitoring dashboard and error tracking.

## 13. Analytics & KPIs
- Bundle load times and cache hit rates
- Memory usage patterns
- Error frequency and recovery success
- **API request efficiency: <10 per page** ✅ **ACHIEVED**
- User engagement metrics

## 14. TODO / Backlog
**Phase 2 (Current):**
- Component refactoring for maintainability
- State management optimization
- Code organization improvements
- Advanced caching strategies

## 15. Revision History
- v3.3.0 (2025-06-13): **Phase 1 COMPLETE** - API cascade resolved, UserInteractionContext implemented, <10 requests achieved
- v3.2.0 (2025-06-13): Phase 1 completion - bundle optimization, memory management, error boundaries
- v3.1.0 (2025-06-13): Performance monitoring and query optimization
- v3.0.0 (2025-06-13): Major architecture improvements with unified systems
