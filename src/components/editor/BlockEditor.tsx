
// ABOUTME: Enhanced block editor with unified grid management and fixed drag and drop
// Uses new grid layout manager for consistent operations and proper event handling

import React, { useState, useCallback, useRef } from 'react';
import { ReviewBlock, BlockType } from '@/types/review';
import { BlockRenderer } from '@/components/review/BlockRenderer';
import { DragHandle } from './DragHandle';
import { ResizableGrid } from './layout/ResizableGrid';
import { useGridLayoutManager } from '@/hooks/useGridLayoutManager';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  Plus, 
  Eye, 
  EyeOff, 
  Copy, 
  Trash2, 
  Grid2X2,
  Grid3X3,
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
  onConvertToGrid?: (blockId: number, columns: number) => void;
  className?: string;
}

interface DragState {
  draggedBlockId: number | null;
  dragOverRowId: string | null;
  dragOverPosition: number | null;
  isDragging: boolean;
  draggedFromRowId: string | null;
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
  onConvertToGrid,
  className
}) => {
  const [dragState, setDragState] = useState<DragState>({
    draggedBlockId: null,
    dragOverRowId: null,
    dragOverPosition: null,
    isDragging: false,
    draggedFromRowId: null
  });

  const dragTimeoutRef = useRef<NodeJS.Timeout>();

  // Use the unified grid layout manager
  const {
    layoutState,
    updateColumnWidths,
    deleteBlockWithLayoutRepair,
    getRowByBlockId,
    isBlockInGrid
  } = useGridLayoutManager({
    blocks,
    onUpdateBlock,
    onDeleteBlock
  });

  console.log('BlockEditor render:', { 
    blocksCount: blocks.length, 
    layoutRows: layoutState.rows.length,
    activeBlockId 
  });

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
    console.log('Adding block between positions:', { position, type });
    onAddBlock(type, position);
  }, [onAddBlock]);

  // Enhanced grid conversion with proper validation and feedback
  const convertToLayout = useCallback((blockId: number, columns: number) => {
    const block = blocks.find(b => b.id === blockId);
    if (!block) {
      console.error('Block not found for grid conversion:', blockId);
      return;
    }

    if (isBlockInGrid(blockId)) {
      console.warn('Block is already in a grid layout:', blockId);
      return;
    }

    console.log('Converting block to grid layout:', { blockId, columns, blockType: block.type });
    
    if (onConvertToGrid) {
      onConvertToGrid(blockId, columns);
    } else {
      console.error('onConvertToGrid handler not provided');
    }
  }, [blocks, onConvertToGrid, isBlockInGrid]);

  const addBlockToGrid = useCallback((rowId: string, position: number) => {
    const row = layoutState.rows.find(r => r.id === rowId);
    if (!row) {
      console.error('Row not found for grid block addition:', rowId);
      return;
    }

    // Find the insertion point based on the grid position
    let insertionIndex: number;
    
    if (position === 0) {
      // Insert at the beginning of the row
      const firstBlockInRow = row.blocks[0];
      insertionIndex = firstBlockInRow ? blocks.findIndex(b => b.id === firstBlockInRow.id) : blocks.length;
    } else if (position < row.blocks.length) {
      // Insert between existing blocks
      const blockAtPosition = row.blocks[position];
      insertionIndex = blockAtPosition ? blocks.findIndex(b => b.id === blockAtPosition.id) : blocks.length;
    } else {
      // Insert at the end of the row
      const lastBlockInRow = row.blocks[row.blocks.length - 1];
      insertionIndex = lastBlockInRow ? 
        blocks.findIndex(b => b.id === lastBlockInRow.id) + 1 : 
        blocks.length;
    }

    console.log('Adding block to grid:', { rowId, position, insertionIndex });
    onAddBlock('paragraph', insertionIndex);
  }, [layoutState.rows, blocks, onAddBlock]);

  // ENHANCED DRAG AND DROP IMPLEMENTATION
  const handleDragStart = useCallback((e: React.DragEvent, blockId: number) => {
    const sourceRow = getRowByBlockId(blockId);
    
    console.log('Drag started:', { blockId, sourceRowId: sourceRow?.id });
    
    setDragState({
      draggedBlockId: blockId,
      draggedFromRowId: sourceRow?.id || null,
      dragOverRowId: null,
      dragOverPosition: null,
      isDragging: true
    });

    // Set drag data for proper HTML5 drag and drop
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', blockId.toString());
    e.dataTransfer.setData('application/json', JSON.stringify({
      blockId,
      sourceRowId: sourceRow?.id || null
    }));

    // Add visual feedback class to body
    document.body.classList.add('dragging-block');
  }, [getRowByBlockId]);

  const handleDragOver = useCallback((e: React.DragEvent, targetRowId: string, targetPosition?: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    // Clear any existing timeout
    if (dragTimeoutRef.current) {
      clearTimeout(dragTimeoutRef.current);
    }

    // Debounce the drag over state updates
    dragTimeoutRef.current = setTimeout(() => {
      if (dragState.isDragging) {
        setDragState(prev => ({
          ...prev,
          dragOverRowId: targetRowId,
          dragOverPosition: targetPosition ?? null
        }));
      }
    }, 50);
  }, [dragState.isDragging]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    // Only trigger if leaving the actual drop zone
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      if (dragTimeoutRef.current) {
        clearTimeout(dragTimeoutRef.current);
      }
      
      dragTimeoutRef.current = setTimeout(() => {
        setDragState(prev => ({
          ...prev,
          dragOverRowId: null,
          dragOverPosition: null
        }));
      }, 100);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, targetRowId: string, targetPosition?: number) => {
    e.preventDefault();
    
    if (!dragState.draggedBlockId) {
      console.warn('No dragged block found during drop');
      return;
    }

    const draggedBlock = blocks.find(b => b.id === dragState.draggedBlockId);
    const targetRow = layoutState.rows.find(r => r.id === targetRowId);
    
    if (!draggedBlock || !targetRow) {
      console.error('Invalid drop operation:', { 
        draggedBlock: !!draggedBlock, 
        targetRow: !!targetRow,
        targetRowId 
      });
      return;
    }

    const finalPosition = targetPosition ?? targetRow.blocks.length;
    
    console.log('Executing drop operation:', { 
      blockId: dragState.draggedBlockId, 
      targetRowId, 
      finalPosition,
      targetRowColumns: targetRow.columns,
      sourceRowId: dragState.draggedFromRowId
    });

    // Update the block with new layout metadata
    onUpdateBlock(dragState.draggedBlockId, {
      meta: {
        ...draggedBlock.meta,
        layout: {
          row_id: targetRowId,
          position: finalPosition,
          columns: targetRow.columns,
          gap: targetRow.gap || 4,
          columnWidths: targetRow.columnWidths
        }
      }
    });

    // Clear drag state
    setDragState({
      draggedBlockId: null,
      dragOverRowId: null,
      dragOverPosition: null,
      isDragging: false,
      draggedFromRowId: null
    });
  }, [dragState, blocks, layoutState.rows, onUpdateBlock]);

  const handleDragEnd = useCallback(() => {
    if (dragTimeoutRef.current) {
      clearTimeout(dragTimeoutRef.current);
    }
    
    // Remove visual feedback class
    document.body.classList.remove('dragging-block');
    
    setDragState({
      draggedBlockId: null,
      dragOverRowId: null,
      dragOverPosition: null,
      isDragging: false,
      draggedFromRowId: null
    });
  }, []);

  const renderBlock = (block: ReviewBlock, rowIndex: number, blockIndex: number, row: any) => {
    const globalIndex = blocks.findIndex(b => b.id === block.id);
    const isActive = activeBlockId === block.id;
    const isDragging = dragState.draggedBlockId === block.id;
    const isDropTarget = dragState.dragOverRowId === row.id && dragState.dragOverPosition === blockIndex;

    return (
      <div key={block.id} className="relative">
        {/* Drop zone indicator */}
        {isDropTarget && (
          <div className="absolute -top-2 left-0 right-0 h-1 bg-blue-500 rounded z-20 animate-pulse" />
        )}
        
        <div className="relative group">
          {/* Add block button - appears on hover */}
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

          <Card
            className={cn(
              "relative transition-all duration-200 cursor-pointer",
              isActive ? "ring-2 ring-blue-500 shadow-lg" : "hover:shadow-md",
              !block.visible && "opacity-50",
              isDragging && "opacity-50 scale-95 rotate-2"
            )}
            style={{ 
              backgroundColor: '#1a1a1a',
              borderColor: isActive ? '#3b82f6' : '#2a2a2a'
            }}
            onClick={(e) => handleBlockClick(block.id, e)}
            draggable={!isBlockInGrid(block.id) || row.columns === 1}
            onDragStart={(e) => handleDragStart(e, block.id)}
            onDragOver={(e) => handleDragOver(e, row.id, blockIndex)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, row.id, blockIndex)}
            onDragEnd={handleDragEnd}
          >
            {/* Block Controls */}
            <div className={cn(
              "absolute -top-2 -right-2 flex items-center gap-1 z-10 transition-opacity",
              isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"
            )}>
              {/* Grid conversion buttons - only for single blocks */}
              {row.columns === 1 && !isBlockInGrid(block.id) && (
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      convertToLayout(block.id, 2);
                    }}
                    className="h-6 w-6 p-0 bg-gray-800 border border-gray-600 hover:bg-gray-700"
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
                    className="h-6 w-6 p-0 bg-gray-800 border border-gray-600 hover:bg-gray-700"
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
                    className="h-6 w-6 p-0 bg-gray-800 border border-gray-600 hover:bg-gray-700"
                    title="4 colunas"
                  >
                    <Columns4 className="w-3 h-3" />
                  </Button>
                </div>
              )}

              {/* Visibility toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleBlockVisibilityToggle(block.id);
                }}
                className="h-6 w-6 p-0 bg-gray-800 border border-gray-600 hover:bg-gray-700"
                title={block.visible ? "Ocultar bloco" : "Mostrar bloco"}
              >
                {block.visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
              </Button>
              
              {/* Duplicate button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onDuplicateBlock(block.id);
                }}
                className="h-6 w-6 p-0 bg-gray-800 border border-gray-600 hover:bg-gray-700"
                title="Duplicar bloco"
              >
                <Copy className="w-3 h-3" />
              </Button>
              
              {/* Delete button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteBlockWithLayoutRepair(block.id);
                }}
                className="h-6 w-6 p-0 bg-red-800 border border-red-600 hover:bg-red-700"
                title="Remover bloco"
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>

            {/* Drag handle for single blocks */}
            {row.columns === 1 && (
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
            )}

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
      </div>
    );
  };

  const renderLayoutRow = (row: any, rowIndex: number) => {
    if (row.columns === 1) {
      return (
        <div key={row.id} className="my-6">
          {renderBlock(row.blocks[0], rowIndex, 0, row)}
        </div>
      );
    }

    // Use ResizableGrid for multi-column layouts
    return (
      <ResizableGrid
        key={row.id}
        rowId={row.id}
        blocks={row.blocks}
        columns={row.columns}
        gap={row.gap}
        columnWidths={row.columnWidths}
        onUpdateLayout={updateColumnWidths}
        onAddBlock={addBlockToGrid}
        onUpdateBlock={onUpdateBlock}
        onDeleteBlock={deleteBlockWithLayoutRepair}
        activeBlockId={activeBlockId}
        onActiveBlockChange={onActiveBlockChange}
        readonly={false}
        className="my-6"
      />
    );
  };

  return (
    <div className={cn("block-editor h-full", className)}>
      <div 
        className="h-full overflow-y-auto p-6"
        style={{ backgroundColor: '#121212' }}
      >
        {layoutState.rows.length > 0 ? (
          <div className="space-y-4">
            {layoutState.rows.map((row, index) => renderLayoutRow(row, index))}
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

      {/* Drag and Drop Styles */}
      <style jsx>{`
        .dragging-block * {
          pointer-events: none;
        }
        .dragging-block .drop-zone {
          pointer-events: auto;
        }
      `}</style>
    </div>
  );
};
