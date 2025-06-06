
# EDITOR NATIVO — MANUAL TÉCNICO COMPLETO & GUIA DE IA
**Versão 4.1.0** • 2025-06-06

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
- Sistema de badges customizáveis
- Seções de achados editáveis  
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

### 4. FIGURE ✅ Completo
**Configurações Inline Implementadas**:
- Ajuste de largura/altura com presets e personalizado
- Controles de alinhamento (esquerda, centro, direita)
- Edição de legenda inline e texto alternativo
- Ajuste de borda arredondada
- Integração com sistema de cores
- Exibição de URL da imagem com validação

**Exemplo de Uso**:
```typescript
const figureBlock: ReviewBlock = {
  id: 4,
  type: 'figure',
  content: {
    src: 'https://exemplo.com/imagem.jpg',
    alt: 'Descrição da imagem para acessibilidade',
    caption: 'Figura 1: Resultados do estudo',
    width: '75%',         // ou valor específico em px
    height: 'auto',
    alignment: 'center',
    border_radius: 8,
    show_caption: true,
    text_color: '#d1d5db',
    background_color: 'transparent',
    border_color: 'transparent',
    caption_color: '#9ca3af'
  },
  sort_index: 3,
  visible: true,
  meta: {}
};
```

### 5. TABLE ✅ Completo
**Configurações Inline Implementadas**:
- Ordenação de dados (toggle sortable)
- Gerenciamento de linhas/colunas (adicionar/remover)
- Estilos específicos de tabela (cabeçalho, células, etc.)
- Modos compacto, listrado e com bordas
- Edição inline de células
- Personalização completa de cores

**Exemplo de Uso**:
```typescript
const tableBlock: ReviewBlock = {
  id: 5,
  type: 'table',
  content: {
    table_data: {
      headers: ['Parâmetro', 'Antes', 'Depois', 'p-valor'],
      rows: [
        ['Glicemia de jejum', '126 mg/dL', '98 mg/dL', '<0.001'],
        ['HbA1c', '8.2%', '6.8%', '<0.001'],
        ['Peso', '82.4 kg', '79.1 kg', '0.03']
      ],
      sortable: true,
      compact: false,
      striped: true,
      bordered: true
    },
    text_color: '#ffffff',
    background_color: '#1a1a1a',
    border_color: '#2a2a2a',
    header_background_color: '#2a2a2a',
    header_text_color: '#ffffff',
    even_row_color: 'rgba(255,255,255,0.05)',
    hover_color: 'rgba(59,130,246,0.1)'
  },
  sort_index: 4,
  visible: true,
  meta: {}
};
```

### 6. CALLOUT ✅ Completo
**Configurações Inline Implementadas**:
- Seletor de tipo (info/warning/success/error/note/tip/etc)
- Personalização de ícone e exibição/ocultação
- Estilo de borda (esquerda, completa, nenhuma)
- Tamanhos (compacto, normal, grande)
- Integração com sistema de cores
- Editor de título e conteúdo rico

**Exemplo de Uso**:
```typescript
const calloutBlock: ReviewBlock = {
  id: 6,
  type: 'callout',
  content: {
    type: 'warning',
    title: 'Atenção para interações medicamentosas',
    content: '<p>O uso concomitante com inibidores de CYP3A4 pode aumentar concentrações plasmáticas.</p>',
    show_icon: true,
    border_style: 'left',
    size: 'normal',
    text_color: '#ffffff',
    background_color: '#f59e0b1a',
    border_color: '#f59e0b',
    accent_color: '#f59e0b',
    title_color: '#ffffff'
  },
  sort_index: 5,
  visible: true,
  meta: {}
};
```

### 7. NUMBER_CARD ✅ Completo
**Configurações Inline Implementadas**:
- Formatos de número (inteiro, decimal, porcentagem, moeda)
- Tendência (subindo, descendo, estável, neutro)
- Variação percentual configurável
- Valores de comparação (anterior, meta)
- Personalização de ícone e tamanho
- Diversos estilos de card
- Sistema de cores completo

**Exemplo de Uso**:
```typescript
const numberCardBlock: ReviewBlock = {
  id: 7,
  type: 'number_card',
  content: {
    number: '42',
    number_format: 'percentage',
    label: 'Redução de Risco Relativo',
    description: 'Comparado ao grupo controle',
    subtitle: 'Desfecho Primário',
    trend: 'up',
    percentage: 15,
    previous_value: '36',
    target_value: '50',
    unit: '%',
    size: 'normal',
    card_style: 'default',
    show_icon: true,
    show_comparison: true,
    show_target: true,
    custom_icon: 'TrendingUp',
    text_color: '#ffffff',
    background_color: '#1a1a1a',
    border_color: '#2a2a2a',
    accent_color: '#3b82f6',
    number_color: '#10b981',
    label_color: '#ffffff'
  },
  sort_index: 6,
  visible: true,
  meta: {}
};
```

### 8. REVIEWER_QUOTE ✅ Completo
**Configurações Inline Implementadas**:
- Citação com formatação rica
- Dados do autor (nome, título, instituição)
- Avatar customizável
- Tipos de especialista com ícones específicos
- Credenciais e localização
- Sistema de avaliação por estrelas
- Informações de contato
- Múltiplos estilos de citação
- Tamanhos variados (compacto, normal, grande)

**Exemplo de Uso**:
```typescript
const reviewerQuoteBlock: ReviewBlock = {
  id: 8,
  type: 'reviewer_quote',
  content: {
    quote: 'Esta revisão sistemática estabelece definitivamente o benefício deste tratamento e deve modificar a prática clínica atual.',
    author: 'Dr. João Silva',
    title: 'Professor de Medicina',
    institution: 'Universidade Federal de Medicina',
    avatar_url: 'https://exemplo.com/avatar.jpg',
    expertise_type: 'professor',
    credentials: 'PhD, FAHA',
    location: 'São Paulo, Brasil',
    email: 'joao@exemplo.com',
    website: 'https://exemplo.com',
    quote_date: '2025-05-20',
    context: 'Durante apresentação do estudo no congresso',
    quote_style: 'default',
    size: 'normal',
    show_credentials: true,
    show_location: true,
    show_contact: false,
    show_context: true,
    show_date: true,
    show_rating: true,
    rating: 5,
    text_color: '#ffffff',
    background_color: '#1a1a1a',
    border_color: '#2a2a2a',
    accent_color: '#a855f7',
    quote_color: '#ffffff',
    author_color: '#ffffff'
  },
  sort_index: 7,
  visible: true,
  meta: {}
};
```

### 9. POLL ✅ Completo
**Configurações Inline Implementadas**:
- Sistema completo de criação de enquetes
- Suporte a escolha simples e múltipla
- Opções personalizáveis com cores
- Exibição de resultados em tempo real
- Exibição configurável (barras, porcentagem, números)
- Sistema de status (rascunho, ativo, encerrado, agendado)
- Configuração de data limite
- Controles de seleção mínima/máxima
- Descrição com formatação rica

**Exemplo de Uso**:
```typescript
const pollBlock: ReviewBlock = {
  id: 9,
  type: 'poll',
  content: {
    question: 'Com base nessa revisão, você mudaria sua prática clínica?',
    description: 'Considere os resultados apresentados ao responder.',
    poll_type: 'single_choice',
    options: [
      { id: 'option-1', text: 'Sim, imediatamente', votes: 42, color: '#10b981' },
      { id: 'option-2', text: 'Sim, após mais estudos', votes: 28, color: '#f59e0b' },
      { id: 'option-3', text: 'Não mudaria', votes: 14, color: '#ef4444' }
    ],
    votes: [42, 28, 14],
    total_votes: 84,
    poll_status: 'active',
    deadline: '2025-12-31T23:59:59',
    result_display: 'bar',
    show_results: true,
    show_vote_count: true,
    show_percentage: true,
    anonymous_voting: true,
    require_auth: false,
    max_selections: 1,
    min_selections: 1,
    text_color: '#ffffff',
    background_color: '#1a1a1a',
    border_color: '#2a2a2a',
    accent_color: '#3b82f6',
    question_color: '#ffffff'
  },
  sort_index: 8,
  visible: true,
  meta: {}
};
```

### 10. CITATION_LIST ✅ Completo
**Configurações Inline Implementadas**:
- Suporte a múltiplos estilos de citação (APA, MLA, Chicago, Vancouver, ABNT, Harvard)
- Sistema completo de gerenciamento de referências bibliográficas
- Tipos de citação (artigo, livro, capítulo, conferência, tese, website)
- Ordenação configurável (alfabética, por ano, por tipo)
- Campos específicos por tipo de referência
- Exibição de DOI, URL e PMID
- Suporte a resumo e palavras-chave
- Preview em tempo real no estilo selecionado

**Exemplo de Uso**:
```typescript
const citationListBlock: ReviewBlock = {
  id: 10,
  type: 'citation_list',
  content: {
    title: 'Referências Bibliográficas',
    description: 'Principais artigos utilizados nesta revisão',
    citations: [
      {
        id: 'citation-1',
        type: 'article',
        authors: 'Smith, J., & Johnson, M.',
        title: 'Efficacy and safety of new treatments for diabetes',
        journal: 'Journal of Metabolic Disorders',
        year: '2024',
        volume: '42',
        issue: '3',
        pages: '256-268',
        doi: '10.1234/jmd.2024.42.3.256',
        pmid: '37654321',
        abstract: 'Este estudo avaliou a eficácia de novos tratamentos...',
        keywords: ['diabetes', 'tratamento', 'ensaio clínico'],
        color: '#3b82f6'
      },
      {
        id: 'citation-2',
        type: 'book',
        authors: 'Brown, A.',
        title: 'Manual de diabetes mellitus',
        publisher: 'Medical Press',
        location: 'São Paulo',
        year: '2023',
        isbn: '978-1-2345-6789-0',
        edition: '3',
        color: '#8b5cf6'
      }
    ],
    citation_style: 'apa',
    numbered: true,
    show_abstract: true,
    show_keywords: true,
    show_doi: true,
    show_url: true,
    sort_by: 'year',
    group_by_type: false,
    title_color: '#ffffff',
    text_color: '#d1d5db',
    background_color: '#1a1a1a',
    border_color: '#2a2a2a',
    accent_color: '#8b5cf6',
    link_color: '#3b82f6'
  },
  sort_index: 9,
  visible: true,
  meta: {}
};
```

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
    type: 'number_card',
    content: { 
      number: '126',
      unit: 'mg/dL',
      label: 'Antes da Intervenção',
      number_format: 'integer'
    },
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
    type: 'number_card',
    content: { 
      number: '98',
      unit: 'mg/dL',
      label: 'Após a Intervenção',
      number_format: 'integer',
      trend: 'down',
      percentage: 22
    },
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

### 5. Citações e Referências Automáticas

**Geração Automática de Citações**:
```typescript
const generateCitationFromDoi = async (doi: string) => {
  try {
    // Chamar API de citação com DOI
    const response = await fetch(`https://api.crossref.org/works/${doi}`);
    const data = await response.json();
    const work = data.message;
    
    // Extrair informações bibliográficas
    const authors = work.author
      .map((author) => `${author.family}, ${author.given.charAt(0)}`)
      .join(', ');
      
    const citation: Citation = {
      id: `citation-${Date.now()}`,
      type: 'article',
      authors,
      title: work.title[0],
      journal: work['container-title'][0],
      year: work.published['date-parts'][0][0].toString(),
      volume: work.volume,
      issue: work.issue,
      pages: work.page,
      doi: doi,
      url: work.URL,
      color: '#3b82f6'
    };
    
    return citation;
  } catch (error) {
    console.error('Failed to generate citation:', error);
    return null;
  }
};
```

### 6. Templates de Review Completos

**Estrutura de Review Clínica**:
```typescript
const clinicalReviewTemplate = [
  // Cabeçalho da revisão
  {
    type: 'heading',
    content: { text: 'Título da Revisão Clínica', level: 1 }
  },
  
  // Snapshot card
  {
    type: 'snapshot_card',
    content: { /* dados PICOD */ }
  },
  
  // Introdução
  {
    type: 'heading',
    content: { text: 'Introdução', level: 2, anchor: 'introducao' }
  },
  {
    type: 'paragraph',
    content: { text: 'Contexto da revisão...' }
  },
  
  // Métodos
  {
    type: 'heading',
    content: { text: 'Métodos', level: 2, anchor: 'metodos' }
  },
  {
    type: 'callout',
    content: {
      type: 'info',
      title: 'Sobre os métodos',
      content: 'Detalhes sobre a busca e seleção de estudos...'
    }
  },
  
  // Resultados principais
  {
    type: 'heading',
    content: { text: 'Resultados', level: 2, anchor: 'resultados' }
  },
  
  // Grid de números-chave
  [
    {
      type: 'number_card',
      content: { number: '42', label: 'Estudos incluídos' }
    },
    {
      type: 'number_card',
      content: { number: '1254', label: 'Pacientes' }
    }
  ],
  
  // Tabela de resultados
  {
    type: 'table',
    content: { /* tabela de dados */ }
  },
  
  // Opinião de especialista
  {
    type: 'reviewer_quote',
    content: { /* citação */ }
  },
  
  // Enquete
  {
    type: 'poll',
    content: { /* enquete */ }
  },
  
  // Referências
  {
    type: 'citation_list',
    content: { /* citações */ }
  }
];
```

### 7. Operações de Layout

**Transformação de Single → Grid**:
```typescript
// Função para criar grid a partir de dois blocos
const createGridFromBlocks = (block1: ReviewBlock, block2: ReviewBlock) => {
  const rowId = `row_${Date.now()}`;
  
  // Atualizar metadados do primeiro bloco
  block1.meta = block1.meta || {};
  block1.meta.layout = {
    row_id: rowId,
    position: 0,
    columns: 2,
    gap: 4,
    columnWidths: [50, 50]
  };
  
  // Atualizar metadados do segundo bloco
  block2.meta = block2.meta || {};
  block2.meta.layout = {
    row_id: rowId,
    position: 1,
    columns: 2,
    gap: 4,
    columnWidths: [50, 50]
  };
  
  return [block1, block2];
};

// Mesclar blocos em grid
const mergeBlocksIntoGrid = (blocks: ReviewBlock[], targetRowId: string) => {
  // Encontrar blocos da linha alvo
  const rowBlocks = blocks.filter(b => b.meta?.layout?.row_id === targetRowId);
  
  // Determinar número de colunas
  const columns = rowBlocks.length + 1;
  
  // Recalcular larguras de colunas
  const columnWidth = Math.floor(100 / columns);
  const columnWidths = Array(columns).fill(columnWidth);
  
  // Ajustar última coluna para 100% total
  columnWidths[columns - 1] = 100 - columnWidth * (columns - 1);
  
  // Atualizar todos os blocos da linha
  return blocks.map(block => {
    if (block.meta?.layout?.row_id === targetRowId) {
      block.meta.layout.columns = columns;
      block.meta.layout.columnWidths = columnWidths;
    }
    return block;
  });
};
```

### 8. Utilidades de Formatação

**Saída Formatada para Grid de Números**:
```typescript
// Função para formatar números baseada no tipo
const formatNumber = (value: string | number, format: string, precision: number = 1) => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(num)) return value;
  
  switch (format) {
    case 'percentage':
      return `${num.toFixed(precision)}%`;
    case 'currency':
      return new Intl.NumberFormat('pt-BR', { 
        style: 'currency', 
        currency: 'BRL',
        minimumFractionDigits: precision
      }).format(num);
    case 'decimal':
      return num.toFixed(precision);
    case 'scientific':
      return num.toExponential(precision);
    default:
      return num.toLocaleString('pt-BR');
  }
};
```

### 9. Workflow de Importação de Texto

**Conversão de Texto Estruturado**:
```typescript
// Converter texto estruturado para blocos
const convertStructuredTextToBlocks = (text: string): ReviewBlock[] => {
  const blocks: ReviewBlock[] = [];
  const lines = text.split('\n').filter(line => line.trim());
  
  let currentIndex = 0;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Detectar cabeçalhos
    if (line.startsWith('# ')) {
      blocks.push({
        id: Date.now() + currentIndex++,
        type: 'heading',
        content: {
          text: line.replace('# ', ''),
          level: 1
        },
        sort_index: currentIndex,
        visible: true,
        meta: {}
      });
    } 
    else if (line.startsWith('## ')) {
      blocks.push({
        id: Date.now() + currentIndex++,
        type: 'heading',
        content: {
          text: line.replace('## ', ''),
          level: 2
        },
        sort_index: currentIndex,
        visible: true,
        meta: {}
      });
    }
    // Detectar tabelas
    else if (line.includes('|') && lines[i+1]?.includes('|-')) {
      const headers = line.split('|').map(h => h.trim()).filter(Boolean);
      let rows = [];
      let j = i + 2;
      
      while (j < lines.length && lines[j].includes('|')) {
        const row = lines[j].split('|').map(c => c.trim()).filter(Boolean);
        rows.push(row);
        j++;
      }
      
      blocks.push({
        id: Date.now() + currentIndex++,
        type: 'table',
        content: {
          table_data: {
            headers,
            rows,
            sortable: true,
            bordered: true
          }
        },
        sort_index: currentIndex,
        visible: true,
        meta: {}
      });
      
      i = j - 1; // Avançar para a linha após a tabela
    }
    // Detectar citações
    else if (line.startsWith('>')) {
      blocks.push({
        id: Date.now() + currentIndex++,
        type: 'callout',
        content: {
          type: 'info',
          content: line.replace('>', '').trim()
        },
        sort_index: currentIndex,
        visible: true,
        meta: {}
      });
    }
    // Parágrafo padrão
    else {
      blocks.push({
        id: Date.now() + currentIndex++,
        type: 'paragraph',
        content: {
          text: line
        },
        sort_index: currentIndex,
        visible: true,
        meta: {}
      });
    }
  }
  
  return blocks;
};
```

### 10. Plugin de Sugerir Estrutura

**Geração de Estruturas Baseadas em Resumos**:
```typescript
const suggestStructureFromAbstract = (abstract: string) => {
  // Analisar o resumo para identificar elementos PICOD
  const population = extractPopulation(abstract);
  const intervention = extractIntervention(abstract);
  const comparison = extractComparison(abstract);
  const outcomes = extractOutcomes(abstract);
  const design = extractDesign(abstract);
  
  // Gerar snapshot card base
  const snapshotCard = {
    type: 'snapshot_card',
    content: {
      population,
      intervention,
      comparison,
      outcome: outcomes.primary,
      design,
      finding_sections: [
        {
          id: 'primary_outcomes',
          label: 'Desfechos Primários',
          items: outcomes.primaryItems.map((text, index) => ({
            id: `primary_${index}`,
            text,
            color: '#10b981'
          }))
        }
      ]
    }
  };
  
  // Identificar seções principais
  const sections = [
    { title: 'Introdução', emoji: '📋' },
    { title: 'Métodos', emoji: '🔬' },
    { title: 'Resultados', emoji: '📊' },
    { title: 'Discussão', emoji: '💭' },
    { title: 'Conclusão', emoji: '📝' }
  ];
  
  // Gerar estrutura básica
  const suggestedStructure = [
    { type: 'heading', content: { text: 'Título da Revisão', level: 1 } },
    snapshotCard,
    ...sections.map(section => ({
      type: 'heading',
      content: { 
        text: `${section.emoji} ${section.title}`,
        level: 2,
        anchor: section.title.toLowerCase()
      }
    }))
  ];
  
  return suggestedStructure;
};
```

---

## REVISÃO COLABORATIVA — COMENTÁRIOS & SUGESTÕES

O sistema de revisão colaborativa permite que vários revisores trabalhem em um único documento, adicionando comentários, sugestões e notas. Cada bloco pode receber comentários específicos.

### Sistema de Comentários por Bloco

```typescript
interface BlockComment {
  id: string;
  block_id: number;
  user_id: string;
  user_name: string;
  user_avatar: string;
  created_at: string;
  content: string;
  status: 'open' | 'resolved' | 'pending';
  replies?: BlockComment[];
}
```

### Fluxo de Trabalho

1. **Revisores adicionam comentários** a blocos específicos
2. **Autor principal responde** ou marca como resolvidos
3. **Editor-chefe** revisa todos os comentários
4. **Publicação final** após resolução dos comentários

---

## IMPORTAÇÃO DE ARTIGOS EXTERNOS

### Fluxos de Importação Suportados

1. **DOI ou URL**: Importação de metadados via API do CrossRef ou PubMed
2. **PDF**: Extração e análise de conteúdo para criação de blocos
3. **PMID**: Busca direta na base PubMed

### Exemplo de Fluxo

```typescript
const importFromPubMed = async (pmid: string) => {
  try {
    const response = await fetch(`https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=${pmid}&retmode=json`);
    const data = await response.json();
    const article = data.result[pmid];
    
    // Criar blocos básicos
    const blocks = [
      {
        type: 'heading',
        content: {
          text: article.title,
          level: 1
        }
      },
      {
        type: 'snapshot_card',
        content: {
          title: article.title,
          design: article.pubtype.join(', '),
          custom_badges: [{
            id: 'source',
            label: 'Fonte',
            value: 'PubMed',
            color: '#3b82f6',
            background_color: 'transparent'
          }]
        }
      },
      {
        type: 'paragraph',
        content: {
          text: article.abstract || 'Resumo não disponível'
        }
      },
      {
        type: 'citation_list',
        content: {
          citations: [{
            id: `citation-${pmid}`,
            type: 'article',
            authors: article.authors.map(a => `${a.name}`).join(', '),
            title: article.title,
            journal: article.fulljournalname,
            year: article.pubdate.split(' ')[0],
            volume: article.volume,
            issue: article.issue,
            pages: article.pages,
            pmid: pmid
          }]
        }
      }
    ];
    
    return blocks;
  } catch (error) {
    console.error('Failed to import from PubMed:', error);
    return null;
  }
};
```

---

## PERSONALIZAÇÃO AVANÇADA

### Temas Customizáveis

O editor permite a criação de temas personalizados com presets de cores e estilos.

```typescript
interface EditorTheme {
  id: string;
  name: string;
  colors: {
    background: string;
    text: string;
    primary: string;
    secondary: string;
    accent: string;
    success: string;
    warning: string;
    error: string;
    info: string;
    border: string;
    muted: string;
  };
  typography: {
    headingFont: string;
    bodyFont: string;
    codeFont: string;
    baseFontSize: string;
  };
  spacing: {
    blockGap: string;
    contentPadding: string;
  };
}

// Exemplo de tema
const darkScientific: EditorTheme = {
  id: 'dark-scientific',
  name: 'Dark Scientific',
  colors: {
    background: '#121212',
    text: '#ffffff',
    primary: '#3b82f6',
    secondary: '#8b5cf6',
    accent: '#10b981',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#0ea5e9',
    border: '#2a2a2a',
    muted: '#6b7280'
  },
  typography: {
    headingFont: 'Inter, sans-serif',
    bodyFont: 'Inter, sans-serif',
    codeFont: 'Fira Code, monospace',
    baseFontSize: '16px'
  },
  spacing: {
    blockGap: '1.5rem',
    contentPadding: '2rem'
  }
};
```

### Comandos Rápidos

O editor suporta comandos de teclado e menu de comandos para operações rápidas.

```typescript
const editorCommands = [
  {
    id: 'add-heading',
    title: 'Adicionar Cabeçalho',
    shortcut: 'Ctrl+Alt+1',
    action: () => addBlock('heading')
  },
  {
    id: 'add-table',
    title: 'Adicionar Tabela',
    shortcut: 'Ctrl+Alt+T',
    action: () => addBlock('table')
  },
  {
    id: 'grid-layout',
    title: 'Layout em Grid',
    shortcut: 'Ctrl+Alt+G',
    action: () => convertToGrid()
  }
];
```

---

## INTEGRAÇÃO COM INTELIGÊNCIA ARTIFICIAL

O editor nativo integra-se com modelos de IA para assistência à escrita e análise:

### 1. Assistente de Redação Científica

- Sugestões de melhorias textuais
- Correção de estilo e clareza
- Preenchimento automático de blocos

### 2. Análise Inteligente de Estudos

- Extração automática de dados PICOD
- Sugestão de badges de evidência
- Identificação de possíveis vieses

### 3. Geração de Resumos e Destaques

- Criação de bullet points destacando achados principais
- Tradução automática de conteúdo
- Resumos adaptados para diferentes públicos

### 4. Assistente de Referências

- Detecção e formatação automática de citações
- Verificação de consistência entre citações
- Sugestão de leituras complementares

---

## CONSIDERAÇÕES FINAIS

O Editor Nativo está pronto para uso com todos os tipos de blocos implementados e completamente funcionais. A documentação acima serve como referência técnica e guia de implementação, assegurando que todas as equipes possam aproveitar ao máximo suas capacidades.

Principais atualizações na versão 4.1.0:
- Implementação completa de todos os tipos de blocos previstos
- Sistema abrangente de edição inline para todos os componentes
- Integração total com o sistema de grid responsivo
- Documentação detalhada de uso e integração com IA
