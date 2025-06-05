
// ABOUTME: Block palette for native editor with comprehensive block creation tools
// Provides organized block types without template system dependencies

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Type, 
  Image, 
  Table, 
  Quote, 
  FileText,
  Lightbulb,
  BarChart3,
  Sparkles,
  Layers
} from 'lucide-react';
import { BlockType } from '@/types/review';

interface BlockPaletteProps {
  onAddBlock: (type: BlockType, position?: number) => void;
}

interface BlockTypeInfo {
  type: BlockType;
  label: string;
  description: string;
  icon: React.ElementType;
  category: 'text' | 'media' | 'data' | 'interactive';
  tags: string[];
}

const BLOCK_TYPES: BlockTypeInfo[] = [
  {
    type: 'heading',
    label: 'Título',
    description: 'Títulos e subtítulos para organizar o conteúdo',
    icon: Type,
    category: 'text',
    tags: ['estrutura', 'organização']
  },
  {
    type: 'paragraph',
    label: 'Parágrafo',
    description: 'Texto rico com formatação básica',
    icon: FileText,
    category: 'text',
    tags: ['texto', 'conteúdo']
  },
  {
    type: 'callout',
    label: 'Destaque',
    description: 'Caixa de destaque para informações importantes',
    icon: Lightbulb,
    category: 'text',
    tags: ['destaque', 'atenção']
  },
  {
    type: 'reviewer_quote',
    label: 'Citação',
    description: 'Citação de autores com fonte',
    icon: Quote,
    category: 'text',
    tags: ['citação', 'referência']
  },
  {
    type: 'figure',
    label: 'Figura',
    description: 'Imagens com legendas e descrições',
    icon: Image,
    category: 'media',
    tags: ['imagem', 'visual']
  },
  {
    type: 'table',
    label: 'Tabela',
    description: 'Tabelas editáveis para dados estruturados',
    icon: Table,
    category: 'data',
    tags: ['dados', 'estrutura']
  },
  {
    type: 'number_card',
    label: 'Card Numérico',
    description: 'Destaque para números e estatísticas',
    icon: BarChart3,
    category: 'data',
    tags: ['número', 'estatística']
  },
  {
    type: 'snapshot_card',
    label: 'Card de Evidência',
    description: 'Framework PICOD para evidências científicas',
    icon: Sparkles,
    category: 'interactive',
    tags: ['evidência', 'PICOD', 'ciência']
  },
  {
    type: 'citation_list',
    label: 'Lista de Citações',
    description: 'Lista organizada de referências bibliográficas',
    icon: FileText,
    category: 'data',
    tags: ['referência', 'bibliografia']
  },
  {
    type: 'divider',
    label: 'Divisor',
    description: 'Linha divisória para separar seções',
    icon: Layers,
    category: 'text',
    tags: ['separação', 'organização']
  }
];

export const BlockPalette: React.FC<BlockPaletteProps> = ({ 
  onAddBlock
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredBlocks = selectedCategory
    ? BLOCK_TYPES.filter(block => block.category === selectedCategory)
    : BLOCK_TYPES;

  const categories = [
    { id: 'text', label: 'Texto', icon: Type },
    { id: 'media', label: 'Mídia', icon: Image },
    { id: 'data', label: 'Dados', icon: Table },
    { id: 'interactive', label: 'Interativo', icon: Sparkles }
  ];

  return (
    <div className="block-palette h-full flex flex-col" style={{ backgroundColor: '#1a1a1a' }}>
      <div className="p-4 space-y-4">
        {/* Header */}
        <div>
          <h2 className="text-lg font-semibold mb-2 flex items-center gap-2" style={{ color: '#ffffff' }}>
            <Plus className="w-5 h-5" />
            Adicionar Blocos
          </h2>
          <p className="text-sm" style={{ color: '#9ca3af' }}>
            Clique para adicionar blocos ao seu conteúdo
          </p>
        </div>

        {/* Category Filter */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium" style={{ color: '#d1d5db' }}>
            Categorias
          </h3>
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
        </div>

        {/* Block List */}
        <div className="space-y-2 flex-1 overflow-y-auto">
          {filteredBlocks.map(block => {
            const IconComponent = block.icon;
            return (
              <Card
                key={block.type}
                className="cursor-pointer transition-colors hover:border-blue-500"
                style={{ backgroundColor: '#212121', borderColor: '#2a2a2a' }}
                onClick={() => onAddBlock(block.type)}
              >
                <CardContent className="p-3">
                  <div className="flex items-start gap-3">
                    <div 
                      className="w-8 h-8 rounded flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: '#3b82f6' }}
                    >
                      <IconComponent className="w-4 h-4" style={{ color: '#ffffff' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm mb-1" style={{ color: '#ffffff' }}>
                        {block.label}
                      </h4>
                      <p className="text-xs mb-2" style={{ color: '#9ca3af' }}>
                        {block.description}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {block.tags.map(tag => (
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
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};
