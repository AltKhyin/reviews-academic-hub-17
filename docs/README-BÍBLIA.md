
# README-BÍBLIA.md
**Versão 3.2.4** • 2025-06-13

## 1. Purpose & Pitch
Sistema completo de publicação científica com homepage otimizada, editor de conteúdo avançado, e sistema de revisão por pares. Plataforma integrada para criação, revisão e distribuição de conteúdo científico com performance e UX otimizados.

**Performance-first architecture** com otimizações sistemáticas implementadas.

## 2. Glossary
- **ReviewBlock**: Unidade básica de conteúdo (parágrafo, figura, diagrama)
- **Issue**: Publicação científica completa
- **Homepage Manager**: Sistema de configuração dinâmica da página inicial
- **SectionFactory**: Gerador dinâmico de seções da homepage
- **DiagramCanvas**: Editor SVG para diagramas científicos
- **LayoutGrid**: Sistema de grid responsivo para organização de conteúdo
- **SnapshotCard**: Componente para métricas e estatísticas visuais
- **Performance Providers**: Camada de otimização de renderização
- **Component Auditing**: Sistema de análise de performance de componentes

## 3. High-Level Architecture

### Core Systems
```
Frontend (React/TS) ←→ Supabase Backend
├── Homepage System (Dynamic Sections)
├── Content Editor (Block-based)
├── Review System (Peer Review)
├── Analytics & Performance
└── Authentication & Permissions
```

### Performance Architecture (Phase C - Current)
```
OptimizedAppProvider
├── PerformanceProvider (Monitoring)
├── BundleOptimizer (Code Splitting)
├── ComponentAuditor (Analysis)
└── MemoryManager (Cleanup)
```

### Homepage Architecture
```
Homepage
├── SectionFactory (Dynamic Rendering)
├── HomepageSectionsManager (Admin Config)
├── FeaturedSection, RecommendedSection
├── TrendingSection, ReviewerNotesSection
├── UpcomingSection (Content Suggestions)
└── Section Visibility & Ordering System
```

## 4. User Journeys

### Visitor Journey
1. **Landing** → Homepage com seções dinâmicas
2. **Browse** → Conteúdo recomendado e em alta
3. **Read** → Visualização otimizada de artigos
4. **Interact** → Comentários e reações

### Admin Journey  
1. **Login** → Dashboard administrativo
2. **Configure** → Homepage sections via manager
3. **Create** → Novo conteúdo via block editor
4. **Publish** → Sistema de revisão e aprovação

### Editor Journey
1. **Access** → Editor de blocos avançado
2. **Compose** → Sistema de diagramas e layouts
3. **Preview** → Visualização em tempo real
4. **Optimize** → Performance insights

## 5. Domain Modules Index

### `/src/components/homepage/`
- `SectionFactory.tsx` - Factory para renderização dinâmica
- `sections/` - Implementações específicas de seções
- `HomepageSectionsManager.tsx` - Interface de configuração

### `/src/components/editor/`
- `BlockContentEditor.tsx` - Editor principal de blocos
- `layout/` - Sistema de layouts e grids
- `BlockRenderer.tsx` - Renderizador universal

### `/src/components/review/blocks/`
- `diagram/` - Sistema completo de diagramas
- `SnapshotCard.tsx` - Métricas visuais
- Diversos tipos de blocos especializados

### `/src/providers/`
- `PerformanceProvider.tsx` - Monitoramento de performance
- `OptimizedAppProvider.tsx` - Camada de otimização

### `/src/utils/`
- `performanceHelpers.ts` - Utilities de performance
- `componentAudit.ts` - Análise de componentes
- `bundleOptimizer.ts` - Otimização de bundle

## 6. Data & API Schemas

### Core Tables
- `issues` - Artigos e conteúdo científico
- `review_blocks` - Blocos de conteúdo estruturado
- `profiles` - Usuários e permissões
- `content_suggestions` - Sugestões de conteúdo
- `upcoming_releases` - Próximas publicações

### Performance Tracking
- `review_analytics` - Métricas de performance
- Performance logs via ComponentAuditor

### Type System
```typescript
interface ReviewBlock {
  id: string;
  type: BlockType;
  content: any;
  sort_index: number;
  meta?: LayoutMeta;
}

interface DiagramContent {
  canvas: CanvasConfig;
  nodes: DiagramNode[];
  connections: DiagramConnection[];
}
```

## 7. UI Component Index

### Homepage Components
- **SectionFactory** - Renderização dinâmica baseada em configuração
- **Featured/Recommended/Trending** - Seções de conteúdo
- **UpcomingReleaseSection** - Próximas publicações
- **HomepageSectionsManager** - Interface administrativa

### Editor Components  
- **BlockContentEditor** - Editor principal
- **LayoutGrid/LayoutRow** - Sistema de layouts
- **DiagramCanvas** - Editor de diagramas SVG
- **BlockRenderer** - Renderização universal

### Performance Components
- **OptimizedAppProvider** - Wrapper de otimização
- **PerformanceProvider** - Monitoramento
- **ComponentAuditor** - Análise de performance

## 8. Design Language
- **Dark Theme**: Base escura com acentos azuis
- **Typography**: Inter font, hierarchy clara
- **Spacing**: Sistema 4px base (Tailwind)
- **Colors**: Blue-500 primary, semantic colors
- **Components**: Shadcn/ui base + customizações

## 9. Accessibility Contract
- ARIA labels em componentes interativos
- Navegação por teclado completa
- Contraste mínimo WCAG AA
- Screen reader compatibility
- Focus management adequado

## 10. Performance Budgets

### Current Metrics (Phase C)
- **Bundle Size**: <500KB inicial
- **FCP**: <1.5s
- **LCP**: <2.5s  
- **Memory Usage**: Monitorado via ComponentAuditor
- **Component Render Time**: <16ms

### Optimization Features
- Code splitting automático
- Component lazy loading
- Memory leak prevention
- Bundle optimization
- Performance monitoring

## 11. Security & Compliance
- Row Level Security (RLS) no Supabase
- Autenticação via Supabase Auth
- Rate limiting planejado para APIs
- Sanitização de inputs
- HTTPS obrigatório

## 12. Admin & Ops

### Performance Monitoring
- ComponentAuditor para análise
- Memory usage tracking
- Bundle size monitoring
- Real-time performance metrics

### Homepage Management
- Dynamic section configuration
- Content suggestion system  
- Visibility controls
- Order management

## 13. Analytics & KPIs
- Page views e engagement
- Component performance metrics
- User interaction tracking
- Content popularity analysis
- Performance benchmarks

## 14. TODO / Backlog

### Current Phase (C - Performance)
- [✅] Core performance infrastructure
- [✅] Component auditing system
- [✅] Memory management
- [✅] Bundle optimization
- [🔄] Rate limiting implementation
- [⏳] Production performance testing

### Homepage Issues Fixed
- [✅] TypeScript interface mismatches
- [✅] DiagramCanvas type definitions
- [✅] LayoutRow prop consistency
- [✅] SnapshotCard property fixes
- [✅] Component prop standardization

### Next Priorities
- Complete Phase C implementation
- Production deployment optimization
- Advanced caching strategies
- API rate limiting enforcement

## 15. Revision History

| Version | Date | Changes | Author |
|---------|------|---------|---------|
| 3.2.4 | 2025-06-13 | CRITICAL: Fixed systematic TypeScript errors, diagram interfaces, layout components, homepage integration | System |
| 3.2.3 | 2025-06-13 | Performance provider implementation, component auditing | System |
| 3.2.2 | 2025-06-13 | Bundle optimization, memory management | System |
| 3.2.1 | 2025-06-13 | Homepage sections implementation | System |
| 3.2.0 | 2025-06-13 | Phase C performance optimization start | System |
