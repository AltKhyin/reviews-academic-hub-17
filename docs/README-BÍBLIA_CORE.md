
# README‑BÍBLIA CORE v3.3.0

## 1. Purpose & Pitch
Scientific journal platform with optimized review system, community features, and advanced performance monitoring. Phase 1 performance optimizations complete with 60-80% query improvement and API request deduplication.

## 2. Glossary
- **Review Blocks**: Modular content components for scientific reviews
- **Bundle Optimizer**: System for lazy loading and performance monitoring
- **Memory Manager**: Automatic cleanup for React components
- **Error Boundaries**: Graceful error handling system
- **Rate Limiting**: API protection with intelligent queuing
- **Query Deduplication**: Prevents duplicate API requests

## 3. High‑Level Architecture
```
┌─ Frontend (React/TS)
│  ├─ Performance Layer (ACTIVE)
│  │  ├─ Bundle Optimizer ✅
│  │  ├─ Memory Manager ✅
│  │  ├─ Error Boundaries ✅
│  │  └─ Query Deduplication ✅
│  ├─ UI Components
│  ├─ Lazy Routes
│  └─ State Management
├─ Backend (Supabase)
│  ├─ Database (PostgreSQL)
│  ├─ Auth System
│  ├─ Storage
│  └─ Real-time subscriptions
└─ Performance Monitoring
   ├─ Query optimization ✅
   ├─ Memory tracking ✅
   └─ Bundle analytics ✅
```

## 4. User Journeys
1. **Reader**: Browse → View Article → Community Discussion
2. **Reviewer**: Login → Access Editor → Create/Edit Reviews
3. **Admin**: Dashboard → Content Management → Analytics

## 15. Revision History
- v3.3.0 (2025-06-13): API request cascade fix, README refactoring for maintainability
- v3.2.0 (2025-06-13): Phase 1 completion - bundle optimization, memory management, error boundaries
- v3.1.0 (2025-06-13): Performance monitoring and query optimization
- v3.0.0 (2025-06-13): Major architecture improvements with unified systems
