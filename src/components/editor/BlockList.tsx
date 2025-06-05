
// ABOUTME: Block list component with drag-and-drop support and block controls
// Provides visual representation and interaction for editor blocks

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ChevronUp, 
  ChevronDown, 
  Trash2, 
  Plus,
  GripVertical,
  Copy
} from 'lucide-react';
import { ReviewBlock, BlockType } from '@/types/review';
import { BlockRenderer } from '../review/BlockRenderer';
import { useBlockDragDrop } from '@/hooks/useBlockDragDrop';
import { cn } from '@/lib/utils';

interface BlockListProps {
  blocks: ReviewBlock[];
  activeBlockId: number | null;
  onActiveBlockChange: (blockId: number | null) => void;
  onDeleteBlock: (blockId: number) => void;
  onMoveBlock: (blockId: number, direction: 'up' | 'down') => void;
  onAddBlock: (type: BlockType, position?: number) => void;
  onDuplicateBlock?: (blockId: number) => void;
  compact?: boolean;
}

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
    useBlockDragDrop(onMoveBlock);

  const getBlockTypeLabel = (type: BlockType): string => {
    const labels: Record<BlockType, string> = {
      snapshot_card: 'Cartão de Evidência',
      heading: 'Título',
      paragraph: 'Parágrafo',
      figure: 'Figura',
      table: 'Tabela',
      poll: 'Enquete',
      callout: 'Destaque',
      reviewer_quote: 'Citação',
      divider: 'Divisor',
      number_card: 'Cartão Numérico',
      citation_list: 'Lista de Citações'
    };
    return labels[type] || type;
  };

  const handleDuplicateBlock = (blockId: number) => {
    if (onDuplicateBlock) {
      onDuplicateBlock(blockId);
    } else {
      const blockToDuplicate = blocks.find(b => b.id === blockId);
      if (blockToDuplicate) {
        const blockIndex = blocks.findIndex(b => b.id === blockId);
        onAddBlock(blockToDuplicate.type, blockIndex + 1);
      }
    }
  };

  if (blocks.length === 0) {
    return (
      <div className="text-center py-12">
        <div style={{ color: 'var(--editor-muted-text)' }} className="mb-4">
          <Plus className="w-12 h-12 mx-auto" />
        </div>
        <p style={{ color: 'var(--editor-muted-text)' }} className="mb-4">
          Nenhum bloco adicionado ainda
        </p>
        <Button 
          variant="outline" 
          onClick={() => onAddBlock('paragraph')}
          size={compact ? "sm" : "default"}
          style={{
            backgroundColor: 'var(--editor-card-bg)',
            borderColor: 'var(--editor-primary-border)',
            color: 'var(--editor-primary-text)'
          }}
          className="hover:bg-[var(--editor-hover-bg)]"
        >
          Adicionar Primeiro Bloco
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {blocks.map((block, index) => (
        <div key={block.id} className="relative group">
          {/* Insert Block Button */}
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
            <Button
              size="sm"
              variant="outline"
              className="h-6 w-6 p-0"
              style={{
                backgroundColor: 'var(--editor-card-bg)',
                borderColor: 'var(--editor-primary-border)',
                color: 'var(--editor-primary-text)'
              }}
              onClick={() => onAddBlock('paragraph', index)}
            >
              <Plus className="w-3 h-3" />
            </Button>
          </div>

          <Card 
            className={cn(
              "cursor-pointer transition-all duration-200 hover:shadow-md block-editor-card",
              activeBlockId === block.id && "ring-2 ring-[var(--editor-focus-border)]",
              dragState.draggedIndex === index && "opacity-50",
              dragState.draggedOver === index && dragState.isDragging && "border-t-4 border-t-[var(--editor-focus-border)]"
            )}
            style={{
              backgroundColor: activeBlockId === block.id ? 'var(--editor-selected-bg)' : 'var(--editor-card-bg)',
              borderColor: 'var(--editor-primary-border)'
            }}
            onClick={() => onActiveBlockChange(block.id)}
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragEnd={(e) => handleDragEnd(e, blocks)}
            onDragOver={handleDragOver}
            onDragEnter={(e) => handleDragEnter(e, index)}
          >
            <CardContent className={cn("p-3", compact && "p-2")}>
              {/* Block Header */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <GripVertical 
                    className="w-4 h-4 cursor-grab active:cursor-grabbing" 
                    style={{ color: 'var(--editor-muted-text)' }}
                  />
                  <Badge 
                    variant="outline" 
                    className={cn("text-xs", compact && "text-xs")}
                    style={{
                      backgroundColor: 'var(--editor-card-bg)',
                      color: 'var(--editor-primary-text)',
                      borderColor: 'var(--editor-primary-border)'
                    }}
                  >
                    {getBlockTypeLabel(block.type)}
                  </Badge>
                  <span className="text-xs" style={{ color: 'var(--editor-muted-text)' }}>
                    #{index + 1}
                  </span>
                </div>
                
                <div className="flex items-center gap-1">
                  {/* Duplicate Button */}
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ color: 'var(--editor-muted-text)' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDuplicateBlock(block.id);
                    }}
                    title="Duplicar bloco"
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                  
                  {/* Move Buttons */}
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ color: 'var(--editor-muted-text)' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onMoveBlock(block.id, 'up');
                    }}
                    disabled={index === 0}
                    title="Mover para cima"
                  >
                    <ChevronUp className="w-3 h-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ color: 'var(--editor-muted-text)' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onMoveBlock(block.id, 'down');
                    }}
                    disabled={index === blocks.length - 1}
                    title="Mover para baixo"
                  >
                    <ChevronDown className="w-3 h-3" />
                  </Button>
                  
                  {/* Delete Button */}
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteBlock(block.id);
                    }}
                    title="Excluir bloco"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>

              {/* Block Preview */}
              <div className={cn("pointer-events-none", compact && "text-xs")}>
                <BlockRenderer 
                  block={block} 
                  readonly={true}
                  className="scale-90 origin-top-left transform"
                />
              </div>
            </CardContent>
          </Card>

          {/* Insert Block Button at Bottom */}
          {index === blocks.length - 1 && (
            <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
              <Button
                size="sm"
                variant="outline"
                className="h-6 w-6 p-0"
                style={{
                  backgroundColor: 'var(--editor-card-bg)',
                  borderColor: 'var(--editor-primary-border)',
                  color: 'var(--editor-primary-text)'
                }}
                onClick={() => onAddBlock('paragraph', index + 1)}
              >
                <Plus className="w-3 h-3" />
              </Button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
