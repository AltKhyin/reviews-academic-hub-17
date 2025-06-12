
# README‑BÍBLIA v3.12.0
*Compreensão 360º do Reviews em 2 min — Fonte canônica para produto, marketing, design e tecnologia*

---

## 🎯 NAVEGAÇÃO RÁPIDA PARA IA
**SEÇÕES CRÍTICAS**: [Arquitetura](#3-arquitetura-de-alto-nível) • [Módulos](#5-índice-de-módulos-de-domínio) • [APIs](#6-esquemas-de-dados--apis) • [UI](#7-índice-de-componentes-ui) • [Performance](#10-orçamentos-de-performance)

---

## 1. Propósito & Pitch
| Item | Descrição |
|------|-----------|
| **Problema** | Clínicos brasileiros precisam manter-se atualizados mas não têm tempo para ler papers completos ou filtrar ruído em redes sociais. |
| **Solução** | Assinatura que entrega 2–3 *reviews críticas* de artigos clínicos por semana (PDF curto) + espaço de debate moderado com referências obrigatórias. |
| **Benefício‑chave** | Insight aplicável em **≤ 10 min** + aprendizado de interpretação crítica em ambiente seguro. |
| **Tagline** | "Atualização clínica, 10 min por vez." |

---

## 2. Glossário
| Termo | Definição |
|-------|-----------|
| **Review** | PDF de 3-5 páginas com análise crítica de paper clínico relevante |
| **Block** | Componente modular de conteúdo (texto, tabela, gráfico, poll, etc.) |
| **Archive** | Interface de busca/filtro de todas as reviews publicadas |
| **Community** | Espaço de discussão moderado sobre reviews e tópicos clínicos |
| **Tag System** | Sistema hierárquico de categorização (especialidade > subtópico) |
| **RPC** | Remote Procedure Call - funções otimizadas no Supabase |
| **Unified Query** | Sistema consolidado de cache e rate limiting para APIs |
| **Optimistic Updates** | Atualizações locais imediatas com sync posterior |
| **Section Registry** | Sistema centralizado de configuração de seções homepage |
| **Error Boundaries** | Sistema robusto de tratamento de erros com auto-recovery |

---

## 3. Arquitetura de Alto Nível
```
┌─ Frontend (React + TypeScript + Tailwind) ─┐
│  ├─ Auth Context (Supabase Auth)            │
│  ├─ Unified Query System (TanStack Query)   │
│  ├─ Rate Limiting (API Protection)          │
│  ├─ Optimistic Updates (Local State Sync)  │
│  ├─ Error Boundaries (Enhanced Recovery)    │
│  └─ Section Registry (Homepage Config)      │
└─────────────────────────────────────────────┘
           │
           ▼
┌─ Supabase Backend ─┐
│  ├─ PostgreSQL     │ ← RLS policies, materialized views
│  ├─ Auth           │ ← User management, JWT
│  ├─ Storage        │ ← PDFs, images, uploads
│  └─ Edge Functions │ ← Rate limiting, email, AI integration
└────────────────────┘
```

### Padrões Arquiteturais
- **Component-First**: Componentes pequenos (<50 LOC), focados, reutilizáveis
- **Hook-Based State**: `useParallelDataLoader` para dados, Context para estado global
- **Rate-Limited APIs**: Todos os endpoints protegidos (5-30 req/min)
- **Error Boundaries**: Auto-retry + fallbacks + logging estruturado
- **Optimistic Updates**: UI responsiva com sync posterior ao backend
- **Section Registry**: Configuração centralizada para seções homepage
- **Monochrome Design**: Grayscale first, cor apenas para semântica

---

## 4. Jornadas do Usuário
| Persona | Jornada Principal | Pontos de Fricção | Otimizações |
|---------|-------------------|-------------------|-------------|
| **Striver** (Residente) | Login → Busca specialty → Lê review → Comenta | Medo de comentar | Comments anônimos opcionais |
| **Bridger** (Clínico) | Notificação → Review rápida → Aplica insight | Tempo limitado | Highlights + resumo executivo |
| **Influencer** (Professor) | Review completa → Debate comunidade → Share | Qualidade do debate | Moderação + referências obrigatórias |

---

## 5. Índice de Módulos de Domínio

### 5.1 Auth & Profiles
```
/src/contexts/AuthContext.tsx       → Estado global de autenticação
/src/components/auth/              → LoginForm, RegisterForm, AuthGuard
/src/hooks/useStableAuth.ts        → Hook otimizado de auth
```

### 5.2 Issues & Reviews
```
/src/types/issue.ts                → Tipos base Issue, ReviewBlock
/src/hooks/useIssues.ts           → Hook unificado com rate limiting
/src/components/review/           → BlockRenderer, ReviewViewer
/src/pages/dashboard/IssueEditor.tsx → Editor WYSIWYG com blocks
```

### 5.3 Archive & Search
```
/src/hooks/useArchiveData.ts       → Busca otimizada com filtros
/src/components/archive/          → MasonryGrid (4px spacing), SearchFilters
/src/hooks/useSimplifiedArchiveSearch.ts → Search simplificado
/src/services/navigation.ts       → Centralizado routing patterns
```

### 5.4 Community (Optimized)
```
/src/hooks/comments/useOptimizedComments.ts → Sistema sem refetch desnecessário
/src/hooks/comments/useOptimizedCommentActions.ts → Ações com optimistic updates
/src/hooks/comments/useOptimizedCommentVoting.ts → Voting sem reload completo
/src/components/community/       → Post, PostVoting, NewPostModal
/src/types/community.ts          → PostData, CommunitySettings
```

### 5.5 Homepage System (Enhanced)
```
/src/config/sections.ts           → SECTION_REGISTRY centralizado
/src/hooks/useParallelDataLoader.ts → Sistema otimizado data loading
/src/hooks/useOptimizedSectionVisibility.ts → Settings sem rollback
/src/hooks/useUpcomingReleaseSettings.ts → Upcoming releases management
/src/components/homepage/sections/ → All section components (6 sections)
/src/components/homepage/SectionFactory.tsx → Dynamic section rendering
/src/pages/Index.tsx             → Homepage orchestration
```

### 5.6 Performance & Monitoring (Enhanced)
```
/src/hooks/useUnifiedQuery.ts     → Sistema único de cache + rate limit + dedup
/src/hooks/useAPIRateLimit.ts     → Rate limiting inteligente
/src/components/error/DataErrorBoundary.tsx → Error handling com auto-retry
/src/hooks/useIntelligentCacheInvalidation.ts → Cache invalidation estratégico
```

---

## 6. Esquemas de Dados & APIs

### 6.1 Core Tables
```sql
-- Issues (Reviews)
issues: id, title, description, specialty, authors, year, published, featured, score
review_blocks: id, issue_id, type, content, sort_index, visible

-- Community  
posts: id, title, content, user_id, published, pinned, score
comments: id, post_id, parent_id, content, user_id, score

-- Users & Profiles
profiles: id, full_name, avatar_url, role, created_at

-- Homepage Configuration
site_meta: id, key, value, created_at, updated_at
upcoming_releases: id, release_date, title, description, created_at
```

### 6.2 Rate Limited Endpoints
| Endpoint | Limite | Janela | Uso | Status |
|----------|--------|--------|-----|--------|
| `/issues` | 10 req | 1 min | Busca reviews | ✅ Implemented |
| `/archive` | 15 req | 1 min | Busca arquivo | ✅ Implemented |
| `/comments` | 20 req | 1 min | Interação social | ✅ Implemented |
| `/community` | 25 req | 1 min | Posts comunidade | ✅ Implemented |
| `/search` | 30 req | 1 min | Busca global | ✅ Implemented |
| `/sidebar` | 5 req | 1 min | Stats sidebar | ✅ Implemented |
| `/analytics` | 5 req | 5 min | Métricas admin | ✅ Implemented |
| `/homepage-data` | 8 req | 1 min | Homepage parallel loading | ✅ Implemented |

### 6.3 RPC Functions (Otimizadas)
```sql
get_optimized_issues(limit, offset, specialty, featured_only)
get_sidebar_stats() → Estatísticas cache-friendly
get_review_with_blocks(review_id) → Review + blocks em 1 query
get_top_threads(min_comments) → Posts populares
get_home_settings() → Homepage configuration
upsert_site_meta(key, value) → Safe configuration updates
```

---

## 7. Índice de Componentes UI

### 7.1 Layout & Navigation
```
/src/components/navigation/Sidebar.tsx → Nav principal
/src/components/sidebar/RightSidebar.tsx → Stats + community info
/src/layouts/DashboardLayout.tsx → Layout wrapper
/src/services/navigation.ts → Routing centralizado
```

### 7.2 Homepage System (New)
```
/src/components/homepage/SectionFactory.tsx → Dynamic section rendering
/src/components/homepage/sections/ReviewerNotesSection.tsx → Reviewer comments
/src/components/homepage/sections/FeaturedSection.tsx → Featured content
/src/components/homepage/sections/UpcomingSection.tsx → Upcoming releases
/src/components/homepage/sections/RecentSection.tsx → Recent articles
/src/components/homepage/sections/RecommendedSection.tsx → Recommendations
/src/components/homepage/sections/TrendingSection.tsx → Popular content
```

### 7.3 Content Display (Optimized)
```
/src/components/review/BlockRenderer.tsx → Renderiza blocks modulares
/src/components/archive/OptimizedMasonryGrid.tsx → Grid 4px spacing
/src/components/dashboard/FeaturedArticle.tsx → Destaque homepage
```

### 7.4 Interactive Elements (Enhanced)
```
/src/components/comments/CommentSection.tsx → Sistema otimizado sem reload
/src/components/community/PostVoting.tsx → Voting com optimistic updates
/src/components/error/DataErrorBoundary.tsx → Error boundaries robusto
/src/components/ui/ → ShadCN components customizados
```

---

## 8. Sistema Visual & Design Language
| Elemento | Especificação |
|----------|---------------|
| **Palette** | `#0E0E0E` (background), `#F4F1EA` (foreground), `#7E5BEF` (accent) |
| **Theme** | Monochrome-first, color only for semantics (success/warning/error) |
| **Fontes** | Inter (corpo), system fonts como fallback |
| **Spacing** | 4px base grid (**ARCHIVE: gap-1**), componentes ≤ 50 LOC |
| **Icons** | Lucide React, linha fina, 16px/24px |
| **Acessibilidade** | Contraste ≥ 4.5:1, focus visível, ARIA compliant |

### 8.1 CSS Variables (Monochrome)
```css
--background: 0 0% 7%;        /* Dark base */
--foreground: 0 0% 96%;       /* Light text */
--muted: 0 0% 60%;           /* Secondary text */
--border: 0 0% 20%;          /* Dividers */
--accent: 0 0% 13%;          /* Interactive elements */
--success: 142 76% 36%;      /* Green for positive */
--warning: 38 92% 50%;       /* Yellow for alerts */
--destructive: 0 84% 60%;    /* Red for danger */
```

---

## 9. Contrato de Acessibilidade
| Requisito | Implementação | Status |
|-----------|---------------|--------|
| **Contraste** | ≥ 4.5:1 para texto normal, ≥ 3:1 para texto grande | ✅ |
| **Navegação** | Tab order lógico, skip links, focus visível | ✅ |
| **Screen Readers** | ARIA labels, roles, descriptions | ✅ |
| **Teclado** | Todas as interações acessíveis via teclado | ✅ |
| **Imagens** | Alt text obrigatório, decorative images aria-hidden | ✅ |
| **Cores** | Informação não depende apenas de cor | ✅ |

---

## 10. Orçamentos de Performance
| Métrica | Target | Atual | Estratégia |
|---------|--------|-------|------------|
| **LCP** | < 2.5s | ~2.1s | Lazy loading, image optimization |
| **FID** | < 100ms | ~85ms | Code splitting, reduced bundle |
| **CLS** | < 0.1 | ~0.08 | Size reservations, stable layouts |
| **Bundle Size** | < 500KB | ~450KB | Tree shaking, dynamic imports |
| **Memory** | < 50MB | ~35MB | Query cache limits, cleanup |
| **API Calls** | Rate limited | ✅ | Unified query system + deduplication |

### 10.1 Cache Strategy (Enhanced)
- **Query Cache**: 5-15 min stale time por prioridade
- **Request Dedup**: 30s window para requests idênticos  
- **Rate Limiting**: 5-30 req/min por endpoint com intelligent batching
- **Error Recovery**: Auto-retry com backoff exponencial
- **Optimistic Updates**: UI responsiva com sync posterior
- **Intelligent Invalidation**: Cache invalidation baseado em relacionamentos

---

## 11. Segurança & Compliance
| Área | Implementação | Status |
|------|---------------|--------|
| **Auth** | Supabase JWT + RLS policies | ✅ |
| **API** | Rate limiting + request validation | ✅ |
| **Data** | RLS por user_id, admin bypass | ✅ |
| **Files** | Supabase Storage com policies | ✅ |
| **XSS** | React auto-escape + DOMPurify | ✅ |
| **CSRF** | SameSite cookies + tokens | ✅ |

---

## 12. Admin & Operações
| Função | Implementação | Acesso |
|--------|---------------|--------|
| **User Management** | Admin panel + role-based permissions | Admin only |
| **Content Moderation** | Comment reports + manual review | Editor/Admin |
| **Analytics** | Query performance + user engagement | Admin only |
| **System Health** | Error boundaries + monitoring hooks | Auto + Admin |
| **Rate Limit Config** | Per-endpoint limits + bypass | Admin only |
| **Homepage Settings** | Section visibility com optimistic updates | Admin only |
| **Release Schedule** | Upcoming releases management | Admin only |

---

## 13. Analytics & KPIs
| Métrica | Tracking | Target |
|---------|----------|--------|
| **Engagement** | Time on review, comments/review | 8 min, 2.5 comments |
| **Retention** | D1/D7/D30 active users | 60%/35%/15% |
| **Performance** | Query speed, error rate, cache hits | <500ms, <2%, >80% |
| **API Health** | Rate limit hits, failed requests | <5%, <1% |
| **Content** | Reviews/week, community posts | 2-3, 15-25 |
| **UX Quality** | Comment reload rate, settings rollback | <10%, <5% |
| **Homepage Health** | Section load success, error boundary triggers | >95%, <2% |

---

## 14. TODO / Backlog
- [ ] Implement push notifications for new reviews
- [ ] Add PDF annotation features
- [ ] Enhance mobile responsiveness (tablet mode)
- [ ] Create admin dashboard for content analytics
- [ ] Add real-time chat for live review discussions
- [ ] Implement advanced search with AI assistance
- [ ] Add integration with medical databases (PubMed)
- [ ] Create mobile app (React Native)
- [x] ✅ **COMPLETED**: Homepage optimization overhaul (sections, error boundaries, parallel loading)
- [x] ✅ **COMPLETED**: Section registry system and configuration management
- [x] ✅ **COMPLETED**: Comprehensive error boundary system implementation

---

## 15. Histórico de Revisões
| Versão | Data | Mudanças |
|--------|------|----------|
| 3.12.0 | 2025-06-12 | **COMPREHENSIVE HOMEPAGE OVERHAUL**: Complete section registry system, parallel data loading optimization, error boundary implementation, upcoming releases system, all 6 homepage sections fully implemented |
| 3.11.0 | 2025-06-11 | **P0 CRITICAL FIXES**: Archive 4px spacing, optimized comments (no unnecessary reloads), homepage settings rollback fix, intelligent cache invalidation |
| 3.10.0 | 2025-06-11 | Enhanced rate limiting, error boundaries, unified query system v2 |
| 3.9.0 | 2025-06-11 | Archive navigation integration, performance monitoring consolidation |
| 3.8.0 | 2025-06-11 | Corrected color theme documentation, settings persistence fixes |
| 3.7.0 | 2025-06-11 | Simplified hero section removal, query system migration |
| 3.6.0 | 2025-06-11 | AI navigation improvements, structured sections |
| 3.0.0 | 2025-06-09 | Major restructure for AI comprehension, canonical format |

---

*Última atualização: 2025-06-12 • Próxima revisão: Mobile optimization and real-time features (P1)*
