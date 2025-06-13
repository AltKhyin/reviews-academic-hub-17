
# README-BÍBLIA.md
# Version 3.7.0 · 2025-06-13
#
# ── PERMA‑BLOCK ───────────────────────────────────────────────────────────────────────────────
# SELF‑CHECK sentinel — On every reasoning loop verify THIS PERMA‑BLOCK exists **verbatim**.
# If absent ⇒ STOP and reload this KB or ask the user to re‑inject. Never proceed without it.
# ─────────────────────────────────────────────────────────────────────────────────────────────

## 1. Purpose & Pitch (≤30 lines)

**ACADEMIA REVIEW PLATFORM** — Native Block Editor Sistema de Review Científico  
Uma plataforma moderna para criação, edição e publicação de reviews científicos com editor nativo de blocos.

**Core Features:**
- ✅ Native Block Editor com suporte a grids 1D/2D  
- ✅ Sistema de autenticação e permissões via Supabase  
- ✅ Preview em tempo real e modo fullscreen  
- ✅ Gestão de issues, comentários e votações  
- ✅ Interface responsiva com Tailwind CSS  
- ✅ Arquitetura TypeScript rigorosa  

**Status:** Em desenvolvimento ativo — Type System Foundation COMPLETE ✅  
**Target:** Comunidade científica, pesquisadores, plataformas acadêmicas  

## 2. Glossary (60 lines)

**REVIEW SYSTEM**
- **Issue**: Documento de review científico com metadados estruturados
- **Review Block**: Unidade atômica de conteúdo (texto, imagem, tabela, etc.)
- **Native Editor**: Editor de blocos personalizado com funcionalidades avançadas
- **Grid Layout**: Sistema de layout em grid 1D (colunas) e 2D (matriz)

**ARCHITECTURE**
- **Block Renderer**: Sistema responsável por renderizar diferentes tipos de blocos
- **Layout Manager**: Gerencia posicionamento e estrutura de layouts em grid
- **Type System**: Sistema rigoroso de tipos TypeScript com IDs string (UUID)
- **Component Architecture**: Estrutura modular com hooks focados e componentes pequenos

**DATA FLOW**
- **Block Management**: Hooks para CRUD de blocos com estado global
- **Grid Management**: Hooks especializados para layouts 1D/2D
- **Editor State**: Estado centralizado do editor com undo/redo
- **Auto Save**: Sistema automático de salvamento com fallback manual

**UI/UX**
- **Block Palette**: Painel lateral com tipos de blocos categorizados
- **Live Preview**: Preview em tempo real com viewport responsivo
- **Editor Toolbar**: Controles de modo, salvamento e histórico
- **Status Bar**: Indicadores de status e estatísticas do documento

## 3. High-Level Architecture (120 lines)

```
FRONTEND ARCHITECTURE (React + TypeScript)
├── /src/components/editor/          # Editor nativo principal
│   ├── BlockEditor.tsx              # Container principal do editor
│   ├── BlockList.tsx                # Lista lateral de blocos
│   ├── ReviewPreview.tsx            # Preview em tempo real
│   ├── NativeEditor.tsx             # Editor padrão
│   ├── NativeEditorFullscreen.tsx   # Modo fullscreen
│   ├── EditorToolbar.tsx            # Barra de ferramentas
│   ├── EditorStatusBar.tsx          # Barra de status
│   ├── BlockPalette.tsx             # Paleta de blocos
│   ├── LivePreview.tsx              # Preview interativo
│   └── /blocks/                     # Componentes de blocos
│       ├── SingleBlock.tsx          # Bloco individual
│       ├── BlockControls.tsx        # Controles de bloco
│       ├── BlockContentEditor.tsx   # Editor de conteúdo
│       ├── BlockStatusIndicators.tsx # Indicadores visuais
│       └── AddBlockButton.tsx       # Botão adicionar bloco
│   └── /layout/                     # Sistema de layouts
│       ├── ResizableGrid.tsx        # Grid 1D redimensionável
│       ├── Grid2DContainer.tsx      # Container de grid 2D
│       └── Grid2DCell.tsx           # Célula de grid 2D
│   └── /inline/                     # Configurações inline
│       ├── InlineBlockSettings.tsx  # Configurações centrais
│       ├── InlineAlignmentControls.tsx # Controles de alinhamento
│       └── SpacingControls.tsx      # Controles de espaçamento

├── /src/hooks/                      # Business logic hooks
│   ├── useBlockManagement.ts        # CRUD de blocos + estado
│   ├── useGridLayoutManager.ts      # Gerenciamento de layouts 1D
│   ├── useGrid2DManager.ts          # Gerenciamento de layouts 2D
│   ├── useEditorLayout.ts           # Estados de layout do editor
│   ├── useEditorAutoSave.ts         # Salvamento automático
│   └── /grid/                       # Hooks especializados de grid
│       ├── useGridState.ts          # Estado de grids 1D
│       └── useGridRepair.ts         # Reparação de layouts

├── /src/types/                      # Type definitions
│   ├── review.ts                    # Tipos centrais (ReviewBlock, etc.)
│   └── grid.ts                      # Tipos de grid e layout

BACKEND ARCHITECTURE (Supabase)
├── issues                 # Documentos de review principais
├── review_blocks          # Blocos de conteúdo (jsonb payload)
├── profiles              # Usuários e permissões
├── comments              # Sistema de comentários
└── [outros 20+ tables]   # Sistema completo de dados
```

**CRITICAL PATTERNS:**
- **String IDs everywhere**: Migração completa para UUIDs string (database-compatible)
- **Focused hooks**: Cada hook tem responsabilidade específica e limitada
- **Small components**: Componentes < 300 LOC, hooks < 50 LOC
- **Immutable updates**: Estado sempre atualizado de forma imutável
- **Type safety**: TypeScript rigoroso em todas as camadas

## 4. User Journeys (150 lines)

**JOURNEY 1: Criar Review Científico**
```
1. Usuário acessa /edit/new
2. Sistema inicializa editor nativo vazio
3. Usuário adiciona blocos via BlockPalette:
   - Heading para título
   - Text para introdução  
   - Table para dados
   - Figure para gráficos
4. Sistema auto-salva a cada 30s
5. Usuário organiza em grids:
   - Converte blocos para grid 1D (colunas)
   - Ou cria grid 2D (matriz)
6. Preview em tempo real mostra resultado
7. Usuário salva e publica
```

**JOURNEY 2: Editar Review Existente**
```
1. Usuário acessa /edit/:issueId
2. Sistema carrega blocks do backend
3. Editor reconstrói layout com grids
4. Usuário modifica conteúdo inline
5. Sistema detecta mudanças não salvas
6. Auto-save + manual save disponíveis
7. Validação de layout em tempo real
```

**JOURNEY 3: Colaboração e Comentários**
```
1. Reviewer acessa issue publicada
2. Sistema permite comentários por bloco
3. Votação e reações em tempo real
4. Notificações de atividade
5. Histórico de revisões preservado
```

**JOURNEY 4: Gestão de Layout Complexo**
```
1. Usuário cria grid 2D (3x2)
2. Arrasta blocos para posições específicas
3. Ajusta dimensões de colunas/linhas
4. Sistema repara inconsistências automaticamente
5. Preview mostra resultado final
```

## 5. Domain Modules Index

**EDITOR MODULE** — Core editing functionality
- `BlockEditor`: Container principal com drag&drop
- `BlockList`: Navegação lateral e reordenação  
- `ReviewPreview`: Preview responsivo em tempo real
- `NativeEditor`: Integração completa com modos
- `EditorToolbar`: Controles e estados do editor

**LAYOUT MODULE** — Grid system management  
- `ResizableGrid`: Grids 1D com redimensionamento
- `Grid2DContainer`: Grids 2D complexos
- `Grid2DCell`: Células individuais interativas
- `useGridLayoutManager`: Hook para grids 1D
- `useGrid2DManager`: Hook para grids 2D

**BLOCK MODULE** — Content block system
- `SingleBlock`: Renderização de blocos individuais
- `BlockRenderer`: Sistema de renderização universal
- `BlockControls`: Controles de ação por bloco
- `InlineBlockSettings`: Configurações modais inline

**STATE MODULE** — Editor state management
- `useBlockManagement`: CRUD + história de blocos
- `useEditorAutoSave`: Salvamento inteligente
- `useGridState`: Estado computado de grids
- `useGridRepair`: Validação e reparação de layouts

## 6. Data & API Schemas

**ReviewBlock (Core Entity)**
```typescript
interface ReviewBlock {
  id: string;                    // UUID string (DB compatible)
  type: BlockType;              // Enum de tipos de bloco
  content: any;                 // Payload específico do tipo
  sort_index: number;           // Posição no documento
  visible: boolean;             // Visibilidade no preview
  meta?: {
    spacing?: SpacingConfig;    // Configurações de espaçamento
    alignment?: AlignmentConfig; // Alinhamento vertical/horizontal
    layout?: LayoutConfig;      // Configurações de grid
  };
}
```

**LayoutConfig (Grid System)**
```typescript  
interface LayoutConfig {
  columns?: number;             // Colunas em grid 1D
  columnWidths?: number[];      // Larguras percentuais
  grid_id?: string;             // ID do grid 2D
  grid_position?: GridPosition; // Posição em grid 2D  
  row_id?: string;              // ID da linha em grid 1D
  grid_rows?: number;           // Linhas em grid 2D
  gap?: number;                 // Espaçamento entre elementos
  rowHeights?: number[];        // Alturas das linhas
}
```

**Grid2DLayout (2D Grid Structure)**
```typescript
interface Grid2DLayout {
  id: string;                   // Identificador único do grid
  rows: GridRow[];              // Estrutura de linhas
  columns: number;              // Número de colunas
  columnWidths?: number[];      // Larguras das colunas
  grid_rows?: number;           // Número de linhas
  gap?: number;                 // Espaçamento interno
  rowHeights?: number[];        // Alturas das linhas
}
```

## 7. UI Component Index

**EDITOR COMPONENTS** — /src/components/editor/
- `BlockEditor` — Container principal (538 LOC) [NEEDS REFACTOR]
- `BlockList` — Lista lateral (395 LOC) [NEEDS REFACTOR]  
- `ReviewPreview` — Preview (320 LOC) [NEEDS REFACTOR]
- `NativeEditor` — Editor padrão (225 LOC) [NEEDS REFACTOR]
- `NativeEditorFullscreen` — Fullscreen (214 LOC) [NEEDS REFACTOR]
- `InlineBlockSettings` — Configurações (235 LOC) [NEEDS REFACTOR]
- `SingleBlock` — Bloco individual (220 LOC) [NEEDS REFACTOR]

**LAYOUT COMPONENTS** — /src/components/editor/layout/
- `ResizableGrid` — Grid 1D redimensionável
- `Grid2DContainer` — Container de grid 2D  
- `Grid2DCell` — Célula de grid 2D

**UTILITY COMPONENTS** — /src/components/editor/blocks/
- `BlockControls` — Controles de ação
- `AddBlockButton` — Botão adicionar
- `BlockStatusIndicators` — Indicadores visuais
- `BlockContentEditor` — Editor de conteúdo

**INTERFACE COMPONENTS**
- `EditorToolbar` — Barra de ferramentas
- `EditorStatusBar` — Barra de status  
- `BlockPalette` — Paleta de blocos
- `LivePreview` — Preview interativo

**REFACTOR PRIORITIES:**
🔴 HIGH: Files > 300 LOC need immediate refactoring
🟡 MEDIUM: Files > 200 LOC should be refactored soon
🟢 LOW: Files < 200 LOC are acceptable

## 8. Design Language (120 lines)

**COLOR SYSTEM**
```css
/* Dark Theme Primary */
--bg-primary: #121212      /* Main background */
--bg-secondary: #1a1a1a    /* Card backgrounds */  
--bg-tertiary: #212121     /* Input backgrounds */
--border-primary: #2a2a2a  /* Main borders */
--border-secondary: #333   /* Subtle borders */

/* Text Hierarchy */
--text-primary: #ffffff    /* Primary text */
--text-secondary: #d1d5db  /* Secondary text */
--text-tertiary: #9ca3af   /* Muted text */
--text-disabled: #6b7280   /* Disabled text */

/* Semantic Colors */
--success: #10b981         /* Success states */
--warning: #f59e0b         /* Warning states */
--error: #ef4444           /* Error states */
--info: #3b82f6            /* Info states */

/* Block Type Colors */
--block-text: #ffffff      /* Text blocks */
--block-heading: #8b5cf6   /* Heading blocks */
--block-media: #10b981     /* Media blocks */
--block-data: #f59e0b      /* Data blocks */
--block-advanced: #ef4444  /* Advanced blocks */
```

**SPACING SYSTEM**
```css  
/* Consistent spacing scale */
--space-1: 0.25rem  /* 4px */
--space-2: 0.5rem   /* 8px */
--space-3: 0.75rem  /* 12px */
--space-4: 1rem     /* 16px */
--space-6: 1.5rem   /* 24px */
--space-8: 2rem     /* 32px */
```

**TYPOGRAPHY**
- **Font Stack**: Inter, system-ui, sans-serif
- **Heading Scale**: text-xs → text-sm → text-base → text-lg → text-xl
- **Line Heights**: tight (1.25) for headings, normal (1.5) for body
- **Font Weights**: normal (400), medium (500), semibold (600)

**COMPONENT PATTERNS**
- **Cards**: Rounded corners (8px), subtle borders, dark backgrounds
- **Buttons**: Consistent sizing (sm/md/lg), hover states, disabled states  
- **Inputs**: Dark theme, focus rings, validation states
- **Grids**: Gap system aligned with spacing scale
- **Shadows**: Minimal usage, dark theme appropriate

## 9. Accessibility Contract (100 lines)

**KEYBOARD NAVIGATION**
- ✅ Tab navigation through all interactive elements
- ✅ Arrow keys for block list navigation  
- ✅ Space/Enter for activation
- ✅ Escape for modal/popup dismissal
- ✅ Ctrl+Z/Y for undo/redo
- ✅ Ctrl+S for manual save

**SCREEN READER SUPPORT**
- ✅ Semantic HTML structure (headings, lists, buttons)
- ✅ ARIA labels for complex interactions
- ✅ Role attributes for custom components
- ✅ Focus management in modals
- ✅ Status announcements for save states

**VISUAL ACCESSIBILITY**  
- ✅ High contrast ratios (4.5:1 minimum)
- ✅ Color not as sole indicator of meaning
- ✅ Focus indicators visible and consistent
- ✅ Text scalable to 200% without horizontal scroll
- ✅ Motion reduced when user prefers

**INTERACTION PATTERNS**
- ✅ Drag and drop with keyboard alternatives
- ✅ Grid navigation with arrow keys
- ✅ Context menus accessible via keyboard  
- ✅ Form validation with clear error messages
- ✅ Progressive disclosure for complex features

## 10. Performance Budgets (80 lines)

**BUNDLE SIZES**
- Main bundle: < 500KB (gzipped)
- Editor bundle: < 200KB (gzipped)  
- Component chunks: < 50KB each
- Asset loading: Progressive, lazy where possible

**RUNTIME PERFORMANCE**
- First Paint: < 1.5s
- Time to Interactive: < 3s
- Block render time: < 100ms per block
- Grid layout calculation: < 50ms
- Auto-save debounce: 500ms

**MEMORY USAGE**
- Editor state: < 10MB for 100 blocks
- Undo history: Limited to 50 operations
- Component cleanup on unmount
- Event listener cleanup

**OPTIMIZATION STRATEGIES**
- React.memo for expensive renders
- useMemo for computed values
- useCallback for event handlers  
- Code splitting by route and feature
- Image optimization and lazy loading

## 11. Security & Compliance (100 lines)

**AUTHENTICATION & AUTHORIZATION**
- ✅ Supabase Auth integration
- ✅ JWT token management
- ✅ Role-based access control (RBAC)
- ✅ Session timeout handling
- ✅ Secure logout procedures

**DATA PROTECTION**
- ✅ Input sanitization for all user content
- ✅ XSS prevention in block rendering
- ✅ CSRF protection via Supabase
- ✅ SQL injection prevention (RLS policies)
- ✅ File upload restrictions and validation

**RLS POLICIES** — Following [RLS_PRINCIPLES]
- ✅ Row-level security on all tables
- ✅ Simple condition-based policies
- ✅ No self-referential queries in policies
- ✅ Security definer functions for complex logic
- ✅ Anti-recursion testing in CI

**CONTENT SECURITY**
- ✅ HTML sanitization in rich text
- ✅ Image source validation
- ✅ External link verification
- ✅ File type restrictions
- ✅ Content moderation hooks

## 12. Admin & Ops (120 lines)

**DEPLOYMENT PIPELINE**
- ✅ Automated builds via GitHub Actions
- ✅ Supabase integration for backend
- ✅ Environment-specific configurations
- ✅ Database migration management
- ✅ Health check endpoints

**MONITORING & LOGGING**
- ✅ Error boundary implementation
- ✅ Console logging for development  
- ✅ Performance metrics collection
- ✅ User interaction tracking
- ✅ Build error reporting

**BACKUP & RECOVERY**
- ✅ Supabase automatic backups
- ✅ Local data recovery mechanisms
- ✅ Version history preservation
- ✅ Export functionality for data portability

**MAINTENANCE PROCEDURES**
- Database cleanup scripts
- Performance monitoring dashboards
- User feedback collection
- Regular security audits
- Dependency updates

## 13. Analytics & KPIs (120 lines)

**USER ENGAGEMENT METRICS**
- Daily/Monthly active users
- Editor session duration
- Blocks created per session
- Feature adoption rates
- User retention cohorts

**PERFORMANCE METRICS**
- Page load times
- Component render times  
- API response times
- Error rates by feature
- Browser compatibility metrics

**CONTENT METRICS**
- Reviews published per day
- Block types usage distribution
- Grid layout adoption
- Comment engagement rates
- Download/export frequency

**BUSINESS METRICS**
- User registration flow completion
- Feature usage patterns
- Support ticket volume
- User satisfaction scores
- Platform reliability uptime

**TRACKING IMPLEMENTATION**
- Google Analytics 4 integration
- Custom event tracking for editor actions
- Performance API for technical metrics
- User feedback collection system
- A/B testing framework ready

## 14. TODO / Backlog

**IMMEDIATE (Phase 1 - COMPLETE ✅)**
- ✅ Type System Foundation Repair (string IDs, consistent types)
- ✅ Component Migration (all editor components updated)
- ✅ Missing Hook Creation (grid management, editor state)
- ✅ Build Error Resolution (all TypeScript errors fixed)

**NEXT PRIORITIES (Phase 2)**  
- 🔄 Component Refactoring (files > 300 LOC)
- 🔄 Performance Testing (bundle analysis, runtime metrics)
- 🔄 Memory Leak Prevention (cleanup, optimization)
- 🔄 Edge Case Handling (error boundaries, fallbacks)

**FUTURE ENHANCEMENTS (Phase 3)**
- 📋 Advanced Grid Features (nested grids, templates)
- 📋 Collaboration Tools (real-time editing, comments)
- 📋 Export Formats (PDF, Word, LaTeX)
- 📋 Advanced Block Types (interactive charts, forms)
- 📋 Mobile Responsiveness (touch interactions)
- 📋 Plugin Architecture (custom block types)

**REFACTORING QUEUE**
1. `BlockEditor.tsx` (538 LOC) → Split into focused components
2. `BlockList.tsx` (395 LOC) → Extract list management logic  
3. `ReviewPreview.tsx` (320 LOC) → Separate preview modes
4. `NativeEditor.tsx` (225 LOC) → Extract toolbar and layout
5. `InlineBlockSettings.tsx` (235 LOC) → Split settings panels
6. `SingleBlock.tsx` (220 LOC) → Extract conversion logic

## 15. Revision History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 3.7.0 | 2025-06-13 | Type System Foundation Complete - Added missing hooks and components | AI Assistant |
| 3.6.0 | 2025-06-13 | Type System Foundation Repair - String ID migration | AI Assistant |  
| 3.5.0 | 2025-06-13 | Initial Type System audit and error analysis | AI Assistant |
| 3.4.0 | 2025-06-13 | Enhanced editor architecture documentation | AI Assistant |
| 3.3.0 | 2025-06-13 | Updated component architecture and hook structure | AI Assistant |
| 3.2.0 | 2025-06-13 | Added grid system and layout management | AI Assistant |
| 3.1.0 | 2025-06-13 | Comprehensive editor component documentation | AI Assistant |
| 3.0.0 | 2025-06-13 | Major restructure - Native Block Editor focus | AI Assistant |
| 2.x.x | 2025-06-12 | Legacy versions - PDF-focused architecture | AI Assistant |
| 1.0.0 | 2025-06-11 | Initial documentation structure | AI Assistant |

---
**END README-BÍBLIA v3.7.0**
