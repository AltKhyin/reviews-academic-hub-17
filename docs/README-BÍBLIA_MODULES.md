
# README‑BÍBLIA MODULES v3.3.0

## 5. Domain Modules Index
- **Authentication**: `/src/contexts/AuthContext.tsx`
- **Review System**: `/src/components/review/`
- **Performance**: `/src/utils/bundleOptimizer.ts`, `/src/utils/memoryManager.ts`
- **Error Handling**: `/src/components/error/`
- **Navigation**: `/src/layouts/DashboardLayout.tsx`
- **Query Management**: `/src/hooks/useUnifiedQuery.ts`, `/src/hooks/useOptimizedQuery.ts`

## 6. Data & API Schemas
```typescript
interface ReviewBlock {
  id: string;
  type: string;
  content: any;
  sort_index: number;
  visible: boolean;
}

interface BundleAnalytics {
  chunkName: string;
  loadTime: number;
  cached: boolean;
}

interface QueryMetrics {
  totalQueries: number;
  cacheHits: number;
  rateLimitBlocks: number;
}
```

## 7. UI Component Index
- **Error Boundaries**: `GlobalErrorBoundary`, `ComponentErrorBoundary`
- **Performance**: `BundleOptimizer`, `MemoryManager`
- **Review Components**: `BlockRenderer`, `NativeReviewViewer`
- **Layout**: `DashboardLayout`, `Sidebar`
