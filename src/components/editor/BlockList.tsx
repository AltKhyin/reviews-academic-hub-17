// ABOUTME: Enhanced block list with proper click handling and inline editing
// Prevents unwanted block creation and provides intuitive interaction patterns - UPDATED: Reduced spacing by 50%

import React, { useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ReviewBlock, BlockType } from '@/types/review';
import { useBlockDragDrop, DragState } from '@/hooks/useBlockDragDrop'; // Import DragState
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
  Image as ImageIcon,
  Table,
  AlertCircle,
  Hash,
  Quote,
  BarChart3,
  List,
  FlaskConical,
  ArrowUp,
  ArrowDown,
  Grid,
  LayoutGrid as LayoutGridIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface BlockListProps {
  blocks: ReviewBlock[];
  activeBlockId: string | null;
  onActiveBlockChange: (blockId: string | null) => void;
  onDeleteBlock: (blockId: string) => void;
  onMoveBlock: (blockId: string, directionOrIndex: 'up' | 'down' | number) => void;
  onAddBlock: (type: BlockType, position?: number) => void;
  onDuplicateBlock?: (blockId: string) => void;
  compact?: boolean;
  onToggleVisibility?: (blockId: string, isVisible: boolean) => void;
  // Drag and drop handlers provided by parent (BlockEditor) using useBlockDragDrop context
  dragState: DragState; // Consuming DragState from parent
  handleDragStart: (e: React.DragEvent, itemId: string) => void;
  handleDragEnd: (e: React.DragEvent) => void;
  handleDragOver: (e: React.DragEvent, targetItemId: string | null, position: 'before' | 'after' | 'over') => void;
  handleDragEnter: (e: React.DragEvent, targetItemId: string | null, position: 'before' | 'after' | 'over') => void;
  handleDrop: (e: React.DragEvent) => void;
}

const getBlockIcon = (block: ReviewBlock) => {
  if (block.meta?.layout?.grid_id) return LayoutGridIcon; 
  if (block.meta?.layout?.row_id) return Grid;

  switch (block.type) {
    case 'snapshot_card':
      return FlaskConical;
    case 'heading':
      return Heading;
    case 'paragraph':
    case 'text':
      return Type;
    case 'figure':
    case 'image':
      return ImageIcon;
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
    case 'diagram':
      return FlaskConical; 
    default:
      return FileText;
  }
};

const getBlockColor = (type: BlockType | 'layout_grid' | 'grid') => { // Adjusted type
  switch (type) {
    case 'snapshot_card': return '#3b82f6'; 
    case 'heading': return '#8b5cf6'; 
    case 'paragraph': case 'text': return '#64748b'; 
    case 'figure': case 'image': return '#10b981'; 
    case 'table': return '#f59e0b'; 
    case 'callout': return '#ef4444'; 
    case 'number_card': return '#0ea5e9'; 
    case 'reviewer_quote': return '#d946ef'; 
    case 'poll': return '#06b6d4'; 
    case 'citation_list': return '#475569'; 
    case 'diagram': return '#a855f7'; 
    case 'grid': return '#f97316'; 
    case 'layout_grid': return '#ec4899'; 
    default: return '#6b7280'; 
  }
};

const getBlockTitle = (block: ReviewBlock) => {
  if (block.meta?.layout?.grid_id && block.type === 'grid_2d') return `Grid 2D (ID: ${block.id.substring(0,6)}...)`;
  if (block.meta?.layout?.row_id && block.type === 'layout_grid') return `Grid Layout (ID: ${block.id.substring(0,6)}...)`;
  if (block.meta?.layout?.row_id) return `Item em Linha de Grid (ID: ${block.id.substring(0,6)}...)`;

  switch (block.type) {
    case 'heading':
      return block.content.text || 'Título sem texto';
    case 'paragraph': case 'text':
      const content = block.content.content || block.content.text || '';
      const textContent = typeof content === 'string' ? content.replace(/<[^>]*>/g, '') : JSON.stringify(content).substring(0,50);
      return textContent.length > 50 ? `${textContent.substring(0, 50)}...` : textContent || 'Parágrafo vazio';
    case 'figure': case 'image':
      return block.content.caption || block.content.alt || 'Figura sem título';
    case 'callout':
      return block.content.title || `Callout (${block.content.type || 'info'})`;
    case 'table':
      return block.content.title || 'Tabela';
    case 'number_card':
      return `${block.content.number || '0'} - ${block.content.label || 'Métrica'}`;
    case 'reviewer_quote':
      return `"${(block.content.quote || '').substring(0, 30)}..." - ${block.content.author || 'Autor'}`;
    case 'poll':
      return block.content.question || 'Enquete';
    case 'snapshot_card':
      return block.content.title || 'Cartão Snapshot';
    case 'diagram':
      return block.content.title || 'Diagrama';
    default:
      const unknownTitle = block.type.replace(/_/g, ' ');
      return unknownTitle.charAt(0).toUpperCase() + unknownTitle.slice(1);
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
  onToggleVisibility,
  compact = false,
  dragState,
  handleDragStart,
  handleDragEnd,
  handleDragOver,
  handleDragEnter,
  handleDrop,
}) => {

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

  const handleToggleVisibility = (e: React.MouseEvent, blockId: string, currentVisibility: boolean) => {
    e.stopPropagation();
    if (onToggleVisibility) {
      onToggleVisibility(blockId, !currentVisibility);
    } else {
      console.warn("onToggleVisibility not provided to BlockList. Visibility change might not persist.");
    }
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
    <div className="block-list space-y-1.5 w-full max-w-full overflow-hidden" onDrop={handleDrop}>
      {blocks.map((block, index) => {
        const Icon = getBlockIcon(block);
        const iconColorKey = block.type === 'grid_2d' ? 'layout_grid' : block.type === 'layout_grid' ? 'grid' : block.type;
        const iconColor = getBlockColor(iconColorKey as BlockType | 'layout_grid' | 'grid');

        const isActive = block.id === activeBlockId;
        const isDraggedOverItem = dragState.dragOverItemId === block.id;
        const isDraggingThisItem = dragState.draggedItemId === block.id;
        const isFirst = index === 0;
        const isLast = index === blocks.length - 1;

        return (
          <div key={block.id} className="space-y-1 w-full max-w-full overflow-hidden">
            {/* Insert line BEFORE the block */}
            <div
              className="insert-point group w-full h-3"
              onDragOver={(e) => handleDragOver(e, block.id, 'before')}
              onDragEnter={(e) => handleDragEnter(e, block.id, 'before')}
            >
              {dragState.isDragging && isDraggedOverItem && dragState.dropPosition === 'before' && (
                <div className="h-full w-full bg-blue-500/30 rounded opacity-100 transition-opacity" />
              )}
               {!dragState.isDragging && (index === 0) && (
                 <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => handleAddBlockClick(e, 0)}
                    className="w-full h-full opacity-0 group-hover:opacity-100 transition-opacity text-xs flex items-center justify-center"
                    style={{ color: '#6b7280' }}
                  >
                    <Plus className="w-3 h-3 mr-1" /> Inserir
                  </Button>
               )}
            </div>

            <Card
              className={cn(
                "block-list-item cursor-pointer transition-all duration-200 group w-full max-w-full overflow-hidden",
                isActive && "ring-2 ring-blue-500",
                isDraggedOverItem && dragState.dropPosition === 'over' && "border-blue-400",
                isDraggingThisItem && "opacity-50 scale-95"
              )}
              style={{
                backgroundColor: isActive ? '#1e3a8a' : '#1a1a1a',
                borderColor: isActive ? '#3b82f6' : (isDraggedOverItem && dragState.dropPosition === 'over' ? '#3b82f6' : '#2a2a2a')
              }}
              draggable
              onDragStart={(e) => handleDragStart(e, block.id)}
              onDragEnd={handleDragEnd}
              onDragOver={(e) => handleDragOver(e, block.id, 'over')}
              onDragEnter={(e) => handleDragEnter(e, block.id, 'over')}
              onClick={(e) => handleBlockClick(e, block.id)}
            >
              <CardContent className={cn("p-2 w-full max-w-full overflow-hidden", compact && "p-1.5")}>
                <div className="flex items-center gap-2 w-full max-w-full overflow-hidden">
                  <div
                    className="drag-handle cursor-grab active:cursor-grabbing flex-shrink-0"
                    onMouseDown={(e) => e.stopPropagation()}
                  >
                    <GripVertical className="w-4 h-4" style={{ color: '#6b7280' }} />
                  </div>

                  <div className="flex-shrink-0">
                    <Icon className="w-4 h-4" style={{ color: iconColor }}/>
                  </div>

                  <div className="flex-1 min-w-0 overflow-hidden">
                    <div className="flex items-center gap-1 mb-0.5 overflow-hidden">
                      <h4
                        className={cn(
                          "font-medium truncate min-w-0 overflow-hidden break-words hyphens-auto",
                          compact ? "text-xs" : "text-sm"
                        )}
                        style={{ color: isActive ? '#ffffff' : '#ffffff', wordWrap: 'break-word', wordBreak: 'break-word', overflowWrap: 'break-word' }}
                        title={getBlockTitle(block)}
                      >
                        {getBlockTitle(block)}
                      </h4>
                      <Badge
                        variant="outline"
                        className="text-xs flex-shrink-0"
                        style={{ backgroundColor: 'transparent', borderColor: iconColor, color: iconColor }}
                      >
                        {block.type === 'grid_2d' ? 'Grid 2D' : block.type === 'layout_grid' ? 'Grid Layout' : block.type}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-1 overflow-hidden">
                      <span className="text-xs break-words" style={{ color: isActive ? '#d1d5db' : '#9ca3af' }}>
                        Posição {index + 1} (ID: {block.id.substring(0,8)})
                      </span>
                      {!block.visible && (
                        <EyeOff className="w-3 h-3 flex-shrink-0" style={{ color: '#ef4444' }} />
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-0.5 flex-shrink-0">
                    {!isFirst && (
                      <Button
                        size="sm" variant="ghost"
                        onClick={(e) => { e.stopPropagation(); onMoveBlock(block.id, 'up'); }}
                        className="w-6 h-6 p-0 hover:bg-blue-700" title="Mover para cima"
                      ><ArrowUp className="w-3 h-3" style={{ color: '#3b82f6' }} /></Button>
                    )}
                    {!isLast && (
                      <Button
                        size="sm" variant="ghost"
                        onClick={(e) => { e.stopPropagation(); onMoveBlock(block.id, 'down'); }}
                        className="w-6 h-6 p-0 hover:bg-blue-700" title="Mover para baixo"
                      ><ArrowDown className="w-3 h-3" style={{ color: '#3b82f6' }} /></Button>
                    )}
                    <Button
                      size="sm" variant="ghost"
                      onClick={(e) => handleToggleVisibility(e, block.id, block.visible)}
                      className="w-6 h-6 p-0" title={block.visible ? "Ocultar bloco" : "Mostrar bloco"}
                    >
                      {block.visible ? <Eye className="w-3 h-3" style={{ color: '#10b981' }} /> : <EyeOff className="w-3 h-3" style={{ color: '#ef4444' }} />}
                    </Button>
                    {onDuplicateBlock && (
                      <Button
                        size="sm" variant="ghost"
                        onClick={(e) => { e.stopPropagation(); onDuplicateBlock(block.id); }}
                        className="w-6 h-6 p-0" title="Duplicar bloco"
                      ><Copy className="w-3 h-3" style={{ color: '#6b7280' }} /></Button>
                    )}
                    <Button
                      size="sm" variant="ghost"
                      onClick={(e) => { e.stopPropagation(); onDeleteBlock(block.id); }}
                      className="w-6 h-6 p-0 hover:bg-red-900/20" title="Remover bloco"
                    ><Trash2 className="w-3 h-3" style={{ color: '#ef4444' }} /></Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Insert line AFTER the block */}
             <div
              className="insert-point group w-full h-3"
              onDragOver={(e) => handleDragOver(e, block.id, 'after')}
              onDragEnter={(e) => handleDragEnter(e, block.id, 'after')}
             >
              {dragState.isDragging && isDraggedOverItem && dragState.dropPosition === 'after' && (
                <div className="h-full w-full bg-blue-500/30 rounded opacity-100 transition-opacity" />
              )}
               {!dragState.isDragging && ( /* Show add button always if not dragging */
                 <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => handleAddBlockClick(e, index + 1)}
                    className="w-full h-full opacity-0 group-hover:opacity-100 transition-opacity text-xs flex items-center justify-center"
                    style={{ color: '#6b7280' }}
                  >
                    <Plus className="w-3 h-3 mr-1" /> Inserir
                  </Button>
               )}
            </div>
          </div>
        );
      })}
       {/* Drop zone for adding to the very end of the list if dragging beyond last item */}
       <div
          className="insert-point group w-full h-3"
          onDragOver={(e) => handleDragOver(e, null, 'after')}
          onDragEnter={(e) => handleDragEnter(e, null, 'after')}
        >
          {dragState.isDragging && dragState.dragOverItemId === null && dragState.dropPosition === 'after' && (
            <div className="h-full w-full bg-blue-500/30 rounded opacity-100 transition-opacity" />
          )}
      </div>
    </div>
  );
};
