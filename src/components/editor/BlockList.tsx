// ABOUTME: Enhanced block list with proper click handling and inline editing
// Prevents unwanted block creation and provides intuitive interaction patterns - UPDATED: Reduced spacing by 50%

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
  Heading as HeadingIcon,
  Type,
  Image as ImageIconLucide,
  Table as TableIcon,
  AlertCircle,
  Hash,
  Quote as QuoteIcon,
  BarChart3,
  List as ListIcon,
  FlaskConical,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface BlockListProps {
  blocks: ReviewBlock[];
  activeBlockId: string | null;
  onActiveBlockChange: (blockId: string | null) => void;
  onDeleteBlock: (blockId: string) => void;
  onMoveBlock: (blockId: string, direction: 'up' | 'down') => void;
  onAddBlock: (type: BlockType, position?: number) => void;
  onDuplicateBlock?: (blockId: string) => void;
  compact?: boolean;
}

const getBlockIcon = (type: string) => {
  switch (type) {
    case 'snapshot_card':
      return FlaskConical;
    case 'heading':
      return HeadingIcon;
    case 'paragraph':
      return Type;
    case 'figure':
      return ImageIconLucide;
    case 'table':
      return TableIcon;
    case 'callout':
      return AlertCircle;
    case 'number_card':
      return Hash;
    case 'reviewer_quote':
      return QuoteIcon;
    case 'poll':
      return BarChart3;
    case 'citation_list':
      return ListIcon;
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
      return block.content?.text || 'Título sem texto';
    case 'paragraph':
      const content = block.content?.content || '';
      const textContent = typeof content === 'string' ? content.replace(/<[^>]*>/g, '') : ''; // Strip HTML
      return textContent.length > 50 ? `${textContent.substring(0, 50)}...` : textContent || 'Parágrafo vazio';
    case 'figure':
      return block.content?.caption || block.content?.alt || 'Figura sem título';
    case 'callout':
      return block.content?.title || `Callout (${block.content?.type || 'info'})`;
    case 'table':
      return block.content?.title || 'Tabela';
    case 'number_card':
      return `${block.content?.number || '0'} - ${block.content?.label || 'Métrica'}`;
    case 'reviewer_quote':
      return `"${(block.content?.quote || '').substring(0, 30)}..." - ${block.content?.author || 'Autor'}`;
    case 'poll':
      return block.content?.question || 'Enquete';
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
    useBlockDragDrop((draggedIndex: number, targetIndex: number) => { // Assuming hook provides numbers
      const draggedBlock = blocks[draggedIndex];
      if (draggedBlock) {
        // Determine direction based on indices
        const direction = draggedIndex < targetIndex ? 'down' : 'up';
        onMoveBlock(draggedBlock.id, direction); // Correctly call with two arguments
      }
    });

  const handleBlockClick = (e: React.MouseEvent, blockId: string) => {
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('[role="button"]')) {
      return;
    }
    
    e.stopPropagation();
    onActiveBlockChange(blockId);
  };

  const handleAddBlockClick = (e: React.MouseEvent, position: number, type: BlockType = 'paragraph') => {
    e.stopPropagation();
    e.preventDefault();
    onAddBlock(type, position);
  };

  if (blocks.length === 0) {
    return (
      <div className="block-list-empty text-center py-6 w-full max-w-full">
        <FileText className="w-12 h-12 mx-auto mb-2" style={{ color: '#6b7280' }} />
        <h3 className="text-lg font-medium mb-1 break-words" style={{ color: '#ffffff' }}>
          Nenhum bloco adicionado
        </h3>
        <p className="mb-3 break-words" style={{ color: '#9ca3af' }}>
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
    <div className="block-list space-y-1.5 w-full max-w-full overflow-hidden">
      {blocks.map((block, index) => {
        const Icon = getBlockIcon(block.type);
        const iconColor = getBlockColor(block.type);
        const isActive = block.id === activeBlockId;
        const isDraggedOver = dragState.draggedOver === index;
        const isDragging = dragState.draggedIndex === index;
        const isFirst = index === 0;
        const isLast = index === blocks.length - 1;

        return (
          <div key={block.id} className="space-y-1 w-full max-w-full overflow-hidden">
            {index === 0 && (
              <div className="insert-point group w-full">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => handleAddBlockClick(e, 0)}
                  className="w-full h-5 opacity-30 hover:opacity-100 transition-opacity text-xs"
                  style={{ color: '#6b7280' }}
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Inserir bloco aqui
                </Button>
              </div>
            )}

            <Card
              className={cn(
                "block-list-item cursor-pointer transition-all duration-200 group w-full max-w-full overflow-hidden",
                isActive && "ring-2 ring-blue-500",
                isDraggedOver && "border-blue-400",
                isDragging && "opacity-50 scale-95"
              )}
              style={{
                backgroundColor: isActive ? '#1e3a8a' : '#1a1a1a',
                borderColor: isActive ? '#3b82f6' : '#2a2a2a'
              }}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragEnd={(e) => handleDragEnd(e, blocks)}
              onDragOver={handleDragOver}
              onDragEnter={(e) => handleDragEnter(e, index)}
              onClick={(e) => handleBlockClick(e, block.id)}
            >
              <CardContent className={cn("p-2 w-full max-w-full overflow-hidden", compact && "p-1.5")}>
                <div className="flex items-center gap-2 w-full max-w-full overflow-hidden">
                  <div 
                    className="drag-handle cursor-grab active:cursor-grabbing flex-shrink-0"
                    onMouseDown={(e) => e.stopPropagation()}
                  >
                    <GripVertical 
                      className="w-4 h-4" 
                      style={{ color: '#6b7280' }}
                    />
                  </div>

                  <div className="flex-shrink-0">
                    <Icon 
                      className="w-4 h-4" 
                      style={{ color: iconColor }}
                    />
                  </div>

                  <div className="flex-1 min-w-0 overflow-hidden">
                    <div className="flex items-center gap-1 mb-0.5 overflow-hidden">
                      <h4 
                        className={cn(
                          "font-medium truncate min-w-0 overflow-hidden break-words hyphens-auto",
                          compact ? "text-xs" : "text-sm"
                        )}
                        style={{ 
                          color: isActive ? '#ffffff' : '#ffffff',
                          wordWrap: 'break-word',
                          wordBreak: 'break-word',
                          overflowWrap: 'break-word'
                        }}
                        title={getBlockTitle(block)}
                      >
                        {getBlockTitle(block)}
                      </h4>
                      <Badge 
                        variant="outline" 
                        className="text-xs flex-shrink-0"
                        style={{ 
                          backgroundColor: 'transparent',
                          borderColor: iconColor,
                          color: iconColor
                        }}
                      >
                        {block.type}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-1 overflow-hidden">
                      <span 
                        className="text-xs break-words"
                        style={{ color: isActive ? '#d1d5db' : '#9ca3af' }}
                      >
                        Posição {index + 1}
                      </span>
                      {!block.visible && (
                        <EyeOff 
                          className="w-3 h-3 flex-shrink-0" 
                          style={{ color: '#ef4444' }}
                        />
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-0.5 flex-shrink-0">
                    {!isFirst && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          onMoveBlock(block.id, 'up');
                        }}
                        className="w-6 h-6 p-0 hover:bg-blue-700"
                        title="Mover para cima"
                      >
                        <ArrowUp className="w-3 h-3" style={{ color: '#3b82f6' }} />
                      </Button>
                    )}

                    {!isLast && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          onMoveBlock(block.id, 'down');
                        }}
                        className="w-6 h-6 p-0 hover:bg-blue-700"
                        title="Mover para baixo"
                      >
                        <ArrowDown className="w-3 h-3" style={{ color: '#3b82f6' }} />
                      </Button>
                    )}

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Toggle visibility logic here - requires onUpdateBlock access
                        // Example: onUpdateBlock(block.id, { visible: !block.visible });
                      }}
                      className="w-6 h-6 p-0"
                    >
                      {block.visible ? (
                        <Eye className="w-3 h-3" style={{ color: '#10b981' }} />
                      ) : (
                        <EyeOff className="w-3 h-3" style={{ color: '#ef4444' }} />
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
                        className="w-6 h-6 p-0"
                      >
                        <Copy className="w-3 h-3" style={{ color: '#6b7280' }} />
                      </Button>
                    )}

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteBlock(block.id);
                      }}
                      className="w-6 h-6 p-0 hover:bg-red-900/20"
                    >
                      <Trash2 className="w-3 h-3" style={{ color: '#ef4444' }} />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="insert-point group w-full">
              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => handleAddBlockClick(e, index + 1)}
                className="w-full h-5 opacity-0 group-hover:opacity-100 transition-opacity text-xs"
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
