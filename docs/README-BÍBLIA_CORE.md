# README-BÍBLIA CORE v3.2.1
> **Core System State** | Last Updated: 2025-06-13

## 🎯 PURPOSE & PITCH _(30 lines max)_

Reviews. é uma plataforma de revisão científica criada por Igor Eckert, oferecendo:
- **Revisões Nativas**: Conteúdo estruturado em blocos interativos
- **Visualização Dual**: Artigos originais lado a lado com revisões
- **Comunidade Acadêmica**: Discussões e colaboração entre pesquisadores
- **Performance Otimizada**: Sistema de cache inteligente e carregamento otimizado
- **Mobile-First**: Design responsivo para todas as telas

## 📚 GLOSSARY _(60 lines max)_

**Architecture Terms:**
- **Review Block**: Unidade básica de conteúdo (heading, paragraph, figure, etc.)
- **Native Review**: Revisão estruturada em blocos vs PDF tradicional
- **Dual Viewer**: Visualização lado a lado (nativo + PDF original)
- **Query Optimization**: Sistema unificado de cache e prefetching
- **Bundle Optimization**: Lazy loading inteligente de componentes

**Content Types:**
- **Issue**: Artigo científico com metadados completos
- **Review Type**: `native` (padrão), `pdf`, `hybrid`
- **Block Types**: `heading`, `paragraph`, `figure`, `table`, `callout`, `poll`, etc.
- **Community Post**: Discussões, polls, mídia da comunidade

**Performance Systems:**
- **Unified Query**: Sistema centralizado com rate limiting e cache
- **Intelligent Prefetch**: Precarregamento baseado em padrões de uso
- **Memory Optimizer**: Monitoramento e limpeza automática de memória
- **Bundle Splitting**: Componentes carregados sob demanda

## 🏗️ HIGH-LEVEL ARCHITECTURE _(120 lines max)_

### Router Architecture (Fixed v3.2.1)
```typescript
// main.tsx - Single BrowserRouter
<BrowserRouter>
  <App />
</BrowserRouter>

// App.tsx - Routes only (NO nested BrowserRouter)
<Routes>
  <Route path="/" element={<Index />} />
  <Route path="/dashboard" element={<Dashboard />} />
  // ... other routes
</Routes>
```

### Query System Architecture
```typescript
// Unified Query Client with Performance Monitoring
QueryClient → useUnifiedQuery → {
  - Rate Limiting
  - Intelligent Cache
  - Performance Tracking  
  - Background Optimization
}
```

### Component Architecture
```typescript
// Review System
ReviewBlock → BlockRenderer → {
  - HeadingBlock, ParagraphBlock, FigureBlock
  - CalloutBlock, PollBlock, etc.
  - Error Boundaries per Block
}

// Performance Optimization
{
  BundleOptimizer,    // Lazy loading
  MemoryOptimizer,    // Memory management  
  QueryOptimizer,     // Cache optimization
  PerformanceMonitor  // Real-time tracking
}
```

### Data Flow
```
Database → RPC Functions → Unified Query → Components
         ↓
Performance Monitoring → Analytics → Optimization
```

**Key Files:**
- `src/App.tsx` - Main app with single router setup
- `src/main.tsx` - Entry point with BrowserRouter
- `src/lib/queryClient.ts` - Unified query configuration
- `src/utils/bundleOptimizer.ts` - Lazy loading system
- `src/hooks/useMemoryOptimizer.ts` - Memory management

## 🎨 CURRENT THEME COLORS _(Lovable Design System v3.0)_
```css
/* Dark Theme (Primary) */
--background: #121212;        /* Main background */
--card: #1a1a1a;             /* Card backgrounds */
--border: #2a2a2a;           /* Borders and dividers */
--primary: #3b82f6;          /* Blue primary */
--primary-foreground: #93c5fd; /* Light blue text */
--muted: #6b7280;            /* Muted gray text */
--foreground: #ffffff;       /* Primary text */
--muted-foreground: #d1d5db; /* Secondary text */

/* Semantic Colors */
--success: #10b981;          /* Green for success */
--warning: #f59e0b;          /* Amber for warnings */ 
--destructive: #ef4444;      /* Red for errors */
--info: #3b82f6;            /* Blue for info */
```

**Component Examples:**
```typescript
// Card with dark theme
<Card style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}>

// Text with proper contrast  
<p style={{ color: '#ffffff' }}>Primary text</p>
<p style={{ color: '#d1d5db' }}>Secondary text</p>
```

---
**Version History:**
- v3.2.1 (2025-06-13): Fixed router duplication error, type casting improvements
- v3.2.0 (2025-06-13): Performance optimization implementation, bundle splitting
- v3.1.0 (2025-06-12): Refactored from monolithic README-BÍBLIA.md
