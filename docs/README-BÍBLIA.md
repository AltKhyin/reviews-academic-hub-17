
# README‑BÍBLIA.md v3.6.0

## 1. Purpose & Pitch
Scientific journal platform with optimized review system, community features, and advanced performance monitoring. **Phase 1 API cascade resolution IN PROGRESS** - Community route optimization implemented with comprehensive type system foundation repair completed - all IDs now use database-compatible string format.

## 2. Glossary
- **Review Blocks**: Modular content components for scientific reviews (string IDs)
- **Bundle Optimizer**: System for lazy loading and performance monitoring
- **Memory Manager**: Automatic cleanup for React components
- **Error Boundaries**: Graceful error handling system
- **Rate Limiting**: API protection with intelligent queuing
- **UserInteractionContext**: Centralized user state management preventing API cascade
- **API Call Monitor**: Real-time tracking system preventing unauthorized component API calls
- **Component Auditor**: Automated system detecting API call violations and performance issues
- **Type System Foundation**: String-based ID system aligned with database schema (STABLE)
- **Community Data Loader**: Centralized parallel data loading for Community route (IMPLEMENTED)

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
│  │  └─ Type System Foundation (STABLE)
│  ├─ Centralized Data Management (IN PROGRESS)
│  │  ├─ Community Data Context (IMPLEMENTED)
│  │  ├─ Profile Data Context (PLANNED)
│  │  └─ Archive Data Context (PLANNED)
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
   ├─ API cascade prevention (IN PROGRESS)
   ├─ Real-time monitoring
   ├─ Component violation detection
   └─ Type system integrity (STABLE)
```

## 4. User Journeys
1. **Reader**: Browse → View Article → Community Discussion (API optimized)
2. **Reviewer**: Login → Access Editor → Create/Edit Reviews (Type system stable)
3. **Admin**: Dashboard → Content Management → Analytics

## 5. Domain Modules Index
- **Authentication**: `/src/contexts/AuthContext.tsx`
- **User Interactions**: `/src/contexts/UserInteractionContext.tsx`
- **API Monitoring**: `/src/middleware/ApiCallMiddleware.ts`
- **Community Data**: `/src/contexts/CommunityDataContext.tsx` (NEW)
- **Community Loader**: `/src/hooks/useCommunityDataLoader.ts` (NEW)
- **Block Management**: `/src/hooks/useBlockManagement.ts` (UPDATED - String IDs)
- **Review Types**: `/src/types/review.ts` (UPDATED - String ID support)
- **Editor Components**: `/src/components/editor/` (UPDATED - String ID compatible)

## 15. Revision History
- v3.6.0 (2025-06-13): Phase 1 API cascade fix - Community route optimization + type system stabilization
- v3.5.0 (2025-06-09): Type system foundation repair - String ID migration
- v3.4.0 (2025-06-08): Component auditor and API monitoring system implementation
- v3.3.0 (2025-06-07): Performance monitoring infrastructure complete
