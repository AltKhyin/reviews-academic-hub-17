
// ABOUTME: Block type palette component for editor with comprehensive block types
// Provides accessible interface for adding different content blocks

import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Type, 
  Image, 
  Video, 
  Quote, 
  List, 
  Code, 
  Table, 
  Minus, 
  MessageCircle,
  BarChart3,
  FileAudio,
  File,
  ImageIcon,
  Calendar,
  GitCompare,
  ChevronDown,
  Hash,
  Card,
  User,
  BookOpen,
  Camera,
  Share2
} from 'lucide-react';
import { BlockType } from '@/types/review';

interface BlockTypePaletteProps {
  onAddBlock: (type: BlockType, position?: number) => void;
  compact?: boolean;
}

const blockTypes = [
  { type: 'paragraph' as BlockType, label: 'Parágrafo', icon: Type, category: 'text' },
  { type: 'heading' as BlockType, label: 'Título', icon: Hash, category: 'text' },
  { type: 'text' as BlockType, label: 'Texto', icon: Type, category: 'text' },
  { type: 'image' as BlockType, label: 'Imagem', icon: Image, category: 'media' },
  { type: 'video' as BlockType, label: 'Vídeo', icon: Video, category: 'media' },
  { type: 'audio' as BlockType, label: 'Áudio', icon: FileAudio, category: 'media' },
  { type: 'file' as BlockType, label: 'Arquivo', icon: File, category: 'media' },
  { type: 'gallery' as BlockType, label: 'Galeria', icon: ImageIcon, category: 'media' },
  { type: 'quote' as BlockType, label: 'Citação', icon: Quote, category: 'content' },
  { type: 'list' as BlockType, label: 'Lista', icon: List, category: 'content' },
  { type: 'table' as BlockType, label: 'Tabela', icon: Table, category: 'content' },
  { type: 'code' as BlockType, label: 'Código', icon: Code, category: 'content' },
  { type: 'callout' as BlockType, label: 'Destaque', icon: MessageCircle, category: 'content' },
  { type: 'divider' as BlockType, label: 'Divisor', icon: Minus, category: 'layout' },
  { type: 'tabs' as BlockType, label: 'Abas', icon: ChevronDown, category: 'layout' },
  { type: 'accordion' as BlockType, label: 'Acordeão', icon: ChevronDown, category: 'layout' },
  { type: 'poll' as BlockType, label: 'Enquete', icon: BarChart3, category: 'interactive' },
  { type: 'chart' as BlockType, label: 'Gráfico', icon: BarChart3, category: 'interactive' },
  { type: 'timeline' as BlockType, label: 'Linha do Tempo', icon: Calendar, category: 'interactive' },
  { type: 'comparison' as BlockType, label: 'Comparação', icon: GitCompare, category: 'interactive' },
  { type: 'figure' as BlockType, label: 'Figura', icon: Camera, category: 'specialized' },
  { type: 'number_card' as BlockType, label: 'Card Numérico', icon: Card, category: 'specialized' },
  { type: 'reviewer_quote' as BlockType, label: 'Citação do Revisor', icon: User, category: 'specialized' },
  { type: 'citation_list' as BlockType, label: 'Lista de Citações', icon: BookOpen, category: 'specialized' },
  { type: 'snapshot_card' as BlockType, label: 'Card Snapshot', icon: Share2, category: 'specialized' },
  { type: 'diagram' as BlockType, label: 'Diagrama', icon: Share2, category: 'specialized' },
  { type: 'embed' as BlockType, label: 'Incorporar', icon: Share2, category: 'media' },
];

const categories = {
  text: 'Texto',
  media: 'Mídia',
  content: 'Conteúdo',
  layout: 'Layout',
  interactive: 'Interativo',
  specialized: 'Especializado'
};

export const BlockTypePalette: React.FC<BlockTypePaletteProps> = ({
  onAddBlock,
  compact = false
}) => {
  const handleAddBlock = (type: BlockType) => {
    onAddBlock(type);
  };

  if (compact) {
    return (
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-gray-300 mb-3">Adicionar Bloco</h4>
        <div className="grid grid-cols-2 gap-1">
          {blockTypes.slice(0, 8).map(({ type, label, icon: Icon }) => (
            <Button
              key={type}
              variant="ghost"
              size="sm"
              onClick={() => handleAddBlock(type)}
              className="h-8 px-2 text-xs justify-start text-gray-300 hover:text-white hover:bg-gray-700/50"
              title={label}
            >
              <Icon className="w-3 h-3 mr-1" />
              <span className="truncate">{label}</span>
            </Button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-300">Tipos de Bloco</h3>
      
      {Object.entries(categories).map(([categoryKey, categoryLabel]) => {
        const categoryBlocks = blockTypes.filter(block => block.category === categoryKey);
        
        return (
          <div key={categoryKey} className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                {categoryLabel}
              </Badge>
            </div>
            
            <div className="grid grid-cols-1 gap-1">
              {categoryBlocks.map(({ type, label, icon: Icon }) => (
                <Button
                  key={type}
                  variant="ghost"
                  size="sm"
                  onClick={() => handleAddBlock(type)}
                  className="h-10 px-3 justify-start text-gray-300 hover:text-white hover:bg-gray-700/50"
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {label}
                </Button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};
