
# README‑BÍBLIA MODULES v3.4.0

## 5. Domain Modules Index
- **Authentication**: `/src/contexts/AuthContext.tsx`
- **Review System**: `/src/components/review/`, `/src/components/editor/`
- **Editor Core**: `/src/hooks/useBlockManagement.ts`, `/src/components/editor/BlockEditor.tsx`
- **Editor Data Adapters**: `/src/lib/editor-adapter.ts`
- **Performance**: `/src/utils/bundleOptimizer.ts`, `/src/utils/memoryManager.ts`
- **Error Handling**: `/src/components/error/`
- **Navigation**: `/src/layouts/DashboardLayout.tsx`
- **Query Management**: `/src/hooks/useUnifiedQuery.ts`, `/src/hooks/useOptimizedQuery.ts`

## 6. Data & API Schemas
```typescript
// The primary data structure for a review document
interface Review {
  id: string;
  title: string;
  elements: LayoutElement[]; // The top-level structure of the review document
  blocks: { [key: string]: ReviewBlock }; // All blocks data, keyed by their ID
  version: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

// Represents a single piece of content (text, image, etc.)
interface ReviewBlock {
  id: string;
  type: string; // e.g., 'text', 'image', 'grid'
  content: any;
  sort_index: number; // Legacy, used for DB storage
  visible: boolean;
  meta?: any;
}

// Represents a structural element on the editor canvas
interface LayoutElement {
  id: string;
  type: 'row' | 'grid' | 'block_container';
  blockId?: string; // For 'block_container'
  columns?: any[]; // For 'row'
  rows?: any[]; // For 'grid'
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
- **Editor Components**: `BlockEditor`, `BlockList`, `LayoutRow`, `LayoutGrid`
- **Layout**: `DashboardLayout`, `Sidebar`
