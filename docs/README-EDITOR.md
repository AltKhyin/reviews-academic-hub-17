
# EDITOR NATIVO — MANUAL TÉCNICO COMPLETO
**Versão 1.0.0** • 2025-01-15

## PROPÓSITO & FILOSOFIA

O Editor Nativo é um sistema de criação de conteúdo baseado em blocos, desenvolvido especificamente para revisões científicas médicas. Substitui o modelo tradicional de PDF por uma experiência interativa, editável e semanticamente estruturada.

### Princípios Fundamentais
- **Atomicidade**: Cada bloco é uma unidade independente e completa
- **Composabilidade**: Blocos se combinam para formar narrativas complexas
- **Editabilidade Inline**: Modificação direta sem modais ou interfaces secundárias
- **Preservação Semântica**: Manutenção do significado científico durante conversões
- **Acessibilidade**: Suporte completo a tecnologias assistivas

---

## ARQUITETURA DE BLOCOS

### Hierarquia de Tipos
```
ReviewBlock
├── ContentBlocks (conteúdo textual)
│   ├── heading (1-6 níveis)
│   ├── paragraph (texto formatado)
│   └── callout (destaque contextual)
├── MediaBlocks (conteúdo visual)
│   ├── figure (imagens com legendas)
│   └── table (dados tabulares)
├── InteractiveBlocks (elementos dinâmicos)
│   ├── poll (enquetes/votações)
│   ├── number_card (métricas destacadas)
│   └── reviewer_quote (citações de especialistas)
└── StructuralBlocks (organização científica)
    ├── snapshot_card (resumo PICOD)
    └── citation_list (referências bibliográficas)
```

### Estrutura Universal de Bloco
```typescript
interface ReviewBlock {
  id: number;                    // Identificador único
  issue_id: string;              // Referência ao artigo
  type: BlockType;               // Tipo do bloco
  sort_index: number;            // Posição na sequência
  visible: boolean;              // Visibilidade no preview
  payload: Record<string, any>;  // Dados específicos do tipo
  meta: Record<string, any>;     // Metadados opcionais
  created_at: string;            // Timestamp de criação
  updated_at: string;            // Timestamp de modificação
}
```

---

## SISTEMA DE CORES INTEGRADO

### Hierarquia de Cores
Cada bloco suporta um sistema de cores padronizado:

1. **text_color**: Cor principal do texto (`#ffffff` padrão)
2. **background_color**: Cor de fundo (`transparent` padrão)  
3. **border_color**: Cor da borda (`transparent` padrão)
4. **accent_color**: Cor de destaque (específico por tipo)

### Aplicação Consistente
```css
/* Padrão aplicado em todos os blocos */
.block-container {
  color: var(--text-color);
  background-color: var(--background-color);
  border-color: var(--border-color);
  direction: ltr;
  text-align: left;
  unicode-bidi: normal;
}
```

---

## TIPOS DE BLOCO DETALHADOS

### 1. HEADING (Cabeçalhos)
**Propósito**: Estruturação hierárquica do conteúdo

**Payload Obrigatório**:
```json
{
  "text": "Título do Cabeçalho",
  "level": 1-6,
  "anchor": "id-para-navegacao"
}
```

**Campos Editáveis**:
- `text`: Inline text editor
- `level`: Seletor H1-H6
- `anchor`: Auto-gerado, editável manualmente
- Cores: texto, fundo, borda

**Regras de Conversão**:
- Markdown: `# Título` → `level: 1`
- HTML: `<h2>` → `level: 2`
- Âncoras automáticas: "Metodologia Aplicada" → `metodologia-aplicada`

### 2. PARAGRAPH (Parágrafos)
**Propósito**: Conteúdo textual principal com formatação rica

**Payload Obrigatório**:
```json
{
  "content": "<p>Texto com <strong>formatação</strong></p>",
  "alignment": "left|center|right|justify",
  "emphasis": "normal|lead|small|caption"
}
```

**Campos Editáveis**:
- `content`: Rich text editor inline
- `alignment`: Botões de alinhamento
- `emphasis`: Seletor de estilo
- Cores: texto, fundo, borda

**Formatação Suportada**:
- **Bold**: `<strong>` ou `<b>`
- *Italic*: `<em>` ou `<i>`  
- <u>Underline</u>: `<u>`
- Links: `<a href="">`

### 3. FIGURE (Imagens)
**Propósito**: Conteúdo visual com metadados completos

**Payload Obrigatório**:
```json
{
  "src": "https://exemplo.com/imagem.jpg",
  "alt": "Descrição da imagem",
  "caption": "Legenda descritiva",
  "width": "auto|100%|500px",
  "alignment": "left|center|right"
}
```

**Validações**:
- `src`: URL válida ou base64
- `alt`: Obrigatório para acessibilidade
- `width`: CSS válido ou 'auto'

### 4. TABLE (Tabelas)
**Propósito**: Dados estruturados com funcionalidades avançadas

**Payload Obrigatório**:
```json
{
  "title": "Título da Tabela",
  "headers": ["Coluna 1", "Coluna 2", "Coluna 3"],
  "rows": [
    ["Dado 1", "Dado 2", "Dado 3"],
    ["Linha 2", "Dados", "Mais dados"]
  ],
  "caption": "Descrição da tabela",
  "sortable": true,
  "searchable": false,
  "compact": false
}
```

**Funcionalidades**:
- Ordenação por coluna (`sortable: true`)
- Busca integrada (`searchable: true`)
- Modo compacto (`compact: true`)

### 5. CALLOUT (Destaques)
**Propósito**: Informações contextuais importantes

**Payload Obrigatório**:
```json
{
  "type": "info|warning|success|error|note|tip",
  "title": "Título do Destaque",
  "content": "Conteúdo do destaque"
}
```

**Tipos Visuais**:
- `info`: Azul (`#3b82f6`)
- `warning`: Amarelo (`#f59e0b`)  
- `success`: Verde (`#10b981`)
- `error`: Vermelho (`#ef4444`)
- `note`: Cinza (`#6b7280`)
- `tip`: Roxo (`#8b5cf6`)

### 6. SNAPSHOT_CARD (Cartão de Evidência)
**Propósito**: Resumo PICOD estruturado para medicina baseada em evidências

**Payload Obrigatório**:
```json
{
  "population": "Descrição da população",
  "intervention": "Intervenção aplicada", 
  "comparison": "Grupo controle/comparação",
  "outcome": "Desfechos medidos",
  "design": "Desenho do estudo",
  "key_findings": ["Achado 1", "Achado 2"],
  "evidence_level": "high|moderate|low|very_low",
  "recommendation_strength": "strong|conditional|against"
}
```

**Framework PICOD**:
- **P**opulation: Características demográficas
- **I**ntervention: Tratamento/exposição
- **C**omparison: Grupo controle
- **O**utcome: Desfechos primários/secundários  
- **D**esign: Metodologia do estudo

### 7. NUMBER_CARD (Cartão de Métrica)
**Propósito**: Destaque visual de números importantes

**Payload Obrigatório**:
```json
{
  "number": "85.4",
  "label": "Eficácia (%)",
  "description": "Taxa de sucesso do tratamento",
  "trend": "neutral|up|down",
  "percentage": 12.5
}
```

### 8. REVIEWER_QUOTE (Citação de Especialista)
**Propósito**: Opiniões e comentários de revisores

**Payload Obrigatório**:
```json
{
  "quote": "Texto da citação",
  "author": "Dr. Nome Sobrenome",
  "title": "Título/Especialidade",
  "institution": "Instituição de origem",
  "avatar_url": "https://exemplo.com/foto.jpg"
}
```

### 9. POLL (Enquete)
**Propósito**: Coleta de opinião da comunidade

**Payload Obrigatório**:
```json
{
  "question": "Qual sua opinião sobre...?",
  "options": ["Opção 1", "Opção 2", "Opção 3"],
  "poll_type": "single_choice|multiple_choice|rating",
  "votes": [23, 45, 12],
  "total_votes": 80,
  "allow_add_options": false,
  "show_results": true
}
```

### 10. CITATION_LIST (Lista de Citações)
**Propósito**: Referências bibliográficas padronizadas

**Payload Obrigatório**:
```json
{
  "citations": [
    {
      "id": "ref1",
      "title": "Título do Artigo",
      "authors": ["Autor 1", "Autor 2"],
      "journal": "Nome da Revista",
      "year": "2023",
      "doi": "10.1000/182",
      "pmid": "12345678"
    }
  ],
  "citation_style": "apa|mla|chicago|vancouver",
  "numbered": true
}
```

---

## SISTEMA DE IMPORT/EXPORT

### Formatos Suportados

#### 1. IMPORT
- **Markdown (.md)**: Conversão automática para blocos
- **Plain Text (.txt)**: Análise inteligente de estrutura
- **JSON (.json)**: Importação direta de blocos
- **HTML**: Extração semântica de elementos

#### 2. EXPORT  
- **Markdown**: Compatível com GitHub/GitLab
- **Plain Text**: Versão limpa para revisão
- **JSON**: Backup completo com metadados
- **HTML**: Para publicação web

### Regras de Conversão Markdown → Blocos

```markdown
# Título Principal        → heading (level: 1)
## Seção                  → heading (level: 2)  
### Subseção             → heading (level: 3)

Parágrafo normal         → paragraph (emphasis: normal)
**Texto em negrito**     → paragraph (com <strong>)
*Texto em itálico*       → paragraph (com <em>)

![Alt text](url)         → figure (src: url, alt: Alt text)

| Coluna 1 | Coluna 2 |   → table (headers + rows)
|----------|----------|
| Dado 1   | Dado 2   |

> Citação ou destaque    → callout (type: note)

1. Lista numerada        → paragraph (com <ol><li>)
- Lista com bullets      → paragraph (com <ul><li>)

---                      → separator (visual)

[Link](url)              → paragraph (com <a>)
```

### Regras de Conversão Plain Text → Blocos

**Detecção Automática**:
- Linhas em MAIÚSCULAS → `heading`
- Parágrafos separados por linha em branco → `paragraph` 
- Números seguidos de ponto → `table` ou lista
- URLs detectadas → `figure` (se imagem) ou `paragraph` (se link)
- Texto entre aspas → `reviewer_quote`
- ATENÇÃO/IMPORTANTE/NOTA → `callout`

### API de Conversão

```typescript
// Importação
interface ImportRequest {
  content: string;
  format: 'markdown' | 'plaintext' | 'json' | 'html';
  options?: {
    autoDetectStructure?: boolean;
    preserveFormatting?: boolean;
    generateAnchors?: boolean;
  };
}

interface ImportResponse {
  blocks: ReviewBlock[];
  warnings: string[];
  metadata: {
    originalLength: number;
    blocksCreated: number;
    conversionTime: number;
  };
}

// Exportação  
interface ExportRequest {
  blocks: ReviewBlock[];
  format: 'markdown' | 'plaintext' | 'json' | 'html';
  options?: {
    includeMetadata?: boolean;
    preserveColors?: boolean;
    generateTOC?: boolean;
  };
}
```

---

## INTEGRAÇÃO COM IA EXTERNA

### Preparação de Conteúdo para IA

**Formato Ideal para Envio**:
```
EDITOR_CONTEXT:
- Total de blocos: N
- Tipos utilizados: [heading, paragraph, figure, ...]
- Estrutura: Seção 1 > Subseção A > Conteúdo...

CONTENT_STRUCTURE:
[BLOCK:heading:1] Título Principal
[BLOCK:paragraph] Parágrafo introdutório...
[BLOCK:figure] Descrição da imagem: Figura mostrando...
[BLOCK:snapshot_card] PICOD: População X, Intervenção Y...

FORMATTING_RULES:
- Headings com âncoras: titulo-principal
- Cores preservadas: text:#ffffff, bg:#1a1a1a
- Alinhamento: left/center/right/justify
- Ênfase: normal/lead/small/caption
```

### Instruções para IA Externa

**Para Conversão MD → Blocos**:
1. Detectar hierarquia de títulos (`#` = level)
2. Preservar formatação inline (`**bold**`, `*italic*`)
3. Converter tabelas para formato `table` 
4. Identificar imagens e criar `figure` blocks
5. Detectar citações e criar `callout` ou `reviewer_quote`
6. Manter estrutura semântica científica

**Para Melhoramento de Conteúdo**:
1. Sugerir divisão em blocos apropriados
2. Identificar oportunidades para `snapshot_card`
3. Propor `number_card` para estatísticas
4. Recomendar `callout` para informações importantes
5. Validar estrutura PICOD em contextos médicos

---

## SISTEMA DE VALIDAÇÃO

### Validações por Tipo de Bloco

**Heading**:
- `text`: não pode estar vazio
- `level`: deve ser 1-6
- `anchor`: deve ser URL-safe (a-z, 0-9, -)

**Paragraph**:
- `content`: HTML válido apenas com tags permitidas
- `alignment`: deve ser valor enum válido

**Figure**:
- `src`: URL válida ou base64 válido
- `alt`: obrigatório para acessibilidade
- `width`: CSS válido

**Table**:
- `headers`: array não vazio
- `rows`: cada row deve ter mesmo número de colunas que headers

**Snapshot_card**:
- Todos os campos PICOD devem estar preenchidos
- `evidence_level` e `recommendation_strength` devem ser enum válidos

### Validações Universais

```typescript
interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

interface ValidationError {
  blockId: number;
  field: string;
  message: string;
  severity: 'error' | 'warning';
}

// Exemplo de uso
const validateBlock = (block: ReviewBlock): ValidationResult => {
  const errors: ValidationError[] = [];
  
  // Validação universal
  if (!block.visible && block.sort_index === 0) {
    errors.push({
      blockId: block.id,
      field: 'visible',
      message: 'Primeiro bloco não pode estar oculto',
      severity: 'warning'
    });
  }
  
  // Validação específica por tipo
  switch (block.type) {
    case 'heading':
      if (!block.payload.text?.trim()) {
        errors.push({
          blockId: block.id,
          field: 'text',
          message: 'Texto do cabeçalho é obrigatório',
          severity: 'error'
        });
      }
      break;
    // ... outros tipos
  }
  
  return {
    isValid: errors.filter(e => e.severity === 'error').length === 0,
    errors,
    warnings: errors.filter(e => e.severity === 'warning')
  };
};
```

---

## PERFORMANCE E OTIMIZAÇÃO

### Estratégias de Rendering

**Virtualização**: Blocos fora da viewport não são renderizados
**Memoização**: Componentes de bloco são React.memo
**Lazy Loading**: Imagens carregam apenas quando visíveis
**Debounce**: Salvamento automático após 2s de inatividade

### Limits Recomendados

- **Máximo de blocos por revisão**: 500
- **Máximo de caracteres por paragraph**: 10.000
- **Máximo de linhas por table**: 1.000
- **Tamanho máximo de imagem**: 5MB
- **Timeout de auto-save**: 2 segundos

---

## TROUBLESHOOTING COMUM

### Problemas de Texto/Direção

**Sintoma**: Texto aparece invertido ou cursor incorreto
**Causa**: Falta de `dir="ltr"` ou CSS `direction`
**Solução**: Adicionar atributos de direção em todos os elementos editáveis

### Problemas de Drag & Drop

**Sintoma**: Blocos não se movem ou aparecem tilted
**Causa**: Estado de dragging não atualizado corretamente  
**Solução**: Verificar `isDragging` state e aplicar `opacity: 0.5`

### Problemas de Performance

**Sintoma**: Editor lento com muitos blocos
**Causa**: Re-render desnecessário de componentes
**Solução**: Implementar React.memo e useCallback adequadamente

### Problemas de Importação

**Sintoma**: Blocos criados incorretamente
**Causa**: Parsing inadequado do formato fonte
**Solução**: Validar formato antes da conversão, usar fallbacks

---

## VERSIONAMENTO E CHANGELOG

### v1.0.0 (2025-01-15)
- ✅ Sistema básico de blocos implementado
- ✅ Editores inline funcionais  
- ✅ Sistema de cores integrado
- ✅ Drag & drop melhorado
- ✅ Fundação de import/export
- 🔄 Documentação completa criada

### Próximas Versões
- **v1.1.0**: Templates e auto-save
- **v1.2.0**: Colaboração em tempo real
- **v1.3.0**: IA integrada para sugestões
- **v2.0.0**: Editor de equações matemáticas

---

## ARQUIVO DE CONFIGURAÇÃO

```json
{
  "editor": {
    "version": "1.0.0",
    "autoSave": {
      "enabled": true,
      "interval": 2000,
      "maxVersions": 10
    },
    "validation": {
      "strictMode": true,
      "allowEmptyBlocks": false,
      "maxBlocksPerIssue": 500
    },
    "ui": {
      "theme": "dark",
      "showLineNumbers": false,
      "enableDragDrop": true,
      "compactMode": false
    },
    "import": {
      "supportedFormats": ["md", "txt", "json", "html"],
      "autoDetectStructure": true,
      "preserveFormatting": true
    },
    "export": {
      "defaultFormat": "markdown",
      "includeMetadata": true,
      "generateTOC": true
    }
  }
}
```

---

**📋 CHECKLIST DE IMPLEMENTAÇÃO PARA IA EXTERNA**

Ao trabalhar com este editor, verifique:

- [ ] Tipos de bloco estão corretos conforme enum `BlockType`
- [ ] Payload contém todos os campos obrigatórios  
- [ ] Cores seguem o padrão hex (#ffffff) ou 'transparent'
- [ ] HTML em `paragraph.content` usa apenas tags permitidas
- [ ] Âncoras em `heading` são URL-safe
- [ ] Validações são executadas antes de salvar
- [ ] `sort_index` é sequencial e único
- [ ] Importação preserva semântica científica
- [ ] Exportação mantém estrutura hierárquica
- [ ] Performance é considerada para muitos blocos

**🔄 ESTE DOCUMENTO É MANTIDO AUTOMATICAMENTE**
Qualquer mudança no código do editor deve refletir aqui.
Versão atual: 1.0.0 | Última atualização: 2025-01-15
