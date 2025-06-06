
# EDITOR NATIVO — MANUAL TÉCNICO COMPLETO & GUIA DE IA
**Versão 4.0.0** • 2025-06-06

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

## ARQUITETURA ATUAL — SISTEMA TOTALMENTE FUNCIONAL ✅

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

## ESTRUTURA DE DADOS ATUAL — CORRIGIDA v4.0.0

### 1. Interface ReviewBlock Definitiva
```typescript
interface ReviewBlock {
  id: number;                    // ID único do bloco
  type: BlockType;              // Tipo do bloco
  content: BlockContent;        // ⚠️ CORRIGIDO: era 'payload', agora é 'content'
  sort_index: number;           // Posição na sequência
  visible: boolean;             // Visibilidade do bloco
  meta: ReviewBlockMeta;        // Metadados incluindo layout
  issue_id?: string;            // ID da issue (opcional)
  created_at?: string;          // Data de criação
  updated_at?: string;          // Data de atualização
}
```

### 2. Sistema de Layout Metadata
```typescript
interface ExtendedLayoutMeta {
  row_id: string;               // Identificador da linha
  position: number;             // Posição na linha (0-3)
  columns: number;              // Total de colunas na linha
  gap: number;                  // Espaçamento entre colunas
  columnWidths?: number[];      // Larguras percentuais
  // Futuro: rows, grid_column, grid_row para 2D grids
}
```

### 3. Conteúdo de Blocos por Tipo
```typescript
// Snapshot Card com recursos avançados
interface SnapshotCardContent {
  title: string;
  subtitle?: string;
  population?: string;
  intervention?: string;
  comparison?: string;
  outcome?: string;
  design?: string;
  
  // ✅ NOVO: Sistema de badges customizáveis
  custom_badges?: CustomBadge[];
  
  // ✅ NOVO: Seções de achados editáveis
  finding_sections?: FindingSection[];
  
  // Sistema de cores
  text_color?: string;
  background_color?: string;
  border_color?: string;
  accent_color?: string;
}

interface CustomBadge {
  id: string;
  label: string;              // Ex: "Evidência", "Recomendação"
  value: string;              // Ex: "Alta", "Forte"
  color: string;              // Cor do texto
  background_color: string;   // Cor de fundo
}

interface FindingSection {
  id: string;
  label: string;              // Ex: "Principais Achados"
  items: FindingItem[];
}

interface FindingItem {
  id: string;
  text: string;               // Texto do achado
  color: string;              // Cor do indicador
}
```

---

## FLUXO DE DADOS ATUAL

### 1. Salvamento no Banco (Supabase)
```sql
-- Tabela review_blocks
CREATE TABLE review_blocks (
  id BIGINT PRIMARY KEY,
  issue_id UUID,
  type TEXT NOT NULL,
  payload JSONB NOT NULL,    -- ⚠️ BANCO usa 'payload'
  meta JSONB DEFAULT '{}',
  sort_index INTEGER,
  visible BOOLEAN DEFAULT true
);
```

### 2. Mapeamento Payload ↔ Content
```typescript
// SALVAMENTO: content → payload
const blocksToInsert = blocks.map(block => ({
  issue_id: id,
  sort_index: block.sort_index,
  type: block.type,
  payload: block.content,     // content vira payload no banco
  meta: block.meta,
  visible: block.visible
}));

// CARREGAMENTO: payload → content
const transformedBlocks = dbBlocks.map(dbBlock => ({
  id: dbBlock.id,
  type: dbBlock.type,
  content: dbBlock.payload,   // payload vira content na interface
  sort_index: dbBlock.sort_index,
  visible: dbBlock.visible,
  meta: dbBlock.meta
}));
```

---

## TIPOS DE BLOCO DETALHADOS — STATUS ATUAL

### 1. HEADING ✅ Completo
**Configurações Inline Implementadas**:
- Nível (H1-H6): Select dropdown inline
- Âncora: Input text auto-gerado
- Cores: text_color, background_color, border_color
- Alinhamento: left, center, right

**Exemplo de Uso**:
```typescript
const headingBlock: ReviewBlock = {
  id: 1,
  type: 'heading',
  content: {
    text: 'Introdução',
    level: 2,
    anchor: 'introducao',
    text_color: '#ffffff',
    background_color: 'transparent',
    border_color: '#3b82f6'
  },
  sort_index: 0,
  visible: true,
  meta: {}
};
```

### 2. PARAGRAPH ✅ Completo  
**Configurações Inline Implementadas**:
- Alinhamento: Botões left/center/right/justify
- Ênfase: normal/lead/small/caption
- Cores: text_color, background_color, border_color

**Exemplo de Uso**:
```typescript
const paragraphBlock: ReviewBlock = {
  id: 2,
  type: 'paragraph',
  content: {
    text: 'Este estudo avaliou a eficácia de...',
    emphasis: 'lead',
    alignment: 'left',
    text_color: '#ffffff',
    background_color: 'transparent'
  },
  sort_index: 1,
  visible: true,
  meta: {}
};
```

### 3. SNAPSHOT_CARD ✅ Completo + Recursos Avançados
**Configurações Inline Implementadas**:
- Todos os campos PICOD editáveis inline
- Sistema de badges customizáveis (NOVO)
- Seções de achados editáveis (NOVO)  
- Cores: text_color, background_color, border_color, accent_color

**Componentes Especializados**:
- `CustomBadgesManager.tsx`: Gerencia badges personalizáveis
- `FindingSectionsManager.tsx`: Gerencia seções de achados

**Exemplo Completo**:
```typescript
const snapshotBlock: ReviewBlock = {
  id: 3,
  type: 'snapshot_card',
  content: {
    title: 'Revisão Sistemática - Diabetes Tipo 2',
    population: 'Adultos com diabetes tipo 2',
    intervention: 'Metformina 500mg 2x/dia',
    comparison: 'Placebo',
    outcome: 'Redução da HbA1c',
    design: 'Ensaio clínico randomizado',
    
    // Sistema de badges customizáveis
    custom_badges: [
      {
        id: 'evidence_level',
        label: 'Evidência',
        value: 'Alta',
        color: '#10b981',
        background_color: 'transparent'
      },
      {
        id: 'recommendation',
        label: 'Recomendação',
        value: 'Forte',
        color: '#3b82f6',
        background_color: 'transparent'
      }
    ],
    
    // Seções de achados editáveis
    finding_sections: [
      {
        id: 'main_findings',
        label: 'Principais Achados',
        items: [
          {
            id: 'finding_1',
            text: 'Redução significativa da HbA1c (-1.2%)',
            color: '#10b981'
          },
          {
            id: 'finding_2', 
            text: 'Melhora do perfil lipídico',
            color: '#3b82f6'
          }
        ]
      }
    ],
    
    // Cores
    text_color: '#ffffff',
    background_color: '#1a1a1a',
    accent_color: '#3b82f6'
  },
  sort_index: 2,
  visible: true,
  meta: {}
};
```

### 4. FIGURE ⚠️ Parcialmente Implementado
**Configurações Inline Faltando**:
- Width/height adjustment
- Alignment controls  
- Caption editing inline
- Color system integration

**Status**: Funcional mas com configurações limitadas

### 5. TABLE ⚠️ Parcialmente Implementado
**Configurações Inline Faltando**:
- Sortable toggle
- Compact mode toggle
- Table-specific colors (header_bg, cell_bg, etc.)
- Add/remove rows/columns

**Status**: Funcional mas com configurações limitadas

### 6. CALLOUT ⚠️ Parcialmente Implementado
**Configurações Inline Faltando**:
- Type selector (info/warning/success/error/note/tip)
- Icon customization
- Color system integration

**Status**: Funcional mas com configurações limitadas

### 7-10. TIPOS NÃO IMPLEMENTADOS
- **NUMBER_CARD**: ❌ Não implementado
- **REVIEWER_QUOTE**: ❌ Não implementado  
- **POLL**: ❌ Não implementado
- **CITATION_LIST**: ❌ Não implementado

---

## SISTEMA DE GRID — IMPLEMENTAÇÃO FUNCIONAL ✅

### Como Funciona o Sistema de Merge

1. **Single Block → Grid**: Arrastar um bloco sobre outro cria um grid 2x1
2. **Grid → Grid**: Arrastar bloco para grid existente adiciona nova coluna
3. **Drop Zones**: Indicadores visuais mostram onde o bloco será inserido
4. **Metadata Sync**: Layout metadata é automaticamente sincronizado

### Exemplo de Layout em Grid
```typescript
// Dois blocos em uma linha (2 colunas)
const gridBlocks: ReviewBlock[] = [
  {
    id: 4,
    type: 'paragraph',
    content: { text: 'Coluna 1' },
    sort_index: 0,
    visible: true,
    meta: {
      layout: {
        row_id: 'row_001',
        position: 0,
        columns: 2,
        gap: 4,
        columnWidths: [50, 50]
      }
    }
  },
  {
    id: 5,
    type: 'paragraph', 
    content: { text: 'Coluna 2' },
    sort_index: 1,
    visible: true,
    meta: {
      layout: {
        row_id: 'row_001',
        position: 1,
        columns: 2,
        gap: 4,
        columnWidths: [50, 50]
      }
    }
  }
];
```

---

## IMPORT/EXPORT SYSTEM ✅ FUNCIONAL COM MIGRAÇÃO

### Formato de Exportação v2.0.0
```typescript
interface ExportData {
  version: string;              // "2.0.0"
  timestamp: string;
  blocks: ReviewBlock[];
  metadata: {
    blockCount: number;
    types: string[];
    hasGridLayouts: boolean;
    hasCustomBadges: boolean;
    hasFindingSections: boolean;
  };
}
```

### Sistema de Migração Automática
O sistema detecta e migra automaticamente dados de versões antigas:

```typescript
// Migração de evidence_level → custom_badges
if (block.content.evidence_level && !block.content.custom_badges) {
  const evidenceLevels = {
    high: { label: 'Alta', color: '#10b981' },
    moderate: { label: 'Moderada', color: '#f59e0b' },
    low: { label: 'Baixa', color: '#ef4444' }
  };
  
  const level = evidenceLevels[block.content.evidence_level];
  block.content.custom_badges = [{
    id: 'migrated_evidence_level',
    label: 'Evidência',
    value: level.label,
    color: level.color,
    background_color: 'transparent'
  }];
  delete block.content.evidence_level;
}
```

---

## GUIA COMPLETO PARA IA — IMPLEMENTAÇÃO PRÁTICA

### 1. Estrutura Básica de uma Revisão

**Template Inicial**:
```typescript
const reviewTemplate: ReviewBlock[] = [
  // Título principal
  {
    id: 1,
    type: 'heading',
    content: {
      text: 'TÍTULO DA REVISÃO',
      level: 1,
      text_color: '#ffffff',
      background_color: 'transparent'
    },
    sort_index: 0,
    visible: true,
    meta: {}
  },
  
  // Snapshot card com dados PICOD
  {
    id: 2,
    type: 'snapshot_card',
    content: {
      title: 'Resumo da Evidência',
      population: 'População do estudo',
      intervention: 'Intervenção testada',
      comparison: 'Comparador usado',
      outcome: 'Desfecho primário',
      design: 'Desenho do estudo',
      custom_badges: [],
      finding_sections: [],
      text_color: '#ffffff',
      background_color: '#1a1a1a',
      accent_color: '#3b82f6'
    },
    sort_index: 1,
    visible: true,
    meta: {}
  },
  
  // Seção de introdução
  {
    id: 3,
    type: 'heading',
    content: {
      text: 'Introdução',
      level: 2,
      anchor: 'introducao'
    },
    sort_index: 2,
    visible: true,
    meta: {}
  },
  
  {
    id: 4,
    type: 'paragraph',
    content: {
      text: 'Texto da introdução...',
      emphasis: 'normal',
      alignment: 'left'
    },
    sort_index: 3,
    visible: true,
    meta: {}
  }
];
```

### 2. Padrões de Layout Avançados

**Grid 2x2 para Comparações**:
```typescript
// Layout em grid para mostrar antes/depois
const comparisonGrid: ReviewBlock[] = [
  {
    id: 5,
    type: 'snapshot_card',
    content: { title: 'Antes da Intervenção' },
    sort_index: 4,
    visible: true,
    meta: {
      layout: {
        row_id: 'comparison_row',
        position: 0,
        columns: 2,
        gap: 4,
        columnWidths: [50, 50]
      }
    }
  },
  {
    id: 6,
    type: 'snapshot_card',
    content: { title: 'Após a Intervenção' },
    sort_index: 5,
    visible: true,
    meta: {
      layout: {
        row_id: 'comparison_row',
        position: 1,
        columns: 2,
        gap: 4,
        columnWidths: [50, 50]
      }
    }
  }
];
```

### 3. Sistema de Badges Inteligente

**Configuração Automática de Badges**:
```typescript
const createEvidenceBadges = (evidenceLevel: string, recommendationStrength: string) => {
  const badges: CustomBadge[] = [];
  
  // Badge de evidência
  const evidenceColors = {
    'alta': '#10b981',
    'moderada': '#f59e0b', 
    'baixa': '#ef4444',
    'muito_baixa': '#6b7280'
  };
  
  badges.push({
    id: 'evidence_badge',
    label: 'Qualidade da Evidência',
    value: evidenceLevel,
    color: evidenceColors[evidenceLevel.toLowerCase()] || '#6b7280',
    background_color: 'transparent'
  });
  
  // Badge de recomendação
  const recommendationColors = {
    'forte': '#10b981',
    'condicional': '#f59e0b',
    'contra': '#ef4444'
  };
  
  badges.push({
    id: 'recommendation_badge',
    label: 'Força da Recomendação',
    value: recommendationStrength,
    color: recommendationColors[recommendationStrength.toLowerCase()] || '#6b7280',
    background_color: 'transparent'
  });
  
  return badges;
};
```

### 4. Seções de Achados Estruturadas

**Template para Achados Categorizados**:
```typescript
const createFindingSections = (findings: any) => {
  return [
    {
      id: 'primary_outcomes',
      label: 'Desfechos Primários',
      items: findings.primary.map((text: string, index: number) => ({
        id: `primary_${index}`,
        text,
        color: '#10b981'
      }))
    },
    {
      id: 'secondary_outcomes',
      label: 'Desfechos Secundários',
      items: findings.secondary.map((text: string, index: number) => ({
        id: `secondary_${index}`,
        text,
        color: '#3b82f6'
      }))
    },
    {
      id: 'safety_outcomes',
      label: 'Segurança',
      items: findings.safety.map((text: string, index: number) => ({
        id: `safety_${index}`,
        text,
        color: '#f59e0b'
      }))
    }
  ];
};
```

### 5. Workflow de Importação de Texto

**Conversão de Texto Estruturado**:
```typescript
const parseStructuredText = (rawText: string): ReviewBlock[] => {
  const blocks: ReviewBlock[] = [];
  let currentIndex = 0;
  
  // Regex patterns para identificar seções
  const titlePattern = /^#\s(.+)/gm;
  const subtitlePattern = /^##\s(.+)/gm;
  const paragraphPattern = /^(?!#)(.+)/gm;
  
  // Processar títulos
  let match;
  while ((match = titlePattern.exec(rawText)) !== null) {
    blocks.push({
      id: ++currentIndex,
      type: 'heading',
      content: {
        text: match[1],
        level: 1,
        anchor: match[1].toLowerCase().replace(/\s+/g, '-')
      },
      sort_index: blocks.length,
      visible: true,
      meta: {}
    });
  }
  
  // Processar subtítulos
  while ((match = subtitlePattern.exec(rawText)) !== null) {
    blocks.push({
      id: ++currentIndex,
      type: 'heading',
      content: {
        text: match[1],
        level: 2,
        anchor: match[1].toLowerCase().replace(/\s+/g, '-')
      },
      sort_index: blocks.length,
      visible: true,
      meta: {}
    });
  }
  
  // Processar parágrafos
  while ((match = paragraphPattern.exec(rawText)) !== null) {
    blocks.push({
      id: ++currentIndex,
      type: 'paragraph',
      content: {
        text: match[1],
        emphasis: 'normal',
        alignment: 'left'
      },
      sort_index: blocks.length,
      visible: true,
      meta: {}
    });
  }
  
  return blocks;
};
```

### 6. Validação e Otimização

**Checklist de Qualidade**:
```typescript
const validateReviewBlocks = (blocks: ReviewBlock[]): string[] => {
  const errors: string[] = [];
  
  // Verificar IDs únicos
  const ids = blocks.map(b => b.id);
  if (new Set(ids).size !== ids.length) {
    errors.push('IDs duplicados encontrados');
  }
  
  // Verificar sort_index sequencial
  const sortIndices = blocks.map(b => b.sort_index).sort((a, b) => a - b);
  for (let i = 0; i < sortIndices.length; i++) {
    if (sortIndices[i] !== i) {
      errors.push('Sort indices não sequenciais');
      break;
    }
  }
  
  // Verificar integridade dos grids
  const gridBlocks = blocks.filter(b => b.meta?.layout?.row_id);
  const gridRows = new Map();
  
  gridBlocks.forEach(block => {
    const rowId = block.meta!.layout!.row_id;
    if (!gridRows.has(rowId)) {
      gridRows.set(rowId, []);
    }
    gridRows.get(rowId).push(block);
  });
  
  gridRows.forEach((rowBlocks, rowId) => {
    if (rowBlocks.length !== rowBlocks[0].meta.layout.columns) {
      errors.push(`Grid ${rowId}: número de blocos não confere com número de colunas`);
    }
  });
  
  return errors;
};
```

### 7. Padrões de Performance

**Otimização para Reviews Grandes**:
```typescript
// Lazy loading para blocos complexos
const createLazyBlock = (type: BlockType, content: any): ReviewBlock => ({
  id: Date.now() + Math.random(),
  type,
  content,
  sort_index: 0, // Será ajustado na inserção
  visible: true,
  meta: {
    lazy: true // Flag para carregamento lazy
  }
});

// Batching para inserções múltiplas
const batchInsertBlocks = (blocks: ReviewBlock[], batchSize = 10) => {
  const batches = [];
  for (let i = 0; i < blocks.length; i += batchSize) {
    batches.push(blocks.slice(i, i + batchSize));
  }
  return batches;
};
```

---

## ARQUIVOS PRINCIPAIS DO SISTEMA

```
src/components/editor/
├── NativeEditor.tsx ✅ (núcleo principal - 202 linhas)
├── BlockEditor.tsx ✅ (container de blocos)  
├── BlockPalette.tsx ✅ (paleta de tipos)
├── ImportExportManager.tsx ✅ (import/export - 538 linhas)
├── inline/
│   ├── InlineRichTextEditor.tsx ✅
│   ├── InlineTextEditor.tsx ✅
│   ├── InlineColorPicker.tsx ✅
│   ├── InlineBlockSettings.tsx ⚠️ (incompleto)
│   ├── BlockSpecificProperties.tsx ✅
│   ├── InlineAlignmentControls.tsx ✅
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
├── snapshot/
│   ├── CustomBadgesManager.tsx ✅ (badges customizáveis)
│   └── FindingSectionsManager.tsx ✅ (seções de achados)
├── FigureBlock.tsx ⚠️ (settings incompleto)
├── TableBlock.tsx ⚠️ (settings incompleto)
├── CalloutBlock.tsx ⚠️ (settings incompleto)
├── NumberCard.tsx ❌ (não implementado)
├── ReviewerQuote.tsx ❌ (não implementado)
├── PollBlock.tsx ❌ (não implementado)
└── CitationListBlock.tsx ❌ (não implementado)
```

---

## PROBLEMAS CONHECIDOS & LIMITAÇÕES

### ⚠️ Configurações Inline Incompletas
- **FIGURE**: Falta width/height, alignment, caption editing
- **TABLE**: Falta sortable toggle, add/remove rows/columns  
- **CALLOUT**: Falta type selector, icon customization

### ⚠️ Sistema de Cores Parcial
- **Funcionais**: heading, paragraph, snapshot_card
- **Limitados**: figure, table, callout
- **Não Funcionais**: number_card, reviewer_quote, poll, citation_list

### ⚠️ Tipos de Bloco Não Implementados
4 tipos de bloco ainda não possuem implementação:
- NUMBER_CARD, REVIEWER_QUOTE, POLL, CITATION_LIST

---

## ROADMAP & PRÓXIMOS PASSOS

### Prioridade 1 - Melhorias Imediatas
- [ ] Completar configurações inline para figure, table, callout
- [ ] Implementar alinhamento de conteúdo em grids
- [ ] Fixar pipeline de cores para todos os blocos

### Prioridade 2 - Novos Tipos de Bloco
- [ ] Implementar NUMBER_CARD com configurações inline
- [ ] Implementar REVIEWER_QUOTE com configurações inline
- [ ] Implementar POLL com configurações inline  
- [ ] Implementar CITATION_LIST com configurações inline

### Prioridade 3 - Sistema Multi-Row Grid
- [ ] Estender metadata para suporte 2D (2x2, 3x2, etc.)
- [ ] Migrar de ResizablePanelGroup para CSS Grid nativo
- [ ] Implementar controles 2D para resize vertical

### Prioridade 4 - Funcionalidades Avançadas
- [ ] Sistema de templates pré-configurados
- [ ] Versionamento de revisões  
- [ ] Colaboração em tempo real
- [ ] Exportação para múltiplos formatos

---

## CHANGELOG

### v4.0.0 (2025-06-06) - Documentação Completa & IA-Ready
- ✅ Estrutura de dados corrigida (payload → content)
- ✅ Sistema de import/export com migração automática
- ✅ Custom badges e finding sections documentados
- ✅ Guia completo para implementação por IA
- ✅ Exemplos práticos e templates
- ✅ Workflow de validação e otimização

### v3.0.0 (2025-06-05) - Sistema de Grid Funcional
- ✅ Sistema de grid single-row totalmente implementado
- ✅ Drag & drop entre grids funcionando
- ✅ Merge operations estáveis
- ✅ ResizableGrid com panels redimensionáveis

### v2.0.0 (2025-06-05) - Estado Pós-Rollback
- ✅ Painéis de propriedades eliminados
- ✅ Sistema inline implementado para 3 tipos de bloco

### v1.0.0 (2025-01-15) - Baseline Original
- Sistema básico de blocos com painéis laterais

---

**🎯 RESUMO PARA IA: COMO USAR ESTE EDITOR**

1. **Estrutura de Dados**: Use sempre `content` (não `payload`). O mapeamento é feito automaticamente.

2. **Tipos Funcionais**: heading, paragraph, snapshot_card têm configurações inline completas.

3. **Sistema de Grid**: Arraste blocos uns sobre os outros para criar grids. Metadata é sincronizada automaticamente.

4. **Badges Customizáveis**: Use `custom_badges` array no snapshot_card para evidência/recomendação personalizadas.

5. **Seções de Achados**: Use `finding_sections` array para organizar achados categorizados.

6. **Import/Export**: Sistema v2.0.0 com migração automática. Use `ImportExportManager` para backup/restore.

7. **Validação**: Sempre validar IDs únicos, sort_index sequencial, e integridade de grids.

8. **Performance**: Para reviews grandes, use lazy loading e batching de inserções.

**✅ Este documento fornece tudo que uma IA precisa para implementar revisões científicas completas e bem estruturadas usando o Editor Nativo.**

---

**🔄 VERSÃO ATUAL: 4.0.0 | ESTADO: PRODUCTION-READY**
Última atualização: 2025-06-06 | Próxima revisão: Após implementação de tipos de bloco faltantes
