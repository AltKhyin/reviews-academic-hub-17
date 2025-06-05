
// ABOUTME: Block palette for native review editor
// Provides draggable block types for content creation

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
          color: 'text-[hsl(var(--accent-primary))]'
        },
        {
          type: 'heading' as BlockType,
          title: 'Título',
          description: 'Cabeçalho de seção com âncora',
          icon: Heading,
          color: 'text-[hsl(var(--accent-secondary))]'
        },
        {
          type: 'paragraph' as BlockType,
          title: 'Parágrafo',
          description: 'Texto rico com citações',
          icon: Type,
          color: 'text-[hsl(var(--accent-secondary))]'
        },
        {
          type: 'divider' as BlockType,
          title: 'Divisor',
          description: 'Separação visual entre seções',
          icon: Minus,
          color: 'text-[hsl(var(--accent-tertiary))]'
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
          color: 'text-[hsl(var(--success))]'
        },
        {
          type: 'table' as BlockType,
          title: 'Tabela',
          description: 'Dados estruturados com ordenação',
          icon: Table,
          color: 'text-[hsl(var(--accent-primary))]'
        },
        {
          type: 'number_card' as BlockType,
          title: 'Cartão Numérico',
          description: 'Destaque de estatísticas importantes',
          icon: BarChart3,
          color: 'text-[hsl(var(--info))]'
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
          color: 'text-[hsl(var(--warning))]'
        },
        {
          type: 'reviewer_quote' as BlockType,
          title: 'Citação de Revisor',
          description: 'Comentário de especialista',
          icon: Quote,
          color: 'text-[hsl(var(--accent-primary))]'
        },
        {
          type: 'poll' as BlockType,
          title: 'Enquete',
          description: 'Votação interativa para leitores',
          icon: Target,
          color: 'text-[hsl(var(--accent-secondary))]'
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
          color: 'text-[hsl(var(--accent-secondary))]'
        }
      ]
    }
  ];

  return (
    <div className="block-palette p-4 space-y-6 h-full overflow-y-auto">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-5 h-5 text-[hsl(var(--accent-primary))]" />
          <h3 className="text-lg font-semibold text-[hsl(var(--foreground))]">Blocos Disponíveis</h3>
        </div>
        <p className="text-sm text-[hsl(var(--muted-foreground))]">
          Clique em um bloco para adicioná-lo ao final do documento
        </p>
      </div>

      {blockTypes.map((category, categoryIndex) => (
        <div key={categoryIndex}>
          <h4 className="text-sm font-medium text-[hsl(var(--accent-secondary))] mb-3 uppercase tracking-wide">
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
                >
                  <div className="flex items-start gap-3 w-full">
                    <IconComponent className={`w-5 h-5 mt-0.5 flex-shrink-0 ${block.color}`} />
                    <div className="text-left flex-1">
                      <div className="font-medium text-[hsl(var(--foreground))] text-sm">
                        {block.title}
                      </div>
                      <div className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">
                        {block.description}
                      </div>
                    </div>
                  </div>
                </Button>
              );
            })}
          </div>
          
          {categoryIndex < blockTypes.length - 1 && (
            <Separator className="mt-4 border-[hsl(var(--editor-border))]" />
          )}
        </div>
      ))}
      
      {/* Status Indicator */}
      <div className="mt-6 p-3 rounded-lg status-success">
        <div className="flex items-center gap-2 text-xs">
          <div className="w-2 h-2 bg-[hsl(var(--success))] rounded-full"></div>
          <span>Todos os componentes implementados</span>
        </div>
      </div>
    </div>
  );
};
