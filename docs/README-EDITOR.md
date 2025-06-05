
# EDITOR NATIVO — MANUAL TÉCNICO COMPLETO
**Versão 3.0.0** • 2025-06-05

## PROPÓSITO & FILOSOFIA

O Editor Nativo é um sistema de criação de conteúdo baseado em blocos, desenvolvido especificamente para revisões científicas médicas. Substitui o modelo tradicional de PDF por uma experiência interativa, editável e semanticamente estruturada com edição inline completa e sistema de grid responsivo.

### Princípios Fundamentais
- **Atomicidade**: Cada bloco é uma unidade independente e completa
- **Composabilidade**: Blocos se combinam para formar narrativas complexas  
- **Editabilidade Inline**: Modificação direta sem modais ou painéis laterais
- **Layout Flexível**: Suporte a múltiplos blocos por linha com sistema de grid responsivo
- **Preservação Semântica**: Manutenção do significado científico durante conversões
- **Acessibilidade**: Suporte completo a tecnologias assistivas

---

## ARQUITETURA ATUAL — SISTEMA DE GRID FUNCIONAL

### Sistema de Edição Inline ✅ IMPLEMENTADO
- **Painéis de propriedades eliminados**: Toda configuração é feita inline
- **Settings integrados**: Cada bloco possui botão de configurações (ícone engrenagem)
- **Edição contextual**: Modificação direta do conteúdo sem modais
- **Sistema de cores unificado**: Aplicação consistente através de todos os blocos

### Layout Multi-Bloco ✅ IMPLEMENTADO
- **Grid responsivo**: Suporte a 1-4 blocos por linha usando ResizablePanelGroup
- **Drag & Drop funcional**: Reorganização visual entre linhas e posições
- **Merge operations**: Sistema completo de mesclagem de blocos
- **Column management**: Adição/remoção dinâmica de colunas
- **Resize handles**: Ajuste manual de larguras de coluna

### Sistema de Estado e Hooks
- **useBlockManagement**: Gerenciamento central de todos os blocos
- **useGridLayoutManager**: Gerenciamento específico de layout em grid
- **useEnhancedGridOperations**: Operações avançadas de grid (merge, split, reorder)

---

## FLUXO DE DADOS ATUAL

### 1. Estrutura de Dados de Bloco
```typescript
interface ReviewBlock {
  id: number;
  issue_id: string;
  type: BlockType;
  sort_index: number;
  visible: boolean;
  payload: BlockPayload;
  meta: {
    styles: {},
    conditions: {},
    analytics: {},
    layout?: {
      row_id: string;        // Identificador da linha
      position: number;      // Posição na linha (0-3)
      columns: number;       // Total de colunas na linha
      gap: number;          // Espaçamento entre colunas
      columnWidths?: number[]; // Larguras percentuais
    }
  };
}
```

### 2. Sistema de Layout State
```typescript
interface GridLayoutState {
  rows: GridRow[];
  totalBlocks: number;
}

interface GridRow {
  id: string;
  blocks: ReviewBlock[];
  columns: number;
  gap: number;
  columnWidths?: number[];
}
```

### 3. Fluxo de Operações
1. **NativeEditor** → Container principal com toolbar e modo split/preview
2. **BlockEditor** → Renderiza rows individuais ou grids usando layoutState
3. **ResizableGrid** → Gerencia grid específico com ResizablePanelGroup
4. **useGridLayoutManager** → Computa layout state a partir dos blocks
5. **useEnhancedGridOperations** → Executa operações de grid (merge, split, etc.)

---

## SISTEMA DE GRID — IMPLEMENTAÇÃO ATUAL

### Status: ✅ TOTALMENTE FUNCIONAL

**Componentes Principais**:
- `ResizableGrid.tsx`: Grid container com panels redimensionáveis
- `GridControls.tsx`: Controles de adição/remoção de colunas
- `useGridLayoutManager.ts`: Computação de layout state
- `useEnhancedGridOperations.ts`: Operações de grid

**Funcionalidades Implementadas**:
- ✅ Drag & drop entre posições na mesma linha
- ✅ Drag & drop entre linhas diferentes (merge)
- ✅ Redimensionamento de colunas com handles
- ✅ Adição/remoção dinâmica de colunas
- ✅ Preview de drop zones em tempo real
- ✅ Conversão single ↔ grid automática

### Como Funciona o Sistema de Merge

1. **Single Block → Grid**: Arrastar um bloco sobre outro cria um grid 2x1
2. **Grid → Grid**: Arrastar bloco para grid existente adiciona nova coluna
3. **Drop Zones**: Indicadores visuais mostram onde o bloco será inserido
4. **Metadata Sync**: Layout metadata é automaticamente sincronizado

### Grid Layout Manager Logic

```typescript
// Computa layout state a partir dos blocks
const layoutState = useMemo(() => {
  const rowsMap = new Map<string, GridRow>();
  
  blocks.forEach(block => {
    const layout = block.meta?.layout;
    
    if (layout?.row_id && layout.columns) {
      // Block pertence a um grid
      if (!rowsMap.has(layout.row_id)) {
        rowsMap.set(layout.row_id, {
          id: layout.row_id,
          blocks: [],
          columns: layout.columns,
          gap: layout.gap || 4,
          columnWidths: layout.columnWidths
        });
      }
      rowsMap.get(layout.row_id)!.blocks.push(block);
    } else {
      // Single block row
      rowsMap.set(`single-${block.id}`, {
        id: `single-${block.id}`,
        blocks: [block],
        columns: 1,
        gap: 4
      });
    }
  });
  
  return { rows: Array.from(rowsMap.values()) };
}, [blocks]);
```

---

## TIPOS DE BLOCO DETALHADOS

### 1. HEADING ✅ Completo
**Configurações Inline**:
- Nível (H1-H6): Select dropdown
- Âncora: Input text auto-gerado
- Cores: texto, fundo, borda

### 2. PARAGRAPH ✅ Completo  
**Configurações Inline**:
- Alinhamento: Botões left/center/right/justify
- Ênfase: normal/lead/small/caption
- Cores: texto, fundo, borda

### 3. SNAPSHOT_CARD ✅ Completo
**Configurações Inline**:
- Todos os campos PICOD editáveis inline
- Evidence level: Select dropdown  
- Recommendation strength: Select dropdown
- Cores: texto, fundo, borda, accent

### 4. FIGURE ⚠️ Parcialmente Implementado
**Configurações Inline Faltando**:
- Width/height adjustment
- Alignment controls  
- Caption editing inline
- Color system integration

### 5. TABLE ⚠️ Parcialmente Implementado
**Configurações Inline Faltando**:
- Sortable toggle
- Compact mode toggle
- Table-specific colors (header_bg, cell_bg, etc.)
- Add/remove rows/columns

### 6. CALLOUT ⚠️ Parcialmente Implementado
**Configurações Inline Faltando**:
- Type selector (info/warning/success/error/note/tip)
- Icon customization
- Color system integration

### 7. NUMBER_CARD ❌ Não Implementado
**Configurações Inline Necessárias**:
- Number input
- Label input  
- Description textarea
- Trend selector (up/down/neutral)
- Color system integration

### 8. REVIEWER_QUOTE ❌ Não Implementado
**Configurações Inline Necessárias**:
- Quote textarea
- Author input
- Title input
- Institution input
- Avatar URL input
- Color system integration

### 9. POLL ❌ Não Implementado
**Configurações Inline Necessárias**:
- Question input
- Options management (add/remove/edit)
- Poll type selector
- Results visibility toggle
- Color system integration

### 10. CITATION_LIST ❌ Não Implementado
**Configurações Inline Necessárias**:
- Citation style selector
- Numbered toggle
- Individual citation editing
- Color system integration

---

## SISTEMA DE CORES

### Status Atual: ⚠️ PARCIALMENTE FUNCIONAL

**✅ Funcionais**:
- `text_color`: Aplicado em heading, paragraph, snapshot_card
- `background_color`: Aplicado em heading, paragraph, snapshot_card  
- `border_color`: Aplicado em heading, paragraph, snapshot_card

**⚠️ Parcialmente Funcionais**:
- `accent_color`: Implementado apenas em snapshot_card e callout

**❌ Não Funcionais**:
- Cores em figure, table, poll, number_card, reviewer_quote, citation_list

---

## IMPORT/EXPORT SYSTEM ✅ FUNCIONAL

### Componente: `ImportExportManager`
**Formatos Suportados**:
- JSON: Backup/restore completo
- Markdown: Conversão bidirecional
- Plain text: Importação com detecção automática

**Funcionalidades**:
- Validação de dados na importação
- Preview antes de aplicar mudanças
- Error handling com toast notifications
- Preservação de metadados

---

## PROBLEMAS CRÍTICOS RESOLVIDOS

### ✅ Sistema de Grid Funcional
- Grid operations funcionando corretamente
- Drag & drop entre grids implementado
- Metadata synchronization resolvida
- Performance otimizada

### ✅ Hook Ordering Fixed
- Todos os hooks chamados na ordem correta
- Conditional hooks eliminados
- React Rules of Hooks respeitadas

### ⚠️ Ainda Pendentes
- Configurações inline para 7 tipos de bloco
- Sistema de cores incompleto
- Alinhamento de conteúdo em grids

---

## ARQUIVOS PRINCIPAIS DO SISTEMA

```
src/components/editor/
├── NativeEditor.tsx ✅ (núcleo principal)
├── BlockEditor.tsx ✅ (container de blocos)  
├── BlockPalette.tsx ✅ (paleta de tipos)
├── ImportExportManager.tsx ✅ (import/export)
├── inline/
│   ├── InlineRichTextEditor.tsx ✅
│   ├── InlineTextEditor.tsx ✅
│   ├── InlineColorPicker.tsx ✅
│   ├── InlineBlockSettings.tsx ⚠️ (incompleto)
│   └── EditableTable.tsx ⚠️ (limitado)
├── layout/ ✅ IMPLEMENTADO
│   ├── ResizableGrid.tsx ✅ (grid responsivo)
│   └── GridControls.tsx ✅ (controles de grid)
└── hooks/
    ├── useBlockManagement.ts ✅
    ├── useGridLayoutManager.ts ✅ (grid state)
    ├── useEnhancedGridOperations.ts ✅ (grid ops)
    ├── useEditorAutoSave.ts ✅
    └── useRichTextFormat.ts ✅

src/components/review/blocks/
├── HeadingBlock.tsx ✅ (settings completo)
├── ParagraphBlock.tsx ✅ (settings completo)
├── SnapshotCardBlock.tsx ✅ (settings completo)
├── FigureBlock.tsx ⚠️ (settings incompleto)
├── TableBlock.tsx ⚠️ (settings incompleto)
├── CalloutBlock.tsx ⚠️ (settings incompleto)
├── NumberCard.tsx ❌ (settings não implementado)
├── ReviewerQuote.tsx ❌ (settings não implementado)
├── PollBlock.tsx ❌ (settings não implementado)
└── CitationListBlock.tsx ❌ (settings não implementado)
```

---

## ANÁLISE: EXPANSÃO PARA GRIDS MULTI-ROW (2x3, 3x2, etc.)

### Complexidade Atual vs. Multi-Row

**✅ O que já funciona bem**:
- Sistema de metadata de layout está bem estruturado
- Grid operations são modulares e extensíveis
- Drag & drop infrastructure é robusta
- State management está centralizado

**🔄 Modificações necessárias para Multi-Row**:

1. **Extensão de Metadata Layout**:
```typescript
interface BlockLayout {
  row_id: string;
  position: number;        // Posição linear (0-5 para 2x3)
  columns: number;         // Colunas totais
  rows: number;           // ← NOVO: Linhas totais
  grid_column: number;    // ← NOVO: Coluna específica (0-2)
  grid_row: number;       // ← NOVO: Linha específica (0-1)
  columnWidths?: number[];
  rowHeights?: number[];  // ← NOVO: Alturas das linhas
}
```

2. **Modificação do ResizableGrid**:
- Substituir ResizablePanelGroup por CSS Grid nativo
- Adicionar handles de resize vertical
- Implementar grid template areas dinâmicas

3. **Expansão do GridLayoutManager**:
- Computar posições 2D ao invés de 1D
- Gerenciar row heights além de column widths
- Validar consistência de grid multi-row

### Estimativa de Complexidade: 🟡 MÉDIA-ALTA

**Prós do sistema atual**:
- Arquitetura bem separada e modular
- Hooks já abstraem a complexidade
- Metadata system já existe e é extensível
- Drag & drop pode ser reutilizado

**Desafios específicos**:
- ResizablePanelGroup não suporta 2D (precisa CSS Grid)
- Grid validation se torna mais complexa
- UI controls precisam de redesign para 2D
- Performance com muitos resize handles

### Estimativa de Trabalho: 15-20 prompts

**Fases de implementação**:
1. **Fase 1 (5-7 prompts)**: Estender metadata e GridLayoutManager
2. **Fase 2 (8-10 prompts)**: Reimplementar ResizableGrid com CSS Grid
3. **Fase 3 (3-5 prompts)**: Atualizar UI controls e drag operations

### Recomendação: 📈 VIÁVEL

O sistema atual fornece uma base sólida. A transição para multi-row seria **relativamente stress-free** porque:
- A arquitetura já separa concerns corretamente
- Os hooks são reutilizáveis
- O sistema de metadata é extensível
- A lógica de drag & drop é agnóstica ao layout

---

## MÉTRICAS DE QUALIDADE ATUAL

### Cobertura de Funcionalidades
- **Edição Inline**: 30% (3/10 blocos completos)
- **Sistema de Cores**: 30% (3/10 blocos funcionais)
- **Layout Single-Row Grid**: 100% (totalmente funcional) ✅
- **Layout Multi-Row Grid**: 0% (não implementado)
- **Import/Export**: 100% (totalmente funcional)

### Prioridades de Desenvolvimento
1. 🟡 **MÉDIA**: Completar configurações inline (7 blocos pendentes)  
2. 🟡 **MÉDIA**: Fixar pipeline de cores completo
3. 🟢 **BAIXA**: Implementar sistema multi-row grid
4. 🟢 **BAIXA**: Otimizações de performance e acessibilidade

---

## CHANGELOG

### v3.0.0 (2025-06-05) - Sistema de Grid Funcional
- ✅ Sistema de grid single-row totalmente implementado
- ✅ Drag & drop entre grids funcionando
- ✅ Merge operations estáveis
- ✅ ResizableGrid com panels redimensionáveis
- ✅ GridLayoutManager computando state corretamente
- ✅ Hook ordering issues resolvidos
- ⚠️ Configurações inline incompletas para 7 tipos de bloco
- ⚠️ Sistema de cores parcialmente funcional

### v2.0.0 (2025-06-05) - Estado Pós-Rollback
- ✅ Painéis de propriedades eliminados
- ✅ Sistema inline implementado para heading, paragraph, snapshot_card
- ❌ Sistema de grid não implementado

### v1.0.0 (2025-01-15) - Baseline Original
- Sistema básico de blocos
- Painéis de propriedades lateral

---

**📋 PRÓXIMOS PASSOS RECOMENDADOS**

**Prioridade 1 - Melhorias Imediatas**:
- [ ] Implementar alinhamento de conteúdo em grids
- [ ] Otimizar merge operations para não criar blocos vazios
- [ ] Refatorar ResizableGrid para melhor modularidade

**Prioridade 2 - Configurações Inline**:
- [ ] Completar settings para figure, table, callout
- [ ] Implementar settings para number_card, reviewer_quote, poll, citation_list

**Prioridade 3 - Sistema Multi-Row**:
- [ ] Planejar extensão de metadata para 2D
- [ ] Redesign ResizableGrid com CSS Grid
- [ ] Implementar controles 2D

---

**🎯 CONCLUSÃO SOBRE MULTI-ROW GRIDS**

Baseado na análise da arquitetura atual, implementar grids multi-row (2x3, 3x2, etc.) seria **VIÁVEL e relativamente STRESS-FREE** porque:

1. **Base sólida**: O sistema atual já resolve os problemas fundamentais
2. **Arquitetura modular**: Hooks e componentes são bem separados
3. **Metadata extensível**: Layout system já suporta extensões
4. **Drag & drop robusto**: Infrastructure pode ser reutilizada

**Estimativa realista**: 15-20 prompts para implementação completa
**Nível de stress**: 🟡 BAIXO-MÉDIO (comparado aos 100 prompts para chegar aqui)

A maior mudança seria migrar de ResizablePanelGroup para CSS Grid nativo, mas isso é uma refatoração técnica, não uma reimplementação completa.

---

**🔄 ESTE DOCUMENTO REFLETE O ESTADO REAL v3.0.0**
Versão atual: 3.0.0 | Última atualização: 2025-06-05
Próxima revisão: Após implementação de melhorias imediatas
