
# EDITOR NATIVO — MANUAL TÉCNICO COMPLETO
**Versão 2.0.0** • 2025-06-05

## PROPÓSITO & FILOSOFIA

O Editor Nativo é um sistema de criação de conteúdo baseado em blocos, desenvolvido especificamente para revisões científicas médicas. Substitui o modelo tradicional de PDF por uma experiência interativa, editável e semanticamente estruturada com edição inline completa.

### Princípios Fundamentais
- **Atomicidade**: Cada bloco é uma unidade independente e completa
- **Composabilidade**: Blocos se combinam para formar narrativas complexas  
- **Editabilidade Inline**: Modificação direta sem modais ou painéis laterais
- **Layout Flexível**: Suporte a múltiplos blocos por linha com sistema de grid responsivo
- **Preservação Semântica**: Manutenção do significado científico durante conversões
- **Acessibilidade**: Suporte completo a tecnologias assistivas

---

## ARQUITETURA ATUAL

### Sistema de Edição Inline
- **Painéis de propriedades eliminados**: Toda configuração é feita inline
- **Settings integrados**: Cada bloco possui botão de configurações (ícone engrenagem)
- **Edição contextual**: Modificação direta do conteúdo sem modais
- **Sistema de cores unificado**: Aplicação consistente através de todos os blocos

### Layout Multi-Bloco
- **Grid flexível**: Suporte a 1-4 blocos por linha
- **Responsividade**: Adaptação automática em dispositivos móveis
- **Drag & Drop**: Reorganização visual entre linhas e posições
- **Breakpoints adaptativos**: Colapso inteligente baseado no tamanho da tela

---

## HIERARQUIA DE TIPOS DE BLOCO

```
ReviewBlock
├── ContentBlocks (conteúdo textual)
│   ├── heading (1-6 níveis) ✅ Inline settings completo
│   ├── paragraph (texto formatado) ✅ Inline settings completo  
│   └── callout (destaque contextual) ⚠️ Inline settings parcial
├── MediaBlocks (conteúdo visual)
│   ├── figure (imagens com legendas) ⚠️ Inline settings parcial
│   └── table (dados tabulares) ⚠️ Inline settings parcial
├── InteractiveBlocks (elementos dinâmicos)
│   ├── poll (enquetes/votações) ❌ Inline settings não implementado
│   ├── number_card (métricas destacadas) ❌ Inline settings não implementado
│   └── reviewer_quote (citações) ❌ Inline settings não implementado
└── StructuralBlocks (organização científica)
    ├── snapshot_card (resumo PICOD) ✅ Inline settings completo
    └── citation_list (referências) ❌ Inline settings não implementado
```

### Estrutura Universal de Bloco
```typescript
interface ReviewBlock {
  id: number;                    // Identificador único
  issue_id: string;              // Referência ao artigo
  type: BlockType;               // Tipo do bloco
  sort_index: number;            // Posição na sequência
  visible: boolean;              // Visibilidade no preview
  payload: BlockPayload;         // Dados específicos do tipo
  meta: BlockMeta;              // Metadados e layout
  layout?: BlockLayout;         // Informações de layout multi-bloco
  created_at: string;           // Timestamp de criação
  updated_at: string;           // Timestamp de modificação
}

interface BlockLayout {
  row_id: string;               // ID da linha no layout
  position: number;             // Posição na linha (0-3)
  width: number;                // Largura relativa (1-12)
  breakpoint?: 'sm' | 'md' | 'lg'; // Breakpoint de colapso
}
```

---

## SISTEMA DE CORES INTEGRADO

### Status Atual de Implementação

**✅ Funcionais**:
- `text_color`: Aplicado em heading, paragraph, snapshot_card
- `background_color`: Aplicado em heading, paragraph, snapshot_card  
- `border_color`: Aplicado em heading, paragraph, snapshot_card

**⚠️ Parcialmente Funcionais**:
- `accent_color`: Implementado apenas em snapshot_card e callout
- Cores específicas de tabela: Definidas mas não aplicadas consistentemente

**❌ Não Funcionais**:
- Cores em figure, poll, number_card, reviewer_quote, citation_list
- Pipeline de aplicação de cores quebrado em vários componentes

### Hierarquia de Cores Padrão
```css
:root {
  --block-text-default: #ffffff;
  --block-background-default: transparent;
  --block-border-default: transparent;
  --block-accent-default: #3b82f6;
}
```

---

## COMPONENTES INLINE IMPLEMENTADOS

### InlineRichTextEditor ✅
- **Status**: Totalmente funcional
- **Recursos**: Formatação rica, toolbar, direção de texto corrigida
- **Usado em**: paragraph.content

### InlineTextEditor ✅  
- **Status**: Totalmente funcional
- **Recursos**: Edição simples, placeholder, eventos de teclado
- **Usado em**: heading.text, snapshot_card campos

### InlineColorPicker ✅
- **Status**: Funcional com limitações
- **Recursos**: Paleta de cores, cores customizadas, reset
- **Problemas**: Pipeline de aplicação inconsistente

### InlineBlockSettings ⚠️
- **Status**: Implementado mas incompleto
- **Recursos**: Abas (Geral, Cores), visibilidade toggle
- **Problemas**: Configurações específicas faltando em vários tipos de bloco

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

## SISTEMA MULTI-BLOCO LAYOUT

### Status: ❌ Não Implementado

**Componentes Necessários**:
- `LayoutRow`: Container para múltiplos blocos
- `LayoutGrid`: Sistema de grid responsivo  
- `LayoutControls`: Controles de adição/remoção de colunas
- `useLayoutManagement`: Hook para gerenciar estado do layout

**Funcionalidades Planejadas**:
- Drag & drop entre posições na mesma linha
- Drag & drop entre linhas diferentes
- Redimensionamento de colunas
- Breakpoints responsivos
- Preview de layout em tempo real

### Estrutura de Dados
```typescript
interface LayoutRow {
  id: string;
  blocks: ReviewBlock[];
  columns: number; // 1-4
  gap: number; // spacing between blocks
  responsive: {
    sm: number; // columns on small screens
    md: number; // columns on medium screens  
    lg: number; // columns on large screens
  };
}

interface LayoutState {
  rows: LayoutRow[];
  activeRow?: string;
  dragState: {
    isDragging: boolean;
    draggedBlock?: number;
    targetPosition?: { rowId: string; position: number };
  };
}
```

---

## IMPORT/EXPORT SYSTEM ✅

### Status: Implementado e Funcional

**Componente**: `ImportExportManager`
**Localização**: Toolbar do NativeEditor
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

## PROBLEMAS CRÍTICOS IDENTIFICADOS

### 1. Pipeline de Cores Quebrado
**Problema**: Cores definidas no InlineColorPicker não são aplicadas
**Causa**: Falta de propagação entre handleColorChange e renderização
**Componentes Afetados**: figure, table, callout, number_card, reviewer_quote, poll, citation_list

### 2. Configurações Inline Incompletas  
**Problema**: Muitos blocos não possuem configurações específicas
**Causa**: InlineBlockSettings não implementa cases para todos os tipos
**Blocos Afetados**: poll, number_card, reviewer_quote, citation_list

### 3. Ausência de Layout Multi-Bloco
**Problema**: Sistema atual suporta apenas um bloco por linha
**Impacto**: Limitação severa na flexibilidade de design
**Solução**: Implementar sistema completo de grid layout

### 4. Inconsistência de Estado
**Problema**: Updates de payload nem sempre disparam re-render
**Causa**: Mutação direta vs immutable updates
**Solução**: Padronizar uso de spread operators e useCallback

---

## PLANO DE IMPLEMENTAÇÃO PRIORITÁRIO

### Fase 1: Correção do Sistema de Cores ⚡ CRÍTICO
1. Fixar pipeline InlineColorPicker → BlockRenderer
2. Implementar aplicação de cores em todos os blocos
3. Validar propagação de mudanças

### Fase 2: Completar Configurações Inline ⚡ CRÍTICO  
1. Implementar settings para number_card, reviewer_quote, poll, citation_list
2. Adicionar configurações específicas faltando em figure, table, callout
3. Padronizar interface de todas as configurações

### Fase 3: Sistema Multi-Bloco Layout 🎯 ALTA PRIORIDADE
1. Criar componentes LayoutRow e LayoutGrid
2. Implementar useLayoutManagement hook
3. Adicionar drag & drop entre posições
4. Implementar responsividade automática

### Fase 4: Otimizações e Polimento 📈 MÉDIA PRIORIDADE
1. Performance optimizations para grandes coleções
2. Melhorias de acessibilidade  
3. Testes de integração
4. Documentação final

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
│   ├── InlineColorPicker.tsx ✅ (com problemas)
│   ├── InlineBlockSettings.tsx ⚠️ (incompleto)
│   └── EditableTable.tsx ⚠️ (limitado)
├── layout/ ❌ (não existe)
│   ├── LayoutRow.tsx ❌
│   ├── LayoutGrid.tsx ❌
│   └── LayoutControls.tsx ❌
└── hooks/
    ├── useBlockManagement.ts ✅
    ├── useEditorAutoSave.ts ✅
    ├── useRichTextFormat.ts ✅
    └── useLayoutManagement.ts ❌

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

## MÉTRICAS DE QUALIDADE

### Cobertura de Funcionalidades
- **Edição Inline**: 30% (3/10 blocos completos)
- **Sistema de Cores**: 30% (3/10 blocos funcionais)
- **Layout Multi-Bloco**: 0% (não implementado)
- **Import/Export**: 100% (totalmente funcional)

### Prioridades de Desenvolvimento
1. 🔴 **CRÍTICO**: Fixar pipeline de cores (afeta todos os blocos)
2. 🔴 **CRÍTICO**: Completar configurações inline (7 blocos pendentes)  
3. 🟡 **ALTA**: Implementar sistema multi-bloco layout
4. 🟢 **MÉDIA**: Otimizações de performance e acessibilidade

---

## CHANGELOG

### v2.0.0 (2025-06-05) - Estado Atual Pós-Rollback
- ✅ Painéis de propriedades completamente eliminados
- ✅ Sistema inline implementado para heading, paragraph, snapshot_card
- ✅ Import/Export totalmente funcional
- ✅ Auto-save e undo/redo implementados
- ❌ Sistema de cores com problemas críticos
- ❌ Configurações inline incompletas para 7 tipos de bloco
- ❌ Layout multi-bloco não implementado

### v1.0.0 (2025-01-15) - Baseline Original
- Sistema básico de blocos
- Painéis de propriedades lateral
- Funcionalidades limitadas

---

**📋 CHECKLIST DE IMPLEMENTAÇÃO IMEDIATA**

**Fase 1 - Cores (CRÍTICO)**:
- [ ] Fixar InlineColorPicker.handleColorChange propagation
- [ ] Implementar aplicação de cores em FigureBlock
- [ ] Implementar aplicação de cores em TableBlock  
- [ ] Implementar aplicação de cores em CalloutBlock
- [ ] Implementar aplicação de cores em NumberCard
- [ ] Implementar aplicação de cores em ReviewerQuote
- [ ] Implementar aplicação de cores em PollBlock
- [ ] Implementar aplicação de cores em CitationListBlock

**Fase 2 - Settings Inline (CRÍTICO)**:
- [ ] Completar InlineBlockSettings para FigureBlock
- [ ] Completar InlineBlockSettings para TableBlock
- [ ] Completar InlineBlockSettings para CalloutBlock
- [ ] Implementar InlineBlockSettings para NumberCard
- [ ] Implementar InlineBlockSettings para ReviewerQuote  
- [ ] Implementar InlineBlockSettings para PollBlock
- [ ] Implementar InlineBlockSettings para CitationListBlock

**Fase 3 - Layout Multi-Bloco (ALTA)**:
- [ ] Criar LayoutRow component
- [ ] Criar LayoutGrid component  
- [ ] Criar useLayoutManagement hook
- [ ] Implementar drag & drop entre posições
- [ ] Adicionar responsividade automática

---

**🔄 ESTE DOCUMENTO REFLETE O ESTADO REAL**
Versão atual: 2.0.0 | Última atualização: 2025-06-05
Próxima revisão: Após conclusão das Fases 1-2
