
// ABOUTME: Enhanced block list with proper click handling and inline editing
// Prevents unwanted block creation and provides intuitive interaction patterns

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ReviewBlock, BlockType } from '@/types/review';
import { useBlockDragDrop } from '@/hooks/useBlockDragDrop';
import { 
  GripVertical, 
  Eye, 
  EyeOff, 
  Copy, 
  Trash2, 
  Plus,
  FileText,
  Heading,
  Type,
  Image,
  Table,
  AlertCircle,
  Hash,
  Quote,
  BarChart3,
  List,
  FlaskConical
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface BlockListProps {
  blocks: ReviewBlock[];
  activeBlockId: number | null;
  onActiveBlockChange: (blockId: number | null) => void;
  onDeleteBlock: (blockId: number) => void;
  onMoveBlock: (fromIndex: number, toIndex: number) => void;
  onAddBlock: (type: BlockType, position?: number) => void;
  onDuplicateBlock?: (blockId: number) => void;
  compact?: boolean;
}

const getBlockIcon = (type: string) => {
  switch (type) {
    case 'snapshot_card':
      return FlaskConical;
    case 'heading':
      return Heading;
    case 'paragraph':
      return Type;
    case 'figure':
      return Image;
    case 'table':
      return Table;
    case 'callout':
      return AlertCircle;
    case 'number_card':
      return Hash;
    case 'reviewer_quote':
      return Quote;
    case 'poll':
      return BarChart3;
    case 'citation_list':
      return List;
    default:
      return FileText;
  }
};

const getBlockColor = (type: string) => {
  switch (type) {
    case 'snapshot_card':
      return '#3b82f6';
    case 'heading':
      return '#8b5cf6';
    case 'paragraph':
      return '#ffffff';
    case 'figure':
      return '#10b981';
    case 'table':
      return '#f59e0b';
    case 'callout':
      return '#ef4444';
    case 'number_card':
      return '#3b82f6';
    case 'reviewer_quote':
      return '#a855f7';
    case 'poll':
      return '#06b6d4';
    case 'citation_list':
      return '#9ca3af';
    default:
      return '#6b7280';
  }
};

const getBlockTitle = (block: ReviewBlock) => {
  switch (block.type) {
    case 'heading':
      return block.payload.text || 'Título sem texto';
    case 'paragraph':
      const content = block.payload.content || '';
      const textContent = content.replace(/<[^>]*>/g, ''); // Strip HTML
      return textContent.length > 50 ? `${textContent.substring(0, 50)}...` : textContent || 'Parágrafo vazio';
    case 'figure':
      return block.payload.caption || block.payload.alt || 'Figura sem título';
    case 'callout':
      return block.payload.title || `Callout (${block.payload.type || 'info'})`;
    case 'table':
      return block.payload.title || 'Tabela';
    case 'number_card':
      return `${block.payload.number || '0'} - ${block.payload.label || 'Métrica'}`;
    case 'reviewer_quote':
      return `"${(block.payload.quote || '').substring(0, 30)}..." - ${block.payload.author || 'Autor'}`;
    case 'poll':
      return block.payload.question || 'Enquete';
    default:
      return `Bloco ${block.type}`;
  }
};

export const BlockList: React.FC<BlockListProps> = ({
  blocks,
  activeBlockId,
  onActiveBlockChange,
  onDeleteBlock,
  onMoveBlock,
  onAddBlock,
  onDuplicateBlock,
  compact = false
}) => {
  const { dragState, handleDragStart, handleDragEnd, handleDragOver, handleDragEnter } = 
    useBlockDragDrop({
      blocks,
      onMoveBlock,
      onMergeBlockIntoGrid: () => {} // Empty function for now
    });

  // Handle block selection with proper event handling
  const handleBlockClick = (e: React.MouseEvent, blockId: number) => {
    // Prevent triggering on button clicks or other interactive elements
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('[role="button"]')) {
      return;
    }
    
    e.stopPropagation();
    onActiveBlockChange(blockId);
  };

  // Handle add block with explicit positioning
  const handleAddBlockClick = (e: React.MouseEvent, position: number, type: BlockType = 'paragraph') => {
    e.stopPropagation();
    e.preventDefault();
    onAddBlock(type, position);
  };

  if (blocks.length === 0) {
    return (
      <div className="block-list-empty text-center py-12">
        <FileText className="w-12 h-12 mx-auto mb-4" style={{ color: '#6b7280' }} />
        <h3 className="text-lg font-medium mb-2" style={{ color: '#ffffff' }}>
          Nenhum bloco adicionado
        </h3>
        <p className="mb-6" style={{ color: '#9ca3af' }}>
          Use a paleta à esquerda para adicionar blocos ao editor.
        </p>
        <Button
          onClick={(e) => handleAddBlockClick(e, 0)}
          variant="outline"
          style={{ 
            borderColor: '#3b82f6',
            color: '#3b82f6'
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Primeiro Bloco
        </Button>
      </div>
    );
  }

  return (
    <div className="block-list space-y-3">
      {blocks.map((block, index) => {
        const Icon = getBlockIcon(block.type);
        const iconColor = getBlockColor(block.type);
        const isActive = block.id === activeBlockId;
        const isDraggedOver = dragState.draggedOver === index;
        const isDragging = dragState.draggedIndex === index;

        return (
          <div key={block.id} className="space-y-2">
            {/* Insert point at the top for first block */}
            {index === 0 && (
              <div className="insert-point group">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => handleAddBlockClick(e, 0)}
                  className="w-full h-6 opacity-30 hover:opacity-100 transition-opacity text-xs"
                  style={{ color: '#6b7280' }}
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Inserir bloco aqui
                </Button>
              </div>
            )}

            <Card
              className={cn(
                "block-list-item cursor-pointer transition-all duration-200 group",
                isActive && "ring-2 ring-blue-500",
                isDraggedOver && "border-blue-400",
                isDragging && "opacity-50 scale-95"
              )}
              style={{
                backgroundColor: isActive ? '#1e3a8a' : '#1a1a1a',
                borderColor: isActive ? '#3b82f6' : '#2a2a2a'
              }}
              draggable
              onDragStart={(e) => handleDragStart(e, block.id)}
              onDragEnd={handleDragEnd}
              onDragOver={handleDragOver}
              onDragEnter={(e) => handleDragEnter(e, index)}
              onClick={(e) => handleBlockClick(e, block.id)}
            >
              <CardContent className={cn("p-4", compact && "p-3")}>
                <div className="flex items-center gap-3">
                  {/* Drag Handle */}
                  <div 
                    className="drag-handle cursor-grab active:cursor-grabbing"
                    onMouseDown={(e) => e.stopPropagation()}
                  >
                    <GripVertical 
                      className="w-4 h-4" 
                      style={{ color: '#6b7280' }}
                    />
                  </div>

                  {/* Block Icon */}
                  <div className="flex-shrink-0">
                    <Icon 
                      className="w-5 h-5" 
                      style={{ color: iconColor }}
                    />
                  </div>

                  {/* Block Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 
                        className={cn(
                          "font-medium truncate",
                          compact ? "text-sm" : "text-base"
                        )}
                        style={{ color: isActive ? '#ffffff' : '#ffffff' }}
                      >
                        {getBlockTitle(block)}
                      </h4>
                      <Badge 
                        variant="outline" 
                        className="text-xs"
                        style={{ 
                          backgroundColor: 'transparent',
                          borderColor: iconColor,
                          color: iconColor
                        }}
                      >
                        {block.type}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span 
                        className="text-xs"
                        style={{ color: isActive ? '#d1d5db' : '#9ca3af' }}
                      >
                        Posição {index + 1}
                      </span>
                      {!block.visible && (
                        <EyeOff 
                          className="w-3 h-3" 
                          style={{ color: '#ef4444' }}
                        />
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Toggle visibility logic here
                      }}
                      className="w-8 h-8 p-0"
                    >
                      {block.visible ? (
                        <Eye className="w-4 h-4" style={{ color: '#10b981' }} />
                      ) : (
                        <EyeOff className="w-4 h-4" style={{ color: '#ef4444' }} />
                      )}
                    </Button>

                    {onDuplicateBlock && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDuplicateBlock(block.id);
                        }}
                        className="w-8 h-8 p-0"
                      >
                        <Copy className="w-4 h-4" style={{ color: '#6b7280' }} />
                      </Button>
                    )}

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteBlock(block.id);
                      }}
                      className="w-8 h-8 p-0 hover:bg-red-900/20"
                    >
                      <Trash2 className="w-4 h-4" style={{ color: '#ef4444' }} />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Insert Point After Each Block */}
            <div className="insert-point group">
              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => handleAddBlockClick(e, index + 1)}
                className="w-full h-6 opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                style={{ color: '#6b7280' }}
              >
                <Plus className="w-3 h-3 mr-1" />
                Inserir bloco aqui
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
