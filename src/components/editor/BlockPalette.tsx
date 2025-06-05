
// ABOUTME: Enhanced block palette with responsive descriptions and proper text wrapping
// Provides all available block types with overflow-safe descriptions

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ReviewBlock } from '@/types/review';
import { 
  Type, 
  FileText, 
  Image, 
  Table, 
  AlertTriangle, 
  BarChart3, 
  Quote, 
  BarChart, 
  BookOpen,
  CreditCard,
  Minus,
  Search,
  Layers,
  Palette
} from 'lucide-react';

interface BlockPaletteProps {
  onBlockAdd: (blockType: string) => void;
  className?: string;
}

interface BlockType {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: 'structure' | 'content' | 'interaction' | 'data';
  color: string;
}

const BLOCK_TYPES: BlockType[] = [
  // STRUCTURE
  {
    id: 'heading',
    name: 'Título',
    description: 'Cabeçalho de seção com âncora',
    icon: <Type className="w-4 h-4" />,
    category: 'structure',
    color: '#8b5cf6'
  },
  {
    id: 'paragraph',
    name: 'Parágrafo',
    description: 'Texto rico com citações',
    icon: <FileText className="w-4 h-4" />,
    category: 'structure',
    color: '#ffffff'
  },
  {
    id: 'divider',
    name: 'Divisor',
    description: 'Separação visual entre seções',
    icon: <Minus className="w-4 h-4" />,
    category: 'structure',
    color: '#6b7280'
  },
  
  // CONTENT
  {
    id: 'figure',
    name: 'Figura',
    description: 'Imagem com legenda e lightbox',
    icon: <Image className="w-4 h-4" />,
    category: 'content',
    color: '#10b981'
  },
  {
    id: 'table',
    name: 'Tabela',
    description: 'Dados estruturados com ordenação',
    icon: <Table className="w-4 h-4" />,
    category: 'content',
    color: '#f59e0b'
  },
  {
    id: 'callout',
    name: 'Destaque',
    description: 'Caixa de alerta ou informação',
    icon: <AlertTriangle className="w-4 h-4" />,
    category: 'content',
    color: '#ef4444'
  },
  
  // DATA & METRICS
  {
    id: 'snapshot_card',
    name: 'Cartão de Evidência',
    description: 'Resumo executivo com framework PICO',
    icon: <CreditCard className="w-4 h-4" />,
    category: 'data',
    color: '#3b82f6'
  },
  {
    id: 'number_card',
    name: 'Cartão Numérico',
    description: 'Destaque de estatísticas importantes',
    icon: <BarChart3 className="w-4 h-4" />,
    category: 'data',
    color: '#3b82f6'
  },
  {
    id: 'reviewer_quote',
    name: 'Citação do Revisor',
    description: 'Comentário ou opinião destacada',
    icon: <Quote className="w-4 h-4" />,
    category: 'data',
    color: '#a855f7'
  },
  
  // INTERACTION
  {
    id: 'poll',
    name: 'Enquete',
    description: 'Pesquisa interativa com resultados',
    icon: <BarChart className="w-4 h-4" />,
    category: 'interaction',
    color: '#06b6d4'
  },
  {
    id: 'citation_list',
    name: 'Referências',
    description: 'Lista de citações acadêmicas',
    icon: <BookOpen className="w-4 h-4" />,
    category: 'interaction',
    color: '#9ca3af'
  }
];

const CATEGORIES = [
  { id: 'all', name: 'Todos', icon: <Layers className="w-4 h-4" /> },
  { id: 'structure', name: 'Estrutura', icon: <Type className="w-4 h-4" /> },
  { id: 'content', name: 'Conteúdo', icon: <FileText className="w-4 h-4" /> },
  { id: 'data', name: 'Dados', icon: <BarChart3 className="w-4 h-4" /> },
  { id: 'interaction', name: 'Interação', icon: <BarChart className="w-4 h-4" /> }
];

export const BlockPalette: React.FC<BlockPaletteProps> = ({
  onBlockAdd,
  className = ""
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredBlocks = BLOCK_TYPES.filter(block => {
    const matchesSearch = block.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         block.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || block.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleBlockAdd = (blockType: string) => {
    onBlockAdd(blockType);
  };

  return (
    <Card 
      className={`block-palette h-full flex flex-col ${className}`}
      style={{ 
        backgroundColor: '#1a1a1a',
        borderColor: '#2a2a2a'
      }}
    >
      <CardHeader className="flex-shrink-0 pb-3">
        <CardTitle className="flex items-center gap-2 text-sm" style={{ color: '#ffffff' }}>
          <Palette className="w-4 h-4" style={{ color: '#3b82f6' }} />
          Blocos Disponíveis
        </CardTitle>
        <div className="text-xs" style={{ color: '#9ca3af' }}>
          Clique em um bloco para adicioná-lo ao final do documento
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-3 pt-0">
        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3 h-3" style={{ color: '#9ca3af' }} />
          <Input
            placeholder="Buscar blocos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-8 text-xs"
            style={{ 
              backgroundColor: '#212121', 
              borderColor: '#2a2a2a',
              color: '#ffffff'
            }}
          />
        </div>

        {/* Categories */}
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="flex-1 flex flex-col">
          <TabsList 
            className="grid grid-cols-2 gap-1 h-auto p-1 mb-3"
            style={{ backgroundColor: '#212121' }}
          >
            {CATEGORIES.slice(0, 2).map((category) => (
              <TabsTrigger
                key={category.id}
                value={category.id}
                className="text-xs h-7 data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                style={{ color: '#ffffff' }}
              >
                {category.icon}
                <span className="ml-1 hidden sm:inline">{category.name}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsList 
            className="grid grid-cols-3 gap-1 h-auto p-1 mb-3"
            style={{ backgroundColor: '#212121' }}
          >
            {CATEGORIES.slice(2).map((category) => (
              <TabsTrigger
                key={category.id}
                value={category.id}
                className="text-xs h-7 data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                style={{ color: '#ffffff' }}
              >
                {category.icon}
                <span className="ml-1 hidden sm:inline">{category.name}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Block List */}
          <ScrollArea className="flex-1">
            <div className="space-y-2">
              {filteredBlocks.map((block) => (
                <Button
                  key={block.id}
                  variant="outline"
                  onClick={() => handleBlockAdd(block.id)}
                  className="w-full p-3 h-auto text-left justify-start hover:scale-[1.02] transition-all duration-200"
                  style={{ 
                    backgroundColor: '#212121',
                    borderColor: '#2a2a2a',
                    color: '#ffffff'
                  }}
                >
                  <div className="flex items-start gap-3 w-full">
                    <div 
                      className="flex-shrink-0 w-8 h-8 rounded-md flex items-center justify-center"
                      style={{ backgroundColor: `${block.color}20`, color: block.color }}
                    >
                      {block.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm mb-1 text-left" style={{ color: '#ffffff' }}>
                        {block.name}
                      </div>
                      <div 
                        className="text-xs leading-tight text-left break-words hyphens-auto"
                        style={{ 
                          color: '#d1d5db',
                          wordWrap: 'break-word',
                          overflowWrap: 'break-word',
                          lineHeight: '1.3'
                        }}
                      >
                        {block.description}
                      </div>
                    </div>
                  </div>
                </Button>
              ))}
            </div>

            {filteredBlocks.length === 0 && (
              <div className="text-center py-8">
                <Search className="w-8 h-8 mx-auto mb-2" style={{ color: '#6b7280' }} />
                <p className="text-sm" style={{ color: '#9ca3af' }}>
                  Nenhum bloco encontrado
                </p>
                <p className="text-xs mt-1" style={{ color: '#6b7280' }}>
                  Tente ajustar sua busca ou categoria
                </p>
              </div>
            )}
          </ScrollArea>
        </Tabs>
      </CardContent>
    </Card>
  );
};
