// ABOUTME: Enhanced block list with proper click handling and inline editing
// Prevents unwanted block creation and provides intuitive interaction patterns - UPDATED: Reduced spacing by 50%

import React, { useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ReviewBlock, BlockType } from '@/types/review';
import { useBlockDragDrop } from '@/hooks/useBlockDragDrop'; // Ensure this hook uses string IDs
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
  LayoutGrid as LayoutGridIcon // Renamed to avoid conflict with LayoutGrid component
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface BlockListProps {
  blocks: ReviewBlock[];
  activeBlockId: string | null;
  onActiveBlockChange: (blockId: string | null) => void;
  onDeleteBlock: (blockId: string) => void;
  onMoveBlock: (blockId: string, directionOrIndex: 'up' | 'down' | number) => void; // String ID for block, number for index
  onAddBlock: (type: BlockType, position?: number) => void;
  onDuplicateBlock?: (blockId: string) => void;
  compact?: boolean;
  onToggleVisibility?: (blockId: string, isVisible: boolean) => void;
}

const getBlockIcon = (block: ReviewBlock) => {
  if (block.meta?.layout?.grid_id) return LayoutGridIcon; // Use renamed LayoutGridIcon
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

// ... keep existing code (getBlockColor, getBlockTitle)
const getBlockColor = (type: string) => {
  switch (type) {
    case 'snapshot_card': return '#3b82f6'; // Blue
    case 'heading': return '#8b5cf6'; // Purple
    case 'paragraph': case 'text': return '#64748b'; // Slate
    case 'figure': case 'image': return '#10b981'; // Green
    case 'table': return '#f59e0b'; // Amber
    case 'callout': return '#ef4444'; // Red
    case 'number_card': return '#0ea5e9'; // Sky
    case 'reviewer_quote': return '#d946ef'; // Fuchsia
    case 'poll': return '#06b6d4'; // Cyan
    case 'citation_list': return '#475569'; // Slate
    case 'diagram': return '#a855f7'; // Purple (same as reviewer_quote for now)
    // Layout block types
    case 'grid': return '#f97316'; // Orange for 1D Grid
    case 'layout_grid': return '#ec4899'; // Pink for 2D Grid // Matches icon LayoutGridIcon
    default: return '#6b7280'; // Gray
  }
};

const getBlockTitle = (block: ReviewBlock) => {
  if (block.meta?.layout?.grid_id) return `Grid 2D (ID: ${block.meta.layout.grid_id.substring(0,6)}...)`;
  if (block.meta?.layout?.row_id) return `Linha em Grid (ID: ${block.meta.layout.row_id.substring(0,6)}...)`;

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
      return `Bloco ${block.type}`;
  }
};


export const BlockList: React.FC<BlockListProps> = ({
  blocks,
  activeBlockId,
  onActiveBlockChange,
  onDeleteBlock,
  onMoveBlock, // This prop expects (blockId: string, newIndex: number) or (blockId: string, direction: 'up'|'down')
  onAddBlock,
  onDuplicateBlock,
  onToggleVisibility,
  compact = false
}) => {
  // Assuming useBlockDragDrop's onMove callback expects (draggedId: string, targetId: string | null, position: 'before' | 'after')
  // And onMoveBlock is (movedItemId: string, newIndex: number)
  // This requires an adapter or consistent signature.
  // For now, let's assume useBlockDragDrop's onMove is (string, string|null, 'before'|'after') and we adapt
  
  const handleInternalMove = useCallback((draggedId: string, targetId: string | null, position: 'before' | 'after') => {
    const draggedIndex = blocks.findIndex(b => b.id === draggedId);
    if (draggedIndex === -1) return;

    if (targetId === null) { // Dropped on an empty area or an insert line not related to a specific block
      if (position === 'before') { // Typically means top of the list
        onMoveBlock(draggedId, 0);
      } else { // Typically means bottom of the list
        onMoveBlock(draggedId, blocks.length);
      }
      return;
    }

    const targetIndex = blocks.findIndex(b => b.id === targetId);
    if (targetIndex === -1) return;

    let newIndex = targetIndex;
    if (position === 'after') {
      newIndex = targetIndex + 1;
    }
    // Adjust newIndex if dragging downwards past original position
    if (draggedIndex < newIndex) {
        newIndex--;
    }
    onMoveBlock(draggedId, newIndex);

  }, [blocks, onMoveBlock]);
  
  const { dragState, handleDragStart, handleDragEnd, handleDragOver, handleDragEnter } = 
    useBlockDragDrop(handleInternalMove); // Pass the adapter

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
    <div className="block-list space-y-1.5 w-full max-w-full overflow-hidden">
      {blocks.map((block, index) => {
        const Icon = getBlockIcon(block);
        const iconColor = getBlockColor(block.meta?.layout?.grid_id ? 'layout_grid' : block.meta?.layout?.row_id ? 'grid' : block.type);
        const isActive = block.id === activeBlockId;
        // Assuming dragState from useBlockDragDrop uses string IDs
        const isDraggedOver = dragState.dragOverItemId === block.id;
        const isDragging = dragState.draggedItemId === block.id;
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
                  onDragOver={(e) => handleDragOver(e, null, 'before')} // Drop at the very top
                  onDragEnter={(e) => handleDragEnter(e, null, 'before')} // Drop at the very top
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
                isDraggedOver && dragState.dropPosition === 'over' && "border-blue-400", // Highlight for 'over' drop
                isDragging && "opacity-50 scale-95"
              )}
              style={{
                backgroundColor: isActive ? '#1e3a8a' : '#1a1a1a',
                borderColor: isActive ? '#3b82f6' : (isDraggedOver && dragState.dropPosition === 'over' ? '#3b82f6' : '#2a2a2a')
              }}
              draggable
              onDragStart={(e) => handleDragStart(e, block.id)}
              onDragEnd={(e) => handleDragEnd(e)} // Adjusted: handleDragEnd might not need args from error
              onDragOver={(e) => handleDragOver(e, block.id, 'over')} // Pass 'over' for dropping onto block
              onDragEnter={(e) => handleDragEnter(e, block.id, 'over')} // Pass 'over'
              onClick={(e) => handleBlockClick(e, block.id)}
            >
              <CardContent className={cn("p-2 w-full max-w-full overflow-hidden", compact && "p-1.5")}>
                <div className="flex items-center gap-2 w-full max-w-full overflow-hidden">
                  <div 
                    className="drag-handle cursor-grab active:cursor-grabbing flex-shrink-0"
                    onMouseDown={(e) => e.stopPropagation()} // Prevent card click when grabbing handle
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
                        {block.meta?.layout?.grid_id ? 'Grid 2D' : block.meta?.layout?.row_id ? 'Grid Row' : block.type}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-1 overflow-hidden">
                      <span className="text-xs break-words" style={{ color: isActive ? '#d1d5db' : '#9ca3af' }}>
                        Posição {index + 1} (ID: {block.id})
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

            <div className="insert-point group w-full">
              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => handleAddBlockClick(e, index + 1)}
                className={cn(
                    "w-full h-5 transition-opacity text-xs",
                    dragState.isDragging ? "opacity-30 hover:opacity-100" : "opacity-0 group-hover:opacity-100"
                )}
                style={{ color: '#6b7280' }}
                onDragOver={(e) => handleDragOver(e, block.id, 'after')} // Drop after this block
                onDragEnter={(e) => handleDragEnter(e, block.id, 'after')} // Drop after this block
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
