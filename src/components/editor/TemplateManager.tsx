
// ABOUTME: Template management system for native editor with predefined block collections
// Enables rapid content creation using proven review structures and patterns

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  FileTemplate, 
  Plus, 
  Eye,
  Sparkles,
  BookOpen,
  FlaskConical,
  TrendingUp
} from 'lucide-react';
import { ReviewBlock, BlockType } from '@/types/review';
import { getDefaultPayload } from '@/utils/blockDefaults';

interface Template {
  id: string;
  name: string;
  description: string;
  category: 'systematic' | 'narrative' | 'meta_analysis' | 'case_study';
  blocks: Partial<ReviewBlock>[];
  icon: React.ElementType;
  tags: string[];
}

interface TemplateManagerProps {
  onApplyTemplate: (blocks: ReviewBlock[]) => void;
  className?: string;
}

const REVIEW_TEMPLATES: Template[] = [
  {
    id: 'systematic_standard',
    name: 'Revisão Sistemática Padrão',
    description: 'Estrutura completa para revisão sistemática com PRISMA',
    category: 'systematic',
    icon: BookOpen,
    tags: ['PRISMA', 'Evidência', 'Metodologia'],
    blocks: [
      {
        type: 'heading',
        payload: { text: 'Revisão Sistemática', level: 1 }
      },
      {
        type: 'paragraph',
        payload: { text: 'Introdução e contextualização do tema...' }
      },
      {
        type: 'heading',
        payload: { text: 'Metodologia', level: 2 }
      },
      {
        type: 'snapshot_card',
        payload: {
          population: 'Definir população do estudo',
          intervention: 'Definir intervenção',
          comparison: 'Definir comparação',
          outcome: 'Definir desfechos',
          design: 'Revisão sistemática',
          evidence_level: 'high',
          recommendation_strength: 'strong',
          key_findings: []
        }
      },
      {
        type: 'heading',
        payload: { text: 'Resultados', level: 2 }
      },
      {
        type: 'table',
        payload: {
          headers: ['Estudo', 'População', 'Intervenção', 'Resultado'],
          rows: [
            ['Exemplo 1', 'N=100', 'Tratamento A', 'Melhora significativa'],
            ['Exemplo 2', 'N=150', 'Tratamento B', 'Sem diferença']
          ]
        }
      },
      {
        type: 'heading',
        payload: { text: 'Conclusão', level: 2 }
      },
      {
        type: 'callout',
        payload: { 
          text: 'Resumo das principais conclusões e recomendações',
          type: 'info'
        }
      }
    ]
  },
  {
    id: 'meta_analysis',
    name: 'Meta-análise',
    description: 'Template para meta-análise com análise estatística',
    category: 'meta_analysis',
    icon: TrendingUp,
    tags: ['Estatística', 'Forest Plot', 'Heterogeneidade'],
    blocks: [
      {
        type: 'heading',
        payload: { text: 'Meta-análise', level: 1 }
      },
      {
        type: 'paragraph',
        payload: { text: 'Objetivo da meta-análise...' }
      },
      {
        type: 'number_card',
        payload: {
          title: 'Estudos Incluídos',
          number: '12',
          subtitle: 'Após seleção criteriosa'
        }
      },
      {
        type: 'number_card',
        payload: {
          title: 'Participantes Total',
          number: '2.847',
          subtitle: 'Amostra combinada'
        }
      },
      {
        type: 'heading',
        payload: { text: 'Análise Estatística', level: 2 }
      },
      {
        type: 'figure',
        payload: {
          src: '',
          caption: 'Forest plot dos estudos incluídos',
          alt: 'Forest plot'
        }
      },
      {
        type: 'callout',
        payload: {
          text: 'I² = 25% (baixa heterogeneidade entre estudos)',
          type: 'success'
        }
      }
    ]
  },
  {
    id: 'narrative_review',
    name: 'Revisão Narrativa',
    description: 'Estrutura flexível para revisão narrativa',
    category: 'narrative',
    icon: FileTemplate,
    tags: ['Narrativa', 'Discussão', 'Perspectiva'],
    blocks: [
      {
        type: 'heading',
        payload: { text: 'Revisão Narrativa', level: 1 }
      },
      {
        type: 'paragraph',
        payload: { text: 'Introdução ao tema e objetivos da revisão...' }
      },
      {
        type: 'heading',
        payload: { text: 'Desenvolvimento', level: 2 }
      },
      {
        type: 'paragraph',
        payload: { text: 'Discussão dos principais aspectos...' }
      },
      {
        type: 'reviewer_quote',
        payload: {
          quote: 'Destaque para um ponto importante da literatura',
          author: 'Autor Principal',
          source: 'Fonte da citação'
        }
      },
      {
        type: 'heading',
        payload: { text: 'Considerações Finais', level: 2 }
      },
      {
        type: 'paragraph',
        payload: { text: 'Síntese e perspectivas futuras...' }
      }
    ]
  },
  {
    id: 'clinical_case',
    name: 'Caso Clínico',
    description: 'Template para apresentação de caso clínico',
    category: 'case_study',
    icon: FlaskConical,
    tags: ['Caso', 'Clínico', 'Diagnóstico'],
    blocks: [
      {
        type: 'heading',
        payload: { text: 'Caso Clínico', level: 1 }
      },
      {
        type: 'paragraph',
        payload: { text: 'Apresentação do caso...' }
      },
      {
        type: 'heading',
        payload: { text: 'História Clínica', level: 2 }
      },
      {
        type: 'snapshot_card',
        payload: {
          population: 'Paciente específico',
          intervention: 'Tratamento aplicado',
          comparison: 'Alternativas consideradas',
          outcome: 'Desfecho clínico',
          design: 'Relato de caso',
          evidence_level: 'low',
          recommendation_strength: 'conditional',
          key_findings: ['Achado clínico 1', 'Achado clínico 2']
        }
      },
      {
        type: 'heading',
        payload: { text: 'Discussão', level: 2 }
      },
      {
        type: 'callout',
        payload: {
          text: 'Pontos de aprendizado e relevância clínica',
          type: 'warning'
        }
      }
    ]
  }
];

export const TemplateManager: React.FC<TemplateManagerProps> = ({
  onApplyTemplate,
  className = ''
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);

  const filteredTemplates = selectedCategory
    ? REVIEW_TEMPLATES.filter(t => t.category === selectedCategory)
    : REVIEW_TEMPLATES;

  const applyTemplate = (template: Template) => {
    const processedBlocks: ReviewBlock[] = template.blocks.map((blockTemplate, index) => ({
      id: -(Date.now() + index), // Temporary negative ID
      issue_id: '',
      sort_index: index,
      type: blockTemplate.type as BlockType,
      payload: blockTemplate.payload || getDefaultPayload(blockTemplate.type as BlockType),
      meta: {
        styles: {},
        conditions: {},
        analytics: {
          track_views: true,
          track_interactions: true
        }
      },
      visible: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));

    onApplyTemplate(processedBlocks);
  };

  const categories = [
    { id: 'systematic', label: 'Sistemática', icon: BookOpen },
    { id: 'narrative', label: 'Narrativa', icon: FileTemplate },
    { id: 'meta_analysis', label: 'Meta-análise', icon: TrendingUp },
    { id: 'case_study', label: 'Caso Clínico', icon: FlaskConical }
  ];

  return (
    <Card className={className} style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2" style={{ color: '#ffffff' }}>
          <Sparkles className="w-5 h-5" />
          Templates
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Category Filter */}
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant={selectedCategory === null ? "default" : "outline"}
            onClick={() => setSelectedCategory(null)}
            className="text-xs"
          >
            Todos
          </Button>
          {categories.map(category => {
            const IconComponent = category.icon;
            return (
              <Button
                key={category.id}
                size="sm"
                variant={selectedCategory === category.id ? "default" : "outline"}
                onClick={() => setSelectedCategory(category.id)}
                className="text-xs flex items-center gap-1"
              >
                <IconComponent className="w-3 h-3" />
                {category.label}
              </Button>
            );
          })}
        </div>

        {/* Template List */}
        <div className="space-y-3">
          {filteredTemplates.map(template => {
            const IconComponent = template.icon;
            return (
              <Card
                key={template.id}
                className="border transition-colors hover:border-blue-500"
                style={{ backgroundColor: '#212121', borderColor: '#2a2a2a' }}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <IconComponent className="w-4 h-4" style={{ color: '#3b82f6' }} />
                        <h4 className="font-medium text-sm" style={{ color: '#ffffff' }}>
                          {template.name}
                        </h4>
                      </div>
                      <p className="text-xs mb-3" style={{ color: '#9ca3af' }}>
                        {template.description}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {template.tags.map(tag => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="text-xs"
                            style={{ backgroundColor: '#374151', color: '#d1d5db' }}
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-col gap-1 ml-3">
                      <Button
                        size="sm"
                        onClick={() => setPreviewTemplate(template)}
                        variant="ghost"
                        className="w-8 h-8 p-0"
                        title="Visualizar"
                      >
                        <Eye className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => applyTemplate(template)}
                        className="w-8 h-8 p-0"
                        title="Aplicar Template"
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Preview Modal */}
        {previewTemplate && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Preview: {previewTemplate.name}</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setPreviewTemplate(null)}
                  >
                    ✕
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {previewTemplate.blocks.map((block, index) => (
                    <div
                      key={index}
                      className="p-3 border rounded"
                      style={{ backgroundColor: '#f9fafb', borderColor: '#e5e7eb' }}
                    >
                      <div className="text-sm font-medium text-blue-600 mb-1">
                        {block.type?.replace('_', ' ').toUpperCase()}
                      </div>
                      <div className="text-sm text-gray-600">
                        {JSON.stringify(block.payload, null, 2).substring(0, 100)}...
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <Button
                    variant="outline"
                    onClick={() => setPreviewTemplate(null)}
                  >
                    Fechar
                  </Button>
                  <Button
                    onClick={() => {
                      applyTemplate(previewTemplate);
                      setPreviewTemplate(null);
                    }}
                  >
                    Aplicar Template
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
