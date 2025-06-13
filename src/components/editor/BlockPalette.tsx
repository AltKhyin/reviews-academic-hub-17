
// ABOUTME: Block palette component for adding new blocks
// Provides categorized block types for content creation

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BlockType } from '@/types/review';
import {
  Type,
  Heading,
  Image,
  Table,
  Quote,
  List,
  Code,
  BarChart3,
  FileText,
  AlertCircle,
  Video,
  Music,
  FileDown,
  Calendar,
  GitBranch,
  ChevronDown
} from 'lucide-react';

interface BlockPaletteProps {
  onBlockAdd: (type: BlockType, position?: number) => string;
}

const blockTypes = [
  { type: 'heading' as BlockType, label: 'Título', icon: Heading, category: 'text' },
  { type: 'text' as BlockType, label: 'Texto', icon: Type, category: 'text' },
  { type: 'quote' as BlockType, label: 'Citação', icon: Quote, category: 'text' },
  { type: 'list' as BlockType, label: 'Lista', icon: List, category: 'text' },
  { type: 'image' as BlockType, label: 'Imagem', icon: Image, category: 'media' },
  { type: 'video' as BlockType, label: 'Vídeo', icon: Video, category: 'media' },
  { type: 'audio' as BlockType, label: 'Áudio', icon: Music, category: 'media' },
  { type: 'table' as BlockType, label: 'Tabela', icon: Table, category: 'data' },
  { type: 'chart' as BlockType, label: 'Gráfico', icon: BarChart3, category: 'data' },
  { type: 'code' as BlockType, label: 'Código', icon: Code, category: 'advanced' },
  { type: 'callout' as BlockType, label: 'Destaque', icon: AlertCircle, category: 'advanced' },
  { type: 'file' as BlockType, label: 'Arquivo', icon: FileDown, category: 'advanced' },
  { type: 'timeline' as BlockType, label: 'Timeline', icon: Calendar, category: 'advanced' },
  { type: 'comparison' as BlockType, label: 'Comparação', icon: GitBranch, category: 'advanced' }
];

const categories = {
  text: 'Texto',
  media: 'Mídia',
  data: 'Dados',
  advanced: 'Avançado'
};

export const BlockPalette: React.FC<BlockPaletteProps> = ({ onBlockAdd }) => {
  const [expandedCategories, setExpandedCategories] = React.useState<Set<string>>(
    new Set(['text', 'media'])
  );

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  const handleBlockAdd = (type: BlockType) => {
    onBlockAdd(type);
  };

  return (
    <Card className="block-palette h-full" style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg" style={{ color: '#ffffff' }}>
          Blocos
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {Object.entries(categories).map(([categoryKey, categoryLabel]) => {
          const categoryBlocks = blockTypes.filter(block => block.category === categoryKey);
          const isExpanded = expandedCategories.has(categoryKey);
          
          return (
            <div key={categoryKey} className="space-y-2">
              <Button
                variant="ghost"
                onClick={() => toggleCategory(categoryKey)}
                className="w-full justify-between p-2 h-auto text-left"
                style={{ color: '#ffffff' }}
              >
                <span className="font-medium">{categoryLabel}</span>
                <ChevronDown 
                  className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
                />
              </Button>
              
              {isExpanded && (
                <div className="grid grid-cols-2 gap-2 pl-2">
                  {categoryBlocks.map(({ type, label, icon: Icon }) => (
                    <Button
                      key={type}
                      variant="outline"
                      onClick={() => handleBlockAdd(type)}
                      className="h-auto p-3 flex flex-col items-center gap-1 text-xs"
                      style={{ 
                        borderColor: '#2a2a2a',
                        backgroundColor: 'transparent',
                        color: '#ffffff'
                      }}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{label}</span>
                    </Button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};
