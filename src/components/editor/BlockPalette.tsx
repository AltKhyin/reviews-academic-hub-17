
// ABOUTME: Block palette for native review editor
// Provides draggable block types for content creation

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
          color: 'text-blue-600 dark:text-blue-400'
        },
        {
          type: 'heading' as BlockType,
          title: 'Título',
          description: 'Cabeçalho de seção com âncora',
          icon: Heading,
          color: 'text-gray-600 dark:text-gray-400'
        },
        {
          type: 'paragraph' as BlockType,
          title: 'Parágrafo',
          description: 'Texto rico com citações',
          icon: Type,
          color: 'text-gray-600 dark:text-gray-400'
        },
        {
          type: 'divider' as BlockType,
          title: 'Divisor',
          description: 'Separação visual entre seções',
          icon: Minus,
          color: 'text-gray-400 dark:text-gray-500'
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
          color: 'text-green-600 dark:text-green-400'
        },
        {
          type: 'table' as BlockType,
          title: 'Tabela',
          description: 'Dados estruturados com ordenação',
          icon: Table,
          color: 'text-purple-600 dark:text-purple-400'
        },
        {
          type: 'number_card' as BlockType,
          title: 'Cartão Numérico',
          description: 'Destaque de estatísticas importantes',
          icon: BarChart3,
          color: 'text-indigo-600 dark:text-indigo-400'
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
          color: 'text-yellow-600 dark:text-yellow-400'
        },
        {
          type: 'reviewer_quote' as BlockType,
          title: 'Citação de Revisor',
          description: 'Comentário de especialista',
          icon: Quote,
          color: 'text-purple-600 dark:text-purple-400'
        },
        {
          type: 'poll' as BlockType,
          title: 'Enquete',
          description: 'Votação interativa para leitores',
          icon: Target,
          color: 'text-red-600 dark:text-red-400'
        }
      ]
    },
    {
      category: 'Referências',
      blocks: [
        {
          type: 'citation_list' as BlockType,
          title: 'Lista de Citações',
          description: 'Bibliografia formatada',
          icon: FileText,
          color: 'text-gray-600 dark:text-gray-400'
        }
      ]
    }
  ];

  return (
    <div className="block-palette p-4 space-y-6 bg-gray-50 dark:bg-gray-900">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Blocos Disponíveis</h3>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Clique em um bloco para adicioná-lo ao final do documento
        </p>
      </div>

      {blockTypes.map((category, categoryIndex) => (
        <div key={categoryIndex}>
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wide">
            {category.category}
          </h4>
          
          <div className="space-y-2">
            {category.blocks.map((block) => {
              const IconComponent = block.icon;
              return (
                <Button
                  key={block.type}
                  variant="ghost"
                  className="w-full justify-start h-auto p-3 border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/20 block-type-button transition-all duration-200"
                  onClick={() => onAddBlock(block.type)}
                >
                  <div className="flex items-start gap-3 w-full">
                    <IconComponent className={`w-5 h-5 mt-0.5 flex-shrink-0 ${block.color}`} />
                    <div className="text-left flex-1">
                      <div className="font-medium text-gray-900 dark:text-white text-sm">
                        {block.title}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {block.description}
                      </div>
                    </div>
                  </div>
                </Button>
              );
            })}
          </div>
          
          {categoryIndex < blockTypes.length - 1 && (
            <Separator className="mt-4 border-gray-200 dark:border-gray-700" />
          )}
        </div>
      ))}
      
      {/* Dark Mode Indicator */}
      <div className="mt-6 p-3 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span>Editor otimizado para modo escuro</span>
        </div>
      </div>
    </div>
  );
};
