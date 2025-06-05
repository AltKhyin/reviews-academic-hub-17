
// ABOUTME: Block palette for native review editor with colored icons
// Provides categorized block types with visual distinctions

import React from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  FlaskConical, 
  Heading, 
  Type, 
  Image, 
  Table, 
  BarChart3, 
  AlertCircle, 
  Quote, 
  Minus,
  Target,
  FileText,
  Sparkles
} from 'lucide-react';
import { BlockType } from '@/types/review';

interface BlockPaletteProps {
  onAddBlock: (type: BlockType) => void;
}

export const BlockPalette: React.FC<BlockPaletteProps> = ({ onAddBlock }) => {
  const blockTypes = [
    {
      category: 'Estrutura',
      blocks: [
        {
          type: 'snapshot_card' as BlockType,
          title: 'Cartão de Evidência',
          description: 'Resumo executivo com framework PICOD',
          icon: FlaskConical,
          iconColor: 'var(--block-snapshot-card-accent)'
        },
        {
          type: 'heading' as BlockType,
          title: 'Título',
          description: 'Cabeçalho de seção com âncora',
          icon: Heading,
          iconColor: 'var(--block-heading-accent)'
        },
        {
          type: 'paragraph' as BlockType,
          title: 'Parágrafo',
          description: 'Texto rico com citações',
          icon: Type,
          iconColor: 'var(--block-paragraph-accent)'
        },
        {
          type: 'divider' as BlockType,
          title: 'Divisor',
          description: 'Separação visual entre seções',
          icon: Minus,
          iconColor: 'var(--block-divider-accent)'
        }
      ]
    },
    {
      category: 'Dados & Mídia',
      blocks: [
        {
          type: 'figure' as BlockType,
          title: 'Figura',
          description: 'Imagem com legenda e lightbox',
          icon: Image,
          iconColor: 'var(--block-figure-accent)'
        },
        {
          type: 'table' as BlockType,
          title: 'Tabela',
          description: 'Dados estruturados com ordenação',
          icon: Table,
          iconColor: 'var(--block-table-accent)'
        },
        {
          type: 'number_card' as BlockType,
          title: 'Cartão Numérico',
          description: 'Destaque de estatísticas importantes',
          icon: BarChart3,
          iconColor: 'var(--block-number-card-accent)'
        }
      ]
    },
    {
      category: 'Interação',
      blocks: [
        {
          type: 'callout' as BlockType,
          title: 'Destaque',
          description: 'Caixa de alerta ou informação',
          icon: AlertCircle,
          iconColor: 'var(--block-callout-accent)'
        },
        {
          type: 'reviewer_quote' as BlockType,
          title: 'Citação de Revisor',
          description: 'Comentário de especialista',
          icon: Quote,
          iconColor: 'var(--block-quote-accent)'
        },
        {
          type: 'poll' as BlockType,
          title: 'Enquete',
          description: 'Votação interativa para leitores',
          icon: Target,
          iconColor: 'var(--block-poll-accent)'
        }
      ]
    },
    {
      category: 'Referências',
      blocks: [
        {
          type: 'citation_list' as BlockType,
          title: 'Lista de Citações',
          description: 'Bibliografia formatada automaticamente',
          icon: FileText,
          iconColor: 'var(--block-citation-accent)'
        }
      ]
    }
  ];

  return (
    <div className="block-palette p-4 space-y-6 h-full overflow-y-auto">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-5 h-5" style={{ color: 'var(--editor-accent-text)' }} />
          <h3 className="text-lg font-semibold" style={{ color: 'var(--palette-block-title-text)' }}>
            Blocos Disponíveis
          </h3>
        </div>
        <p className="text-sm" style={{ color: 'var(--palette-block-desc-text)' }}>
          Clique em um bloco para adicioná-lo ao final do documento
        </p>
      </div>

      {blockTypes.map((category, categoryIndex) => (
        <div key={categoryIndex}>
          <h4 
            className="text-sm font-medium mb-3 uppercase tracking-wide"
            style={{ color: 'var(--palette-category-text)' }}
          >
            {category.category}
          </h4>
          
          <div className="space-y-2">
            {category.blocks.map((block) => {
              const IconComponent = block.icon;
              return (
                <Button
                  key={block.type}
                  variant="ghost"
                  className="w-full justify-start h-auto p-3 block-type-button transition-all duration-200"
                  onClick={() => onAddBlock(block.type)}
                  style={{
                    backgroundColor: 'var(--palette-palette-card-bg)',
                    borderColor: 'var(--palette-palette-border)',
                    color: 'var(--palette-block-title-text)'
                  }}
                >
                  <div className="flex items-start gap-3 w-full">
                    <IconComponent 
                      className="w-5 h-5 mt-0.5 flex-shrink-0" 
                      style={{ color: block.iconColor }}
                    />
                    <div className="text-left flex-1">
                      <div 
                        className="font-medium text-sm"
                        style={{ color: 'var(--palette-block-title-text)' }}
                      >
                        {block.title}
                      </div>
                      <div 
                        className="text-xs mt-0.5"
                        style={{ color: 'var(--palette-block-desc-text)' }}
                      >
                        {block.description}
                      </div>
                    </div>
                  </div>
                </Button>
              );
            })}
          </div>
          
          {categoryIndex < blockTypes.length - 1 && (
            <Separator className="mt-4" style={{ borderColor: 'var(--editor-primary-border)' }} />
          )}
        </div>
      ))}
      
      {/* Status Indicator */}
      <div 
        className="mt-6 p-3 rounded-lg"
        style={{ 
          backgroundColor: 'color-mix(in srgb, var(--editor-success-color) 10%, transparent)',
          borderColor: 'color-mix(in srgb, var(--editor-success-color) 20%, transparent)',
          border: '1px solid'
        }}
      >
        <div className="flex items-center gap-2 text-xs">
          <div 
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: 'var(--editor-success-color)' }}
          ></div>
          <span style={{ color: 'var(--editor-success-color)' }}>
            Todos os componentes implementados
          </span>
        </div>
      </div>
    </div>
  );
};
