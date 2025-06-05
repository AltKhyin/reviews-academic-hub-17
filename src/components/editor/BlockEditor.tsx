
// ABOUTME: Block editor interface for native reviews with drag-and-drop reordering
// Handles block selection, editing, manipulation, and drag-and-drop functionality

import React, { useState, useRef, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ChevronUp, 
  ChevronDown, 
  Trash2, 
  Settings, 
  Plus,
  GripVertical,
  Copy
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
  onDuplicateBlock?: (blockId: number) => void;
  compact?: boolean;
}

interface DragState {
  draggedIndex: number | null;
  draggedOver: number | null;
  isDragging: boolean;
}

export const BlockEditor: React.FC<BlockEditorProps> = ({
  blocks,
  activeBlockId,
  onActiveBlockChange,
  onUpdateBlock,
  onDeleteBlock,
  onMoveBlock,
  onAddBlock,
  onDuplicateBlock,
  compact = false
}) => {
  const [showProperties, setShowProperties] = useState(true);
  const [dragState, setDragState] = useState<DragState>({
    draggedIndex: null,
    draggedOver: null,
    isDragging: false
  });
  
  const dragItemRef = useRef<number | null>(null);
  const dragOverItemRef = useRef<number | null>(null);

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

  // Drag and drop handlers
  const handleDragStart = useCallback((e: React.DragEvent, index: number) => {
    dragItemRef.current = index;
    setDragState(prev => ({
      ...prev,
      draggedIndex: index,
      isDragging: true
    }));
    
    // Set drag effect
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.currentTarget.outerHTML);
    
    // Add ghost image styling
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '0.5';
    }
  }, []);

  const handleDragEnd = useCallback((e: React.DragEvent) => {
    // Reset opacity
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '1';
    }
    
    // Perform the move if valid
    if (dragItemRef.current !== null && dragOverItemRef.current !== null && 
        dragItemRef.current !== dragOverItemRef.current) {
      
      const fromIndex = dragItemRef.current;
      const toIndex = dragOverItemRef.current;
      
      // Calculate direction and number of moves needed
      if (fromIndex < toIndex) {
        // Moving down
        for (let i = fromIndex; i < toIndex; i++) {
          onMoveBlock(blocks[fromIndex].id, 'down');
        }
      } else {
        // Moving up
        for (let i = fromIndex; i > toIndex; i--) {
          onMoveBlock(blocks[fromIndex].id, 'up');
        }
      }
    }
    
    // Reset drag state
    setDragState({
      draggedIndex: null,
      draggedOver: null,
      isDragging: false
    });
    dragItemRef.current = null;
    dragOverItemRef.current = null;
  }, [blocks, onMoveBlock]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const handleDragEnter = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault();
    dragOverItemRef.current = index;
    setDragState(prev => ({
      ...prev,
      draggedOver: index
    }));
  }, []);

  const handleDuplicateBlock = useCallback((blockId: number) => {
    if (onDuplicateBlock) {
      onDuplicateBlock(blockId);
    } else {
      // Fallback: find block and create copy
      const blockToDuplicate = blocks.find(b => b.id === blockId);
      if (blockToDuplicate) {
        const blockIndex = blocks.findIndex(b => b.id === blockId);
        onAddBlock(blockToDuplicate.type, blockIndex + 1);
      }
    }
  }, [blocks, onAddBlock, onDuplicateBlock]);

  const activeBlock = blocks.find(block => block.id === activeBlockId);

  return (
    <div className={cn("block-editor flex h-full", compact && "text-sm")}>
      {/* Block List */}
      <div className={cn("overflow-y-auto border-r", compact ? "flex-1" : "flex-1")} 
           style={{ borderColor: 'var(--editor-primary-border)' }}>
        <div className="p-4 space-y-2">
          {blocks.length === 0 && (
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
          )}

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
                onDragEnd={handleDragEnd}
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
      </div>

      {/* Properties Panel */}
      {!compact && showProperties && activeBlock && (
        <div 
          className="w-80 border-r properties-panel overflow-y-auto"
          style={{ 
            backgroundColor: 'var(--editor-secondary-bg)',
            borderColor: 'var(--editor-primary-border)'
          }}
        >
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold" style={{ color: 'var(--editor-primary-text)' }}>
                Propriedades
              </h3>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowProperties(false)}
                style={{ color: 'var(--editor-muted-text)' }}
                className="hover:bg-[var(--editor-hover-bg)]"
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
        <div 
          className="w-12 border-r properties-panel flex items-start justify-center pt-4"
          style={{ borderColor: 'var(--editor-primary-border)' }}
        >
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setShowProperties(true)}
            style={{ color: 'var(--editor-muted-text)' }}
            className="hover:bg-[var(--editor-hover-bg)]"
          >
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
};
