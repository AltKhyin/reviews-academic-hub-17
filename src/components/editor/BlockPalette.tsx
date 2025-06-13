// ABOUTME: Block palette component for adding new blocks to the editor
// Provides categorized block types with visual previews and drag-and-drop support

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { BlockType } from '@/types/review';
import { 
  Type, 
  AlignLeft, 
  Image, 
  Table, 
  MessageSquare, 
  BarChart3, 
  Hash, 
  Quote, 
  Star,
  Vote,
  FileText,
  Minus,
  Grid3X3,
  Search,
  Plus
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface BlockPaletteProps {
  onBlockAdd: (type: BlockType, position?: number) => string;
}

export const BlockPalette: React.FC<BlockPaletteProps> = ({ onBlockAdd }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const blockCategories = [
    {
      name: 'Texto',
      blocks: [
        {
          type: 'heading' as BlockType,
          icon: Type,
          label: 'Título',
          description: 'Cabeçalhos H1-H6',
          color: '#3b82f6'
        },
        {
          type: 'paragraph' as BlockType,
          icon: AlignLeft,
          label: 'Parágrafo',
          description: 'Texto formatado',
          color: '#6b7280'
        },
        {
          type: 'quote' as BlockType,
          icon: Quote,
          label: 'Citação',
          description: 'Bloco de citação',
          color: '#8b5cf6'
        },
        {
          type: 'divider' as BlockType,
          icon: Minus,
          label: 'Divisor',
          description: 'Linha de separação',
          color: '#9ca3af'
        }
      ]
    },
    {
      name: 'Mídia',
      blocks: [
        {
          type: 'figure' as BlockType,
          icon: Image,
          label: 'Figura',
          description: 'Imagem com legenda',
          color: '#10b981'
        },
        {
          type: 'diagram' as BlockType,
          icon: Grid3X3,
          label: 'Diagrama',
          description: 'Fluxogramas e diagramas científicos',
          color: '#f59e0b'
        }
      ]
    },
    {
      name: 'Dados',
      blocks: [
        {
          type: 'table' as BlockType,
          icon: Table,
          label: 'Tabela',
          description: 'Dados tabulares',
          color: '#ef4444'
        },
        {
          type: 'number_card' as BlockType,
          icon: Hash,
          label: 'Card Numérico',
          description: 'Métricas destacadas',
          color: '#06b6d4'
        },
        {
          type: 'snapshot_card' as BlockType,
          icon: BarChart3,
          label: 'Card de Evidência',
          description: 'Resumo de estudos',
          color: '#8b5cf6'
        }
      ]
    },
    {
      name: 'Interação',
      blocks: [
        {
          type: 'callout' as BlockType,
          icon: MessageSquare,
          label: 'Callout',
          description: 'Destaque informativo',
          color: '#f59e0b'
        },
        {
          type: 'poll' as BlockType,
          icon: Vote,
          label: 'Enquete',
          description: 'Votação interativa',
          color: '#10b981'
        },
        {
          type: 'reviewer_quote' as BlockType,
          icon: Star,
          label: 'Avaliação',
          description: 'Comentário de revisor',
          color: '#a855f7'
        }
      ]
    },
    {
      name: 'Referências',
      blocks: [
        {
          type: 'citation_list' as BlockType,
          icon: FileText,
          label: 'Bibliografia',
          description: 'Lista de referências',
          color: '#6366f1'
        }
      ]
    }
  ];

  const filteredCategories = blockCategories
    .map(category => ({
      ...category,
      blocks: category.blocks.filter(block =>
        block.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        block.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }))
    .filter(category => category.blocks.length > 0);

  return (
    <div className="h-full flex flex-col" style={{ backgroundColor: '#1a1a1a' }}>
      {/* Header */}
      <div className="p-4 border-b" style={{ borderColor: '#2a2a2a' }}>
        <h3 className="font-semibold mb-3" style={{ color: '#ffffff' }}>
          Blocos Disponíveis
        </h3>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Buscar blocos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-9"
            style={{ backgroundColor: '#212121', borderColor: '#2a2a2a', color: '#ffffff' }}
          />
        </div>
      </div>

      {/* Block Categories */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-6">
          {filteredCategories.map((category) => (
            <div key={category.name}>
              <h4 className="text-sm font-medium mb-3 flex items-center gap-2" style={{ color: '#d1d5db' }}>
                {category.name}
                <Badge variant="outline" className="text-xs">
                  {category.blocks.length}
                </Badge>
              </h4>
              
              <div className="grid grid-cols-1 gap-2">
                {category.blocks.map((block) => {
                  const Icon = block.icon;
                  return (
                    <Button
                      key={block.type}
                      variant="ghost"
                      className={cn(
                        "h-auto p-3 justify-start hover:bg-gray-800/50 group transition-all",
                        "border border-transparent hover:border-gray-700"
                      )}
                      onClick={() => onBlockAdd(block.type)}
                      style={{ 
                        backgroundColor: 'transparent',
                        color: '#ffffff'
                      }}
                    >
                      <div className="flex items-start gap-3 w-full">
                        <div 
                          className="p-2 rounded-md flex-shrink-0 group-hover:scale-110 transition-transform"
                          style={{ backgroundColor: `${block.color}20`, color: block.color }}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        
                        <div className="flex-1 text-left min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm">{block.label}</span>
                            <Plus className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                          <p className="text-xs text-gray-400 line-clamp-2">
                            {block.description}
                          </p>
                        </div>
                      </div>
                    </Button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {filteredCategories.length === 0 && (
          <div className="text-center py-12">
            <Search className="w-12 h-12 mx-auto mb-4 opacity-30" style={{ color: '#6b7280' }} />
            <p className="text-gray-400 mb-2">Nenhum bloco encontrado</p>
            <p className="text-sm text-gray-500">
              Tente ajustar os termos de busca
            </p>
          </div>
        )}
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t" style={{ borderColor: '#2a2a2a' }}>
        <p className="text-xs text-gray-500 text-center">
          Clique para adicionar • Arraste para organizar
        </p>
      </div>
    </div>
  );
};
