
// ABOUTME: Block editor interface for native reviews
// Handles block selection, editing, and manipulation

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ChevronUp, 
  ChevronDown, 
  Trash2, 
  Settings, 
  Plus,
  GripVertical
} from 'lucide-react';
import { ReviewBlock, BlockType } from '@/types/review';
import { BlockPropertyEditor } from './BlockPropertyEditor';
import { BlockRenderer } from '../review/BlockRenderer';
import { cn } from '@/lib/utils';

interface BlockEditorProps {
  blocks: ReviewBlock[];
  activeBlockId: number | null;
  onActiveBlockChange: (blockId: number | null) => void;
  onUpdateBlock: (blockId: number, updates: Partial<ReviewBlock>) => void;
  onDeleteBlock: (blockId: number) => void;
  onMoveBlock: (blockId: number, direction: 'up' | 'down') => void;
  onAddBlock: (type: BlockType, position?: number) => void;
  compact?: boolean;
}

export const BlockEditor: React.FC<BlockEditorProps> = ({
  blocks,
  activeBlockId,
  onActiveBlockChange,
  onUpdateBlock,
  onDeleteBlock,
  onMoveBlock,
  onAddBlock,
  compact = false
}) => {
  const [showProperties, setShowProperties] = useState(true);

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

  const activeBlock = blocks.find(block => block.id === activeBlockId);

  return (
    <div className={cn("block-editor flex h-full", compact && "text-sm")}>
      {/* Block List */}
      <div className={cn("overflow-y-auto border-r border-[hsl(var(--editor-border))]", compact ? "flex-1" : "flex-1")}>
        <div className="p-4 space-y-2">
          {blocks.length === 0 && (
            <div className="text-center py-12">
              <div className="text-[hsl(var(--muted-foreground))] mb-4">
                <Plus className="w-12 h-12 mx-auto" />
              </div>
              <p className="text-[hsl(var(--muted-foreground))] mb-4">
                Nenhum bloco adicionado ainda
              </p>
              <Button 
                variant="outline" 
                onClick={() => onAddBlock('paragraph')}
                size={compact ? "sm" : "default"}
                className="bg-[hsl(var(--editor-card-bg))] border-[hsl(var(--editor-border))] text-[hsl(var(--foreground))] hover:bg-[hsl(var(--editor-hover))]"
              >
                Adicionar Primeiro Bloco
              </Button>
            </div>
          )}

          {blocks.map((block, index) => (
            <div key={block.id} className="relative group">
              {/* Insert Block Button */}
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-6 w-6 p-0 bg-[hsl(var(--editor-card-bg))] border-[hsl(var(--editor-border))] hover:bg-[hsl(var(--editor-hover))] text-[hsl(var(--foreground))]"
                  onClick={() => onAddBlock('paragraph', index)}
                >
                  <Plus className="w-3 h-3" />
                </Button>
              </div>

              <Card 
                className={cn(
                  "cursor-pointer transition-all duration-200 hover:shadow-md block-editor-card",
                  activeBlockId === block.id 
                    ? "active" 
                    : ""
                )}
                onClick={() => onActiveBlockChange(block.id)}
              >
                <CardContent className={cn("p-3", compact && "p-2")}>
                  {/* Block Header */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <GripVertical className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
                      <Badge variant="outline" className={cn("text-xs bg-[hsl(var(--editor-card-bg))] text-[hsl(var(--foreground))] border-[hsl(var(--editor-border))]", compact && "text-xs")}>
                        {getBlockTypeLabel(block.type)}
                      </Badge>
                      <span className="text-xs text-[hsl(var(--muted-foreground))]">#{index + 1}</span>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      {/* Move Buttons */}
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--editor-hover))]"
                        onClick={(e) => {
                          e.stopPropagation();
                          onMoveBlock(block.id, 'up');
                        }}
                        disabled={index === 0}
                      >
                        <ChevronUp className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--editor-hover))]"
                        onClick={(e) => {
                          e.stopPropagation();
                          onMoveBlock(block.id, 'down');
                        }}
                        disabled={index === blocks.length - 1}
                      >
                        <ChevronDown className="w-3 h-3" />
                      </Button>
                      
                      {/* Delete Button */}
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0 text-[hsl(var(--destructive))] hover:text-[hsl(var(--destructive-foreground))] hover:bg-[hsl(var(--destructive))]/10"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteBlock(block.id);
                        }}
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
                    className="h-6 w-6 p-0 bg-[hsl(var(--editor-card-bg))] border-[hsl(var(--editor-border))] hover:bg-[hsl(var(--editor-hover))] text-[hsl(var(--foreground))]"
                    onClick={() => onAddBlock('paragraph', index + 1)}
                  >
                    <Plus className="w-3 h-3" />
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Properties Panel */}
      {!compact && showProperties && activeBlock && (
        <div className="w-80 border-r border-[hsl(var(--editor-border))] properties-panel overflow-y-auto">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-[hsl(var(--foreground))]">Propriedades</h3>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowProperties(false)}
                className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--editor-hover))]"
              >
                <Settings className="w-4 h-4" />
              </Button>
            </div>
            
            <BlockPropertyEditor
              block={activeBlock}
              onUpdate={(updates) => onUpdateBlock(activeBlock.id, updates)}
            />
          </div>
        </div>
      )}

      {/* Show Properties Button */}
      {!compact && !showProperties && (
        <div className="w-12 border-r border-[hsl(var(--editor-border))] properties-panel flex items-start justify-center pt-4">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setShowProperties(true)}
            className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--editor-hover))]"
          >
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
};
