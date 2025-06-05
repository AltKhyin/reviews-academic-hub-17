
// ABOUTME: Unified block editor with integrated layout controls and improved drag & drop
// Single-view editor with inline layout options for each block

import React, { useState, useCallback } from 'react';
import { ReviewBlock, BlockType } from '@/types/review';
import { BlockRenderer } from '@/components/review/BlockRenderer';
import { DragHandle } from './DragHandle';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  Plus, 
  Eye, 
  EyeOff, 
  Copy, 
  Trash2, 
  ChevronUp, 
  ChevronDown,
  Columns2,
  Columns3,
  Columns4,
  Square
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface BlockEditorProps {
  blocks: ReviewBlock[];
  activeBlockId: number | null;
  onActiveBlockChange: (blockId: number | null) => void;
  onUpdateBlock: (blockId: number, updates: Partial<ReviewBlock>) => void;
  onDeleteBlock: (blockId: number) => void;
  onMoveBlock: (blockId: number, direction: 'up' | 'down') => void;
  onAddBlock: (type: BlockType, position?: number) => void;
  onDuplicateBlock: (blockId: number) => void;
  className?: string;
}

interface LayoutRow {
  id: string;
  blocks: ReviewBlock[];
  columns: number;
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
  className
}) => {
  const [draggedBlock, setDraggedBlock] = useState<number | null>(null);
  const [dragOverPosition, setDragOverPosition] = useState<{ index: number; position: 'before' | 'after' } | null>(null);

  // Group blocks into layout rows
  const layoutRows: LayoutRow[] = React.useMemo(() => {
    const rows: LayoutRow[] = [];
    let currentRow: LayoutRow | null = null;

    blocks.forEach((block, index) => {
      const blockLayout = block.meta?.layout;
      
      if (blockLayout?.row_id && currentRow?.id === blockLayout.row_id) {
        // Add to current row
        currentRow.blocks.push(block);
      } else {
        // Start new row
        if (currentRow) rows.push(currentRow);
        currentRow = {
          id: blockLayout?.row_id || `row-${block.id}`,
          blocks: [block],
          columns: blockLayout?.columns || 1
        };
      }
    });

    if (currentRow) rows.push(currentRow);
    return rows;
  }, [blocks]);

  const handleBlockClick = useCallback((blockId: number, event: React.MouseEvent) => {
    const target = event.target as Element;
    const isInteractiveElement = target.closest('.inline-editor-display, .inline-rich-editor-display, input, textarea, button, select');
    
    if (!isInteractiveElement) {
      onActiveBlockChange(activeBlockId === blockId ? null : blockId);
    }
  }, [activeBlockId, onActiveBlockChange]);

  const handleBlockVisibilityToggle = useCallback((blockId: number) => {
    const block = blocks.find(b => b.id === blockId);
    if (block) {
      onUpdateBlock(blockId, { visible: !block.visible });
    }
  }, [blocks, onUpdateBlock]);

  const addBlockBetween = useCallback((position: number, type: BlockType = 'paragraph') => {
    onAddBlock(type, position);
  }, [onAddBlock]);

  // Layout manipulation functions
  const convertToLayout = useCallback((blockId: number, columns: number) => {
    const block = blocks.find(b => b.id === blockId);
    if (!block) return;

    const rowId = `row-${Date.now()}`;
    const layoutMeta = {
      layout: {
        row_id: rowId,
        position: 0,
        columns,
        gap: 4
      }
    };

    onUpdateBlock(blockId, {
      meta: { ...block.meta, ...layoutMeta }
    });

    // Add empty blocks to fill the row
    const blockIndex = blocks.findIndex(b => b.id === blockId);
    for (let i = 1; i < columns; i++) {
      setTimeout(() => {
        const newBlock: Partial<ReviewBlock> = {
          type: 'paragraph',
          payload: { content: '' },
          meta: {
            layout: {
              row_id: rowId,
              position: i,
              columns,
              gap: 4
            }
          }
        };
        onAddBlock('paragraph', blockIndex + i);
        // Update the newly added block with layout meta
        setTimeout(() => {
          const newBlocks = blocks.slice();
          const lastBlock = newBlocks[newBlocks.length - 1];
          if (lastBlock) {
            onUpdateBlock(lastBlock.id, newBlock);
          }
        }, 50);
      }, i * 50);
    }
  }, [blocks, onUpdateBlock, onAddBlock]);

  // Drag and drop handlers
  const handleDragStart = useCallback((e: React.DragEvent, blockId: number) => {
    setDraggedBlock(blockId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', blockId.toString());
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    const rect = e.currentTarget.getBoundingClientRect();
    const midpoint = rect.top + rect.height / 2;
    const position = e.clientY < midpoint ? 'before' : 'after';
    
    setDragOverPosition({ index: targetIndex, position });
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOverPosition(null);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    
    if (!draggedBlock) return;
    
    const draggedIndex = blocks.findIndex(b => b.id === draggedBlock);
    if (draggedIndex === -1) return;

    let newIndex = targetIndex;
    if (dragOverPosition?.position === 'after') {
      newIndex = targetIndex + 1;
    }

    // Adjust for the removal of the dragged block
    if (draggedIndex < newIndex) {
      newIndex--;
    }

    // Calculate how many positions to move
    const direction = newIndex > draggedIndex ? 'down' : 'up';
    const steps = Math.abs(newIndex - draggedIndex);

    // Perform the moves
    for (let i = 0; i < steps; i++) {
      setTimeout(() => onMoveBlock(draggedBlock, direction), i * 50);
    }

    setDraggedBlock(null);
    setDragOverPosition(null);
  }, [draggedBlock, blocks, dragOverPosition, onMoveBlock]);

  const handleDragEnd = useCallback(() => {
    setDraggedBlock(null);
    setDragOverPosition(null);
  }, []);

  // Render individual block with layout controls
  const renderBlock = (block: ReviewBlock, rowIndex: number, blockIndex: number, row?: LayoutRow) => {
    const globalIndex = blocks.findIndex(b => b.id === block.id);
    const isActive = activeBlockId === block.id;
    const isDragging = draggedBlock === block.id;
    const showDropIndicator = dragOverPosition?.index === globalIndex;

    return (
      <div key={block.id} className="relative">
        {/* Drop indicator */}
        {showDropIndicator && dragOverPosition?.position === 'before' && (
          <div className="absolute -top-1 left-0 right-0 h-0.5 bg-blue-500 z-20" />
        )}
        
        <div className="relative group">
          {/* Add Block Button Above */}
          <div className="flex justify-center mb-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => addBlockBetween(globalIndex)}
              className="h-6 w-24 text-xs"
              style={{ color: '#9ca3af' }}
            >
              <Plus className="w-3 h-3 mr-1" />
              Adicionar
            </Button>
          </div>

          {/* Block Container */}
          <Card
            className={cn(
              "relative transition-all duration-200 cursor-pointer",
              isActive ? "ring-2 ring-blue-500 shadow-lg" : "hover:shadow-md",
              !block.visible && "opacity-50",
              isDragging && "opacity-50 scale-95"
            )}
            style={{ 
              backgroundColor: '#1a1a1a',
              borderColor: isActive ? '#3b82f6' : '#2a2a2a'
            }}
            onClick={(e) => handleBlockClick(block.id, e)}
            draggable
            onDragStart={(e) => handleDragStart(e, block.id)}
            onDragOver={(e) => handleDragOver(e, globalIndex)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, globalIndex)}
            onDragEnd={handleDragEnd}
          >
            {/* Block Controls */}
            <div className={cn(
              "absolute -top-2 -right-2 flex items-center gap-1 z-10 transition-opacity",
              isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"
            )}>
              {/* Layout Controls */}
              {!row || row.columns === 1 ? (
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      convertToLayout(block.id, 1);
                    }}
                    className="h-6 w-6 p-0 bg-gray-800 border border-gray-600"
                    title="1 coluna"
                  >
                    <Square className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      convertToLayout(block.id, 2);
                    }}
                    className="h-6 w-6 p-0 bg-gray-800 border border-gray-600"
                    title="2 colunas"
                  >
                    <Columns2 className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      convertToLayout(block.id, 3);
                    }}
                    className="h-6 w-6 p-0 bg-gray-800 border border-gray-600"
                    title="3 colunas"
                  >
                    <Columns3 className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      convertToLayout(block.id, 4);
                    }}
                    className="h-6 w-6 p-0 bg-gray-800 border border-gray-600"
                    title="4 colunas"
                  >
                    <Columns4 className="w-3 h-3" />
                  </Button>
                </div>
              ) : null}

              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleBlockVisibilityToggle(block.id);
                }}
                className="h-6 w-6 p-0 bg-gray-800 border border-gray-600"
                title={block.visible ? "Ocultar bloco" : "Mostrar bloco"}
              >
                {block.visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onDuplicateBlock(block.id);
                }}
                className="h-6 w-6 p-0 bg-gray-800 border border-gray-600"
                title="Duplicar bloco"
              >
                <Copy className="w-3 h-3" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteBlock(block.id);
                }}
                className="h-6 w-6 p-0 bg-red-800 border border-red-600 hover:bg-red-700"
                title="Remover bloco"
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>

            {/* Drag Handle */}
            <div className={cn(
              "absolute -left-2 top-1/2 transform -translate-y-1/2 transition-opacity",
              isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"
            )}>
              <DragHandle 
                onMoveUp={() => onMoveBlock(block.id, 'up')}
                onMoveDown={() => onMoveBlock(block.id, 'down')}
                canMoveUp={globalIndex > 0}
                canMoveDown={globalIndex < blocks.length - 1}
              />
            </div>

            {/* Block Content */}
            <div className="p-4">
              <BlockRenderer
                block={block}
                onUpdate={onUpdateBlock}
                readonly={false}
              />
            </div>
          </Card>
        </div>

        {/* Drop indicator after */}
        {showDropIndicator && dragOverPosition?.position === 'after' && (
          <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-blue-500 z-20" />
        )}
      </div>
    );
  };

  // Render layout row
  const renderLayoutRow = (row: LayoutRow, rowIndex: number) => {
    if (row.columns === 1) {
      return renderBlock(row.blocks[0], rowIndex, 0, row);
    }

    const gridCols = {
      2: 'grid-cols-2',
      3: 'grid-cols-3',
      4: 'grid-cols-4'
    }[row.columns] || 'grid-cols-1';

    return (
      <div key={row.id} className={`grid ${gridCols} gap-4 my-6`}>
        {row.blocks.map((block, blockIndex) => (
          <div key={block.id}>
            {renderBlock(block, rowIndex, blockIndex, row)}
          </div>
        ))}
        
        {/* Empty slots for incomplete rows */}
        {Array.from({ length: row.columns - row.blocks.length }).map((_, index) => (
          <div
            key={`empty-${index}`}
            className="min-h-[120px] border-2 border-dashed rounded-lg flex items-center justify-center"
            style={{ borderColor: '#2a2a2a' }}
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                const lastBlockIndex = blocks.findIndex(b => b.id === row.blocks[row.blocks.length - 1].id);
                addBlockBetween(lastBlockIndex + 1);
              }}
              className="text-gray-400 hover:text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Bloco
            </Button>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className={cn("block-editor h-full", className)}>
      <div 
        className="h-full overflow-y-auto p-6"
        style={{ backgroundColor: '#121212' }}
      >
        {layoutRows.length > 0 ? (
          <div className="space-y-4">
            {layoutRows.map((row, index) => renderLayoutRow(row, index))}
          </div>
        ) : (
          <div 
            className="border-2 border-dashed rounded-lg p-12 text-center"
            style={{ borderColor: '#2a2a2a', backgroundColor: '#1a1a1a' }}
          >
            <div className="text-4xl mb-4">📝</div>
            <h3 className="text-lg font-medium mb-2" style={{ color: '#ffffff' }}>
              Comece Criando seu Primeiro Bloco
            </h3>
            <p className="mb-6" style={{ color: '#d1d5db' }}>
              Use a paleta de blocos à esquerda para adicionar conteúdo à sua revisão
            </p>
          </div>
        )}

        {/* Final Add Block Button */}
        {blocks.length > 0 && (
          <div className="flex justify-center pt-8">
            <Button
              variant="outline"
              onClick={() => addBlockBetween(blocks.length)}
              className="flex items-center gap-2"
              style={{ 
                borderColor: '#2a2a2a',
                backgroundColor: '#1a1a1a',
                color: '#ffffff'
              }}
            >
              <Plus className="w-4 h-4" />
              Adicionar Bloco
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
